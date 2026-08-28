/**
 * OKLCH colour conversion and interpolation.
 *
 * Why OKLCH and not sRGB: interpolating two saturated colours in RGB drags the
 * midpoint through grey, which on a full-viewport gradient reads as a dirty
 * smear. OKLCH is perceptually uniform, so the midpoint stays clean.
 *
 * Conversions follow Björn Ottosson's OKLab derivation. Pure functions, no DOM,
 * so they are unit-testable in isolation.
 */

export type Oklch = { l: number; c: number; h: number };

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** sRGB 0–255 channel to linear-light 0–1. */
function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function hexToOklch(hex: string): Oklch {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Not a 6-digit hex colour: ${hex}`);
  const n = parseInt(m[1], 16);

  const r = linearise((n >> 16) & 255);
  const g = linearise((n >> 8) & 255);
  const b = linearise(n & 255);

  // Linear sRGB -> LMS
  const lms0 = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const lms1 = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const lms2 = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(lms0);
  const m_ = Math.cbrt(lms1);
  const s_ = Math.cbrt(lms2);

  // LMS -> OKLab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // OKLab -> OKLCH
  const c = Math.sqrt(a * a + bb * bb);
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;

  return { l: L, c, h };
}

/** Serialises to a CSS `oklch()` value, e.g. "oklch(0.23 0.06 276)". */
export function oklchToCss({ l, c, h }: Oklch): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}

/**
 * Interpolates two OKLCH colours.
 *
 * Hue takes the SHORTER arc around the circle: 350 to 10 passes through 0, not
 * the long way round through 180. Getting this wrong is the bug that would
 * otherwise ship — the gradient would sweep the entire spectrum mid-scroll —
 * and it is why this module has tests.
 *
 * `t` is clamped to [0, 1].
 */
export function lerpOklch(a: Oklch, b: Oklch, t: number): Oklch {
  const k = clamp01(t);

  // Shortest signed hue delta, in (-180, 180].
  const delta = (((b.h - a.h + 540) % 360) - 180 + 360) % 360;
  const signed = delta > 180 ? delta - 360 : delta;

  return {
    l: a.l + (b.l - a.l) * k,
    c: a.c + (b.c - a.c) * k,
    h: (((a.h + signed * k) % 360) + 360) % 360,
  };
}
