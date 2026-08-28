import { expect, test } from "@playwright/test";

/**
 * End-to-end cover for the backdrop drift.
 *
 * The home page is currently shorter than the viewport (phase 3 adds the six
 * real sections), so scroll cannot be exercised against it as-is. Rather than
 * defer this until there is content — and ship an untested driver in the
 * meantime — each test gives the page its own height. That exercises the real
 * driver, whichever path the browser takes: Chromium supports
 * `animation-timeline: scroll()` and runs the CSS path, WebKit falls back to
 * the rAF loop in Backdrop.tsx. Both must produce a drift.
 */

const TALL = "body::after { content: ''; display: block; height: 400vh; }";

const bgA = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg-a").trim(),
  );

test.describe("backdrop drift", () => {
  test.use({ colorScheme: "dark" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.addStyleTag({ content: TALL });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight),
      )
      .toBeGreaterThan(1000);
  });

  test("changes the gradient between top and bottom", async ({ page }) => {
    const top = await bgA(page);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => bgA(page)).not.toBe(top);
  });

  test("drifts progressively rather than jumping once", async ({ page }) => {
    const scrollTo = (fraction: number) =>
      page.evaluate((f) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, max * f);
      }, fraction);

    const seen: string[] = [await bgA(page)];

    // Poll for the change rather than sleeping a fixed interval. The rAF
    // fallback (WebKit) needs frames it is not guaranteed to get promptly under
    // parallel load, so a fixed wait races and flakes. Failing to change within
    // the poll window IS the failure this test is looking for.
    for (const fraction of [0.25, 0.5, 0.75, 1]) {
      const previous = seen[seen.length - 1]!;
      await scrollTo(fraction);
      await expect
        .poll(() => bgA(page), { message: `no drift by ${fraction * 100}%` })
        .not.toBe(previous);
      seen.push(await bgA(page));
    }

    // A single crossfade would produce two distinct values; a real drift across
    // six stops produces a distinct value at every sample.
    expect(new Set(seen).size, `samples: ${seen.join(" | ")}`).toBe(seen.length);
  });

  test("returns to the first stop when scrolled back to the top", async ({ page }) => {
    const top = await bgA(page);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => bgA(page)).not.toBe(top);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => bgA(page)).toBe(top);
  });
});
