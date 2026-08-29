import Image from "next/image";
import { HERO, SITE } from "@/data/site";
import styles from "./sections.module.css";

/**
 * The hero load sequence: one orchestrated stagger, run once, of the headline,
 * subline, meta row, CTAs and portrait.
 *
 * Plan section 6 allows exactly one entrance moment. Scattering separate
 * entrance effects across the page is what makes a design read as templated,
 * so everything below the fold uses the shared Reveal instead.
 *
 * Driven by CSS, not Motion, and this is a server component as a result. Under
 * Motion the whole hero started at `opacity: 0` and only appeared once the
 * bundle had loaded and hydrated: Lighthouse measured LCP at 3.1s with 85% of
 * it render delay, on the single most important line of text on the site. CSS
 * animations run at first paint and need no JavaScript at all.
 *
 * The headline animates transform only, never opacity — an element faded from
 * zero is not painted, so fading the LCP element would just move the delay from
 * JavaScript into CSS. Everything after it fades, because none of it is the LCP
 * candidate.
 */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className={styles.hero} data-seq="">
      <div>
        <h1 id="hero-heading" className={styles.headline} data-seq="" data-seq-lcp="">
          {HERO.headline}
        </h1>

        <p className={styles.subline} data-seq="" style={{ "--seq": 1 } as React.CSSProperties}>
          {HERO.subline}
        </p>

        <p className={styles.heroMeta} data-seq="" style={{ "--seq": 2 } as React.CSSProperties}>
          <span>{SITE.stackLine}</span>
          <span>{SITE.location}</span>
        </p>

        <div className={styles.ctaRow} data-seq="" style={{ "--seq": 3 } as React.CSSProperties}>
          <a className={styles.ctaPrimary} href="#work">
            {HERO.ctaPrimary}
          </a>
          <a className={styles.ctaSecondary} href="#contact">
            {HERO.ctaSecondary}
          </a>
        </div>
      </div>

      {/* Sits on a defined --card surface: the portrait is background-removed,
          so against the gradient alone it would halo. Explicit dimensions and a
          fixed aspect-ratio box keep it out of the CLS budget. */}
      <div className={styles.portrait} data-seq="" style={{ "--seq": 4 } as React.CSSProperties}>
        <Image
          src="/bilal.png"
          alt={SITE.name}
          width={400}
          height={500}
          priority
          sizes="(min-width: 60rem) 12.5rem, 9rem"
        />
      </div>
    </section>
  );
}
