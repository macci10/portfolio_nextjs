# Implementation Plan — bilalmakki.vercel.app

Portfolio site for Bilal Haider Makki, Senior Cross-Platform Mobile Engineer.

- **Repo:** https://github.com/macci10/portfolio_nextjs
- **Deploy:** Vercel. Set the Vercel **project name** to `bilalmakki` so the subdomain is `bilalmakki.vercel.app` — it does not inherit the repo name.
- **Content source:** `portfolio-content.md` in the repo root. It is the single source of truth for every fact on the site.

## Purpose

Two audiences, both must be served:

1. A recruiter or hiring manager who scrolls for 40 seconds and needs to believe "senior mobile engineer, and apparently competent on web too."
2. An engineer who opens the repo. The code, the tests, and the README do as much convincing as the page does.

Do not optimise for one at the cost of the other.

---

## 1. Constraints

These are decisions already made. Do not revisit them without asking.

- **No scroll-hijacking libraries.** No Lenis, no Locomotive, no GSAP ScrollSmoother. Use native `scroll-behavior: smooth`. They add weight, break keyboard and screen-reader navigation, and feel wrong on touch.
- **No Tailwind.** CSS Modules plus CSS custom properties. The theme system and the scroll gradient both run on custom properties.
- **Only `transform` and `opacity` animate**, plus custom-property writes on `:root`. Never animate layout properties.
- **No `localStorage` access in components.** `next-themes` owns theme persistence.
- **Do not add any technology to the skills grid that is not in `portfolio-content.md`.** Explicitly excluded: GraphQL, Apollo, React Query, TanStack Query, Sentry, Jetpack Compose, Room, Riverpod, Bloc, GetX, Terraform, Firestore Security Rules, Detox, Appium, Reanimated, Skia, Zustand. The site is what an interviewer reads before asking questions.
- **Do not invent content.** If a fact is not in `portfolio-content.md`, leave it out or leave a `TODO(bilal)` comment. No placeholder lorem, no invented metrics, no invented client names.
- **No phone number anywhere on the site.** Email and LinkedIn only.
- **Screenshots are expected and encouraged** for anything publicly listed — App Store and Play Store listings are already public marketing material — and for Maxxsol's own products. For client work that was never publicly released (Joulea, Strip Reader), do not publish internal screens, architecture diagrams, or anything showing client data.

---

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript strict | Static route generation for project pages, Metadata API, `next/font` |
| Styling | CSS Modules + custom properties | Theme and gradient both need custom properties |
| Theme | `next-themes` | Solves FOUC and hydration mismatch, ~2kb |
| Animation | `motion` (Framer Motion v12) via `LazyMotion` + `domAnimation` | ~18kb instead of ~34kb; use `<m.div>` not `<motion.div>` |
| Fonts | `next/font/google` | Self-hosts at build, zero layout shift. Do **not** use Fontsource or a `<link>` |
| Content | MDX + zod-validated frontmatter | Real prose on detail pages, schema gives content tests for free |
| Unit tests | Vitest + React Testing Library + jsdom | |
| E2E | Playwright + `@axe-core/playwright` | |
| CI | GitHub Actions | |

`tsconfig.json` must set `"strict": true` and `"noUncheckedIndexedAccess": true`.

---

## 3. Design system

### Fonts

```ts
// src/app/fonts.ts
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

export const display = Bricolage_Grotesque({
  subsets: ["latin"], weight: ["600", "800"], variable: "--font-display", display: "swap",
});
export const body = IBM_Plex_Sans({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-body", display: "swap",
});
export const mono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap",
});
```

Roles: display for headings only, used with restraint. Body for prose. Mono for labels, tags, metadata, and the experience rail — it is doing real work there, not decoration.

### Type scale

```css
--step--1: clamp(0.83rem, 0.80rem + 0.15vw, 0.90rem);
--step-0:  clamp(1.00rem, 0.96rem + 0.20vw, 1.10rem);
--step-1:  clamp(1.27rem, 1.18rem + 0.44vw, 1.52rem);
--step-2:  clamp(1.60rem, 1.43rem + 0.85vw, 2.10rem);
--step-3:  clamp(2.03rem, 1.71rem + 1.58vw, 2.90rem);
--step-4:  clamp(2.57rem, 2.00rem + 2.85vw, 4.00rem);
--step-5:  clamp(3.25rem, 2.20rem + 5.25vw, 6.50rem);
```

