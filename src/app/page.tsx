import { ThemeToggle } from "@/components/ThemeToggle";
import { HERO, SITE } from "@/data/site";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.wordmark}>{SITE.name}</span>
        <ThemeToggle />
      </header>

      <main id="main" className={styles.main}>
        {/* Phase 3 replaces this with the six real sections. */}
        <section id="hero" aria-labelledby="hero-heading" className={styles.hero}>
          <h1 id="hero-heading" className={styles.headline}>
            {HERO.headline}
          </h1>
          <p className={styles.subline}>{HERO.subline}</p>
        </section>
      </main>
    </>
  );
}
