/**
 * Maps scroll position onto a pair of adjacent palette stops plus a blend
 * factor. Pure and DOM-free so the driver's maths is testable without a browser.
 */

export type Stop = { index: number; next: number; t: number };

// Frozen: this object is returned by reference, so an accidental mutation by a
// caller would silently corrupt every later degenerate result.
const AT_REST: Stop = Object.freeze({ index: 0, next: 0, t: 0 });

export function resolveStop(
  scrollY: number,
  docHeight: number,
  viewportHeight: number,
  stopCount: number,
): Stop {
  // A document shorter than the viewport has no scroll range. Without this the
  // division below is 0/0 and every colour downstream becomes NaN.
  const scrollable = docHeight - viewportHeight;
  if (!Number.isFinite(scrollable) || scrollable <= 0) return AT_REST;
  // Exported as a pure primitive with its own tests, so stay total rather than
  // relying on callers only ever passing window.scrollY.
  if (!Number.isFinite(scrollY)) return AT_REST;
  if (stopCount <= 1) return AT_REST;

  const raw = scrollY / scrollable;
  const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;

  const last = stopCount - 1;

  // At the very bottom, settle on the final stop rather than running off the
  // end of the array. `t` is degenerate when index === next: interpolating a
  // stop with itself yields that stop for any t.
  if (progress >= 1) return { index: last, next: last, t: 1 };

  const scaled = progress * last;
  const index = Math.floor(scaled);

  return { index, next: Math.min(index + 1, last), t: scaled - index };
}
