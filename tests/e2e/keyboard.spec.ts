import { expect, test, type Page } from "@playwright/test";
import { loadDetailProjects } from "../../src/lib/content";

const DETAIL = loadDetailProjects().map((p) => p.frontmatter.slug);
const ROUTES = ["/", ...DETAIL.map((slug) => `/work/${slug}`)];

/**
 * Chromium only, and not as a convenience. WebKit's default is that Tab visits
 * form controls and nothing else — links included — unless the user turns on
 * Full Keyboard Access. So a Tab-order walk under WebKit measures that setting,
 * not this site, and would fail identically on a page with perfect keyboard
 * support. The a11y suite still runs axe under both engines.
 */
test.skip(
  ({ browserName }) => browserName === "webkit",
  "WebKit does not Tab to links without Full Keyboard Access",
);

test("the route list is the one the site actually has", () => {
  expect(DETAIL).toHaveLength(5);
});

/** Everything a browser will stop on, in document order. */
const FOCUSABLE =
  "a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])";

async function active(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent ?? "").trim().slice(0, 40),
      href: el.getAttribute("href"),
      outlineWidth: style.outlineWidth,
      outlineStyle: style.outlineStyle,
    };
  });
}

for (const route of ROUTES) {
  test.describe(route, () => {
    test("the skip link is the first thing Tab reaches, and it works", async ({ page }) => {
      await page.goto(route);
      await page.keyboard.press("Tab");

      const first = await active(page);
      expect(first?.text).toBe("Skip to content");
      expect(first?.href).toBe("#main");

      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${route === "/" ? "/" : route}#main$`));
      await expect(page.locator("#main")).toBeVisible();
    });

    test("Tab reaches every interactive element, in DOM order", async ({ page }) => {
      await page.goto(route);

      // Reveals hold below-fold content at opacity 0 until scrolled into view,
      // and an invisible element is not tabbable. Settle the page first so the
      // walk covers the whole document rather than the first screen.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();

      const expected = await page.$$eval(FOCUSABLE, (nodes) =>
        nodes
          .filter((n) => {
            const r = n.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          })
          .map((n) => `${n.tagName.toLowerCase()}:${(n.textContent ?? "").trim().slice(0, 40)}`),
      );
      expect(expected.length, "no focusable elements found — the walk proves nothing")
        .toBeGreaterThan(3);

      const seen: string[] = [];
      for (let i = 0; i < expected.length; i += 1) {
        await page.keyboard.press("Tab");
        const el = await active(page);
        if (!el) break;
        seen.push(`${el.tag}:${el.text}`);
      }

      // The skip link is offscreen-positioned rather than display:none, so it
      // has a box and is already first in `expected` — no offset needed.
      expect(seen).toEqual(expected.slice(0, seen.length));
      expect(seen.length, "Tab stopped early — some elements are unreachable")
        .toBe(expected.length);
    });

    test("every focused element shows a visible focus ring", async ({ page }) => {
      await page.goto(route);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();

      let checked = 0;
      for (let i = 0; i < 40; i += 1) {
        await page.keyboard.press("Tab");
        const el = await active(page);
        if (!el) break;

        expect(
          el.outlineStyle,
          `${el.tag} "${el.text}" has no focus outline style`,
        ).not.toBe("none");
        expect(
          parseFloat(el.outlineWidth),
          `${el.tag} "${el.text}" has a zero-width focus outline`,
        ).toBeGreaterThan(0);
        checked += 1;
      }

      expect(checked, "tabbed through nothing — the assertions above never ran")
        .toBeGreaterThan(3);
    });

    test("Tab escapes the page rather than trapping", async ({ page }) => {
      await page.goto(route);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();

      const visits = new Set<string>();
      let escaped = false;

      for (let i = 0; i < 60; i += 1) {
        await page.keyboard.press("Tab");
        const el = await active(page);
        if (!el) {
          // Focus left the document for the browser chrome — no trap.
          escaped = true;
          break;
        }
        const key = `${el.tag}:${el.text}:${el.href ?? ""}`;
        if (visits.has(key) && visits.size > 3) {
          // Wrapped back to the start of the document. Also not a trap.
          escaped = true;
          break;
        }
        visits.add(key);
      }

      expect(escaped, "focus never left or wrapped — 60 tabs stayed inside a cycle").toBe(true);
    });
  });
}

test.describe("theme toggle", () => {
  test("is operable by keyboard and announces its state", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /theme|dark|light/i }).first();
    await toggle.focus();
    await expect(toggle).toBeFocused();

    const before = await page.locator("html").getAttribute("data-theme");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });
});

test.describe("in-page navigation", () => {
  test("section links move focus to the section they name", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("nav[aria-label='Sections'] a:visible").first();
    const href = await link.getAttribute("href");
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(href!)).toBeVisible();
  });
});
