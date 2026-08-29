import { z } from "zod";

/**
 * Frontmatter contract for `src/content/projects/*.mdx`.
 *
 * Validation runs at build time via content.ts, so a malformed field fails the
 * build rather than rendering something wrong on a live page.
 */
export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  role: z.string(),
  period: z.string(),
  category: z.string(),
  platforms: z.array(z.string()),
  featured: z.boolean(),
  detailPage: z.boolean(),
  order: z.number(),
  tags: z.array(z.string()).min(1),
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
  links: z
    .object({
      appStore: z.string().url().optional(),
      playStore: z.string().url().optional(),
    })
    .default({}),
  whatIdImprove: z.string().optional(),
  media: z
    .array(
      z.object({
        src: z.string(),
        // Long enough that it must describe the screen, not name the file.
        alt: z.string().min(15),
        /**
         * A stand-in until the real capture is gathered. The file does not show
         * what `alt` describes, so the gallery must say so rather than read a
         * fabricated description to anyone using a screen reader. Flip this off
         * (or drop it) when the real image replaces the file at the same path.
         */
        placeholder: z.boolean().default(false),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        caption: z.string().optional(),
      }),
    )
    .default([]),
});

export type ProjectFrontmatter = z.infer<typeof ProjectSchema>;
