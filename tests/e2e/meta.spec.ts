import { expect, test, type Page } from "@playwright/test";
import { loadDetailProjects } from "../../src/lib/content";
import { SITE } from "../../src/data/site";

const DETAIL = loadDetailProjects().map((p) => p.frontmatter);

const content = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute("content");

/**
 * An unfurl is often the first thing anyone sees of this site — a shared link in
 * a Slack channel or a LinkedIn post. A missing OG tag is not cosmetic; it is
 * the difference between a card and a bare URL.
 */
test.describe("home metadata", () => {
  test("has a title, description, and canonical", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(SITE.metaTitle);
    expect(await content(page, 'meta[name="description"]')).toBe(SITE.metaDescription);
    // Next normalises a "/" canonical to the bare origin.
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(SITE.url);
  });

  test("declares an absolute Open Graph image", async ({ page }) => {
    await page.goto("/");
    const src = await content(page, 'meta[property="og:image"]');
    expect(src).toMatch(new RegExp(`^${SITE.url}/opengraph-image`));
    expect(await content(page, 'meta[property="og:image:width"]')).toBe("1200");
    expect(await content(page, 'meta[property="og:image:height"]')).toBe("630");
    expect(await content(page, 'meta[property="og:type"]')).toBe("website");
  });

  test("declares a large-image Twitter card", async ({ page }) => {
    await page.goto("/");
    expect(await content(page, 'meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await content(page, 'meta[name="twitter:image"]')).toMatch(/opengraph-image/);
  });
});

test.describe("project metadata", () => {
  for (const project of DETAIL) {
    test(`${project.slug} carries its own title, description, and OG image`, async ({ page }) => {
      await page.goto(`/work/${project.slug}`);

      await expect(page).toHaveTitle(`${project.name} — ${SITE.name}`);
      expect(await content(page, 'meta[name="description"]')).toBe(project.summary);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(
        `${SITE.url}/work/${project.slug}`,
      );
      expect(await content(page, 'meta[property="og:image"]')).toMatch(
        new RegExp(`^${SITE.url}/work/${project.slug}/opengraph-image`),
      );
      expect(await content(page, 'meta[property="og:type"]')).toBe("article");
    });
  }

  test("every project OG image renders at 1200x630 PNG", async ({ request }) => {
    for (const project of DETAIL) {
      const res = await request.get(`/work/${project.slug}/opengraph-image`);
      expect(res.status(), project.slug).toBe(200);
      expect(res.headers()["content-type"], project.slug).toContain("image/png");

      // PNG IHDR: 8-byte signature, 4-byte length, "IHDR", then width and height
      // as big-endian uint32. Cheaper and more honest than trusting the tag.
      const body = await res.body();
      expect(body.readUInt32BE(16), `${project.slug} width`).toBe(1200);
      expect(body.readUInt32BE(20), `${project.slug} height`).toBe(630);
    }
  });

  test("no two projects share an OG image", async ({ request }) => {
    const bytes = await Promise.all(
      DETAIL.map(async (p) => {
        const res = await request.get(`/work/${p.slug}/opengraph-image`);
        return (await res.body()).length;
      }),
    );
    // Identical length across every project would mean the slug is being
    // ignored and one generic card is served five times.
    expect(new Set(bytes).size).toBe(DETAIL.length);
  });
});

test.describe("crawlability", () => {
  test("robots.txt allows indexing and names the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("Allow: /");
    expect(text).toContain(`${SITE.url}/sitemap.xml`);
  });

  test("sitemap lists the home page and every detail page", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();

    expect(xml).toContain(`<loc>${SITE.url}/</loc>`);
    for (const project of DETAIL) {
      expect(xml, project.slug).toContain(`<loc>${SITE.url}/work/${project.slug}</loc>`);
    }
  });

  test("the sitemap does not list card-only projects", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).not.toContain("/work/mimesa");
  });
});
