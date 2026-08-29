# bilalmakki.vercel.app

Portfolio site for Bilal Haider Makki — Senior Cross-Platform Mobile Engineer.

Next.js 15 App Router, React 19, TypeScript, CSS Modules. No UI framework, no
CSS framework, no scroll library.

```bash
npm ci
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright (builds and starts the site first) |
| `npm run bundle` | Gzipped first-load JS per route, against a ceiling |

CI runs typecheck, lint, unit tests, build, the bundle check, and the full
Playwright suite on every pull request. Lighthouse runs separately and
non-blocking.

---

## The backdrop

The one piece of this site worth reading the code for. Everything else is
ordinary React.

The page has a single background layer that shifts colour continuously as you
scroll — six colour stops, one per section, interpolated rather than stepped.
There is no parallax, no pinned sections, no scroll-jacking, and no scroll
library.

### Why a single layer

The obvious implementation is six stacked full-viewport divs cross-fading on
scroll. That works and it is what most sites do. It also means six composited
layers the compositor has to blend on every frame, on a surface that covers the
entire viewport, which is the most expensive possible thing to overdraw.

Instead there is one element painting `linear-gradient(var(--bg-a), var(--bg-b))`,
and scrolling changes those two custom properties. One layer, one paint.

### Why OKLCH

Interpolating between two colours in sRGB drags the midpoint through grey.
Between `#0D1128` and `#17102C` that hardly matters; between the more separated
stops it is very visible, and the whole effect depends on the transition being
imperceptible.

OKLCH is perceptually uniform, so a midpoint between two colours looks like a
midpoint. `src/lib/oklch.ts` converts sRGB → linear RGB → OKLab → OKLCH,
interpolates, and converts back. Hue interpolation takes the shortest arc around
the circle, because going the long way around produces a rainbow sweep through
colours that are in neither stop.

Exact antipodes (a 180° difference, where both directions are equally short)
resolve counter-clockwise, deterministically. Not because that direction is
better, but because a coin flip in a colour function is a bug that reproduces
once a month.

### Three rendering paths, and why

`src/components/Backdrop.tsx` resolves to one of three:

**1. Reduced motion.** The stylesheet pins the backdrop to the midpoint stop and
JavaScript releases the properties entirely. This one is first for a reason: the
preference has to hold on the very first paint, and anything JavaScript does
happens after hydration. An earlier version wrote the correct value from JS and
flashed the wrong colour for a few hundred milliseconds on every load.

**2. Native scroll-driven animation.** Where `animation-timeline: scroll()` is
supported, the drift is a CSS animation keyed to scroll position and runs off
the main thread. JavaScript sets nothing and releases the properties.

**3. rAF fallback.** Everywhere else, a `requestAnimationFrame` loop reads
`scrollY`, resolves the stop pair and interpolation factor, and writes `--bg-a`
and `--bg-b`. It is self-idling — the loop schedules the next frame only when
there is work to do, so a stationary page costs nothing.

Path 2 duplicates the palette as `@keyframes` in `globals.css`, because CSS
cannot import from TypeScript. That duplication is real and is the reason
`tests/unit/backdrop-css.test.ts` exists: it parses the stylesheet and asserts
the keyframes still match `src/lib/palettes.ts`. Retune the palette and forget
the stylesheet, and the two paths silently disagree — with each browser showing
whichever one it happens to take.

### Testing paths a browser will not give you

Both Chromium and WebKit now support `animation-timeline: scroll()`, so the
fallback path never executes in the test suite by default. A suite that ran
twice against path 2 and called it coverage is exactly what shipped once here.

Forcing path 3 needs two things, and the first alone is not enough: stubbing
`CSS.supports` makes the component choose the fallback, but the stylesheet's own
`@supports` block still matches, and a running CSS animation outranks an inline
style. `tests/e2e/backdrop.spec.ts` injects `:root { animation: none !important }`
as well, then runs the same assertions against both paths.

### Contrast is a test, not a judgement call

