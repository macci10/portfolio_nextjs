import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ogFonts } from "./_og/fonts";
import { OG } from "./_og/theme";
import { SITE } from "@/data/site";

export const alt = `${SITE.name} — ${SITE.title}`;
export const size = OG.size;
export const contentType = "image/png";

export default async function Image() {
  const [fonts, portrait] = await Promise.all([
    ogFonts(),
    readFile(join(process.cwd(), "public/bilal.png")),
  ]);

  // satori resolves no network or /public URLs — the image has to be inlined.
  const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${OG.bgA} 0%, ${OG.bgB} 100%)`,
          color: OG.ink,
          fontFamily: "Plex",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: 56,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 44, height: 3, background: OG.signal }} />
              <div
                style={{
                  marginLeft: 16,
                  fontSize: 22,
                  letterSpacing: 3,
                  color: OG.slate,
                }}
              >
                {SITE.title.toUpperCase()}
              </div>
            </div>

            <div
              style={{
                marginTop: 34,
                fontFamily: "Bricolage",
                fontSize: 62,
                lineHeight: 1.08,
                letterSpacing: -2,
              }}
            >
              {SITE.name}
            </div>

            <div
              style={{
                marginTop: 26,
                fontSize: 27,
                lineHeight: 1.45,
                color: OG.slate,
              }}
            >
              {SITE.ogBlurb}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              paddingTop: 26,
              borderTop: `1px solid ${OG.line}`,
              fontSize: 22,
              color: OG.slate,
            }}
          >
            {SITE.stackLine}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 300,
            height: 375,
            alignSelf: "center",
            borderRadius: 20,
            border: `1px solid ${OG.line}`,
            background: "rgba(255, 255, 255, 0.05)",
            overflow: "hidden",
          }}
        >
          <img src={portraitSrc} alt="" width={300} height={375} style={{ objectFit: "cover" }} />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
