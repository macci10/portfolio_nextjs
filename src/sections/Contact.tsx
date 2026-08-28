import { CONTACT, SITE } from "@/data/site";
import styles from "./sections.module.css";
import { Reveal } from "@/components/Reveal";

export function Contact() {
  return (
    <Reveal id="contact" labelledBy="contact-heading" className={styles.section}>
      <p className={styles.eyebrow}>Contact</p>
      <h2 id="contact-heading" className={styles.heading}>
        {CONTACT.heading}
      </h2>

      <div className={styles.prose} style={{ marginBlockStart: "var(--space-l)" }}>
        {CONTACT.body.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      {/* Email and LinkedIn only — no phone number anywhere on the site. */}
      <ul className={styles.contactLinks}>
        <li>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </li>
        <li>
          <a href={SITE.linkedin} rel="me noreferrer" target="_blank">
            LinkedIn
          </a>
        </li>
      </ul>

      <p className={styles.availability}>
        {SITE.availability}
        <br />
        {SITE.timezoneNote}
      </p>
    </Reveal>
  );
}
