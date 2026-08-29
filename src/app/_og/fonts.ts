import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Fonts for `ImageResponse` (satori), which cannot use variable fonts — the
 * site's own next/font faces are unusable here. These are pre-instanced static
 * cuts from Google Fonts, verified to carry no `fvar` table.
 *
 * Build-time only: every OG route is statically generated, so these bytes never
 * reach a browser.
 */
const DIR = join(process.cwd(), "src/app/_og");

export async function ogFonts() {
  const [display, body] = await Promise.all([
    readFile(join(DIR, "BricolageGrotesque-ExtraBold.ttf")),
    readFile(join(DIR, "IBMPlexSans-Regular.ttf")),
  ]);

  return [
    { name: "Bricolage", data: display, style: "normal" as const, weight: 800 as const },
    { name: "Plex", data: body, style: "normal" as const, weight: 400 as const },
  ];
}
