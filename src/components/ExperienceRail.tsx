import { EDUCATION, EMPLOYER, ENGAGEMENTS } from "@/data/experience";
import styles from "./ExperienceRail.module.css";

export function ExperienceRail() {
  return (
    <div className={styles.rail}>
      <div className={styles.trunkHead}>
        <h3 className={styles.employer}>
          {EMPLOYER.name} <span className={styles.period}>· {EMPLOYER.location}</span>
        </h3>
        <p className={styles.progression}>
          {EMPLOYER.period} — {EMPLOYER.progression}
        </p>
        <p className={styles.note}>{EMPLOYER.note}</p>
      </div>

      {/* Ordered: this is a real chronology, most recent first, so the sequence
          carries information the reader needs. */}
      <ol className={styles.list}>
        {ENGAGEMENTS.map((engagement) => (
          <li
            key={`${engagement.name}-${engagement.period}`}
            className={`${styles.item} ${engagement.current ? styles.current : ""}`}
          >
            <p className={styles.period}>
              {engagement.period}
              {engagement.current ? <span className="sr-only"> (current)</span> : null}
            </p>
            <p className={styles.engagement}>{engagement.name}</p>
            <p className={styles.role}>{engagement.role}</p>
          </li>
        ))}
      </ol>

      <div className={styles.education}>
        <p>
          {EDUCATION.degree} · {EDUCATION.school} · {EDUCATION.period}
        </p>
      </div>
    </div>
  );
}
