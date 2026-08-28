import Image from "next/image";
import { HERO, SITE } from "@/data/site";
import styles from "./sections.module.css";

export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className={styles.hero}>
      <div>
        <h1 id="hero-heading" className={styles.headline}>
          {HERO.headline}
        </h1>
        <p className={styles.subline}>{HERO.subline}</p>

        <p className={styles.heroMeta}>
          <span>{SITE.stackLine}</span>
          <span>{SITE.location}</span>
        </p>

        <div className={styles.ctaRow}>
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
      <div className={styles.portrait}>
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
