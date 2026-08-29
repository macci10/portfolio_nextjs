import { SITE } from "@/data/site";
import styles from "./SiteChrome.module.css";

export function SiteFooter() {
  return <footer className={styles.footer}>{SITE.footerLine}</footer>;
}
