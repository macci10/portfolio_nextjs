import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { loadProjects } from "@/lib/content";
import sections from "./sections.module.css";
import styles from "./Work.module.css";

export function Work() {
  // Server component: the loader reads and validates src/content/projects at
  // build time, so a malformed file fails the build rather than the page.
  const projects = loadProjects();
  const featured = projects.filter((p) => p.frontmatter.featured);
  const rest = projects.filter((p) => !p.frontmatter.featured);

  return (
    <Reveal id="work" labelledBy="work-heading" className={sections.section}>
      <p className={sections.eyebrow}>Work</p>
      <h2 id="work-heading" className={sections.heading}>
        Six of these are the ones worth asking about.
      </h2>
      <p className={sections.lede}>
        Ordered by what the work demanded rather than by recency. Screenshots and the longer
        write-ups live on the detail pages.
      </p>

      <div className={styles.featured}>
        {featured.map(({ frontmatter }) => (
          <ProjectCard key={frontmatter.slug} project={frontmatter} />
        ))}
      </div>

      <h3 className={styles.restHeading}>Also shipped</h3>
      <div className={styles.rest}>
        {rest.map(({ frontmatter }) => (
          <ProjectCard key={frontmatter.slug} project={frontmatter} compact />
        ))}
      </div>
    </Reveal>
  );
}
