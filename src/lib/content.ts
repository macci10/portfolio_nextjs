import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { ProjectSchema, type ProjectFrontmatter } from "./schema";

const CONTENT_DIR = join(process.cwd(), "src/content/projects");

export type LoadedProject = { frontmatter: ProjectFrontmatter; body: string };

/**
 * Reads and validates every project. Server-only — it touches the filesystem,
 * so it must never be imported into a client component.
 *
 * Validation failures throw with the offending file named, which turns a
 * content mistake into a failed build rather than a broken page.
 */
export function loadProjects(): LoadedProject[] {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const projects = files.map((file) => {
    const raw = readFileSync(join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const parsed = ProjectSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in ${file}:\n${parsed.error.message}`);
    }
    if (parsed.data.slug !== file.replace(/\.mdx$/, "")) {
      throw new Error(`Slug "${parsed.data.slug}" does not match filename ${file}`);
    }

    return { frontmatter: parsed.data, body: content.trim() };
  });

  return projects.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function loadDetailProjects(): LoadedProject[] {
  return loadProjects().filter((p) => p.frontmatter.detailPage);
}

export function findProject(slug: string): LoadedProject | undefined {
  return loadProjects().find((p) => p.frontmatter.slug === slug);
}
