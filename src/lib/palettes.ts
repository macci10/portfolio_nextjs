export const SECTIONS = [
  "hero",
  "about",
  "work",
  "skills",
  "experience",
  "contact",
] as const;

export type Section = (typeof SECTIONS)[number];

/**
 * Six backdrop stops per theme, one per section. Each stop is the pair of
 * colours feeding `linear-gradient(160deg, var(--bg-a), var(--bg-b))`.
 *
 * The drift is deliberately subtle: a slow rotation from cool indigo toward
 * warm plum, not a rainbow. Stops are interpolated in OKLCH (see `oklch.ts`),
 * never sRGB.
 */
export const PALETTES = {
  dark: [
    ["#0D1128", "#17102C"],
    ["#101534", "#1E1133"],
    ["#101C38", "#261232"],
    ["#0F2338", "#2E1330"],
    ["#0E2935", "#37152B"],
    ["#0D2E31", "#401826"],
  ],
  light: [
    ["#E8EBF3", "#EFE9F4"],
    ["#E5EAF3", "#F1E9F3"],
    ["#E2ECF3", "#F3E8F1"],
    ["#E0EEF2", "#F5E8EE"],
    ["#DFF0F0", "#F6E9EB"],
    ["#DEF1ED", "#F8EBE8"],
  ],
} as const;

export type ThemeName = keyof typeof PALETTES;

/** Foreground tokens, mirrored from `globals.css` so tests can gate contrast. */
export const FOREGROUND = {
  dark: { ink: "#E9ECF4", slate: "#98A2B8", signal: "#4DA6FF" },
  light: { ink: "#0E1116", slate: "#57606E", signal: "#0057C8" },
} as const;
