import { expect, test, type Page } from "@playwright/test";

/**
 * Plan section 5 makes the theme wipe the site's signature moment: a View
 * Transitions circular reveal expanding from the toggle's own coordinates,
 * feature-detected, falling back to an instant swap, and skipped entirely
 * under reduced motion.
 *
 * Every condition here is FORCED rather than inferred from the browser. Phase 2
 * shipped a suite that silently tested one code path twice because it assumed
 * WebKit lacked a feature it had since shipped.
 */

/** Records calls to startViewTransition without suppressing the real one. */
const SPY_VIEW_TRANSITION = () => {
  const w = window as unknown as { __vt: number };
  w.__vt = 0;
  const doc = document as unknown as { startViewTransition?: unknown };
  // Mirrors the real ViewTransition shape — the implementation awaits `ready`
  // before animating, so a stub without it would fail for the wrong reason.
  doc.startViewTransition = (cb: () => void) => {
    w.__vt += 1;
    const done = Promise.resolve(cb());
    return {
      ready: Promise.resolve(),
      updateCallbackDone: done,
      finished: done,
      skipTransition: () => {},
    };
  };
};

/** Removes the API so the fallback path is the only one available. */
const REMOVE_VIEW_TRANSITION = () => {
  const w = window as unknown as { __vt: number };
  w.__vt = 0;
  delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
};

const toggle = (page: Page) => page.getByRole("button", { name: "Dark theme" });
const themeOf = (page: Page) => page.locator("html").getAttribute("data-theme");
const vtCount = (page: Page) => page.evaluate(() => (window as unknown as { __vt: number }).__vt);

test.describe("theme wipe", () => {
  test("uses a view transition when the API is available", async ({ page }) => {
    await page.addInitScript(SPY_VIEW_TRANSITION);
    await page.goto("/");
    const before = await themeOf(page);

    await toggle(page).click();

    await expect.poll(() => themeOf(page)).not.toBe(before);
    expect(await vtCount(page), "startViewTransition was not used").toBeGreaterThan(0);
  });

  test("still switches theme when the API is missing", async ({ page }) => {
    await page.addInitScript(REMOVE_VIEW_TRANSITION);
    await page.goto("/");
    const before = await themeOf(page);

    await toggle(page).click();

    await expect.poll(() => themeOf(page)).not.toBe(before);
    expect(await vtCount(page)).toBe(0);
  });

  test("exposes the origin coordinates the reveal expands from", async ({ page }) => {
    await page.addInitScript(SPY_VIEW_TRANSITION);
    await page.goto("/");
    await toggle(page).click();

    // The circular reveal is centred on the button, not the viewport corner.
    const origin = await page.evaluate(() => ({
      x: document.documentElement.style.getPropertyValue("--wipe-x"),
      y: document.documentElement.style.getPropertyValue("--wipe-y"),
    }));
    expect(origin.x, "--wipe-x must be set from the button's position").not.toBe("");
    expect(origin.y, "--wipe-y must be set from the button's position").not.toBe("");
  });

  test.describe("under reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("skips the transition but still switches theme", async ({ page }) => {
      await page.addInitScript(SPY_VIEW_TRANSITION);
      await page.goto("/");
      const before = await themeOf(page);

      await toggle(page).click();

      await expect.poll(() => themeOf(page)).not.toBe(before);
      expect(await vtCount(page), "no transition may run under reduce").toBe(0);
    });
  });
});

test.describe("scroll reveals", () => {
  test("content below the fold starts hidden and reveals on scroll", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");

    const initial = await contact.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(initial), "#contact should start faded out").toBeLessThan(1);

    await contact.scrollIntoViewIfNeeded();
    await expect.poll(() => contact.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  // NOTE: this passes under the previous viewport config too, so it is a floor
  // rather than a regression guard for that change. It asserts the reveal is
  // not triggered by a section merely clipping the viewport edge, which is the
  // behaviour worth keeping whatever the trigger values are.
  test("does not fire while the section is only clipping the viewport bottom", async ({
    page,
  }) => {
    await page.goto("/");

    // Park #contact so its top edge sits just inside the bottom of the viewport.
    await page.evaluate(() => {
      const el = document.querySelector("#contact")!;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight + 24);
    });
    await page.waitForTimeout(400);

    const clipping = await page
      .locator("#contact")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(clipping), "reveal fired too early").toBeLessThan(1);

    // Bring it properly into view; now it must reveal.
    await page.evaluate(() => {
      const el = document.querySelector("#contact")!;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.45);
    });
    await expect
      .poll(() => page.locator("#contact").evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");
  });

  test("reveals only once — scrolling away does not re-hide", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await expect.poll(() => contact.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    expect(await contact.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test.describe("under reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("everything is visible without scrolling into view", async ({ page }) => {
      await page.goto("/");
      for (const id of ["#about", "#work", "#skills", "#experience", "#contact"]) {
        const opacity = await page.locator(id).evaluate((el) => getComputedStyle(el).opacity);
        expect(Number(opacity), `${id} must not be hidden under reduce`).toBe(1);
      }
    });

    test("nothing is offset by a reveal transform", async ({ page }) => {
      await page.goto("/");
      for (const id of ["#about", "#work", "#contact"]) {
        const transform = await page.locator(id).evaluate((el) => getComputedStyle(el).transform);
        expect(["none", "matrix(1, 0, 0, 1, 0, 0)"], `${id}`).toContain(transform);
      }
    });
  });
});

test.describe("hero load sequence", () => {
  test("headline and meta are visible once the sequence settles", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hero-heading")).toBeVisible();
    await expect
      .poll(() => page.locator("#hero-heading").evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");
  });

  test.describe("under reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("renders immediately with no entrance animation", async ({ page }) => {
      await page.goto("/");
      const opacity = await page
        .locator("#hero-heading")
        .evaluate((el) => getComputedStyle(el).opacity);
      expect(Number(opacity)).toBe(1);
    });
  });
});
