import { expect, test } from "@playwright/test";
import { SECTIONS } from "../../src/lib/palettes";

/**
 * The six home sections are load-bearing, not decorative: each one maps to a
 * backdrop palette stop, so a missing or renamed id silently breaks the drift
 * as well as the navigation. SECTIONS is the single source for both.
 */
test.describe("home navigation", () => {
  test("renders", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("has every section id, in palette order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.$$eval("main section[id]", (nodes) => nodes.map((n) => n.id));
    expect(ids).toEqual([...SECTIONS]);
  });

  test.describe("each section", () => {
    for (const id of SECTIONS) {
      test(`#${id} is labelled by its own heading`, async ({ page }) => {
        await page.goto("/");
        const section = page.locator(`section#${id}`);
        await expect(section).toHaveCount(1);

        const labelledBy = await section.getAttribute("aria-labelledby");
        expect(labelledBy, `#${id} needs aria-labelledby`).toBeTruthy();
        await expect(page.locator(`#${labelledBy}`)).toHaveCount(1);
      });
    }
  });

  test("exposes exactly one h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("in-page nav links resolve to real sections", async ({ page }) => {
    await page.goto("/");
    const targets = await page.$$eval('a[href^="#"]', (nodes) =>
      nodes.map((n) => n.getAttribute("href")!).filter((h) => h !== "#"),
    );
    expect(targets.length, "expected in-page navigation").toBeGreaterThan(0);

    for (const href of targets) {
      await expect(page.locator(href), `${href} has no target`).toHaveCount(1);
    }
  });

  test("scrolls to the work section when its link is used", async ({ page }) => {
    await page.goto("/");
    // The section nav is hidden below 44rem, where the hero CTA is the path to
    // the same target — so assert on whichever link is actually exposed.
    const link = page.locator('a[href="#work"]:visible').first();
    await expect(link, "#work must be reachable at every viewport").toBeVisible();
    await link.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });
});
