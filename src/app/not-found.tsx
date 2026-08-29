import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>That page doesn&rsquo;t exist.</h1>
        <p className={styles.body}>
          Most of the work lives on one page. The five projects with their own write-up are
          linked from there.
        </p>
        <Link className={styles.cta} href="/#work">
          Go to the work
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
