# Decisions

Why the larger choices were made. Where a decision was wrong first, that is
recorded too — a decisions log that only contains decisions that worked out is
a marketing document.

---

## Next.js, App Router

The site is mostly static content with five generated detail pages, a set of
generated Open Graph images, a sitemap and a robots file. All of that is a
build-time concern, and the App Router generates every route statically.

The alternative worth taking seriously was Astro, which would have shipped less
JavaScript. It was not chosen because the interactive parts — the scroll-driven
backdrop, the reveals, the View Transition theme switch — are the point of the
site rather than an add-on, and because this is a portfolio for a React
engineer. Shipping it in a framework the owner does not work in would be a
strange thing for the artifact to say.

## CSS Modules, not Tailwind

Not a general position on Tailwind. Specific to this site: the backdrop system
is built on custom properties that change at runtime, `@property` registration,
`@supports` feature branching, and `@keyframes` that restate a palette defined
in TypeScript. All of that is CSS that has to be written as CSS. Adding a
utility framework on top would mean two styling systems where one is already
doing the work.

## No scroll library

No Lenis, no Locomotive, no GSAP ScrollSmoother. They add weight, they break
keyboard and screen-reader navigation, and smoothed scrolling feels wrong on
touch devices, which is most of this site's traffic.

Native `scroll-behavior: smooth` covers the anchor links. The backdrop reads
`scrollY` directly.

## OKLCH over RGB for the backdrop

Interpolating two colours in sRGB drags the midpoint through grey, because sRGB
is not perceptually uniform. The backdrop's whole premise is that the transition
between stops is imperceptible, so a visibly desaturated midpoint defeats it.

OKLCH is perceptually uniform. The cost is a conversion chain — sRGB → linear
RGB → OKLab → OKLCH and back — which is about sixty lines and runs a handful of
times per frame. Cheap, and `tests/unit/oklch.test.ts` pins it against known
values including the hue-arc cases.

## A single background layer

Six stacked cross-fading divs is the common implementation and it works. It also
gives the compositor six full-viewport layers to blend every frame. One element
with two custom properties gives one layer and one paint.

The constraint this imposes is that the gradient can only be two colours, which
turned out not to matter.

## LazyMotion with `domAnimation` and `strict`

`strict` makes `motion.*` a runtime error, forcing every component to use `m.*`.
That is the point: `motion.div` silently pulls in the full feature bundle, and
the failure mode is a bundle that grows without anyone noticing. Making it throw
turns a silent regression into a build-time error.

## Where a preference must hold at first paint, the stylesheet owns it

This one was learned twice, both times from a bug.

**The backdrop.** Under `prefers-reduced-motion` the drift should sit at a fixed
midpoint. The first implementation had JavaScript write that value on mount. It
was correct, and it flashed the wrong colour on every load, because hydration
happens after first paint. The fix was to put the value in the stylesheet and
have JavaScript release the properties instead.

**The reveals.** Motion applies `initial` as an inline style. Under `reduce` it
skips the animation and leaves that inline style in place, which strands every
section at opacity 0 — permanently. A blank page, for exactly the users who
cannot opt back in. `useReducedMotion` in the component is not enough, because
an inline style is what has to be beaten. `globals.css` overrides
`[data-reveal]` and `[data-seq]` under `reduce`, and that is the guarantee.

The general form: JavaScript cannot own anything that must be true before
JavaScript runs.

## The hero entrance is CSS, and the LCP element never fades

Follows directly from the rule above, but was found through Lighthouse rather
than reasoning. The home page scored 0.91 with LCP at 3.1s, 85% of it render
delay. The LCP element was the hero headline, which Motion held at opacity 0
until hydration — so the most important line of text on the site was invisible
until the bundle arrived.

Moving the sequence to CSS keyframes fixed the dependency on JavaScript and took
the hero out of the client bundle entirely, since it no longer needs to be a
client component. But a CSS fade would have kept most of the problem: an element
at opacity 0 is not painted either way. So the headline animates `transform`
only. Everything after it fades normally, because none of it is an LCP
candidate.

