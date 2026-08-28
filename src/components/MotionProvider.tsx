"use client";

import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * `domAnimation` is roughly 18kb against the ~34kb full feature set, which is
 * why every animated element in this codebase is `m.*` and never `motion.*` —
 * importing `motion` would pull the whole bundle back in. `strict` makes that
 * a runtime error rather than a silent regression.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