Display headings: `letter-spacing: -0.03em`, `line-height: 0.92–1.05`. Body: `line-height: 1.6`, max measure `68ch`.

### Foreground tokens

```css
[data-theme="dark"] {
  --ink:    #E9ECF4;
  --slate:  #98A2B8;
  --signal: #FF4D8D;
  --line:   rgba(255,255,255,0.10);
  --card:   rgba(255,255,255,0.045);
}
[data-theme="light"] {
  --ink:    #0E1116;
  --slate:  #57606E;
  --signal: #C8005A;
  --line:   rgba(14,17,22,0.10);
  --card:   rgba(255,255,255,0.60);
}
```

`--signal` is reserved for release markers, active states, and the primary CTA. Nothing else.

### Backdrop palettes

Six sections, six stops per theme. Each stop is a two-colour linear gradient. The drift is deliberately subtle — a slow rotation from cool indigo toward warm plum, not a rainbow.

```ts
// src/lib/palettes.ts
export const SECTIONS = ["hero","about","work","skills","experience","contact"] as const;

export const PALETTES = {
  dark: [
    ["#0D1128", "#17102C"],
    ["#101534", "#1E1133"],
    ["#101C38", "#261232"],
    ["#0F2338", "#2E1330"],
    ["#0E2935", "#37152B"],
    ["#0D2E31", "#401826"],
  ],
  light: [
    ["#E8EBF3", "#EFE9F4"],
    ["#E5EAF3", "#F1E9F3"],
    ["#E2ECF3", "#F3E8F1"],
    ["#E0EEF2", "#F5E8EE"],
    ["#DFF0F0", "#F6E9EB"],
    ["#DEF1ED", "#F8EBE8"],
  ],
} as const;
```

---

## 4. The backdrop system

This is the technically non-obvious part of the site. Build it carefully; it is also what the README will be about.

### Why one layer

Per-section backgrounds produce visible seams no matter how they are crossfaded. Instead there is exactly **one** fixed element behind everything, and its colours are driven by scroll progress. No seams, because there is nothing to seam.

### Layer stack

`<Backdrop />` renders `position: fixed; inset: 0; z-index: -1;` containing, bottom to top:

1. **Base gradient** — `linear-gradient(160deg, var(--bg-a), var(--bg-b))`. Both custom properties are written by the scroll system.
2. **Aurora** — two or three large blurred radial gradients, ~60vmax each, drifting on `transform: translate3d()` over 40–70s. GPU-composited, never repainting.
3. **Grain** — inline SVG `feTurbulence` as a data URI, `opacity: 0.035`, `mix-blend-mode: overlay`. This kills gradient banding, which is the most visible amateur tell on large gradients. Do not skip it.

### Colour interpolation

Interpolate in **OKLCH, not sRGB.** RGB interpolation drags saturated colours through grey on the way between them; OKLCH stays clean.

`src/lib/oklch.ts` exports pure functions:

```ts
export type Oklch = { l: number; c: number; h: number };

export function hexToOklch(hex: string): Oklch;
export function oklchToCss(c: Oklch): string;       // "oklch(0.23 0.06 276)"
export function lerpOklch(a: Oklch, b: Oklch, t: number): Oklch;
```

`lerpOklch` must take the **shorter path around the hue circle**. Interpolating 350° to 10° must pass through 0°, not sweep 180° the wrong way. This is the bug that will otherwise ship, and it is the reason this module has unit tests.

`t` is clamped to `[0, 1]`.

### Scroll driver

`src/lib/scroll-progress.ts` exports a pure function, separately testable:

```ts
export function resolveStop(scrollY: number, docHeight: number, viewportHeight: number, stopCount: number):
  { index: number; next: number; t: number };
```

Guard against `docHeight <= viewportHeight` (returns index 0, t 0) — otherwise it divides by zero on short pages.

`src/components/Backdrop.tsx` (`"use client"`):

