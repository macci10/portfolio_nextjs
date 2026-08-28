import { ThemeToggle } from "@/components/ThemeToggle";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import { Experience } from "@/sections/Experience";
import { Hero } from "@/sections/Hero";
import { Skills } from "@/sections/Skills";
import { Work } from "@/sections/Work";
import { NAV, SITE } from "@/data/site";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#hero">
          {SITE.name}
        </a>

        <div className={styles.headerEnd}>
          <nav className={styles.nav} aria-label="Sections">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      {/* Six sections, one per backdrop palette stop. The ids are load-bearing:
          src/lib/palettes.ts SECTIONS is the shared source for both. */}
      <main id="main" className={styles.main}>
        <Hero />
        <About />
        <Work />
        <Skills />
        <Experience />
        <Contact />
      </main>

      <footer className={styles.footer}>{SITE.footerLine}</footer>
    </>
  );
}
