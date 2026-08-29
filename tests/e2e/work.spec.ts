import { expect, test } from "@playwright/test";
import { loadProjects } from "../../src/lib/content";

const PROJECTS = loadProjects().map((p) => p.frontmatter);
const DETAIL = PROJECTS.filter((p) => p.detailPage);
const CARD_ONLY = PROJECTS.filter((p) => !p.detailPage);

// Self-contained: without this an emptied content directory produces zero
// generated tests and a green run that proves nothing.
test("the content set is the one the plan describes", () => {
  expect(PROJECTS).toHaveLength(12);
  expect(DETAIL).toHaveLength(5);
});

test.describe("project detail pages", () => {
  for (const project of DETAIL) {
    test.describe(project.slug, () => {
      test("renders with its own h1 and summary", async ({ page }) => {
        const response = await page.goto(`/work/${project.slug}`);
        expect(response?.status()).toBe(200);

        await expect(page.locator("h1")).toHaveText(project.name);
        await expect(page.getByText(project.summary, { exact: false })).toBeVisible();
      });

      test("lists every highlight", async ({ page }) => {
        await page.goto(`/work/${project.slug}`);
        const items = page.locator("section[aria-labelledby='highlights'] li");
        await expect(items).toHaveCount(project.highlights.length);
      });

      test("renders each screenshot with its alt text", async ({ page }) => {
        await page.goto(`/work/${project.slug}`);
        for (const [index, shot] of project.media.entries()) {
          // A stand-in must not be announced with the description of a screen
          // that was never built, so the placeholder state overrides the alt.
          const name = shot.placeholder
            ? `Placeholder image ${index + 1} of ${project.media.length}; the ${project.name} screenshot has not been added yet`
            : shot.alt;
          const img = page.getByRole("img", { name });
          await expect(img).toBeVisible();
          // next/image must not be allowed to drop the intrinsic size, which
          // is what holds CLS flat while the image decodes.
          await expect(img).toHaveAttribute("width", String(shot.width));
          await expect(img).toHaveAttribute("height", String(shot.height));
        }
      });

      test("links back to the work section", async ({ page }) => {
        await page.goto(`/work/${project.slug}`);
        await page.getByRole("link", { name: /all work/i }).click();
        await expect(page).toHaveURL(/\/#work$/);
      });
    });
  }

  test("shows the what-I'd-improve block only where the field exists", async ({ page }) => {
    for (const project of DETAIL) {
      await page.goto(`/work/${project.slug}`);
      const block = page.getByRole("complementary", { name: /what i.d improve/i });
      await expect(block, project.slug).toHaveCount(project.whatIdImprove ? 1 : 0);
    }
  });

  test("marks every placeholder image visibly, not just in the alt text", async ({ page }) => {
    for (const project of DETAIL) {
      const placeholders = project.media.filter((m) => m.placeholder);
      if (placeholders.length === 0) continue;

      await page.goto(`/work/${project.slug}`);
      await expect(
        page.getByText("Placeholder", { exact: true }),
        project.slug,
      ).toHaveCount(placeholders.length);
    }
  });

  test("the screenshot rail is reachable by keyboard", async ({ page }) => {
    // overflow-x with no focusable children is axe's scrollable-region-focusable
    // (WCAG 2.1.1): without a tabindex, images past the first are unreachable.
    await page.goto("/work/avomd");
    const rail = page.getByRole("list", { name: /screenshots/i });
    await expect(rail).toHaveAttribute("tabindex", "0");
    await rail.focus();
    await expect(rail).toBeFocused();
  });

  test("renders no gallery for the NDA project", async ({ page }) => {
    // The Joulea NDA is resolved for the client name and end users only.
    await page.goto("/work/drone-inspection-controller");
    await expect(page.locator("main img")).toHaveCount(0);
  });
});

test.describe("linking", () => {
  test("the work section links every detail project and no other", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("#work a[href^='/work/']")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));

    expect(hrefs.sort()).toEqual(DETAIL.map((p) => `/work/${p.slug}`).sort());
  });

  test("card-only projects render as text, not links", async ({ page }) => {
    await page.goto("/");
    for (const project of CARD_ONLY) {
      const link = page.getByRole("link", { name: project.name, exact: true });
      await expect(link, project.slug).toHaveCount(0);
    }
  });
});

test.describe("404", () => {
  test("an unknown slug 404s", async ({ page }) => {
    const response = await page.goto("/work/not-a-real-project");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/doesn.t exist/i);
  });

  test("a card-only project has no route of its own", async ({ page }) => {
    const response = await page.goto("/work/mimesa");
    expect(response?.status()).toBe(404);
  });

  test("the 404 page routes back to the work section", async ({ page }) => {
    await page.goto("/work/not-a-real-project");
    await page.getByRole("link", { name: /go to the work/i }).click();
    await expect(page).toHaveURL(/\/#work$/);
  });
});
