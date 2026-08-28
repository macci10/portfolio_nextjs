import { ExperienceRail } from "@/components/ExperienceRail";
import styles from "./sections.module.css";
import { Reveal } from "@/components/Reveal";

export function Experience() {
  return (
    <Reveal id="experience" labelledBy="experience-heading" className={styles.section}>
      <p className={styles.eyebrow}>Experience</p>
      <h2 id="experience-heading" className={styles.heading}>
        One employer since 2014. The overlaps are parallel engagements.
      </h2>

      <ExperienceRail />
    </Reveal>
  );
}
