import { expect, test } from "@playwright/test";
import { PALETTES } from "../../src/lib/palettes";

/** Palette hex -> the `rgb(r, g, b)` form getComputedStyle returns. */
function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

// Derived, not transcribed — a palette retune must not leave this file behind
// failing with an opaque rgb mismatch.
const [MID_A, MID_B] = PALETTES.dark[2]!;

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
    // Enumerates the whole document, not just the aurora — a stray running
    // animation anywhere is also a reduced-motion failure.
    const running = await page.evaluate(() => {
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

    const MIDPOINT = { a: hexToRgb(MID_A), b: hexToRgb(MID_B) };

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

    // Measure a delta over a settled window rather than a total from load.
    // Startup frames from React and next-themes are excluded, so a running
    // driver (~18 frames per 300ms at 60fps) is unambiguous.
    await page.waitForTimeout(300);
    const read = () =>
      page.evaluate(() => (window as unknown as { __rafCount: number }).__rafCount);
    const first = await read();
    await page.waitForTimeout(300);
    const second = await read();

    expect(second - first, `${first} -> ${second} frames`).toBeLessThan(3);
  });

  test("the theme toggle still works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    await page.getByRole("button", { name: "Dark theme" }).click();
    await expect(html).not.toHaveAttribute("data-theme", before ?? "");
  });
});

/**
 * Reduced motion is a preference users toggle mid-session. On the native CSS
 * path the media query handles that for free. On the rAF path it does not:
 * the driver writes INLINE custom properties, which outrank the stylesheet's
 * reduced-motion block, so without a listener the loop keeps overriding it.
 */
test.describe("runtime preference changes on the rAF path", () => {
  test.use({ colorScheme: "dark" });

  const MIDPOINT_A = hexToRgb(MID_A);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const original = CSS.supports.bind(CSS);
      CSS.supports = ((...args: string[]) =>
        args.join(" ").includes("animation-timeline")
          ? false
          : original(...(args as [string]))) as typeof CSS.supports;
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.addStyleTag({
      content: "body::after{content:'';display:block;height:400vh} :root{animation:none !important}",
    });
  });

  test("stands down and hands the gradient back to CSS when reduce is enabled", async ({
    page,
  }) => {
    await page.evaluate(() => window.scrollTo(0, 2000));
    // The driver is live and has written an inline oklch value.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--bg-a")))
      .toMatch(/^oklch\(/);

    await page.emulateMedia({ reducedMotion: "reduce" });

    // It must clear its inline write so the stylesheet's midpoint applies again.
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue("--bg-a").trim(),
        ),
      )
      .toBe(MIDPOINT_A);
  });

  test("starts driving again when reduce is turned back off", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue("--bg-a").trim(),
        ),
      )
      .toBe(MIDPOINT_A);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.evaluate(() => window.scrollTo(0, 2000));

    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--bg-a")))
      .toMatch(/^oklch\(/);
  });
});
