import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ProjectGallery } from "@/components/ProjectGallery";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatIdImprove } from "@/components/WhatIdImprove";
import { findProject, loadDetailProjects } from "@/lib/content";
import { SITE } from "@/data/site";
import styles from "./page.module.css";

type Params = { slug: string };

/**
 * Only the five projects the plan names get a route. Everything else is a card
 * on the home page with no link, so an unknown slug is a genuine 404 rather
 * than a project we simply haven't written up.
 */
export function generateStaticParams(): Params[] {
  return loadDetailProjects().map(({ frontmatter }) => ({ slug: frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project?.frontmatter.detailPage) return { title: "Not found" };

  const { name, summary } = project.frontmatter;
  const canonical = `/work/${slug}`;

  return {
    // Root layout supplies the "— Bilal Haider Makki" suffix via its template.
    title: name,
    description: summary,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: `${name} — ${SITE.name}`,
      description: summary,
      url: canonical,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${SITE.name}`,
      description: summary,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = findProject(slug);

  // Handles both an unknown slug and a card-only project that has no write-up.
  // Deliberately not `dynamicParams = false`: that 404s through an internal
  // NoFallbackError, which works but logs a stack trace on every hit.
  if (!project?.frontmatter.detailPage) notFound();

  const { frontmatter, body } = project;

  return (
    <>
      <SiteHeader />

      <main id="main" className={styles.main}>
        <article>
          <Link className={styles.back} href="/#work">
            &larr; All work
          </Link>

          <header className={styles.head}>
            <p className={styles.meta}>
              <span>{frontmatter.period}</span>
              <span>{frontmatter.category}</span>
            </p>
            <h1 className={styles.title}>{frontmatter.name}</h1>
            <p className={styles.summary}>{frontmatter.summary}</p>

            <dl className={styles.facts}>
              <div>
                <dt>Role</dt>
                <dd>{frontmatter.role}</dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>{frontmatter.platforms.join(", ")}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{frontmatter.tags.join(" · ")}</dd>
              </div>
            </dl>

            {frontmatter.links.appStore ?? frontmatter.links.playStore ? (
              <ul className={styles.stores}>
                {frontmatter.links.appStore ? (
                  <li>
                    <a href={frontmatter.links.appStore} rel="noreferrer" target="_blank">
                      App Store
                    </a>
                  </li>
                ) : null}
                {frontmatter.links.playStore ? (
                  <li>
                    <a href={frontmatter.links.playStore} rel="noreferrer" target="_blank">
                      Play Store
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </header>

          <ProjectGallery media={frontmatter.media} name={frontmatter.name} />

          <div className={styles.prose}>
            <MDXRemote source={body} />
          </div>

          {frontmatter.highlights.length > 0 ? (
            <section className={styles.highlights} aria-labelledby="highlights">
              <h2 id="highlights" className={styles.sectionHeading}>
                What I built
              </h2>
              <ul>
                {frontmatter.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {frontmatter.whatIdImprove ? (
            <WhatIdImprove>
              <MDXRemote source={frontmatter.whatIdImprove} />
            </WhatIdImprove>
          ) : null}
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
