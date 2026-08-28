import Link from "next/link";
import type { Project } from "@/data/projects";
import styles from "./ProjectCard.module.css";

type Props = {
  project: Project;
  compact?: boolean;
  /**
   * Only passed once /work/[slug] exists (phase 4). A project without a detail
   * page must not render a "read more" affordance, so the absence of this prop
   * is what keeps the card link-free rather than a disabled-looking control.
   */
  detailHref?: string;
};

export function ProjectCard({ project, compact = false, detailHref }: Props) {
  const heading = detailHref ? (
    <Link href={detailHref}>{project.name}</Link>
  ) : (
    project.name
  );

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <p className={styles.meta}>
        <span>{project.period}</span>
        <span>{project.category}</span>
      </p>

      <h3 className={styles.name}>{heading}</h3>
      <p className={styles.summary}>{project.summary}</p>

      <ul className={styles.tags}>
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>

      {(project.links?.appStore ?? project.links?.playStore) ? (
        <ul className={styles.stores}>
          {project.links?.appStore ? (
            <li>
              <a href={project.links.appStore} rel="noreferrer" target="_blank">
                App Store
              </a>
            </li>
          ) : null}
          {project.links?.playStore ? (
            <li>
              <a href={project.links.playStore} rel="noreferrer" target="_blank">
                Play Store
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
    </article>
  );
}
