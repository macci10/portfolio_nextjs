import Image from "next/image";
import type { ProjectFrontmatter } from "@/lib/schema";
import styles from "./ProjectGallery.module.css";

type Props = { media: ProjectFrontmatter["media"]; name: string };

/**
 * Screenshots live on detail pages only — the home page is a scan, and twelve
 * app screenshots would turn it into a slow one.
 *
 * Every image carries explicit width and height (the schema enforces it), which
 * is what keeps CLS flat. Layout keys off the declared aspect ratio rather than
 * assuming portrait, so a landscape-only app drops in without a code change.
 */
export function ProjectGallery({ media, name }: Props) {
  if (media.length === 0) return null;

  return (
    <section className={styles.gallery} aria-label={`${name} screenshots`}>
      <ul className={styles.list}>
        {media.map((shot) => (
          <li
            key={shot.src}
            className={shot.width > shot.height ? styles.landscape : styles.portrait}
          >
            <figure className={styles.figure}>
              <div className={styles.frame}>
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  sizes="(min-width: 60rem) 20rem, 70vw"
                  className={styles.image}
                />
              </div>
              {shot.caption ? (
                <figcaption className={styles.caption}>{shot.caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
