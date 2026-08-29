import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadProjects, loadDetailProjects, findProject } from "@/lib/content";
import { imageSize } from "./image-dimensions";
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
        // The plan's own examples of what not to write.
        expect(m.alt.trim().toLowerCase(), p.slug).not.toBe(p.name.toLowerCase());
        expect(m.alt.trim().toLowerCase(), p.slug).not.toMatch(/^(screenshot|image)$/);
        expect(m.alt.trim().split(/\s+/).length, `${p.slug}: "${m.alt}"`).toBeGreaterThan(3);
      }
    }
  });

  it("declares the dimensions the file actually has", () => {
    // These two numbers are the entire CLS guarantee. A mismatch reserves the
    // wrong box and the page reflows once the image decodes — which is exactly
    // what the schema requiring them was meant to prevent.
    for (const p of PROJECTS) {
      for (const m of p.media) {
        const actual = imageSize(join(process.cwd(), "public", m.src));
        expect(actual, `${p.slug}: ${m.src}`).toEqual({ width: m.width, height: m.height });
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
  // Bodies included: frontmatter-only serialisation would miss a TODO left in
  // the prose, which is where it is most likely to be written in the first place.
  const strings = JSON.stringify({
    PROJECTS,
    bodies: loadProjects().map((p) => p.body),
    SKILL_GROUPS,
    ENGAGEMENTS,
    SITE,
  });

  it.each(["lorem", "XXX", "TODO"])("contains no %s", (needle) => {
    expect(strings.toLowerCase()).not.toContain(needle.toLowerCase());
  });
});

/**
 * The plan requires this paragraph verbatim, and it is the one place the site
 * states a limitation rather than a win — iOS is not fully automated. That is
 * more convincing than implying it is, and it is also the sentence a future
 * edit is most likely to quietly soften.
 */
describe("Metal Men CI/CD paragraph", () => {
  const PLAN_TEXT = `CI/CD across four build targets. GitHub Actions runs static analysis, unit
tests, and Android integration tests on an emulator, then builds Android, iOS,
web, and Linux. Fastlane automates Android release signing and Play Store track
promotion through internal → beta → production. Web deploys to Firebase Hosting
on tag. iOS is compile-verified in CI with \`--no-codesign\` and submitted to
TestFlight through a Fastlane lane run locally.`;

  const normalise = (text: string) => text.replace(/\s+/g, " ").trim();

  it("matches the correction in IMPLEMENTATION_PLAN.md section 7", () => {
    const body = findProject("metal-men")?.body ?? "";
    expect(normalise(body)).toContain(normalise(PLAN_TEXT));
  });

  it("still states the iOS limitation plainly", () => {
    const body = findProject("metal-men")?.body ?? "";
    expect(body).toContain("--no-codesign");
    expect(body).toContain("run locally");
  });
});

describe("placeholder media is declared as such", () => {
  // A stand-in image whose alt describes a screen nobody built would read a
  // fabricated account to anyone using a screen reader. The flag is what lets
  // the gallery say so instead.
  it("marks every image that does not show what its alt describes", () => {
    const flagged = PROJECTS.flatMap((p) => p.media).filter((m) => m.placeholder);
    const real = PROJECTS.flatMap((p) => p.media).filter((m) => !m.placeholder);

    // Today every committed image is a stand-in. When real captures land this
    // flips, and the assertion below is what forces the flag to be cleared.
    expect(flagged.length + real.length).toBeGreaterThan(0);
    for (const m of flagged) expect(m.src).toMatch(/^\/media\//);
  });
});

describe("contact details", () => {
  // Plan section 1: no phone number anywhere on the site.
  it("exposes no phone number", () => {
    expect(JSON.stringify(SITE)).not.toMatch(/\+92|342-?4449161/);
  });
});