The background is a moving target, so "is the text readable" cannot be answered
by looking at one screenshot. `tests/unit/palettes.test.ts` computes the
contrast ratio of `--ink`, `--slate` and `--signal` against every stop in both
themes and fails below 4.5:1.

---

## Motion

`motion` v12 behind `LazyMotion` with `domAnimation` and `strict`, so components
use `m.*` rather than `motion.*` and the full feature bundle is never pulled in.

Two rules the code follows:

**First paint belongs to the stylesheet.** Motion applies its `initial` state as
an inline style, and under `prefers-reduced-motion` it skips the animation but
leaves that inline style in place — stranding every revealed section at opacity
0. A blank page for exactly the users who cannot opt back in. `globals.css` pins
`[data-reveal]` and `[data-seq]` visible under `reduce`, and that override is
the guarantee; the `useReducedMotion` checks in components are the courtesy.

**The LCP element is never faded.** The hero entrance is CSS, not Motion, and
the hero is a server component as a result. Under Motion the headline started at
opacity 0 and appeared only after hydration: Lighthouse measured LCP at 3.1s
with 85% of it render delay, on the single most important line of text on the
site. The headline now animates `transform` only — an element at opacity 0 is
not painted, so fading it would move the delay out of JavaScript and back into
CSS. Everything after the headline still fades.

The theme switch is a View Transition: a circular wipe expanding from the toggle
button, falling back to an instant swap where the API is missing or motion is
reduced.

---

## Content

Projects live in `src/content/projects/*.mdx`. Frontmatter is validated by a zod
schema (`src/lib/schema.ts`) through a loader (`src/lib/content.ts`) that runs at
build time, so a malformed field fails the build rather than rendering something
wrong on a live page. The loader also checks that `slug` matches the filename,
which stops a copy-pasted file silently shadowing a route.

Five projects carry `detailPage: true` and get a route at `/work/[slug]`,
prerendered by `generateStaticParams`. The other seven are frontmatter-only and
render as cards with no link — a project without a write-up must not show a
read-more affordance, so the absence of a route is what keeps the card
link-free, rather than a disabled-looking control.

Every factual claim traces to `portfolio-content.md`. On a portfolio that is not
a style preference: the site is what an interviewer reads before asking
questions, so a claim that cannot be defended is a correctness bug. Tests
enforce the parts that can be mechanised — no excluded technologies in the
skills grid, no placeholder text in frontmatter or prose, and the one paragraph
the plan requires verbatim is pinned against the plan's text.

### Screenshots

Images are declared with explicit `width` and `height`, verified against the
files on disk, because that pair is the entire CLS guarantee.

Images currently in `public/media/` are **stand-ins from a different app** and
are marked `placeholder: true`. That flag overrides the alt text and shows a
visible badge, because reading a description of a screen nobody built to
somebody using a screen reader is the same category of mistake as writing an
unsupportable claim in the prose. Dropping a real capture at the same path and
clearing the flag restores the real description with no other change.

`drone-inspection-controller` has no images at all and a test keeps it that way:
the client NDA is resolved for the client name and the end users, not for code,
screenshots, or architecture diagrams.

---

## Layout

```
src/
  app/            routes, globals.css, OG image routes, fonts
  components/     Backdrop, Reveal, ProjectCard, ProjectGallery, chrome
  content/        projects/*.mdx — the content layer
  data/           site, skills, experience — non-project content
  lib/            oklch, scroll-progress, palettes, contrast, content, schema
  sections/       the six home sections
tests/
  unit/           Vitest
  e2e/            Playwright — chromium and mobile WebKit
```

The six section ids in `src/app/page.tsx` are load-bearing: `SECTIONS` in
`src/lib/palettes.ts` is the shared source for both the navigation and the
backdrop stops, and `tests/e2e/navigation.spec.ts` asserts they still line up.

---

See [DECISIONS.md](DECISIONS.md) for why the larger choices were made, including
the ones that were wrong first.
