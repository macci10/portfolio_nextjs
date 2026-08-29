import Link from "next/link";
import type { ProjectFrontmatter } from "@/lib/schema";
import styles from "./ProjectCard.module.css";

type Props = {
  project: ProjectFrontmatter;
  compact?: boolean;
};

export function ProjectCard({ project, compact = false }: Props) {
  // A project without a detail page must not render a "read more" affordance,
  // so the absence of a route is what keeps the card link-free rather than a
  // disabled-looking control.
  const heading = project.detailPage ? (
    <Link href={`/work/${project.slug}`}>{project.name}</Link>
  ) : (
    project.name
  );

  const { appStore, playStore } = project.links;
  // Explicit boolean: `a ?? b ? … : …` parses correctly but reads as a
  // precedence bug, and `??` would hide a valid Play Store link behind an
  // empty-string App Store one.
  const hasStoreLink = Boolean(appStore || playStore);

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

      {hasStoreLink ? (
        <ul className={styles.stores}>
          {appStore ? (
            <li>
              <a href={appStore} rel="noreferrer" target="_blank">
                App Store
              </a>
            </li>
          ) : null}
          {playStore ? (
            <li>
              <a href={playStore} rel="noreferrer" target="_blank">
                Play Store
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
    </article>
  );
}
