import { expect, test } from "@playwright/test";

/**
 * Plan section 4: under `prefers-reduced-motion: reduce` the aurora drift stops,
 * the scroll driver does not run, and the backdrop renders the midpoint stop
 * (index 2) as a static gradient.
 */

const bgVars = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return { a: s.getPropertyValue("--bg-a").trim(), b: s.getPropertyValue("--bg-b").trim() };
  });

test.describe("reduced motion", () => {
  // `reducedMotion` is NOT a first-class Playwright test option (unlike
  // `colorScheme`); passing it directly to test.use is silently ignored. It
  // has to go through contextOptions. See playwright/types/test.d.ts.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("freezes the aurora — no running animation", async ({ page }) => {
    await page.goto("/");
    const running = await page.evaluate(() => {
      const el = document.querySelector('[aria-hidden="true"] > div');
      if (!el) return "no-aurora-element";
      return document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => (a.effect as KeyframeEffect | null)?.target?.className ?? "?")
        .join(",");
    });
    expect(running).toBe("");
  });

  test.describe("with a fixed dark theme", () => {
    test.use({ colorScheme: "dark" });

    // PALETTES.dark[2] === ["#101C38", "#261232"]
    const MIDPOINT = { a: "rgb(16, 28, 56)", b: "rgb(38, 18, 50)" };

    test("paints the midpoint stop and holds it across scroll", async ({ page }) => {
      await page.goto("/");

      // Asserting the absolute value, not a before/after pair: the CSS default
      // is stop 0, so a JS write after hydration would race a relative check
      // and pass by accident.
      await expect.poll(() => bgVars(page)).toEqual(MIDPOINT);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(250);

      expect(await bgVars(page)).toEqual(MIDPOINT);
    });
  });

  test("does not start a requestAnimationFrame driver", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __rafCount: number };
      w.__rafCount = 0;
      const original = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb: FrameRequestCallback) => {
        w.__rafCount += 1;
        return original(cb);
      };
    });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);

    // React and next-themes may schedule a few frames; a running driver would
    // be one per frame for the whole 300ms, i.e. well into the dozens.
    const count = await page.evaluate(
      () => (window as unknown as { __rafCount: number }).__rafCount,
    );
    expect(count).toBeLessThan(10);
  });

  test("the theme toggle still works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    await page.getByRole("button", { name: "Dark theme" }).click();
    await expect(html).not.toHaveAttribute("data-theme", before ?? "");
  });
});
