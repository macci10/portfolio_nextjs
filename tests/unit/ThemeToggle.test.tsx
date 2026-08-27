import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ThemeToggle";

const setTheme = vi.fn();
let resolvedTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

beforeEach(() => {
  setTheme.mockClear();
  resolvedTheme = "dark";
  document.head.innerHTML = '<meta name="theme-color" content="#000000" />';
});

describe("ThemeToggle", () => {
  it("renders a button with an accessible name", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Dark theme" })).toBeInTheDocument();
  });

  it("sets aria-pressed true when the resolved theme is dark", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("sets aria-pressed false when the resolved theme is light", () => {
    resolvedTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to light when clicked while dark", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button"));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("switches to dark when clicked while light", async () => {
    resolvedTheme = "light";
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button"));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("keeps the theme-color meta in step with the resolved theme", () => {
    render(<ThemeToggle />);
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#0d1128",
    );
  });

  it("renders without throwing when no theme has resolved yet", () => {
    resolvedTheme = "";
    expect(() => render(<ThemeToggle />)).not.toThrow();
  });
});
