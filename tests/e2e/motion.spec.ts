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

  test("the sequence actually runs rather than resting at its end state", async ({ page }) => {
    // Opacity 1 is also what an animation that never applied would report, so
    // asserting the settled state proves nothing on its own.
    await page.goto("/");
    const running = await page.evaluate(() =>
      [...document.querySelectorAll("#hero [data-seq]")]
        .flatMap((el) => el.getAnimations())
        .map((a) => (a.effect as KeyframeEffect | null)?.getKeyframes?.().length ?? 0),
    );
    expect(running.length, "no CSS animation is attached to the hero sequence")
      .toBeGreaterThan(2);
  });

  test("the headline animates transform only, never opacity", async ({ page }) => {
    // This is the LCP element. An element at opacity 0 is not painted, so
    // fading it moves the 2.4s render delay this fix removed straight back in —
    // and nothing else in the suite would notice.
    await page.goto("/");
    const props = await page.locator("#hero-heading").evaluate((el) =>
      el
        .getAnimations()
        .flatMap((a) => (a.effect as KeyframeEffect | null)?.getKeyframes?.() ?? [])
        .flatMap((frame) => Object.keys(frame)),
    );

    expect(props.length, "the headline has no entrance animation at all").toBeGreaterThan(0);
    expect(props).not.toContain("opacity");
    expect(props).toContain("transform");
  });

  test("elements after the headline do fade in", async ({ page }) => {
    await page.goto("/");
    const props = await page.locator("#hero .heroMeta, #hero [data-seq]:not(#hero-heading)")
      .first()
      .evaluate((el) =>
        el
          .getAnimations()
          .flatMap((a) => (a.effect as KeyframeEffect | null)?.getKeyframes?.() ?? [])
          .flatMap((frame) => Object.keys(frame)),
      );
    expect(props).toContain("opacity");
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

    test("runs no animation at all", async ({ page }) => {
      // The sequence is CSS now, so `transform: none` alone would lose to a
      // running animation on every frame — `animation: none` is what wins.
      await page.goto("/");
      const count = await page.evaluate(
        () =>
          [...document.querySelectorAll("#hero [data-seq]")].flatMap((el) => el.getAnimations())
            .length,
      );
      expect(count).toBe(0);
    });
  });
});
