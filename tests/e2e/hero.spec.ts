import { expect, test, type Page } from "@playwright/test";
import { SITE } from "../../src/data/site";

/**
 * The headshot is the likely LCP element and the only image permitted
 * `priority`. Plan section 11 sets CLS < 0.02 site-wide, and an image without a
 * reserved box is the usual way that budget gets blown.
 */
const cls = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
            if (!shift.hadRecentInput) total += shift.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 1200);
      }),
  );

test.describe("hero", () => {
  test("names the portrait with his name, not 'headshot'", async ({ page }) => {
    await page.goto("/");
    const img = page.getByAltText(SITE.name);
    await expect(img).toBeVisible();
    // Plan section 7 is explicit: alt text is his name.
    await expect(img).toHaveAttribute("alt", SITE.name);
  });

  test("reserves the portrait's box so it cannot shift layout", async ({ page }) => {
    await page.goto("/");
    const img = page.getByAltText(SITE.name);
    const box = await img.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);
  });

  test("serves a modern format, not the raw PNG", async ({ page }) => {
    const types: string[] = [];
    page.on("response", (r) => {
      const ct = r.headers()["content-type"] ?? "";
      if (ct.startsWith("image/")) types.push(ct);
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(types.some((t) => /avif|webp/.test(t)), `served: ${types.join(", ")}`).toBe(true);
  });
});

test.describe("layout stability", () => {
  for (const scheme of ["dark", "light"] as const) {
    test.describe(`${scheme} theme`, () => {
      test.use({ colorScheme: scheme });

      test("keeps cumulative layout shift under budget", async ({ page }) => {
        await page.goto("/");
        const score = await cls(page);
        expect(score, `CLS in ${scheme}`).toBeLessThan(0.02);
      });

      test("renders the portrait on a defined surface", async ({ page }) => {
        await page.goto("/");
        // A background-removed PNG needs a container with its own surface, or
        // it haloes against the gradient. Assert the surface actually exists.
        const surface = await page
          .getByAltText(SITE.name)
          .locator("xpath=..")
          .evaluate((el) => {
            const s = getComputedStyle(el);
            return { bg: s.backgroundColor, border: s.borderTopWidth };
          });
        expect(surface.bg).not.toBe("rgba(0, 0, 0, 0)");
        expect(parseFloat(surface.border)).toBeGreaterThan(0);
      });
    });
  }
});
