/**
 * Project data. Every field traces to `portfolio-content.md` section 7.
 *
 * The shape deliberately matches the zod `ProjectSchema` the plan specifies for
 * phase 4, so moving these into MDX frontmatter is a relocation rather than a
 * rewrite. `detailPage` is true for exactly the five the plan names, in the
 * order it names them; everything else renders as a card with no link.
 */
export type Project = {
  slug: string;
  name: string;
  role: string;
  period: string;
  category: string;
  platforms: string[];
  featured: boolean;
  detailPage: boolean;
  order: number;
  tags: string[];
  summary: string;
  highlights?: string[];
  links?: { appStore?: string; playStore?: string };
};

export const PROJECTS: Project[] = [
  {
    slug: "drone-inspection-controller",
    name: "Drone Inspection Controller",
    role: "Android Developer · DJI Specialist",
    period: "Dec 2023 – Apr 2025",
    category: "Drone / UAV · Native Android",
    platforms: ["Android"],
    featured: true,
    detailPage: true,
    order: 1,
    tags: ["Kotlin", "DJI MSDK", "DJI OSDK", "MOP Protocol", "MediaCodec", "SurfaceView"],
    summary:
      "A remote controller app for autonomous building-envelope drone inspections, delivered to Georgia Tech, the U.S. Department of Energy, Oak Ridge National Laboratory, and New Mexico Tech.",
  },
  {
    slug: "avomd",
    name: "AvoMD",
    role: "Mobile Team Lead (3 engineers)",
    period: "Jun 2020 – Aug 2023",
    category: "Health tech · React Native",
    platforms: ["iOS", "Android"],
    featured: true,
    detailPage: true,
    order: 2,
    tags: ["React Native", "TypeScript", "Expo SDK", "Redux", "Firebase", "AWS S3"],
    summary:
      "Clinical decision support, in production at Mass General Brigham, VCU Health, Geisinger, and Children's Minnesota. 10,000+ downloads.",
    links: {
      appStore: "https://apps.apple.com/us/app/avomd/id1114334146",
      playStore: "https://play.google.com/store/apps/details?id=com.avomd.client",
    },
  },
  {
    slug: "strip-reader-poc",
    name: "Strip Reader",
    role: "Individual contributor",
    period: "2025",
    category: "Computer vision · React Native + native Kotlin",
    platforms: ["Android"],
    featured: true,
    detailPage: true,
    order: 3,
    tags: ["React Native", "Kotlin", "Vision Camera", "Native Modules", "CIEDE2000", "CIELAB"],
    summary:
      "Automated reading of pool chemical test strips from a phone camera, targeting under ±0.2 pH accuracy.",
  },
  {
    slug: "maxkids-coloring-world",
    name: "MaxKids: Coloring World",
    role: "Senior Flutter Developer",
    period: "Jan 2025 – Present",
    category: "Consumer / kids · Flutter",
    platforms: ["iOS", "Android"],
    featured: true,
    detailPage: true,
    order: 4,
    tags: ["Flutter", "Dart", "Provider", "Hive", "Firebase Storage", "Google Mobile Ads"],
    summary:
      "A kids' interactive coloring app with a custom drawing engine, cloud-delivered content packs, and a kid-safe monetisation layer.",
    // TODO(bilal): add App Store and Play Store links once live.
  },
  {
    slug: "metal-men",
    name: "Metal Men",
    role: "Flutter Developer",
    period: "Dec 2024 – Present",
    category: "Real-time messaging · Flutter",
    platforms: ["iOS", "Android"],
    featured: true,
    detailPage: true,
    order: 5,
    tags: ["Flutter", "Dart", "Matrix Protocol", "Hive", "GitHub Actions", "Fastlane"],
    summary:
      "A community messaging app on the Matrix Protocol, built by customising the open-source FluffyChat framework and keeping it upgradable.",
    links: {
      appStore: "https://apps.apple.com/us/app/metal-men-connect/id6504414768",
      playStore: "https://play.google.com/store/apps/details?id=men.metal.connect",
    },
  },
  {
    slug: "ptpal-ble",
    name: "PTPal — BLE wearable integration",
    role: "Android Developer",
    period: "Earlier engagement",
    category: "Connected hardware · Native Android",
    platforms: ["Android"],
    featured: true,
    detailPage: false,
    order: 6,
    tags: ["Android", "Java", "BLE", "GATT", "Background sync"],
    summary:
      "Fixed critical BLE connectivity failures with FitMi Puck wearable devices in a physical therapy app.",
  },
  {
    slug: "mimesa",
    name: "MiMesa",
    role: "Mobile Team Lead (2 engineers)",
    period: "Aug 2023 – May 2025",
    category: "Restaurant tech · React Native",
    platforms: ["iOS", "Android"],
    featured: false,
    detailPage: false,
    order: 7,
    tags: ["React Native", "TypeScript", "Redux", "Socket.io", "Firebase"],
    summary: "Restaurant table booking with real-time reservation state across iOS and Android.",
    links: {
      appStore: "https://apps.apple.com/pk/app/mi-mesa-app/id6444349487",
      playStore: "https://play.google.com/store/apps/details?id=com.primeros.mimesaapp",
    },
  },
  {
    slug: "phraseshare",
    name: "PhraseShare",
    role: "Mobile Team Lead",
    period: "Apr 2020 – Oct 2024",
    category: "Consumer / language · React Native",
    platforms: ["iOS"],
    featured: false,
    detailPage: false,
    order: 8,
    tags: ["React Native", "JavaScript", "Redux", "LoopBack", "Socket.io"],
    summary: "A real-time language dialect sharing platform, built from the ground up.",
    links: { appStore: "https://apps.apple.com/us/app/phraseshare/id1621657684" },
  },
  {
    slug: "chorerelief",
    name: "ChoreRelief (AllBetter)",
    role: "Mobile Developer",
    period: "Earlier engagement",
    category: "Marketplace · React Native",
    platforms: ["iOS", "Android"],
    featured: false,
    detailPage: false,
    order: 9,
    tags: ["React Native", "Stripe", "AWS S3"],
    summary: "Two native codebases, Android and iOS, consolidated into one React Native product.",
  },
  {
    slug: "dripstate",
    name: "Dripstate",
    role: "Mobile Developer",
    period: "Earlier engagement",
    category: "Fitness · React Native",
    platforms: ["iOS", "Android"],
    featured: false,
    detailPage: false,
    order: 10,
    tags: ["React Native", "Twilio", "Stripe", "AWS S3"],
    summary: "A fitness platform with live video training sessions between trainers and trainees.",
  },
  {
    slug: "native-ios-audio",
    name: "Native iOS audio modules",
    role: "Mobile Developer",
    period: "Earlier engagements",
    category: "Native modules · React Native + Swift",
    platforms: ["iOS"],
    featured: false,
    detailPage: false,
    order: 11,
    tags: ["React Native", "Swift", "AVFoundation", "Native modules"],
    summary:
      "Two React Native music apps where JavaScript-side playback wasn't enough, so the audio layer went native.",
  },
  {
    slug: "earlier-work",
    name: "Earlier work",
    role: "Mobile Developer → Senior Mobile Engineer",
    period: "Dec 2014 – 2020",
    category: "React Native · Native Android",
    platforms: ["iOS", "Android"],
    featured: false,
    detailPage: false,
    order: 12,
    tags: ["React Native", "Android", "Java"],
    summary:
      "10+ cross-platform React Native apps and 15+ native Android apps across healthcare, fintech, and consumer verticals.",
  },
];
