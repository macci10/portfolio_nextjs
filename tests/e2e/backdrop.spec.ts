import { expect, test, type Page } from "@playwright/test";
import { PALETTES } from "../../src/lib/palettes";

/**
 * End-to-end cover for the backdrop drift.
 *
 * The home page is currently shorter than the viewport (phase 3 adds the six
 * real sections), so scroll cannot be exercised against it as-is. Rather than
 * defer this until there is content — and ship an untested driver in the
 * meantime — each test gives the page its own height.
 *
 * Both paths are exercised explicitly. Do NOT rely on browser variation to
 * reach the fallback: as of Chromium 151 and WebKit 26.5 both support
 * `animation-timeline: scroll()`, so an earlier version of this file tested
 * the CSS path twice and left the rAF driver entirely unexecuted. Where a test
 * needs a browser to LACK a feature, force the condition.
 *
 * The paths are distinguishable by output format — CSS resolves --bg-a to
 * `rgb(...)`, the JS driver writes `oklch(...)` — so each block asserts which
 * path it is on. The suite cannot silently collapse onto one again.
 */

const TALL = "body::after { content: ''; display: block; height: 400vh; }";

/**
 * Forces Backdrop.tsx past its CSS.supports check and onto the rAF driver.
 *
 * Stubbing CSS.supports only fools JavaScript. The stylesheet's own
 * `@supports (animation-timeline: scroll())` block still matches, and a running
 * CSS animation outranks an inline style in the cascade — so the JS driver
 * writes correctly but its value is overridden and invisible. CANCEL_NATIVE
 * cancels that animation so the fallback's writes are actually observable.
 */
function disableNativeTimeline() {
  const original = CSS.supports.bind(CSS);
  CSS.supports = ((...args: string[]) =>
    args.join(" ").includes("animation-timeline")
      ? false
      : original(...(args as [string]))) as typeof CSS.supports;
}

const CANCEL_NATIVE = ":root { animation: none !important; }";

const bgA = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg-a").trim(),
  );

const scrollToFraction = (page: Page, fraction: number) =>
  page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * f);
  }, fraction);

function driftSuite(label: string, format: RegExp, init?: () => void) {
  test.describe(label, () => {
    test.use({ colorScheme: "dark" });

    test.beforeEach(async ({ page }) => {
      if (init) await page.addInitScript(init);
      await page.goto("/");
      await page.addStyleTag({ content: init ? `${TALL} ${CANCEL_NATIVE}` : TALL });
      await expect
        .poll(() =>
          page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight),
        )
        .toBeGreaterThan(1000);
    });

    test("is actually running the expected path", async ({ page }) => {
      await expect.poll(() => bgA(page)).toMatch(format);
    });

    test("changes the gradient between top and bottom", async ({ page }) => {
      const top = await bgA(page);
      await scrollToFraction(page, 1);
      await expect.poll(() => bgA(page)).not.toBe(top);
    });

    test("drifts progressively rather than jumping once", async ({ page }) => {
      const seen: string[] = [await bgA(page)];

      // Poll for the change rather than sleeping a fixed interval. The rAF path
      // is not guaranteed prompt frames under parallel load, so a fixed wait
      // races and flakes. Failing to change within the poll window IS the
      // failure this test looks for.
      for (const fraction of [0.25, 0.5, 0.75, 1]) {
        const previous = seen[seen.length - 1]!;
        await scrollToFraction(page, fraction);
        await expect
          .poll(() => bgA(page), { message: `no drift by ${fraction * 100}%` })
          .not.toBe(previous);
        seen.push(await bgA(page));
      }

      // A single crossfade yields two distinct values; a real drift across six
      // stops yields a distinct value at every sample.
      expect(new Set(seen).size, `samples: ${seen.join(" | ")}`).toBe(seen.length);
    });

    test("returns to the first stop when scrolled back to the top", async ({ page }) => {
      const top = await bgA(page);
      await scrollToFraction(page, 1);
      await expect.poll(() => bgA(page)).not.toBe(top);
      await scrollToFraction(page, 0);
      await expect.poll(() => bgA(page)).toBe(top);
    });
  });
}

driftSuite("backdrop drift — native scroll timeline", /^rgb\(/);
driftSuite("backdrop drift — rAF fallback", /^oklch\(/, disableNativeTimeline);

test.describe("palette endpoints", () => {
  test.use({ colorScheme: "dark" });

  test("starts at the first dark stop", async ({ page }) => {
    await page.goto("/");
    const [first] = PALETTES.dark[0]!;
    const n = parseInt(first.slice(1), 16);
    const expected = `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    await expect.poll(() => bgA(page)).toBe(expected);
  });
});