- Subscribe with a **passive** scroll listener. Store the raw value; do nothing else in the handler.
- Do the interpolation and the `document.documentElement.style.setProperty()` writes inside a single `requestAnimationFrame` loop, and only when the value changed.
- Never read layout inside the scroll handler.

### Progressive enhancement

Wrap the JS path so it is skipped where CSS can do it natively:

```css
@supports (animation-timeline: scroll()) {
  /* keyframed --bg-a / --bg-b via @property, driven off animation-timeline: scroll(root) */
}
```

Register the custom properties with `@property` so they are interpolatable:

```css
@property --bg-a { syntax: "<color>"; inherits: true; initial-value: #0D1128; }
@property --bg-b { syntax: "<color>"; inherits: true; initial-value: #17102C; }
```

The `Backdrop` component checks `CSS.supports("animation-timeline: scroll()")` and does not start its rAF loop when the CSS path is active.

### Reduced motion

Under `prefers-reduced-motion: reduce`: aurora drift stops, the scroll driver does not run, and the backdrop renders the **midpoint stop** (index 2) as a static gradient. Test this.

---

## 5. Theming

- `next-themes` with `attribute="data-theme"`, `defaultTheme="system"`, `enableSystem`.
- `suppressHydrationWarning` on `<html>` in `app/layout.tsx`.
- `ThemeToggle` is a real `<button>` with an accessible name and `aria-pressed`. It must **not** render theme-dependent content until mounted, to avoid hydration mismatch — render a fixed-size neutral placeholder on first paint.
- Update `<meta name="theme-color">` on change.
- **Signature moment:** the toggle uses the View Transitions API for a circular reveal expanding from the button's own coordinates. Feature-detect `document.startViewTransition`; fall back to an instant swap. Skip the transition entirely under reduced motion.

Spend the visual boldness here. Everything else stays quiet.

---

## 6. Motion inventory

Five items. Do not add a sixth — scattered effects are what make a page read as templated.

1. **Hero load sequence.** One orchestrated stagger of the headline lines and the manifest rows. Runs once.
2. **Scroll reveals.** `whileInView` with `once: true`, `translateY(12px)` + opacity, applied to section groups rather than every element.
3. **Ambient aurora drift.** Continuous, transform only.
4. **Theme wipe.** The View Transition above.
5. **Hover and focus micro-states** on cards, links, and the toggle.

Explicitly not doing: magnetic cursors, parallax, text scramble, custom cursors, marquees.

Every one of these is disabled or frozen under `prefers-reduced-motion`.

---

## 7. Content model

### Structure

```
src/content/projects/<slug>.mdx      # frontmatter + long-form body
src/lib/schema.ts                    # zod schema for frontmatter
src/lib/content.ts                   # fs + gray-matter loader, validates via schema
```

Body rendered with `next-mdx-remote/rsc` in a server component. Validation runs at build — a malformed frontmatter field fails the build rather than rendering wrong.

### Schema

```ts
export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  role: z.string(),
  period: z.string(),
  category: z.string(),
  platforms: z.array(z.string()),
  featured: z.boolean(),
  detailPage: z.boolean(),          // true = gets /work/[slug]
  order: z.number(),
  tags: z.array(z.string()).min(1),
  summary: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  links: z.object({
    appStore: z.string().url().optional(),
    playStore: z.string().url().optional(),
  }).default({}),
  whatIdImprove: z.string().optional(),
  media: z.array(z.object({
    src: z.string(),
    alt: z.string().min(15),        // required, and must describe the screen — not "screenshot"
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    caption: z.string().optional(),
  })).default([]),
});
```

### Detail pages

`detailPage: true` for exactly these five, in this order:

1. **`drone-inspection-controller`** — Joulea. The rarest work; leads the site.
2. **`avomd`** — the metrics and the team-lead story.
3. **`strip-reader-poc`** — strongest native-module proof point.
4. **`maxkids-coloring-world`** — strongest current Flutter work.
5. **`metal-men`** — the upstream-merge and CI/CD story.

Everything else renders as a card on the home page with no link. Do not render a "read more" affordance on a project without a detail page.

`generateStaticParams()` from the loader. Unknown slug → `notFound()`.

