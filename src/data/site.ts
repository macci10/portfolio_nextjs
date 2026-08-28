/**
 * Identity and meta. Every value traces to `portfolio-content.md`, which is the
 * single source of truth for the site. Nothing here is invented.
 *
 * Note: the content file lists a phone number. The implementation plan forbids
 * a phone number anywhere on the site, so it is deliberately absent.
 */
export const SITE = {
  name: "Bilal Haider Makki",
  title: "Senior Cross-Platform Mobile Engineer",
  secondaryTitle: "Mobile Team Lead",
  stackLine: "React Native · Flutter · Android · iOS",
  location: "Lahore, Pakistan",
  availability:
    "Open to senior / lead mobile roles — remote (US, UK, EU, Canada, Australia)",
  timezoneNote:
    "PKT (UTC+5). Four-hour overlap with US Eastern mornings, 9am–1pm ET.",
  yearsExperience: "11+",
  appsShipped: "25+",
  email: "bilalhaidermakki@gmail.com",
  linkedin: "https://linkedin.com/in/bilal-haider-makki",
  url: "https://bilalmakki.vercel.app",
  metaTitle:
    "Bilal Haider Makki — Senior Cross-Platform Mobile Engineer (React Native, Flutter)",
  metaDescription:
    "Mobile engineer with 11+ years and 25+ shipped apps. React Native, Flutter, native Android and iOS. Drone systems, clinical software, real-time apps.",
  ogBlurb:
    "I build mobile apps. 25+ are live on the App Store and Play Store — clinical decision support, drone inspection controllers, real-time messaging.",
  footerLine: "Built by Bilal Haider Makki · Lahore, Pakistan",
} as const;

export const HERO = {
  headline: "I build mobile apps. 25+ of them are live on the App Store and Play Store.",
  subline:
    "Senior Cross-Platform Mobile Engineer and Mobile Team Lead. I take products from architecture through store release, and go native — Kotlin or Swift — when the JavaScript layer runs out.",
  ctaPrimary: "See the work",
  ctaSecondary: "Get in touch",
} as const;

/** About copy — the "medium" variant from `portfolio-content.md` section 3. */
export const ABOUT = {
  paragraphs: [
    "I'm a mobile engineer with eleven years at one agency, which in practice means six-plus client engagements across healthcare, drone systems, restaurant tech, and consumer products.",
    "Most of my work is React Native and Flutter, but the interesting parts have been below that line: a real-time LiDAR visualiser built on MediaCodec, MOP communication between DJI's Mobile and Onboard SDKs, native iOS audio modules on AVFoundation, a sequential BLE queue that stopped a wearable integration losing readings.",
    "I lead a mobile team while staying hands-on. Leading a team, for me, means reviewing code properly and telling people things early.",
  ],
} as const;

/**
 * Site-level stats only. `portfolio-content.md` section 4 also lists three
 * project-specific figures (AvoMD's 40% crash reduction and 50% delivery time,
 * Metal Men's 70% integration time). Those stay on their detail pages in phase
 * 4 — on the home page they would be metrics with nothing to anchor them to.
 */
export const STATS = [
  { label: "Years in mobile", value: "11+" },
  { label: "Apps shipped to stores", value: "25+" },
  { label: "Team size led", value: "3" },
] as const;

export const CONTACT = {
  heading: "Get in touch",
  body: [
    "I'm open to senior and lead mobile roles at product companies, and to selective contract work. Drone, hardware, and health-tech products are where my experience is least replaceable.",
    "Email is the fastest route.",
  ],
} as const;

/** In-page navigation. Ids must match SECTIONS in src/lib/palettes.ts. */
export const NAV = [
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
] as const;
