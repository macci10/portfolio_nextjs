import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/data/projects";
import { SKILL_GROUPS } from "@/data/skills";
import { ENGAGEMENTS } from "@/data/experience";
import { SITE } from "@/data/site";

/**
 * Plan section 1 is explicit that nothing may appear in the skills grid that is
 * not in portfolio-content.md, and names the exclusions. The site is what an
 * interviewer reads before asking questions, so this is a correctness gate, not
 * a style preference.
 */
const EXCLUDED = [
  "GraphQL", "Apollo", "React Query", "TanStack Query", "Sentry",
  "Jetpack Compose", "Room", "Riverpod", "Bloc", "GetX", "Terraform",
  "Firestore Security Rules", "Detox", "Appium", "Reanimated", "Skia", "Zustand",
];

const allSkills = SKILL_GROUPS.flatMap((g) => g.items);

describe("skills grid", () => {
  it.each(EXCLUDED)("does not claim %s", (excluded) => {
    const hit = allSkills.find((s) => s.toLowerCase() === excluded.toLowerCase());
    expect(hit, `"${excluded}" is on the exclusions list in plan section 1`).toBeUndefined();
  });

  it("has no duplicate entries within a group", () => {
    // Across groups, repeats are intentional and match the content file:
    // TypeScript and Dart are listed under both Cross-platform and Languages,
    // which are different framings of the same skill. Within one group a
    // repeat is always a mistake.
    for (const group of SKILL_GROUPS) {
      expect(new Set(group.items).size, group.name).toBe(group.items.length);
    }
  });

  it("has a non-empty item list in every group", () => {
    for (const group of SKILL_GROUPS) expect(group.items.length, group.name).toBeGreaterThan(0);
  });
});

describe("projects", () => {
  it("has unique slugs", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("marks exactly five for detail pages", () => {
    expect(PROJECTS.filter((p) => p.detailPage)).toHaveLength(5);
  });

  it("names the five the plan names, in its order", () => {
    expect(
      PROJECTS.filter((p) => p.detailPage)
        .sort((a, b) => a.order - b.order)
        .map((p) => p.slug),
    ).toEqual([
      "drone-inspection-controller",
      "avomd",
      "strip-reader-poc",
      "maxkids-coloring-world",
      "metal-men",
    ]);
  });

  it("gives every detail-page project a summary", () => {
    for (const p of PROJECTS.filter((x) => x.detailPage)) {
      expect(p.summary.length, p.slug).toBeGreaterThan(40);
    }
  });

  it("uses lowercase kebab slugs", () => {
    for (const p of PROJECTS) expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("has at least one tag per project", () => {
    for (const p of PROJECTS) expect(p.tags.length, p.slug).toBeGreaterThan(0);
  });

  it("uses absolute https store links only", () => {
    for (const p of PROJECTS) {
      for (const url of [p.links?.appStore, p.links?.playStore]) {
        if (url) expect(url, p.slug).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("no placeholder content ships", () => {
  const strings = JSON.stringify({ PROJECTS, SKILL_GROUPS, ENGAGEMENTS, SITE });

  it.each(["lorem", "XXX", "TODO"])("contains no %s", (needle) => {
    expect(strings.toLowerCase()).not.toContain(needle.toLowerCase());
  });
});

describe("contact details", () => {
  // Plan section 1: no phone number anywhere on the site.
  it("exposes no phone number", () => {
    expect(JSON.stringify(SITE)).not.toMatch(/\+92|342-?4449161/);
  });
});