### Two content corrections to apply

**Metal Men CI/CD** — replace the cautious line in `portfolio-content.md` with:

> CI/CD across four build targets. GitHub Actions runs static analysis, unit tests, and Android integration tests on an emulator, then builds Android, iOS, web, and Linux. Fastlane automates Android release signing and Play Store track promotion through internal → beta → production. Web deploys to Firebase Hosting on tag. iOS is compile-verified in CI with `--no-codesign` and submitted to TestFlight through a Fastlane lane run locally.

Keep the final sentence. Stating the iOS limitation plainly is more convincing than implying full automation.

**Joulea NDA** — resolved. The NDA covered code only, so the client name and the end users (Georgia Tech, U.S. Department of Energy, Oak Ridge National Laboratory, New Mexico Tech) may be named. Still no code, no screenshots, no architecture diagrams.

### Sections on the home page

Hero → About → Work → Skills → Experience → Contact. Six, matching the six palette stops. Each is a `<section>` with a stable `id` and an `aria-labelledby`.

**The Experience section needs care.** The timeline has five overlapping date ranges. A recruiter reading that without framing sees job-hopping or padding. Render it as a single **Maxxsol trunk** with client engagements branching off it — a vertical rail, mono labels, engagement nodes on branch stubs. The framing must be structural and immediately legible, not a footnote below the table. This is the one place where a structural device encodes something true rather than decorating.

Hero headline: use option 1 from the content file — *"I build mobile apps. 25+ of them are live on the App Store and Play Store."*

### Images and screenshots

Screenshots carry real weight on a mobile portfolio — they are the fastest proof that the apps exist. They are also the easiest way to wreck the performance and layout-stability targets, so handle them deliberately.

- **`next/image` only.** Never a raw `<img>`. Explicit `width` and `height` on every image, which is why the schema requires them — this is what keeps CLS under 0.02.
- **Store originals in `public/media/<slug>/`.** Commit them at 2x the largest rendered size and let Next handle the rest; do not commit pre-generated size variants.
- **AVIF and WebP** via the default `next/image` formats config. Phone screenshots are tall PNGs and compress badly — expect to convert.
- **Lazy by default.** The only image that may set `priority` is a hero image, if one exists.
- **Alt text describes the screen, not the file.** "Mission planning view with waypoint markers over a building footprint," not "Joulea screenshot." The schema enforces a minimum length so this cannot be skipped silently.
- **Device frames are optional and easy to overdo.** If used, one consistent frame style across the whole site, and it must not be the visual focus. A raw screenshot at a sensible size beats a heavily styled mockup.
- **Screenshots go on detail pages, not the home page.** The home page is a scan; adding twelve app screenshots to it turns a fast page into a slow one and dilutes the ship-log structure.
- **Both themes.** A light-mode app screenshot on a dark backdrop needs a container with a defined surface, not a raw transparent PNG. Check every image in both themes.

For Joulea and Strip Reader, there is nothing publicly released to screenshot. Describe the work in prose — the LiDAR pipeline and the CIEDE2000 colour work are already the strongest material on the site, and they read fine without pictures.

### Headshot

A portrait is supplied at the repo root alongside this plan. Move it to `public/bilal.jpg` during phase 1; nothing but config and docs should stay at the root.

It appears in two places:

**Hero.** Modest size — around 140–200px rendered, beside or above the headline, not a full-bleed background. This is a face that establishes a person exists, not a magazine cover. Commit it at 2x the largest rendered size (roughly 400px square is enough) and crop it square or to a 4:5 portrait before committing; do not ship a 4000px camera original and let `next/image` do the downscaling.

**Site OG image.** Include it in `app/opengraph-image.tsx`. A LinkedIn unfurl with a face on it gets noticeably more engagement than one with type alone, and you are actively DMing people. Note that `ImageResponse` cannot fetch from a relative path — read the file with `readFile` and inline it as a base64 data URI.

Technical requirements:

