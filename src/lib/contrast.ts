/**
 * WCAG 2.1 relative luminance and contrast ratio, plus the gradient-midpoint
 * helper the palette contrast gate uses. Kept dependency-free and pure so it
 * runs in both Vitest and the browser bundle.
 */

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Not a 6-digit hex colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** sRGB 0–255 channel to linear-light 0–1. */
function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** WCAG contrast ratio, always >= 1. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The sRGB midpoint of a two-colour gradient stop. This is the worst realistic
 * case for text sitting over the gradient, so it is what the contrast gate
 * measures against.
 */
export function mixHex(a: string, b: string, t = 0.5): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t);
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(ch(ca.r, cb.r))}${hex(ch(ca.g, cb.g))}${hex(ch(ca.b, cb.b))}`;
}
