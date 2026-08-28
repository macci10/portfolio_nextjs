/**
 * Skills grid. Traces to `portfolio-content.md` section 5, verbatim.
 *
 * The plan is explicit that nothing may be added here that is not in the
 * content file — the site is what an interviewer reads before asking questions.
 * Specifically excluded: GraphQL, Apollo, React Query, TanStack Query, Sentry,
 * Jetpack Compose, Room, Riverpod, Bloc, GetX, Terraform, Firestore Security
 * Rules, Detox, Appium, Reanimated, Skia, Zustand.
 */
export type SkillGroup = { name: string; items: string[] };

export const SKILL_GROUPS: SkillGroup[] = [
  {
    name: "Cross-platform",
    items: ["React Native", "Flutter", "Expo SDK", "TypeScript", "Dart"],
  },
  {
    name: "Native",
    items: [
      "Android (Kotlin, Java)",
      "iOS (Swift, Objective-C)",
      "Native modules",
      "Coroutines",
      "WorkManager",
      "MediaCodec",
      "SurfaceView",
      "AVFoundation",
      "BLE / GATT",
    ],
  },
  {
    name: "Languages",
    items: [
      "JavaScript",
      "TypeScript",
      "Kotlin",
      "Java",
      "Dart",
      "Swift",
      "Objective-C",
      "C++",
      "Python",
    ],
  },
  {
    name: "Architecture & state",
    items: [
      "Clean Architecture",
      "MVVM",
      "Redux",
      "React Hooks",
      "Provider",
      "Context API",
      "REST APIs",
      "Socket.io",
      "LoopBack",
    ],
  },
  {
    name: "Cloud & data",
    items: ["Firebase", "AWS S3", "MySQL", "MongoDB", "SQLite", "Hive"],
  },
  {
    name: "Hardware & protocols",
    items: ["DJI SDK (MSDK / OSDK)", "MOP Protocol", "Matrix Protocol", "BLE", "Google Maps SDK"],
  },
  {
    name: "Integrations",
    items: [
      "Stripe",
      "Twilio",
      "Google Mobile Ads",
      "Push notifications",
      "In-app purchases",
    ],
  },
  {
    name: "Delivery",
    items: [
      "Git",
      "GitHub",
      "GitHub Actions",
      "Fastlane",
      "Code review",
      "Store release management",
      "Jest",
      "Agile / Scrum",
      "Jira",
      "Figma",
    ],
  },
  {
    name: "AI-assisted development",
    items: ["GitHub Copilot", "Claude Code", "Antigravity"],
  },
];