- This will almost certainly be the **LCP element**, so it is the one image permitted `priority`. Serve AVIF, set explicit `width` and `height`, and verify LCP under mobile throttling in phase 7.
- **Alt text is his name**, not "headshot" or "profile photo": `alt="Bilal Haider Makki"`.
- **Check it against both themes.** A portrait shot against a light background will halo awkwardly on the dark gradient. If the original has a busy or mismatched background, either sit it on a defined surface with a subtle `--line` border, or use a background-removed version placed on `--card`. Do not apply a duotone, gradient overlay, or heavy filter — the visual boldness on this site is spent on the theme wipe, and a stylised portrait competes with it.

---

## 8. File tree

```
.github/workflows/ci.yml
playwright.config.ts
vitest.config.ts
next.config.ts
src/
  app/
    layout.tsx                 # server: fonts, ThemeProvider, Backdrop, skip link
    page.tsx                   # composes the six sections
    globals.css                # tokens, @property, resets, reduced-motion
    fonts.ts
    opengraph-image.tsx
    not-found.tsx
    work/[slug]/
      page.tsx
      opengraph-image.tsx
  components/
    Backdrop.tsx               "use client"
    ThemeToggle.tsx            "use client"
    Reveal.tsx                 "use client"  — wraps m.div + whileInView
    ProjectCard.tsx
    ExperienceRail.tsx
    SkipLink.tsx
  sections/
    Hero.tsx  About.tsx  Work.tsx  Skills.tsx  Experience.tsx  Contact.tsx
  lib/
    oklch.ts  scroll-progress.ts  palettes.ts  content.ts  schema.ts  contrast.ts
  content/projects/*.mdx
  data/site.ts                 # identity, meta, contact, skills groups
tests/
  unit/     *.test.ts(x)
  e2e/      *.spec.ts
```

---

## 9. Testing

Tests are part of the deliverable, not a nice-to-have. The repo is being read.

### Unit — Vitest

**`tests/unit/oklch.test.ts`**
- `hexToOklch` → `oklchToCss` → parse round-trips within ΔE tolerance for a fixture set covering both palettes.
- `lerpOklch(a, b, 0)` equals `a`; `t = 1` equals `b`.
- **Hue takes the shorter arc:** `lerp({h: 350}, {h: 10}, 0.5).h` is within tolerance of `0`, not `180`.
- Hue wrap in the other direction: `lerp({h: 10}, {h: 350}, 0.5).h` also lands near `0`.
- `t` outside `[0, 1]` is clamped.
- Lightness and chroma interpolate linearly.

**`tests/unit/scroll-progress.test.ts`**
- `scrollY = 0` → `{ index: 0, t: 0 }`.
- Bottom of document → `{ index: stopCount - 1, t: 1 }`.
- A midpoint returns the expected adjacent pair and a `t` in `[0, 1]`.
- `docHeight <= viewportHeight` returns index 0, t 0, and does not produce `NaN`.
- Never returns `next` out of bounds.

**`tests/unit/palettes.test.ts`**
- `PALETTES.dark` and `PALETTES.light` have identical length, equal to `SECTIONS.length`.
- Every colour parses as valid hex.
- **Contrast gate:** for every stop in both themes, `--ink` against the gradient midpoint is ≥ 4.5:1, and `--slate` is ≥ 4.5:1. Use `src/lib/contrast.ts`. This makes contrast a CI failure rather than a manual eyeball.

**`tests/unit/content.test.ts`**
- Every MDX file under `src/content/projects/` validates against `ProjectSchema`.
- Slugs are unique.
- Exactly five projects have `detailPage: true`.
- Every `detailPage: true` project has a non-empty `description` and at least three `highlights`.
- No string field contains `TODO`, `lorem`, or `XXX`.
- Every URL in `links` is absolute and https.
- Every `media[].src` resolves to a file that exists under `public/`.
- No `media[].alt` is just the project name, "screenshot", or "image".

**`tests/unit/ThemeToggle.test.tsx`**
- Renders with an accessible name.
- `aria-pressed` reflects the current theme.
- Clicking calls `setTheme` with the opposite value.
- Renders a placeholder before mount without throwing.

**`tests/unit/ProjectCard.test.tsx`**
- Renders a link only when `detailPage` is true.
- Renders every tag.
- Renders store links when present, omits the row when absent.

### E2E — Playwright

Run against `next build && next start`, not dev. Chromium, plus one WebKit project for the mobile viewport.