Result: 0.91 → 0.95, TBT 180ms → 60ms, Speed Index 2.4s → 0.9s.

## The iOS CI limitation is stated, not hidden

The Metal Men write-up says iOS is compile-verified in CI with `--no-codesign`
and submitted to TestFlight through a Fastlane lane run locally, rather than
implying the whole pipeline is automated.

That is a deliberate choice about what a portfolio is for. Anyone who has set up
iOS CI knows where the signing boundary usually falls, so claiming full
automation invites a question the claim cannot survive. Stating the limit is
both true and more convincing.

## The 60 kB JavaScript target was abandoned

The original plan set a target of 60 kB gzipped first-load JS on the home route.
It is not reachable: React 19 plus the App Router runtime is roughly 100 kB
gzipped before any of this site's own code exists. The target belonged to a
different architecture — one without React.

Rather than carry a permanently failing number or quietly delete it, the site
now measures gzipped first-load JS per route against a ceiling set slightly
above current (`npm run bundle`, wired into CI). Framework cost passes silently;
accidentally adding a charting or date library fails loudly. That is the thing
the original target was actually trying to protect.

## Lighthouse runs through `npx`, not as a dependency

`@lhci/cli` pulls in transitive advisories with no non-breaking fix. This repo
keeps `npm audit` clean so that the command stays a signal worth reading, and a
known-noisy dev tool in the lockfile would end that. It runs via `npx` inside a
non-blocking CI job, where it never touches the lockfile.

The same reasoning rejected `image-size` for a test helper; a thirty-line
header parser replaced it.

## Never rely on browser variation to reach a code path

The backdrop has a `requestAnimationFrame` fallback for browsers without
`animation-timeline: scroll()`. Both test engines support it, so the fallback
never ran — and the suite passed, having tested one path twice while appearing
to test two.

Forcing the fallback needed more than stubbing `CSS.supports`: the stylesheet's
own `@supports` block still matched, and a running CSS animation outranks an
inline style. Cancelling the animation as well was the missing piece.

The same failure appeared again in phase 6, where a Playwright `reducedMotion`
option that is not a first-class test option was silently ignored, and an entire
reduced-motion suite passed while exercising nothing. And again in phase 4,
where every media assertion looped over an empty array.

The rule that came out of it: a test that could pass on an empty set, or on the
wrong code path, needs an assertion that the set is non-empty and the path is
the intended one. Several suites now carry exactly that guard.

## Accessibility scanning runs under reduced motion

Not a convenience. Under normal motion the reveals hold everything below the
fold at opacity 0 until it is scrolled into view, so a scan would silently skip
most of the page. And mid-fade, an element blends toward the backdrop, which axe
reports as a contrast violation that the settled page does not have — it fired
on roughly one home-page run in four under parallel load.

Reduced motion pins every section visible and static, which is the state where
"does this page have accessibility violations" is a well-posed question. The
suite asserts that pinning still holds, so removing the CSS override fails the
scan rather than quietly shrinking it.

## The keyboard suite is Chromium-only

WebKit does not move focus to links with Tab unless the user enables Full
Keyboard Access. A Tab-order walk under WebKit therefore measures that setting
rather than this site, and would fail identically on a page with flawless
keyboard support.

The axe suite still runs under both engines. The skip is recorded in the spec
with its reason, rather than the suite quietly being configured Chromium-only.

## Placeholder screenshots are labelled as placeholders

The images currently in `public/media/` are real screenshots of a different
application, standing in until real captures are gathered. The first version
shipped them under alt text describing the screens they were meant to replace.

That is the same category of mistake as an unsupportable claim in the prose,
and worse in one direction: a sighted visitor sees an obviously unrelated app,
while somebody using a screen reader is read a confident description of a screen
that was never built. They are now flagged in frontmatter, which overrides the
alt text and renders a visible badge. Replacing the file and clearing the flag
restores the real description.
