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
 *
 * A `placeholder` image is a stand-in that does not show what its `alt`
 * describes. Reading that description to a screen reader would be a fabricated
 * account of a screen nobody built, so the placeholder state overrides the alt
 * text and is marked visibly. Replacing the file and clearing the flag restores
 * the real description with no other change.
 */
export function ProjectGallery({ media, name }: Props) {
  if (media.length === 0) return null;

  return (
    <section className={styles.gallery}>
      {/* tabIndex on the scrolling element itself: without it a keyboard-only
          user cannot reach anything past the first image (WCAG 2.1.1).
          Deliberately no role="group" — that overrides the implicit list role
          and orphans the <li> children, which axe flags. A list can be named
          and focused without changing what it is. */}
      <ul className={styles.list} tabIndex={0} aria-label={`${name} screenshots`}>
        {media.map((shot, index) => (
          <li
            key={shot.src}
            className={shot.width > shot.height ? styles.landscape : styles.portrait}
          >
            <figure className={styles.figure}>
              <div className={styles.frame}>
                <Image
                  src={shot.src}
                  alt={
                    shot.placeholder
                      ? // Numbered: three images sharing one alt string is
                        // indistinguishable to a screen reader.
                        `Placeholder image ${index + 1} of ${media.length}; the ${name} screenshot has not been added yet`
                      : shot.alt
                  }
                  width={shot.width}
                  height={shot.height}
                  sizes="(min-width: 60rem) 15rem, 70vw"
                  className={styles.image}
                />
                {shot.placeholder ? <p className={styles.badge}>Placeholder</p> : null}
              </div>

              {shot.placeholder ? (
                <figcaption className={styles.caption}>
                  Stand-in image. The real screenshot has not been added yet.
                </figcaption>
              ) : shot.caption ? (
                <figcaption className={styles.caption}>{shot.caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