**`tests/e2e/theme.spec.ts`**
- Toggle switches `data-theme` on `<html>`.
- Choice persists across reload.
- First visit with `colorScheme: "dark"` emulated starts dark; with `"light"` starts light.
- **No FOUC:** `data-theme` is already set when `document.readyState` first reaches `interactive`.

**`tests/e2e/navigation.spec.ts`**
- Home renders; all six section ids are present.
- All five `/work/[slug]` routes return 200 and render a unique `<h1>`.
- An unknown slug renders the 404 page.
- In-page nav links scroll to the right section.

**`tests/e2e/reduced-motion.spec.ts`**
- With `reducedMotion: "reduce"`, revealed content is visible without scrolling into view (opacity 1, no transform).
- The aurora layer has no running animation.
- Theme toggle still works and does not start a view transition.

**`tests/e2e/a11y.spec.ts`**
- `@axe-core/playwright` scan on the home page and all five detail pages, in **both themes**. Zero violations at `wcag2a` and `wcag2aa`.

**`tests/e2e/keyboard.spec.ts`**
- Skip link is the first focusable element and works.
- Every interactive element is reachable by Tab in DOM order.
- Focus is visible on each — assert a non-zero outline via computed style.
- No focus trap.

**`tests/e2e/meta.spec.ts`**
- Every page has a unique `<title>` and `<meta name="description">`.
- Every detail page exposes an `og:image` that returns 200 and is 1200×630.

### Lighthouse

`@lhci/cli` as a **separate, non-blocking** CI job on the built site. Assertions: performance ≥ 0.95, accessibility = 1.0, best-practices ≥ 0.95, SEO = 1.0, mobile throttling. Tighten to blocking once it passes consistently.

---

## 10. CI

`.github/workflows/ci.yml`, on push to `dev` and `main`, and on every pull request:

```
verify:   npm ci → typecheck → lint → test:unit → build
e2e:      needs verify → install playwright browsers → test:e2e → upload report on failure
lighthouse: needs verify → lhci autorun (continue-on-error: true)
```

Cache npm and the Playwright browser binaries.

You list GitHub Actions and Fastlane as skills. Having real CI on your own repo is the cheapest possible proof of that, so this is not optional.

---

## 11. Quality gates

Before any phase is considered done:

- `npm run typecheck && npm run lint && npm run test && npm run build` all pass.
- No `any`, no `@ts-ignore`, no `eslint-disable` without an inline reason.
- Keyboard-only walkthrough of anything new.
- Both themes checked.
- Reduced-motion checked.

Site-level targets: JS ≤ 60kb gzipped on the home route, Lighthouse mobile 95+/100/95+/100, contrast ≥ 4.5:1 everywhere in both themes, CLS < 0.02.

---

## 12. Git workflow

**`main` stays clean.** It is the production branch and receives merges from `dev` only, via pull request, only when a phase is genuinely finished. Never commit to `main` directly.

### Branches

| Branch | Role |
|---|---|
| `main` | Production. Protected. Merges from `dev` only. |
| `dev` | Integration. GitHub default branch, so PRs target it automatically. |
| `phase/<n>-<name>` | One per phase, branched from `dev`, merged back into `dev`. |

Phase branch names, fixed:

```
phase/1-foundation
phase/2-backdrop
phase/3-home
phase/4-content
phase/5-metadata
phase/6-motion
phase/7-quality
phase/8-docs
```

### Setup

```bash
git checkout -b dev
git push -u origin dev
gh repo edit --default-branch dev
```

Then protect `main` in repo settings: require a pull request, require the `verify` and `e2e` checks to pass, disallow force pushes.

### Flow per phase

```bash
git checkout dev && git pull
git checkout -b phase/2-backdrop
# ...work, committing as you go
git push -u origin phase/2-backdrop
gh pr create --base dev --title "Phase 2 — backdrop system"
# CI green → squash merge → delete branch
```

When a phase is complete on `dev` and its acceptance criteria are met, open a second PR from `dev` into `main`. That merge is what promotes the site to production.

### Commits

Conventional commits — `feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`. The history is part of what an engineer reading the repo sees, so keep it legible. Squash-merge phase branches so `dev` carries one commit per phase.

