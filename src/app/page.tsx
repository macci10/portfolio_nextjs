import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import { Experience } from "@/sections/Experience";
import { Hero } from "@/sections/Hero";
import { Skills } from "@/sections/Skills";
import { Work } from "@/sections/Work";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <SiteHeader onHome />

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

      <SiteFooter />
    </>
  );
}
