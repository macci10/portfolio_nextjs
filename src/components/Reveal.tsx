"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Matches --ease-out in globals.css. Tuple, not number[], for motion's types. */
const EASE = [0.22, 1, 0.36, 1] as const;

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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </m.section>
  );
}