### PR checklist

Every PR into `dev` must state:

- Which phase and which acceptance criteria it satisfies.
- That `typecheck`, `lint`, `test`, and `build` pass locally.
- Both themes checked, reduced-motion checked, keyboard-only walkthrough done for anything new.
- The preview URL.

### Vercel

Set the **production branch to `main`** in project settings. Every other branch gets a preview deployment automatically, so `dev` and each phase branch have their own URL. Give `dev` a stable alias — `dev-bilalmakki.vercel.app` — so there is one link that always shows current integration state rather than a new hash per push.

`bilalmakki.vercel.app` therefore only ever shows finished work. That is the point of keeping `main` clean, and it means the URL is safe to share at any moment.

---

## 13. Phases

Each phase is one branch off `dev`, one PR into `dev`, and — once its acceptance criteria are met — a promotion PR from `dev` into `main`. Promote early and often rather than accumulating finished phases on `dev`. The most common way "do it properly" fails is that it never goes live.

### Phase 1 — Foundation
Scaffold, `tsconfig` strict, `globals.css` with all tokens and `@property` registrations, fonts, `next-themes`, `ThemeToggle` (no view transition yet), `Backdrop` rendering a **static** stop, skip link, CI workflow, Vitest and Playwright configured.

*Done when:* both themes render with no FOUC, `palettes.test.ts` contrast gate passes, CI is green, site is live.

### Phase 2 — Backdrop system
`oklch.ts`, `scroll-progress.ts`, the rAF driver, the `@supports` CSS path, aurora, grain, reduced-motion static fallback.

*Done when:* `oklch.test.ts` and `scroll-progress.test.ts` pass including the hue-arc cases; scrolling produces a continuous colour drift with no visible banding or seam; DevTools shows no layout or paint during scroll.

### Phase 3 — Home page
All six sections with real content from `portfolio-content.md`. `ExperienceRail` with the Maxxsol-trunk framing. Skills grid. Project cards.

*Done when:* every fact traces to the content file; the overlapping-dates framing is legible at a glance; the headshot renders correctly in both themes and is not causing layout shift; `navigation.spec.ts` passes.

### Phase 4 — Content layer and detail pages
zod schema, MDX loader, five detail pages, `generateStaticParams`, `not-found`, `whatIdImprove` component.

*Done when:* `content.test.ts` passes; all five pages render with real prose; unknown slugs 404.

### Phase 5 — Metadata and OG
Metadata API per route, site OG image, per-project OG images via `next/og`.

Two gotchas that will otherwise cost an hour: `ImageResponse` **cannot use variable fonts** — load a static `.ttf` cut of Bricolage Grotesque with `readFile`. And it supports **flexbox only** — no grid, no custom properties, so hardcode the hex values rather than importing tokens.

*Done when:* `meta.spec.ts` passes; unfurl verified on LinkedIn's post inspector.

### Phase 6 — Motion
The five inventory items, `LazyMotion` wiring, full reduced-motion pass, view-transition theme wipe.

*Done when:* `reduced-motion.spec.ts` passes; no jank at 4x CPU throttle.

### Phase 7 — Accessibility and performance
Full axe pass in both themes, keyboard suite, bundle audit, Lighthouse CI.

*Done when:* `a11y.spec.ts` and `keyboard.spec.ts` pass with zero violations; Lighthouse targets met.

### Phase 8 — README and decisions log
`README.md` with an architecture section explaining the single-layer backdrop and OKLCH interpolation, plus `DECISIONS.md` recording why Next, why no scroll library, why OKLCH over RGB, why `LazyMotion`, why the iOS CI limitation is stated rather than hidden.

*Done when:* an engineer who reads only the README understands the backdrop system without opening the code.

---

## 14. Open items

- `TODO(bilal)`: MaxKids store links once live.
- `TODO(bilal)`: confirm with Maxxsol that naming clients publicly is fine — the code NDA is resolved, but agency contracts sometimes carry a separate publicity clause.
- Screenshots for the publicly listed apps (AvoMD, Metal Men, MiMesa, PhraseShare) still need to be gathered. Store listings are the fastest source.
