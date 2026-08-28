"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import styles from "./ThemeToggle.module.css";

const THEME_COLOR = { dark: "#0d1128", light: "#e8ebf3" } as const;

const WIPE_MS = 480;

type ViewTransitionLike = { ready: Promise<void> };

/**
 * The site's signature moment: a circular reveal of the incoming theme,
 * expanding from the toggle's own coordinates rather than from a screen edge.
 *
 * Falls back to an instant swap wherever View Transitions are unavailable, and
 * is skipped entirely under reduced motion. Plan section 5 spends the visual
 * boldness here, which is why everything else on the page stays quiet.
 */
function wipe(button: HTMLElement, apply: () => void) {
  const start = document.startViewTransition?.bind(document);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!start || reduced) {
    apply();
    return;
  }

  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Published so the stylesheet can position the pseudo-elements, and so the
  // origin is inspectable rather than trapped in a closure.
  const root = document.documentElement;
  root.style.setProperty("--wipe-x", `${x}px`);
  root.style.setProperty("--wipe-y", `${y}px`);

  // Radius to the furthest corner, so the circle always clears the viewport.
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = start(() => {
    // The DOM must be updated synchronously inside the callback, or the
    // transition captures the old state twice and nothing appears to change.
    flushSync(apply);
  }) as ViewTransitionLike;

  void transition.ready.then(() => {
    root.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
      },
      {
        duration: WIPE_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}

function SunIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.4v2.4M12 19.2v2.4M4.2 12H1.8M22.2 12h-2.4M6.5 6.5 4.8 4.8M19.2 19.2l-1.7-1.7M17.5 6.5l1.7-1.7M4.8 19.2l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  // Keep the browser chrome in step with the page.
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", isDark ? THEME_COLOR.dark : THEME_COLOR.light);
  }, [mounted, resolvedTheme, isDark]);

  // Before mount the resolved theme is unknown. Rendering either icon here
  // would be a hydration mismatch, so render a same-size inert placeholder.
  if (!mounted) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.toggle}
      aria-pressed={isDark}
      onClick={(event) => wipe(event.currentTarget, () => setTheme(isDark ? "light" : "dark"))}
    >
      <span className="sr-only">Dark theme</span>
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
