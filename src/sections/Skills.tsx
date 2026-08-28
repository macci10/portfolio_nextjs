import { SKILL_GROUPS } from "@/data/skills";
import styles from "./sections.module.css";

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className={styles.section}>
      <p className={styles.eyebrow}>Skills</p>
      <h2 id="skills-heading" className={styles.heading}>
        What I actually use, and would answer questions about.
      </h2>

      <div className={styles.skillGroups} style={{ marginBlockStart: "var(--space-xl)" }}>
        {SKILL_GROUPS.map((group) => (
          <div key={group.name} className={styles.skillGroup}>
            <h3>{group.name}</h3>
            <ul className={styles.skillList}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
