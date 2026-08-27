"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import styles from "./ThemeToggle.module.css";

const THEME_COLOR = { dark: "#0d1128", light: "#e8ebf3" } as const;

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
      type="button"
      className={styles.toggle}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="sr-only">Dark theme</span>
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
