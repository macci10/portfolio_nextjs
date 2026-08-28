import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Resolved from the vitest root (vitest.config.ts sits at the project root, so
// cwd is pinned there). A `?raw` import would be tidier but Vitest stubs CSS
// imports to an empty string, which fails silently and misleadingly.
const CSS_PATH = resolve(process.cwd(), "src/app/globals.css");
if (!existsSync(CSS_PATH)) {
  throw new Error(`globals.css not found at ${CSS_PATH} — is the vitest root still the repo root?`);
}
const css = readFileSync(CSS_PATH, "utf8");
import { PALETTES, SECTIONS } from "@/lib/palettes";

/**
 * The native `animation-timeline: scroll()` path in globals.css restates the
 * palette as keyframes, because CSS cannot import from TypeScript. That
 * duplication is the whole reason this test exists: if someone retunes
 * palettes.ts and forgets the stylesheet, the two rendering paths silently
 * disagree and only some browsers show the drift as intended.
 */

function keyframeStops(name: string): string[][] {
  const open = css.indexOf(`@keyframes ${name}`);
  if (open === -1) throw new Error(`No @keyframes ${name} in globals.css`);
  // Brace-match rather than assuming the closing brace is at column 0, which
  // any reformat would break with a misleading "not found" error.
  let depth = 0;
  let end = open;
  for (let i = css.indexOf("{", open); i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = css.slice(open, end);

  return [...body.matchAll(/--bg-a:\s*(#[0-9a-f]{6});\s*--bg-b:\s*(#[0-9a-f]{6})/gi)].map(
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
  // There are several reduced-motion blocks in globals.css now, so locate the
  // one that actually pins the gradient rather than relying on its position.
  const block = (() => {
    const chunks = css.split("@media (prefers-reduced-motion: reduce)").slice(1);
    // Match the declaration shape, not just the token name: the first chunk
    // runs to the next media query and sweeps up the keyframes, which mention
    // --bg-a without pinning it.
    const match = chunks.find((c) => /\[data-theme="dark"\]\s*\{\s*--bg-a/.test(c));
    expect(match, "no reduced-motion block pins --bg-a per theme").toBeDefined();
    return match!;
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

describe("keyframe spacing", () => {
  // The length check above catches a missing stop, but nothing verifies the
  // percentages get redistributed — a 7th section must respace 0..100, not
  // append a stop the timeline never reaches.
  it.each(["bg-drift-dark", "bg-drift-light"])("spaces %s evenly across 0-100%%", (name) => {
    const open = css.indexOf(`@keyframes ${name}`);
    const body = css.slice(open, css.indexOf("}\n", css.indexOf("100%", open)));
    const percents = [...body.matchAll(/^\s*(\d+)%\s*\{/gm)].map((m) => Number(m[1]));

    expect(percents).toHaveLength(SECTIONS.length);

    const step = 100 / (SECTIONS.length - 1);
    expect(percents).toEqual(SECTIONS.map((_, i) => Math.round(i * step)));
  });
});
