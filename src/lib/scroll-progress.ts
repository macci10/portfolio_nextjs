/**
 * Maps scroll position onto a pair of adjacent palette stops plus a blend
 * factor. Pure and DOM-free so the driver's maths is testable without a browser.
 */

export type Stop = { index: number; next: number; t: number };

const AT_REST: Stop = { index: 0, next: 0, t: 0 };

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
  if (stopCount <= 1) return AT_REST;

  const raw = scrollY / scrollable;
  const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;

  const last = stopCount - 1;

  // At the very bottom, settle on the final stop fully blended rather than
  // running off the end of the array.
  if (progress >= 1) return { index: last, next: last, t: 1 };

  const scaled = progress * last;
  const index = Math.floor(scaled);

  return { index, next: Math.min(index + 1, last), t: scaled - index };
}
