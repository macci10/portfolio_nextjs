import type { MetadataRoute } from "next";
import { loadDetailProjects } from "@/lib/content";
import { SITE } from "@/data/site";

/**
 * `metadataBase` does not apply here — Next passes sitemap URLs through
 * untouched, and the sitemaps protocol requires an absolute <loc>. A relative
 * one is silently rejected by search engines, so the origin is explicit.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "monthly", priority: 1 },
    ...loadDetailProjects().map(({ frontmatter }) => ({
      url: `${SITE.url}/work/${frontmatter.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
