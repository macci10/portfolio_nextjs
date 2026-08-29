import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/ProjectCard";
import type { ProjectFrontmatter } from "@/lib/schema";

const base: ProjectFrontmatter = {
  slug: "example-project",
  name: "Example Project",
  role: "Mobile Developer",
  period: "2024",
  category: "Test · React Native",
  platforms: ["iOS"],
  featured: false,
  detailPage: false,
  order: 99,
  tags: ["React Native", "TypeScript", "Redux"],
  summary: "A project used to exercise the card in isolation.",
  highlights: [],
  links: {},
  media: [],
};

const card = (overrides: Partial<ProjectFrontmatter> = {}) =>
  render(<ProjectCard project={{ ...base, ...overrides }} />);

describe("ProjectCard", () => {
  it("links the name only when the project has a detail page", () => {
    card({ detailPage: true });
    expect(screen.getByRole("link", { name: "Example Project" })).toHaveAttribute(
      "href",
      "/work/example-project",
    );
  });

  it("renders the name as plain text when there is no detail page", () => {
    card({ detailPage: false });
    // A card with no write-up must not render a read-more affordance that 404s.
    expect(screen.queryByRole("link", { name: "Example Project" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Example Project" })).toBeInTheDocument();
  });

  it("renders every tag", () => {
    card();
    for (const tag of base.tags) expect(screen.getByText(tag)).toBeInTheDocument();
  });

  it("renders both store links when present", () => {
    card({
      links: {
        appStore: "https://apps.apple.com/us/app/example/id1",
        playStore: "https://play.google.com/store/apps/details?id=com.example",
      },
    });
    expect(screen.getByRole("link", { name: "App Store" })).toHaveAttribute(
      "href",
      "https://apps.apple.com/us/app/example/id1",
    );
    expect(screen.getByRole("link", { name: "Play Store" })).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=com.example",
    );
  });

  it("renders a Play Store link with no App Store link", () => {
    // The guard used to be `appStore ?? playStore`, which is correct for nullish
    // but would hide this row behind an empty-string App Store URL.
    card({ links: { playStore: "https://play.google.com/store/apps/details?id=com.example" } });
    expect(screen.getByRole("link", { name: "Play Store" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "App Store" })).toBeNull();
  });

  it("omits the store row entirely when there are no links", () => {
    card({ links: {} });
    expect(screen.queryByRole("link", { name: /store/i })).toBeNull();
  });

  it("shows the period and category", () => {
    card();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("Test · React Native")).toBeInTheDocument();
  });
});
