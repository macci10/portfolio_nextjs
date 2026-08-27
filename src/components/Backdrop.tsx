import styles from "./Backdrop.module.css";

/**
 * The single backdrop layer: base gradient, aurora, grain.
 *
 * Phase 1 renders a static stop straight from the theme tokens. Phase 2 adds
 * the OKLCH scroll driver that rewrites --bg-a/--bg-b on :root, at which point
 * this becomes a client component. Until then it ships zero JavaScript.
 */
export function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.aurora} />
      <div className={styles.grain} />
    </div>
  );
}
