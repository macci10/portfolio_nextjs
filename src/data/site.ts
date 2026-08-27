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
