import { ABOUT, STATS } from "@/data/site";
import styles from "./sections.module.css";

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className={styles.section}>
      <p className={styles.eyebrow}>About</p>
      <h2 id="about-heading" className={styles.heading}>
        Eleven years at one agency, which is six-plus engagements in practice.
      </h2>

      <div className={styles.prose} style={{ marginBlockStart: "var(--space-l)" }}>
        {ABOUT.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <ul className={styles.stats}>
        {STATS.map((stat) => (
          <li key={stat.label}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
