import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { loadDetailProjects } from "../../src/lib/content";

const DETAIL = loadDetailProjects().map((p) => p.frontmatter.slug);
const ROUTES = ["/", ...DETAIL.map((slug) => `/work/${slug}`), "/work/not-a-real-project"];
const THEMES = ["dark", "light"] as const;

/**
 * The scan runs with reduced motion. Two reasons, both structural:
 *
 * 1. Under normal motion the scroll reveals hold everything below the fold at
 *    opacity 0 until it enters the viewport, so a scan would silently skip most
 *    of the page — and mid-fade an element blends toward the backdrop and axe
 *    reports a contrast violation the settled page does not have. Under load
 *    that fired on roughly one home-page run in four.
 * 2. globals.css pins `[data-reveal], [data-seq]` to opacity 1 under reduce, so
 *    every section is present and static. That is the state where "does this
 *    page have accessibility violations" is a well-posed question.
 *
 * Passed through contextOptions, not the top-level `reducedMotion` test option:
 * that one is silently inert here, which is how phase 6 shipped a suite that
 * passed while testing nothing.
 */
test.use({ contextOptions: { reducedMotion: "reduce" } });

test("the route list is the one the site actually has", () => {
  // Derived from the loader, so an emptied content directory would otherwise
  // silently shrink this suite to a home-page-only scan that still passes.
  expect(DETAIL).toHaveLength(5);
  expect(ROUTES).toHaveLength(7);
});

/**
 * next-themes writes data-theme from localStorage before paint. Setting the
 * attribute directly after load is not enough — the toggle would still read the
 * stored value — so the theme is seeded before the document runs.
 */
async function visit(page: Page, route: string, theme: (typeof THEMES)[number]) {
  await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
  await page.goto(route);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

  // Guards the reduced-motion assumption above: if that CSS override is ever
  // removed, the scan would quietly start skipping most of the page instead of
  // failing here.
  const faded = await page.$$eval("[data-reveal]", (nodes) =>
    nodes.filter((n) => getComputedStyle(n).opacity !== "1").length,
  );
  expect(faded, "reveals must be pinned visible under reduced motion").toBe(0);
}

const scan = (page: Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

for (const theme of THEMES) {
  test.describe(`axe — ${theme} theme`, () => {
    for (const route of ROUTES) {
      test(`${route} has no violations`, async ({ page }) => {
        await visit(page, route, theme);
        const results = await scan(page);

        // Name the rules in the failure message; a bare count is useless when
        // this fails months from now in CI.
        expect(
          results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
        ).toEqual([]);
      });
    }
  });
}

test.describe("axe sanity", () => {
  test("the scan actually runs rules rather than passing on an empty page", async ({ page }) => {
    // A zero-violation result means nothing if axe silently checked nothing.
    await visit(page, "/", "dark");
    const results = await scan(page);
    expect(results.passes.length).toBeGreaterThan(10);
    expect(results.testEngine.name).toBe("axe-core");
  });

  test("catches a violation it should catch", async ({ page }) => {
    await visit(page, "/", "dark");
    await page.evaluate(() => {
      const img = document.createElement("img");
      img.src = "/bilal.png";
      document.querySelector("main")?.append(img);
    });
    const results = await scan(page);
    expect(results.violations.map((v) => v.id)).toContain("image-alt");
  });
});
