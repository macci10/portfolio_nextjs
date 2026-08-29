import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { OG } from "@/app/_og/theme";
import { FOREGROUND, PALETTES } from "@/lib/palettes";

const CSS_PATH = resolve(process.cwd(), "src/app/globals.css");
if (!existsSync(CSS_PATH)) {
  throw new Error(`globals.css not found at ${CSS_PATH} — is the vitest root still the repo root?`);
}
const css = readFileSync(CSS_PATH, "utf8");

/**
 * satori supports flexbox only and resolves no custom properties, so the OG
 * images restate the dark palette as literal hex. That duplication is the whole
 * reason this test exists: retune the theme and forget the OG cards, and every
 * shared link unfurls in last month's colours with nothing failing.
 */
describe("OG palette matches the dark theme", () => {
  const firstStop = PALETTES.dark[0];

  it("uses the first backdrop stop as its gradient", () => {
    expect(OG.bgA.toLowerCase()).toBe(firstStop[0].toLowerCase());
    expect(OG.bgB.toLowerCase()).toBe(firstStop[1].toLowerCase());
  });

  it("uses the dark foreground tokens", () => {
    expect(OG.ink.toLowerCase()).toBe(FOREGROUND.dark.ink.toLowerCase());
    expect(OG.slate.toLowerCase()).toBe(FOREGROUND.dark.slate.toLowerCase());
    expect(OG.signal.toLowerCase()).toBe(FOREGROUND.dark.signal.toLowerCase());
  });

  it("matches what globals.css actually declares for the dark theme", () => {
    // Guards against palettes.ts and the stylesheet themselves drifting apart,
    // which would make the two assertions above agree on the wrong value.
    const block = css.slice(css.search(/\[data-theme="dark"\]\s*\{/));
    const declared = (name: string) =>
      block.slice(0, block.indexOf("}")).match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();

    expect(declared("ink")).toBe(OG.ink);
    expect(declared("slate")).toBe(OG.slate);
    expect(declared("signal")).toBe(OG.signal);
    expect(declared("bg-a")).toBe(OG.bgA);
    expect(declared("bg-b")).toBe(OG.bgB);
  });
});

describe("OG canvas", () => {
  it("is the 1200x630 both Open Graph and Twitter expect", () => {
    expect(OG.size).toEqual({ width: 1200, height: 630 });
  });
});
