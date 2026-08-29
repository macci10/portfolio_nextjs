import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NAV, SITE } from "@/data/site";
import styles from "./SiteChrome.module.css";

type Props = {
  /**
   * On the home page the section links are same-document fragments. Anywhere
   * else they have to resolve back to `/` first, or they scroll to nothing.
   */
  onHome?: boolean;
};

export function SiteHeader({ onHome = false }: Props) {
  const home = onHome ? "#hero" : "/";

  return (
    <header className={styles.header}>
      {onHome ? (
        <a className={styles.wordmark} href={home}>
          {SITE.name}
        </a>
      ) : (
        <Link className={styles.wordmark} href={home}>
          {SITE.name}
        </Link>
      )}

      <div className={styles.headerEnd}>
        <nav className={styles.nav} aria-label="Sections">
          {NAV.map((item) =>
            onHome ? (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={`/${item.href}`}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
