import styles from "./WhatIdImprove.module.css";

type Props = { children: React.ReactNode };

/**
 * The honest-engineering block. It is set apart from the rest of the page on
 * purpose: a portfolio that only lists wins reads as marketing, and the thing
 * an interviewer actually wants to know is whether you can see your own work
 * clearly a year later.
 *
 * Children arrive as rendered MDX rather than a string, so the field can use
 * inline code and emphasis like any other prose on the page.
 */
export function WhatIdImprove({ children }: Props) {
  return (
    <aside className={styles.block} aria-labelledby="what-id-improve">
      <h2 id="what-id-improve" className={styles.heading}>
        What I&rsquo;d improve
      </h2>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
