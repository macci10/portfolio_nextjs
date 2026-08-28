import { expect, test } from "@playwright/test";

const toggle = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Dark theme" });

test.describe("theme", () => {
  test("toggles data-theme on <html>", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    await toggle(page).click();
    await expect(html).not.toHaveAttribute("data-theme", before ?? "");
  });

  test("aria-pressed reflects the active theme", async ({ page }) => {
    await page.goto("/");
    const button = toggle(page);
    const isDark = (await page.locator("html").getAttribute("data-theme")) === "dark";
    await expect(button).toHaveAttribute("aria-pressed", String(isDark));
  });

  test("persists the choice across reload", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");

    await toggle(page).click();
    // The theme wipe applies the change inside a view-transition callback, so
    // the swap is asynchronous. Wait for it before capturing what was chosen —
    // reading synchronously here captures the pre-click value.
    await expect(html).not.toHaveAttribute("data-theme", before ?? "");
    const chosen = await html.getAttribute("data-theme");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", chosen ?? "");
  });

  test.describe("honours the OS preference on first visit", () => {
    test.use({ colorScheme: "dark" });
    test("starts dark when the OS is dark", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    });
  });

  test.describe("light OS preference", () => {
    test.use({ colorScheme: "light" });
    test("starts light when the OS is light", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    });
  });

  test("has no FOUC — data-theme is set by the time the DOM is interactive", async ({
    page,
  }) => {
    // Captured inside the page before hydration, not read afterwards.
    await page.addInitScript(() => {
      const record = () => {
        (window as unknown as { __themeAtInteractive?: string | null }).__themeAtInteractive =
          document.documentElement.getAttribute("data-theme");
      };
      document.addEventListener("readystatechange", () => {
        if (document.readyState === "interactive") record();
      });
    });
    await page.goto("/");
    const atInteractive = await page.evaluate(
      () => (window as unknown as { __themeAtInteractive?: string | null }).__themeAtInteractive,
    );
    expect(atInteractive).toMatch(/^(dark|light)$/);
  });
});
