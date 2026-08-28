import { describe, expect, it } from "vitest";
import { hexToOklch, lerpOklch, oklchToCss, type Oklch } from "@/lib/oklch";
import { PALETTES } from "@/lib/palettes";

/** Reads back an `oklch(L C H)` string, to prove the serialiser round-trips. */
function parseOklchCss(css: string): Oklch {
  const m = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(css);
  if (!m?.[1] || !m[2] || !m[3]) throw new Error(`Unparseable: ${css}`);
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) };
}

const ALL_STOPS = [...PALETTES.dark, ...PALETTES.light].flat();

describe("hexToOklch", () => {
  it("puts lightness in [0, 1] and hue in [0, 360) for every palette colour", () => {
    for (const hex of ALL_STOPS) {
      const { l, c, h } = hexToOklch(hex);
      expect(l, hex).toBeGreaterThanOrEqual(0);
      expect(l, hex).toBeLessThanOrEqual(1);
      expect(c, hex).toBeGreaterThanOrEqual(0);
      expect(h, hex).toBeGreaterThanOrEqual(0);
      expect(h, hex).toBeLessThan(360);
    }
  });

  it("maps white and black to the expected extremes", () => {
    expect(hexToOklch("#ffffff").l).toBeCloseTo(1, 2);
    expect(hexToOklch("#000000").l).toBeCloseTo(0, 2);
    expect(hexToOklch("#000000").c).toBeCloseTo(0, 3);
  });

  it("gives greys near-zero chroma", () => {
    expect(hexToOklch("#808080").c).toBeLessThan(0.002);
  });

  it("rejects malformed input", () => {
    expect(() => hexToOklch("#12345")).toThrow();
    expect(() => hexToOklch("rebeccapurple")).toThrow();
  });

  it("accepts hex with or without the leading hash", () => {
    expect(hexToOklch("0D1128")).toEqual(hexToOklch("#0D1128"));
  });
});

describe("oklchToCss", () => {
  it("round-trips every palette colour within tolerance", () => {
    for (const hex of ALL_STOPS) {
      const original = hexToOklch(hex);
      const parsed = parseOklchCss(oklchToCss(original));
      expect(parsed.l, hex).toBeCloseTo(original.l, 3);
      expect(parsed.c, hex).toBeCloseTo(original.c, 3);
      expect(parsed.h, hex).toBeCloseTo(original.h, 1);
    }
  });

  it("emits a valid CSS oklch() value", () => {
    expect(oklchToCss({ l: 0.23, c: 0.06, h: 276 })).toBe("oklch(0.2300 0.0600 276.00)");
  });
});

describe("lerpOklch", () => {
  const a: Oklch = { l: 0.2, c: 0.05, h: 270 };
  const b: Oklch = { l: 0.8, c: 0.15, h: 30 };

  it("returns the start colour at t = 0", () => {
    expect(lerpOklch(a, b, 0)).toEqual(a);
  });

  it("returns the end colour at t = 1", () => {
    const r = lerpOklch(a, b, 1);
    expect(r.l).toBeCloseTo(b.l, 6);
    expect(r.c).toBeCloseTo(b.c, 6);
    expect(r.h).toBeCloseTo(b.h, 6);
  });

  it("interpolates lightness and chroma linearly", () => {
    const r = lerpOklch(a, b, 0.5);
    expect(r.l).toBeCloseTo(0.5, 6);
    expect(r.c).toBeCloseTo(0.1, 6);
  });

  // The bug this module exists to prevent.
  it("takes the shorter arc from 350 to 10, passing through 0", () => {
    const r = lerpOklch({ l: 0.5, c: 0.1, h: 350 }, { l: 0.5, c: 0.1, h: 10 }, 0.5);
    expect(r.h).toBeCloseTo(0, 4);
  });

  it("takes the shorter arc from 10 to 350, also passing through 0", () => {
    const r = lerpOklch({ l: 0.5, c: 0.1, h: 10 }, { l: 0.5, c: 0.1, h: 350 }, 0.5);
    expect(r.h).toBeCloseTo(0, 4);
  });

  it("never sweeps more than 180 degrees", () => {
    for (let from = 0; from < 360; from += 15) {
      for (let to = 0; to < 360; to += 15) {
        const mid = lerpOklch({ l: 0.5, c: 0.1, h: from }, { l: 0.5, c: 0.1, h: to }, 0.5);
        const arc = Math.abs(((mid.h - from + 540) % 360) - 180);
        expect(arc, `${from} -> ${to}`).toBeLessThanOrEqual(90.001);
      }
    }
  });

  it("keeps hue inside [0, 360)", () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const r = lerpOklch({ l: 0.5, c: 0.1, h: 350 }, { l: 0.5, c: 0.1, h: 20 }, t);
      expect(r.h).toBeGreaterThanOrEqual(0);
      expect(r.h).toBeLessThan(360);
    }
  });

  it("clamps t below 0 and above 1", () => {
    expect(lerpOklch(a, b, -3)).toEqual(lerpOklch(a, b, 0));
    expect(lerpOklch(a, b, 4)).toEqual(lerpOklch(a, b, 1));
  });
});
