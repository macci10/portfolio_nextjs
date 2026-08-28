import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PALETTES, SECTIONS } from "@/lib/palettes";

/**
 * The native `animation-timeline: scroll()` path in globals.css restates the
 * palette as keyframes, because CSS cannot import from TypeScript. That
 * duplication is the whole reason this test exists: if someone retunes
 * palettes.ts and forgets the stylesheet, the two rendering paths silently
 * disagree and only some browsers show the drift as intended.
 */
const css = readFileSync("src/app/globals.css", "utf8");

function keyframeStops(name: string): string[][] {
  const block = new RegExp(`@keyframes ${name}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css);
  if (!block?.[1]) throw new Error(`No @keyframes ${name} in globals.css`);

  return [...block[1].matchAll(/--bg-a:\s*(#[0-9a-f]{6});\s*--bg-b:\s*(#[0-9a-f]{6})/gi)].map(
    (m) => [m[1]!.toLowerCase(), m[2]!.toLowerCase()],
  );
}

describe.each([
  ["bg-drift-dark", "dark"],
  ["bg-drift-light", "light"],
] as const)("%s keyframes", (name, theme) => {
  const stops = keyframeStops(name);

  it("declares one keyframe per section", () => {
    expect(stops).toHaveLength(SECTIONS.length);
  });

  it("matches PALETTES exactly, in order", () => {
    const expected = PALETTES[theme].map(([a, b]) => [a.toLowerCase(), b.toLowerCase()]);
    expect(stops).toEqual(expected);
  });
});

describe("native path wiring", () => {
  it("is guarded behind an @supports check", () => {
    expect(css).toMatch(/@supports \(animation-timeline: scroll\(\)\)/);
  });

  it("is disabled under reduced motion", () => {
    // Slice from the @supports opener to the first @keyframes that follows it.
    const start = css.indexOf("@supports (animation-timeline: scroll())");
    const end = css.indexOf("@keyframes", start);
    expect(start, "@supports block not found").toBeGreaterThan(-1);
    expect(end, "@keyframes must follow the @supports block").toBeGreaterThan(start);
    expect(css.slice(start, end)).toMatch(/@media not \(prefers-reduced-motion: reduce\)/);
  });

  it("registers both gradient properties as interpolatable colours", () => {
    for (const prop of ["--bg-a", "--bg-b"]) {
      const at = new RegExp(`@property ${prop}\\s*\\{[\\s\\S]*?syntax:\\s*"<color>"`).exec(css);
      expect(at, `${prop} must be registered with syntax "<color>"`).not.toBeNull();
    }
  });
});

describe("reduced-motion stop", () => {
  // globals.css pins the midpoint stop in CSS so it is correct on first paint.
  // That hardcodes two more colours away from palettes.ts, so guard them too.
  const block = (() => {
    const start = css.lastIndexOf("@media (prefers-reduced-motion: reduce)");
    expect(start, "reduced-motion stop block not found").toBeGreaterThan(-1);
    return css.slice(start);
  })();

  it.each(["dark", "light"] as const)("pins %s to PALETTES[theme][2]", (theme) => {
    const m = new RegExp(
      `\\[data-theme="${theme}"\\]\\s*\\{\\s*--bg-a:\\s*(#[0-9a-f]{6});\\s*--bg-b:\\s*(#[0-9a-f]{6})`,
      "i",
    ).exec(block);

    expect(m, `no reduced-motion override for ${theme}`).not.toBeNull();

    const midpoint = PALETTES[theme][2]!;
    expect([m![1]!.toLowerCase(), m![2]!.toLowerCase()]).toEqual([
      midpoint[0].toLowerCase(),
      midpoint[1].toLowerCase(),
    ]);
  });
});
