import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadProjects, loadDetailProjects, findProject } from "@/lib/content";
import { ProjectSchema } from "@/lib/schema";
import { SKILL_GROUPS } from "@/data/skills";
import { ENGAGEMENTS } from "@/data/experience";
import { SITE } from "@/data/site";

const PROJECTS = loadProjects().map((p) => p.frontmatter);
const DETAIL = loadDetailProjects();

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

describe("skills grid", () => {
  it.each(EXCLUDED)("does not claim %s", (excluded) => {
    const all = SKILL_GROUPS.flatMap((g) => g.items);
    const hit = all.find((s) => s.toLowerCase() === excluded.toLowerCase());
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

describe("project frontmatter", () => {
  it("loads every project in src/content/projects", () => {
    expect(PROJECTS.length).toBe(12);
  });

  it("has unique slugs", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique order values, so the sort is deterministic", () => {
    const orders = PROJECTS.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("returns projects sorted by order", () => {
    const orders = PROJECTS.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("re-validates cleanly against the schema", () => {
    for (const p of PROJECTS) expect(ProjectSchema.safeParse(p).success, p.slug).toBe(true);
  });

  it("uses lowercase kebab slugs", () => {
    for (const p of PROJECTS) expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("has at least one tag per project", () => {
    for (const p of PROJECTS) expect(p.tags.length, p.slug).toBeGreaterThan(0);
  });

  it("uses absolute https store links only", () => {
    for (const p of PROJECTS) {
      for (const url of [p.links.appStore, p.links.playStore]) {
        if (url) expect(url, p.slug).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("detail pages", () => {
  it("marks exactly five for detail pages", () => {
    expect(DETAIL).toHaveLength(5);
  });

  it("names the five the plan names, in its order", () => {
    expect(DETAIL.map((p) => p.frontmatter.slug)).toEqual([
      "drone-inspection-controller",
      "avomd",
      "strip-reader-poc",
      "maxkids-coloring-world",
      "metal-men",
    ]);
  });

  it("gives every detail-page project a summary", () => {
    for (const { frontmatter } of DETAIL) {
      expect(frontmatter.summary.length, frontmatter.slug).toBeGreaterThan(40);
    }
  });

  it("gives every detail-page project real prose in the body", () => {
    for (const { frontmatter, body } of DETAIL) {
      expect(body.length, frontmatter.slug).toBeGreaterThan(400);
    }
  });

  it("gives every detail-page project highlights", () => {
    for (const { frontmatter } of DETAIL) {
      expect(frontmatter.highlights.length, frontmatter.slug).toBeGreaterThan(2);
    }
  });

  it("leaves projects without a detail page free of body prose", () => {
    // A card-only project rendering a body would mean content nothing links to.
    for (const { frontmatter, body } of loadProjects()) {
      if (!frontmatter.detailPage) expect(body, frontmatter.slug).toBe("");
    }
  });

  it("resolves a known slug and rejects an unknown one", () => {
    expect(findProject("avomd")?.frontmatter.name).toBe("AvoMD");
    expect(findProject("not-a-real-project")).toBeUndefined();
  });
});

describe("media", () => {
  // Without this, every loop below passes vacuously on a project set that
  // happens to carry no media at all — the failure mode phase 2 already hit.
  it("actually has images to check", () => {
    const total = PROJECTS.reduce((n, p) => n + p.media.length, 0);
    expect(total).toBeGreaterThan(0);
  });

  it("points every image at a file that exists in public/", () => {
    for (const p of PROJECTS) {
      for (const m of p.media) {
        expect(m.src, `${p.slug} media src must be a rooted public path`).toMatch(/^\/media\//);
        const onDisk = join(process.cwd(), "public", m.src);
        expect(existsSync(onDisk), `${p.slug}: missing ${m.src}`).toBe(true);
      }
    }
  });

  it("describes the screen rather than naming the file", () => {
    for (const p of PROJECTS) {
      for (const m of p.media) {
        expect(m.alt, p.slug).not.toMatch(/screenshot of|\.(png|jpe?g|webp)/i);
        expect(m.alt.trim().split(/\s+/).length, `${p.slug}: "${m.alt}"`).toBeGreaterThan(3);
      }
    }
  });

  it("carries no screenshots for the NDA project", () => {
    // Plan, "Two content corrections": the Joulea NDA is resolved for the
    // client name and end users only. No code, no screenshots, no diagrams.
    expect(findProject("drone-inspection-controller")?.frontmatter.media).toEqual([]);
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
