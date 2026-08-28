"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { hexToOklch, lerpOklch, oklchToCss } from "@/lib/oklch";
import { resolveStop } from "@/lib/scroll-progress";
import { PALETTES } from "@/lib/palettes";
import styles from "./Backdrop.module.css";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const NATIVE_TIMELINE = "animation-timeline: scroll()";

function write(a: string, b: string) {
  const root = document.documentElement.style;
  root.setProperty("--bg-a", a);
  root.setProperty("--bg-b", b);
}

/**
 * The single backdrop layer: base gradient, aurora, grain.
 *
 * Exactly one fixed element sits behind everything and its two gradient stops
 * are driven by scroll progress. Per-section backgrounds seam no matter how
 * they are crossfaded; there is nothing to seam if there is only one layer.
 *
 * Three paths, in order of preference:
 *   1. Reduced motion  — globals.css pins the midpoint stop; JS does nothing.
 *   2. Native CSS      — `animation-timeline: scroll()` drives the custom
 *                        properties off the main thread; no JS runs.
 *   3. rAF fallback    — this component interpolates in OKLCH and writes to
 *                        :root once per frame, only when the value changed.
 */
export function Backdrop() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const palette = PALETTES[resolvedTheme === "light" ? "light" : "dark"];
    const stops = palette.map(([a, b]) => [hexToOklch(a), hexToOklch(b)] as const);

    // Path 1 — reduced motion. globals.css already pins the midpoint stop, so
    // there is nothing to write: doing it here would repaint after hydration
    // and flash. Just stand down.
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    // Path 2 — let CSS drive it. Cheaper than anything we can do in JS.
    if (typeof CSS !== "undefined" && CSS.supports(NATIVE_TIMELINE)) return;

    // Path 3 — rAF driver.
    let scrollY = window.scrollY;
    let docHeight = document.documentElement.scrollHeight;
    let viewport = window.innerHeight;
    let lastA = "";
    let lastB = "";
    let frame = 0;

    // Layout reads live here and in the resize path, never in the scroll
    // handler — measuring during scroll forces synchronous layout every frame.
    const measure = () => {
      docHeight = document.documentElement.scrollHeight;
      viewport = window.innerHeight;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    const tick = () => {
      const { index, next, t } = resolveStop(scrollY, docHeight, viewport, stops.length);
      const from = stops[index];
      const to = stops[next];

      if (from && to) {
        const a = oklchToCss(lerpOklch(from[0], to[0], t));
        const b = oklchToCss(lerpOklch(from[1], to[1], t));
        // Only touch the DOM when the value actually changed.
        if (a !== lastA || b !== lastB) {
          write(a, b);
          lastA = a;
          lastB = b;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [resolvedTheme]);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.aurora} />
      <div className={styles.grain} />
    </div>
  );
}
