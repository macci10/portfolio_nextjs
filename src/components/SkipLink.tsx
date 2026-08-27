import styles from "./SkipLink.module.css";

/** First focusable element on the page. */
export function SkipLink() {
  return (
    <a className={styles.skip} href="#main">
      Skip to content
    </a>
  );
}
