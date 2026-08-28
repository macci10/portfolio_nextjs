import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";
import sections from "./sections.module.css";
import styles from "./Work.module.css";

export function Work() {
  const featured = PROJECTS.filter((p) => p.featured).sort((a, b) => a.order - b.order);
  const rest = PROJECTS.filter((p) => !p.featured).sort((a, b) => a.order - b.order);

  return (
    <section id="work" aria-labelledby="work-heading" className={sections.section}>
      <p className={sections.eyebrow}>Work</p>
      <h2 id="work-heading" className={sections.heading}>
        Six of these are the ones worth asking about.
      </h2>
      <p className={sections.lede}>
        Ordered by what the work demanded rather than by recency. Screenshots and the longer
        write-ups live on the detail pages.
      </p>

      {/* No detailHref yet — /work/[slug] arrives in phase 4. Linking now would
          render a read-more affordance that 404s. */}
      <div className={styles.featured}>
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <h3 className={styles.restHeading}>Also shipped</h3>
      <div className={styles.rest}>
        {rest.map((project) => (
          <ProjectCard key={project.slug} project={project} compact />
        ))}
      </div>
    </section>
  );
}
