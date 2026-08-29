import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { ogFonts } from "@/app/_og/fonts";
import { OG } from "@/app/_og/theme";
import { findProject, loadDetailProjects } from "@/lib/content";
import { SITE } from "@/data/site";

export const alt = "Project";
export const size = OG.size;
export const contentType = "image/png";

export function generateStaticParams() {
  return loadDetailProjects().map(({ frontmatter }) => ({ slug: frontmatter.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project?.frontmatter.detailPage) notFound();

  const { frontmatter } = project;
  const fonts = await ogFonts();
  // Six is where the row still breathes at 1200px; the rest are on the page.
  const tags = frontmatter.tags.slice(0, 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${OG.bgA} 0%, ${OG.bgB} 100%)`,
          color: OG.ink,
          fontFamily: "Plex",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 44, height: 3, background: OG.signal }} />
            <div style={{ marginLeft: 16, fontSize: 21, letterSpacing: 3, color: OG.slate }}>
              {frontmatter.category.toUpperCase()}
            </div>
          </div>

          <div
            style={{
              marginTop: 32,
              fontFamily: "Bricolage",
              fontSize: frontmatter.name.length > 24 ? 60 : 74,
              lineHeight: 1.06,
              letterSpacing: -2,
            }}
          >
            {frontmatter.name}
          </div>

          <div style={{ marginTop: 24, fontSize: 27, lineHeight: 1.45, color: OG.slate }}>
            {frontmatter.summary}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 26 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  marginRight: 10,
                  marginTop: 10,
                  padding: "7px 16px",
                  borderRadius: 999,
                  border: `1px solid ${OG.line}`,
                  fontSize: 20,
                  color: OG.slate,
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 24,
              borderTop: `1px solid ${OG.line}`,
              fontSize: 21,
              color: OG.slate,
            }}
          >
            <div style={{ display: "flex" }}>{SITE.name}</div>
            <div style={{ display: "flex" }}>{frontmatter.period}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
