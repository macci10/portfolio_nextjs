"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { hexToOklch, lerpOklch, oklchToCss } from "@/lib/oklch";
import { resolveStop } from "@/lib/scroll-progress";
import { PALETTES } from "@/lib/palettes";
import styles from "./Backdrop.module.css";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const NATIVE_TIMELINE = "animation-timeline: scroll()";

// PALETTES is static, so convert once rather than on every theme change.
const STOPS = {
  dark: PALETTES.dark.map(([a, b]) => [hexToOklch(a), hexToOklch(b)] as const),
  light: PALETTES.light.map(([a, b]) => [hexToOklch(a), hexToOklch(b)] as const),
} as const;

function write(a: string, b: string) {
  const root = document.documentElement.style;
  root.setProperty("--bg-a", a);
  root.setProperty("--bg-b", b);
}

/**
 * Hands the gradient back to the stylesheet.
 *
 * Inline custom properties outrank author rules, so a stale write from this
 * driver would keep overriding the reduced-motion block in globals.css. The
 * properties must be removed, not overwritten.
 */
function release() {
  const root = document.documentElement.style;
  root.removeProperty("--bg-a");
  root.removeProperty("--bg-b");
}

/** Tracks a media query reactively, so runtime preference changes are honoured. */
function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/**
 * The single backdrop layer: base gradient, aurora, grain.
 *
 * Exactly one fixed element sits behind everything and its two gradient stops
 * are driven by scroll progress. Per-section backgrounds seam no matter how
 * they are crossfaded; there is nothing to seam if there is only one layer.
 *
 * Three paths, in order of preference:
 *   1. Reduced motion — globals.css pins the midpoint stop. JS releases the
 *      properties so the stylesheet wins, and does nothing else.
 *   2. Native CSS — `animation-timeline: scroll()` drives the properties off
 *      the main thread. Also released, for the same reason.
 *   3. rAF fallback — interpolate in OKLCH and write to :root, scheduling a
 *      frame only when scroll or layout actually changed.
 */
export function Backdrop() {
  const { resolvedTheme } = useTheme();
  const reduced = useMediaQuery(REDUCED_MOTION);

  useEffect(() => {
    // `null` means the media query has not been read yet; acting now would
    // write a value we might immediately have to undo.
    if (!resolvedTheme || reduced === null) return;

    const stops = STOPS[resolvedTheme === "light" ? "light" : "dark"];

    if (reduced) {
      release();
      return;
    }

    if (typeof CSS !== "undefined" && CSS.supports(NATIVE_TIMELINE)) {
      release();
      return;
    }

    let scrollY = window.scrollY;
    let docHeight = document.documentElement.scrollHeight;
    let viewport = window.innerHeight;
    let lastA = "";
    let lastB = "";
    let frame = 0;

    const paint = () => {
      const { index, next, t } = resolveStop(scrollY, docHeight, viewport, stops.length);
      const from = stops[index];
      const to = stops[next];
      if (!from || !to) return;

      const a = oklchToCss(lerpOklch(from[0], to[0], t));
      const b = oklchToCss(lerpOklch(from[1], to[1], t));
      if (a !== lastA || b !== lastB) {
        write(a, b);
        lastA = a;
        lastB = b;
      }
    };

    // The loop idles instead of running forever: a frame is scheduled only in
    // response to scroll or a layout change. Without this the page burns a
    // frame's work every 16ms while sitting still.
    const tick = () => {
      frame = 0;
      paint();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      // Layout reads must never happen here — measuring during scroll forces
      // synchronous layout every frame.
      scrollY = window.scrollY;
      schedule();
    };

    // A resize changes the scroll mapping without firing a scroll event.
    const measure = () => {
      docHeight = document.documentElement.scrollHeight;
      viewport = window.innerHeight;
      schedule();
    };

    // ResizeObserver on the root also covers viewport resizes; the resize
    // listener is belt-and-braces for browsers that report them differently.
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    // Paint synchronously so a theme change does not show one stale frame.
    paint();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      release();
    };
  }, [resolvedTheme, reduced]);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.aurora} />
      <div className={styles.grain} />
    </div>
  );
}
