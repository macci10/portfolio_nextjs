"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Matches --ease-out in globals.css. Tuple, not number[], for motion's types. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Plan section 6 specifies 12px. That is a floor rather than a law, and at 12px
 * over a 0.5s fade the movement was not perceptible on a real scroll — an
 * approved deviation, agreed with Bilal, so the effect earns the bundle it
 * costs.
 */
const REVEAL_Y = 24;

type Props = {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
};

/**
 * Scroll reveal applied to a whole section rather than to every element inside
 * it — plan section 6 is explicit that per-element effects are what make a page
 * read as templated.
 *
 * Renders the <section> itself so the id stays on the animated element, and
 * children remain server components passed straight through.
 */
export function Reveal({ id, labelledBy, className, children }: Props) {
  const reduced = useReducedMotion();

  // Under reduce the content is present and unstyled — not merely a zero-length
  // animation, which would still ship the transform.
  if (reduced) {
    return (
      <section id={id} aria-labelledby={labelledBy} className={className}>
        {children}
      </section>
    );
  }

  return (
    <m.section
      id={id}
      data-reveal=""
      aria-labelledby={labelledBy}
      className={className}
      initial={{ opacity: 0, y: REVEAL_Y }}
      whileInView={{ opacity: 1, y: 0 }}
      // The trigger line sits well up the viewport rather than at its bottom
      // edge. With the old -10% the first pixel of a tall section satisfied it,
      // so the reveal ran and finished while the reader was still scrolling
      // toward the content — correct, and invisible.
      viewport={{ once: true, amount: "some", margin: "0px 0px -30% 0px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </m.section>
  );
}
