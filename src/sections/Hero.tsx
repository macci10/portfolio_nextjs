"use client";

import Image from "next/image";
import { m, useReducedMotion } from "motion/react";
import { HERO, SITE } from "@/data/site";
import styles from "./sections.module.css";

/** Matches --ease-out in globals.css. Tuple, not number[], for motion's types. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The hero load sequence: one orchestrated stagger, run once, of the headline,
 * subline, meta row, CTAs and portrait.
 *
 * Plan section 6 allows exactly one entrance moment. Scattering separate
 * entrance effects across the page is what makes a design read as templated,
 * so everything below the fold uses the shared Reveal instead.
 */
const container = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function Hero() {
  const reduced = useReducedMotion();

  // Under reduce the sequence does not exist — no variants, no transform.
  const motionProps = reduced
    ? {}
    : { variants: container, initial: "hidden" as const, animate: "shown" as const };
  const childProps = reduced ? {} : { variants: item };

  return (
    <m.section
      id="hero"
      aria-labelledby="hero-heading"
      className={styles.hero}
      data-seq=""
      {...motionProps}
    >
      <div>
        <m.h1 id="hero-heading" className={styles.headline} data-seq="" {...childProps}>
          {HERO.headline}
        </m.h1>

        <m.p className={styles.subline} data-seq="" {...childProps}>
          {HERO.subline}
        </m.p>

        <m.p className={styles.heroMeta} data-seq="" {...childProps}>
          <span>{SITE.stackLine}</span>
          <span>{SITE.location}</span>
        </m.p>

        <m.div className={styles.ctaRow} data-seq="" {...childProps}>
          <a className={styles.ctaPrimary} href="#work">
            {HERO.ctaPrimary}
          </a>
          <a className={styles.ctaSecondary} href="#contact">
            {HERO.ctaSecondary}
          </a>
        </m.div>
      </div>

      {/* Sits on a defined --card surface: the portrait is background-removed,
          so against the gradient alone it would halo. Explicit dimensions and a
          fixed aspect-ratio box keep it out of the CLS budget. */}
      <m.div className={styles.portrait} data-seq="" {...childProps}>
        <Image
          src="/bilal.png"
          alt={SITE.name}
          width={400}
          height={500}
          priority
          sizes="(min-width: 60rem) 12.5rem, 9rem"
        />
      </m.div>
    </m.section>
  );
}
