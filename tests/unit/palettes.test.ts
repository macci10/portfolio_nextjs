import { describe, expect, it } from "vitest";
import { FOREGROUND, PALETTES, SECTIONS } from "@/lib/palettes";
import { contrastRatio, mixHex } from "@/lib/contrast";

const HEX = /^#[0-9a-fA-F]{6}$/;
const THEMES = ["dark", "light"] as const;

describe("palettes", () => {
  it("has one stop per section in both themes", () => {
    expect(PALETTES.dark).toHaveLength(SECTIONS.length);
    expect(PALETTES.light).toHaveLength(SECTIONS.length);
  });

  it("has identical stop counts across themes", () => {
    expect(PALETTES.dark.length).toBe(PALETTES.light.length);
  });

  it("uses valid 6-digit hex for every colour", () => {
    for (const theme of THEMES) {
      for (const stop of PALETTES[theme]) {
        for (const colour of stop) expect(colour).toMatch(HEX);
      }
    }
  });

  it("gives every stop two colours", () => {
    for (const theme of THEMES) {
      for (const stop of PALETTES[theme]) expect(stop).toHaveLength(2);
    }
  });
});

describe("contrast gate", () => {
  // Text sits over the gradient, so the stop midpoint is the case to measure.
  it.each(THEMES)("keeps --ink >= 4.5:1 on every %s stop", (theme) => {
    for (const [index, stop] of PALETTES[theme].entries()) {
      const bg = mixHex(stop[0], stop[1]);
      const ratio = contrastRatio(FOREGROUND[theme].ink, bg);
      expect(ratio, `${theme} stop ${index} (${bg}) vs ink`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(THEMES)("keeps --slate >= 4.5:1 on every %s stop", (theme) => {
    for (const [index, stop] of PALETTES[theme].entries()) {
      const bg = mixHex(stop[0], stop[1]);
      const ratio = contrastRatio(FOREGROUND[theme].slate, bg);
      expect(ratio, `${theme} stop ${index} (${bg}) vs slate`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(THEMES)("keeps --signal >= 4.5:1 on every %s stop", (theme) => {
    for (const [index, stop] of PALETTES[theme].entries()) {
      const bg = mixHex(stop[0], stop[1]);
      const ratio = contrastRatio(FOREGROUND[theme].signal, bg);
      expect(ratio, `${theme} stop ${index} (${bg}) vs signal`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
