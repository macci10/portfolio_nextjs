import { describe, expect, it } from "vitest";
import { resolveStop } from "@/lib/scroll-progress";

const DOC = 6000;
const VIEW = 1000;
const STOPS = 6;
const MAX = DOC - VIEW;

describe("resolveStop", () => {
  it("is at the first stop, unblended, at the top", () => {
    expect(resolveStop(0, DOC, VIEW, STOPS)).toEqual({ index: 0, next: 1, t: 0 });
  });

  it("is at the final stop, fully blended, at the bottom", () => {
    const r = resolveStop(MAX, DOC, VIEW, STOPS);
    expect(r.index).toBe(STOPS - 1);
    expect(r.t).toBe(1);
  });

  it("returns an adjacent pair with t in [0, 1] at a midpoint", () => {
    const r = resolveStop(MAX / 2, DOC, VIEW, STOPS);
    expect(r.next).toBe(r.index + 1);
    expect(r.t).toBeGreaterThanOrEqual(0);
    expect(r.t).toBeLessThanOrEqual(1);
  });

  it("lands exactly on a stop boundary with t = 0", () => {
    // Two of five segments in.
    const r = resolveStop(MAX * (2 / 5), DOC, VIEW, STOPS);
    expect(r.index).toBe(2);
    expect(r.t).toBeCloseTo(0, 6);
  });

  it("never returns next out of bounds, at any scroll position", () => {
    for (let y = -500; y <= MAX + 500; y += 37) {
      const r = resolveStop(y, DOC, VIEW, STOPS);
      expect(r.index).toBeGreaterThanOrEqual(0);
      expect(r.index).toBeLessThan(STOPS);
      expect(r.next).toBeGreaterThanOrEqual(0);
      expect(r.next).toBeLessThan(STOPS);
      expect(r.t).toBeGreaterThanOrEqual(0);
      expect(r.t).toBeLessThanOrEqual(1);
      expect(Number.isNaN(r.t)).toBe(false);
    }
  });

  it("clamps scroll above and below the scrollable range", () => {
    expect(resolveStop(-9999, DOC, VIEW, STOPS)).toEqual({ index: 0, next: 1, t: 0 });
    expect(resolveStop(999999, DOC, VIEW, STOPS).index).toBe(STOPS - 1);
  });

  describe("degenerate input", () => {
    it("rests at stop 0 when the document is shorter than the viewport", () => {
      expect(resolveStop(0, 500, 1000, STOPS)).toEqual({ index: 0, next: 0, t: 0 });
    });

    it("rests at stop 0 when document and viewport are equal — no divide by zero", () => {
      const r = resolveStop(50, 1000, 1000, STOPS);
      expect(r).toEqual({ index: 0, next: 0, t: 0 });
      expect(Number.isNaN(r.t)).toBe(false);
    });

    it("rests at stop 0 with a single stop", () => {
      expect(resolveStop(MAX, DOC, VIEW, 1)).toEqual({ index: 0, next: 0, t: 0 });
    });

    it("does not produce NaN for non-finite dimensions", () => {
      const r = resolveStop(100, Number.NaN, VIEW, STOPS);
      expect(Number.isNaN(r.t)).toBe(false);
    });
  });
});
