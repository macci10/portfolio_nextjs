/**
 * OG palette. Hardcoded hex on purpose: satori supports flexbox only and
 * resolves no custom properties, so the site's design tokens cannot be reused
 * here. These are the dark-theme values from globals.css, kept in step by
 * `og-tokens.test.ts`.
 */
export const OG = {
  size: { width: 1200, height: 630 },
  bgA: "#0d1128",
  bgB: "#17102c",
  ink: "#e9ecf4",
  slate: "#98a2b8",
  signal: "#4da6ff",
  line: "rgba(255, 255, 255, 0.12)",
} as const;

export const contentType = "image/png";
