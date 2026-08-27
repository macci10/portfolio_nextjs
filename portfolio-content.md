# Portfolio Content — Bilal Haider Makki

Single source file for the portfolio website. Every fact here is drawn from `EXPERIENCE.md` and verified resume content. Nothing is invented.

**Flags before publishing:** see `## Publishing checks` at the bottom. Two items need your decision.

---

## 1. Identity / meta

| Field | Value |
|---|---|
| `name` | Bilal Haider Makki |
| `title` | Senior Cross-Platform Mobile Engineer |
| `secondary_title` | Mobile Team Lead |
| `stack_line` | React Native · Flutter · Android · iOS |
| `location` | Lahore, Pakistan |
| `availability` | Open to senior / lead mobile roles — remote (US, UK, EU, Canada, Australia) |
| `timezone_note` | PKT (UTC+5). Four-hour overlap with US Eastern mornings, 9am–1pm ET. |
| `years_experience` | 11+ |
| `apps_shipped` | 25+ |
| `email` | bilalhaidermakki@gmail.com |
| `phone` | +92 342-4449161 |
| `linkedin` | https://linkedin.com/in/bilal-haider-makki |

### SEO

- **`meta_title`:** Bilal Haider Makki — Senior Cross-Platform Mobile Engineer (React Native, Flutter)
- **`meta_description`:** Mobile engineer with 11+ years and 25+ shipped apps. React Native, Flutter, native Android and iOS. Drone systems, clinical software, real-time apps.
- **`og_blurb`:** I build mobile apps. 25+ are live on the App Store and Play Store — clinical decision support, drone inspection controllers, real-time messaging.
- **`keywords`:** React Native developer, Flutter developer, mobile team lead, native Android Kotlin, iOS Swift, DJI SDK, BLE, cross-platform mobile engineer

---

## 2. Hero

**`hero_headline` (pick one):**

1. I build mobile apps. 25+ of them are live on the App Store and Play Store.
2. Mobile engineer. React Native and Flutter, with the native layer underneath when it matters.
3. Eleven years shipping mobile software — clinical tools, drone controllers, real-time apps.

**`hero_subline`:**
> Senior Cross-Platform Mobile Engineer and Mobile Team Lead. I take products from architecture through store release, and go native — Kotlin or Swift — when the JavaScript layer runs out.

**`hero_cta_primary`:** See the work
**`hero_cta_secondary`:** Get in touch

---

## 3. About

### Short (~40 words, for a sidebar or card)

> I build mobile apps. 25+ are live across the App Store and Play Store — React Native, Flutter, native Android and iOS. I lead a mobile team and still write code every day. Maintainable beats clever, mostly because I end up maintaining the clever thing.

### Medium (~110 words, for an About section)

> I'm a mobile engineer with eleven years at one agency, which in practice means six-plus client engagements across healthcare, drone systems, restaurant tech, and consumer products.
>
> Most of my work is React Native and Flutter, but the interesting parts have been below that line: a real-time LiDAR visualiser built on MediaCodec, MOP communication between DJI's Mobile and Onboard SDKs, native iOS audio modules on AVFoundation, a sequential BLE queue that stopped a wearable integration losing readings.
>
> I lead a mobile team while staying hands-on. Leading a team, for me, means reviewing code properly and telling people things early.

### Long (~230 words, for a dedicated About page)

> I'm a mobile engineer based in Lahore. Eleven years at Maxxsol, a software agency, promoted from Android Developer to React Native Developer to Mobile Team Lead. In agency terms that's six-plus client engagements rather than one job — healthcare, drone systems, restaurant tech, consumer products.
>
> The work I'm proudest of is AvoMD, a clinical decision support app in production at Mass General Brigham, VCU Health, Geisinger, and Children's Minnesota. I led a team of three, drove a migration to TypeScript and functional React Hooks that cut production crashes by 40% and halved feature delivery time, and architected three distinct app variants shipping from a single codebase. Software clinicians rely on at the point of care doesn't get to be unreliable.
>
> The rarest work is the drone side. I built a remote controller for autonomous building-envelope inspections — DJI MSDK and OSDK talking to each other over MOP Protocol, a custom real-time LiDAR point cloud visualiser assembled from a low-level frame reader and MediaCodec encoder rendering onto a SurfaceView, multi-camera live feeds with a drone-to-POV distance overlay. It went out to Georgia Tech and Oak Ridge National Laboratory.
>
> Cross-platform is where I spend most of my time, but I don't treat the native layer as somebody else's problem. Native modules in both Swift and Kotlin, bridged into React Native and Flutter.

---

## 4. Stats block

| `label` | `value` |
|---|---|
| Years in mobile | 11+ |
| Apps shipped to stores | 25+ |
| Team size led | 3 engineers |
| Crash rate reduction (AvoMD) | 40% |
| Feature delivery time cut (AvoMD) | 50% |
| Upstream integration time cut (Metal Men) | 70% |

---

## 5. Skills

Grouped for a skills grid. Order within each group is roughly strongest-first.

**Cross-platform**
React Native · Flutter · Expo SDK · TypeScript · Dart

**Native**
Android (Kotlin, Java) · iOS (Swift, Objective-C) · Native modules bridged into React Native and Flutter · Coroutines · WorkManager · MediaCodec · SurfaceView · AVFoundation · BLE / GATT

**Languages**
JavaScript · TypeScript · Kotlin · Java · Dart · Swift · Objective-C · C++ · Python

**Architecture & state**
Clean Architecture · MVVM · Redux · React Hooks · Provider · Context API · REST APIs · Socket.io · LoopBack

**Cloud & data**
Firebase (Auth, Realtime Database, Firestore, Storage, Cloud Functions, Cloud Messaging, Crashlytics) · AWS S3 · MySQL · MongoDB · SQLite · Hive

**Hardware & protocols**
DJI SDK (MSDK / OSDK) · MOP Protocol · Matrix Protocol · BLE · Google Maps SDK

**Integrations**
Stripe · Twilio · Google Mobile Ads / AdMob · Push notifications · In-app purchases

**Delivery**
Git · GitHub · CI/CD with GitHub Actions and Fastlane · Code review · App Store and Play Store release management · Jest · Agile / Scrum · Jira · Asana · Figma

**AI-assisted development**
GitHub Copilot · Claude Code · Antigravity

---

## 6. What I do (services section)

Four cards, if the site has a services block.

**1. Full app builds**
Architecture through store release. React Native or Flutter, iOS and Android, with the release pipeline set up so shipping isn't an event.

**2. Native module work**
When the cross-platform layer runs out — camera pipelines, audio playback, BLE, hardware SDKs. Written in Kotlin or Swift and bridged in cleanly.

**3. Rescue and upgrade work**
Crash rates, Expo and React Native version upgrades, TypeScript migrations, performance problems on codebases somebody else started.

**4. Mobile team leadership**
Setting architecture and standards, running code reviews, and staying in the code. Teams of two to three engineers across concurrent engagements.

---

## 7. Projects

Field keys are consistent across every entry so they map cleanly to a CMS or a JSON array.

---

### 7.1 Drone Inspection Controller (Joulea)

- **`slug`:** drone-inspection-controller
- **`role`:** Android Developer · DJI Specialist
- **`period`:** Dec 2023 – Apr 2025
- **`category`:** Drone / UAV · Native Android
- **`platforms`:** Android
- **`featured`:** yes — lead project
- **`links`:** none (no public listing)
- **`nda`:** yes — see publishing checks
- **`tags`:** Kotlin · DJI MSDK · DJI OSDK · MOP Protocol · MediaCodec · SurfaceView · Google Maps API · Coroutines · WorkManager

**`summary`:**
> A remote controller app for autonomous building-envelope drone inspections, delivered to Georgia Tech, the U.S. Department of Energy, Oak Ridge National Laboratory, and New Mexico Tech.

**`description`:**
> Native Android, Kotlin. The controller drives autonomous inspection missions and renders everything the operator sees during the flight — live camera feeds, telemetry, mission progress, and a real-time LiDAR view.
>
> The hardest part was the media pipeline. LiDAR frames arrived from the drone's onboard computer over MOP Protocol as fragmented packets. I built the frame reader consuming the packet stream, an assembler reconstructing complete frames, and an encoder feeding MediaCodec to render onto a SurfaceView in real time. I also owned connection reliability — sequencing MOP channel communication so the pipeline never deadlocked when the radio link degraded mid-mission.

**`highlights`:**
- Custom real-time LiDAR point cloud visualiser — low-level frame reader, assembler, and MediaCodec encoder rendering onto a SurfaceView.
- MOP Protocol implementation for synchronised communication between DJI's Mobile SDK and Onboard SDK, running multiple concurrent real-time data pipelines.
- Multi-camera mode system with switchable IR, RGB, and zoom feeds, plus a live drone-to-POV distance overlay rendered on the active camera.
- Google Maps extended well beyond `ClusterManager` — custom waypoint and marker handling, mission path rendering, and inspection progress tracking.
- Restyled DJI's built-in SDK UI components to match the client design system.

**`what_id_improve`** *(optional honest-engineering block — reads well on a portfolio):*
> I'd move frame assembly off the JNI boundary; marshalling between Kotlin and native buffers cost latency at higher frame rates, and today I'd keep buffers native with direct `ByteBuffer` allocation. I'd also add adaptive frame dropping — my implementation buffered and played catch-up when the link degraded, briefly showing operators stale data. A live inspection tool should always prioritise the newest frame.

---

### 7.2 AvoMD

- **`slug`:** avomd
- **`role`:** Mobile Team Lead (3 engineers)
- **`period`:** Jun 2020 – Aug 2023
- **`category`:** Health tech · React Native
- **`platforms`:** iOS, Android
- **`featured`:** yes
- **`links`:**
  - App Store: https://apps.apple.com/us/app/avomd/id1114334146
  - Play Store: https://play.google.com/store/apps/details?id=com.avomd.client
- **`tags`:** React Native · TypeScript · Expo SDK · Redux · Firebase · Cloud Functions · AWS S3

**`summary`:**
> Clinical decision support, in production at Mass General Brigham, VCU Health, Geisinger, and Children's Minnesota. 10,000+ downloads.

**`description`:**
> I led the mobile team of three engineers and owned architecture, code review, and the release cadence across the full lifecycle. The app puts clinical guidance in front of doctors at the point of care, which sets the reliability bar: a runtime error isn't a bad user experience, it's a clinician seeing the wrong guidance.

**`highlights`:**
- Led the migration to TypeScript and functional React Hooks under clean architecture principles — production crash rate down 40%, feature delivery time down 50%.
- Architected three distinct app variants (main app, Columbia Psych, Preoperative Eval) shipping from a single codebase using Xcode build configurations and Android Studio flavors, removing the need for separate codebases.
- Built a Firebase and Google Sheets automation pipeline for user account provisioning — HTTP-triggered Cloud Functions performing bulk writes into the Realtime Database via the Admin SDK, with clients updating live.
- Maintained continuous Expo SDK and React Native version upgrades across three years of app lifecycle.
- Ran code reviews, documented architectural decisions, and mentored the team.

---

### 7.3 Metal Men

- **`slug`:** metal-men
- **`role`:** Flutter Developer
- **`period`:** Dec 2024 – Present
- **`category`:** Real-time messaging · Flutter
- **`platforms`:** iOS, Android
- **`featured`:** yes
- **`links`:**
  - App Store: https://apps.apple.com/us/app/metal-men-connect/id6504414768
  - Play Store: https://play.google.com/store/apps/details?id=men.metal.connect
- **`tags`:** Flutter · Dart · Matrix Protocol · Hive · Firebase · GitHub Actions · Fastlane

**`summary`:**
> A community messaging app on the Matrix Protocol, built by customising the open-source FluffyChat framework and keeping it upgradable.

**`description`:**
> Forking an actively developed open-source client is easy; staying on it isn't. The work that mattered was the upgrade pipeline — a structured way to absorb continuous upstream FluffyChat changes without the fork drifting into something unmergeable.

**`highlights`:**
- Real-time messaging and cross-device state synchronisation on the Matrix Protocol.
- Designed an upgrade pipeline to absorb continuous upstream changes — 7–8 production updates shipped, integration time per release down 70%.
- Built CI/CD with GitHub Actions and Fastlane, automating Android and iOS build and release steps.
- Shipped to both the App Store and Play Store.

---

### 7.4 MaxKids: Coloring World

- **`slug`:** maxkids-coloring-world
- **`role`:** Senior Flutter Developer (with a junior developer)
- **`period`:** Jan 2025 – Present
- **`category`:** Consumer / kids · Flutter
- **`platforms`:** iOS, Android
- **`featured`:** yes
- **`links`:** *(add store links once live)*
- **`tags`:** Flutter · Dart · Provider · Hive · Firebase Storage · Google Mobile Ads · flutter_svg · Python

**`summary`:**
> A kids' interactive coloring app with a custom drawing engine, cloud-delivered content packs, and a kid-safe monetisation layer.

**`description`:**
> An internal Maxxsol product taken end to end, from architecture through iOS and Android release. The drawing engine is the product — everything else exists to keep it fed with content and to keep the monetisation from getting in a child's way.

**`highlights`:**
- Drawing engine: queue-based flood fill, SVG textured brush strokes, multi-touch pinch-to-zoom to 5x via `InteractiveViewer`, and a Magic Rainbow dynamic colour mode.
- Hive-backed pixel-buffer persistence with auto-save and resume across sessions.
- Firebase Storage content pipeline that fetches zip-archived coloring packs, unpacks them locally, and auto-patches SVGs to normalise vector rendering dimensions across devices.
- Google Mobile Ads (banner, interstitial, rewarded) behind a kid-safe arithmetic parental gate protecting gallery export, share sheets, and PDF printing.
- Standalone Python asset toolkit (`svg_optimizer`, `png_to_svg`, `trim_asset`, `find_svg_bbox`) to trace, scale, and normalise line-art assets.

---

### 7.5 MiMesa

- **`slug`:** mimesa
- **`role`:** Mobile Team Lead (2 engineers)
- **`period`:** Aug 2023 – May 2025
- **`category`:** Restaurant tech · React Native
- **`platforms`:** iOS, Android
- **`featured`:** no
- **`links`:**
  - App Store: https://apps.apple.com/pk/app/mi-mesa-app/id6444349487
  - Play Store: https://play.google.com/store/apps/details?id=com.primeros.mimesaapp
- **`tags`:** React Native · TypeScript · Redux · Socket.io · Firebase · REST API

**`summary`:**
> Restaurant table booking with real-time reservation state across iOS and Android.

**`description`:**
> I led a two-engineer team and owned the codebase architecture from inception through 10+ feature releases, writing code alongside the team throughout.

**`highlights`:**
- Rebuilt the app UI from the ground up to match client design specifications.
- Established the project architecture and design system from scratch — 10+ releases without a major refactor.
- Delivered real-time booking updates across both platforms using Socket.io.

---

### 7.6 PhraseShare

- **`slug`:** phraseshare
- **`role`:** Mobile Team Lead
- **`period`:** Apr 2020 – Oct 2024
- **`category`:** Consumer / language · React Native
- **`platforms`:** iOS
- **`featured`:** no
- **`links`:**
  - App Store: https://apps.apple.com/us/app/phraseshare/id1621657684
- **`tags`:** React Native · JavaScript · Redux · LoopBack · Socket.io

**`summary`:**
> A real-time language dialect sharing platform, built from the ground up.

**`highlights`:**
- Owned codebase structure and the LoopBack REST API architecture, standardising endpoint and model organisation.
- Centralised Redux state management across the full app lifecycle.

---

### 7.7 Strip Reader (computer vision POC)

- **`slug`:** strip-reader-poc
- **`role`:** Individual contributor
- **`period`:** 2025
- **`category`:** Computer vision · React Native + native Kotlin
- **`platforms`:** Android
- **`featured`:** yes — strongest native-module proof point
- **`links`:** none (proof of concept)
- **`tags`:** React Native · TypeScript · Kotlin · Vision Camera · Native Modules · CIEDE2000 · CIELAB · Jest

**`summary`:**
> Automated reading of pool chemical test strips from a phone camera, targeting under ±0.2 pH accuracy.

**`description`:**
> A proof of concept for reading colorimetric test strips reliably under uncontrolled lighting. The interesting problem isn't reading colour — it's that the phone camera never gives you the colour that's actually there.

**`highlights`:**
- Native Android Kotlin modules via react-native-vision-camera for bitmap cropping, Laplacian variance blur checks, and raw RGB extraction.
- Two-stage pipeline: detection (capture validation, guide-aware coordinate mapping, ROI localisation), then interpretation (calibration, sRGB→CIELAB conversion, colour comparison, interpolation).
- CIEDE2000 perceptual colour distance in CIELAB space, upgraded from CIE76.
- Von Kries channel scaling for per-pad local white balance against the strip's own white gutters.
- Specular highlight filtering, skipping pixels above 240 luminance.
- Extensible across strip layouts — AquaChek 4-parameter and 7-parameter configurations.

---

### 7.8 PTPal — BLE wearable integration

- **`slug`:** ptpal-ble
- **`role`:** Android Developer
- **`period`:** Earlier engagement
- **`category`:** Connected hardware · Native Android
- **`platforms`:** Android
- **`featured`:** yes — hardware / field-reliability proof point
- **`links`:** none
- **`tags`:** Android · Java · BLE · GATT · Local database buffering · Background sync

**`summary`:**
> Fixed critical BLE connectivity failures with FitMi Puck wearable devices in a physical therapy app.

**`description`:**
> The insight was that neither side of the problem can be trusted: Android's BLE stack cannot reliably manage itself under real-world conditions, and field networks are not stable either. So I stopped trying to make either one behave and put a queue and a buffer in the way.

**`highlights`:**
- Built a strict sequential queue for all BLE hardware communication, removing the concurrency failures the stack couldn't handle on its own.
- Introduced a local database buffer between device and cloud — readings written locally first, synced in the background.
- Result: an ultra-stable connection that eliminated virtually all FitMi reading loss under unstable network conditions.

---

### 7.9 ChoreRelief (AllBetter)

- **`slug`:** chorerelief
- **`role`:** Mobile Developer
- **`period`:** Earlier engagement
- **`category`:** Marketplace · React Native
- **`platforms`:** iOS, Android
- **`featured`:** no
- **`tags`:** React Native · Stripe · AWS S3

**`summary`:**
> Two native codebases, Android and iOS, consolidated into one React Native product.

**`highlights`:**
- Proposed and delivered the migration from separate native Android and iOS apps into a single React Native codebase, cutting ongoing maintenance cost.
- Integrated Stripe payment processing and AWS S3 file storage across separate provider and customer apps.

---

### 7.10 Dripstate (formerly FitX World)

- **`slug`:** dripstate
- **`role`:** Mobile Developer
- **`period`:** Earlier engagement
- **`category`:** Fitness · React Native
- **`platforms`:** iOS, Android
- **`featured`:** no
- **`tags`:** React Native · Twilio · Stripe · AWS S3

**`summary`:**
> A fitness platform with live video training sessions between trainers and trainees.

**`highlights`:**
- Led the Twilio live video integration powering real-time trainer-to-trainee sessions.
- Stripe payment gateway and AWS S3 file storage.

---

### 7.11 Native iOS audio modules

- **`slug`:** native-ios-audio
- **`role`:** Mobile Developer
- **`period`:** Earlier engagements
- **`category`:** Native modules · React Native + Swift
- **`featured`:** no
- **`tags`:** React Native · Swift · AVFoundation · Native modules

**`summary`:**
> Two React Native music apps where JavaScript-side playback wasn't enough, so the audio layer went native.

**`highlights`:**
- Built and improved native iOS audio playback modules on AVFoundation, bridged into React Native.
- Went native for efficient playback with lower battery cost than the JavaScript-side alternative.

> ⚠️ Keep this entry exactly this short. Implementation details and any before/after numbers are not recoverable — see `EXPERIENCE.md`. Don't let the website say more than you can defend in an interview.

---

### 7.12 Earlier work (grouped card)

- **`slug`:** earlier-work
- **`period`:** Dec 2014 – 2020
- **`featured`:** no

**`summary`:**
> 10+ cross-platform React Native apps and 15+ native Android apps across healthcare, fintech, and consumer verticals.

**`highlights`:**
- React Native: Good Luck (lottery game), Sama (crypto rate listings with graphical comparisons), ChoreRelief, Dripstate.
- Native Android: doctorderki (patient consultation), PT on Point (caregiver and physical therapist matching).

---

## 8. Experience timeline

**Maxxsol** — Lahore, Pakistan
*December 2014 – Present*
**Mobile Developer → Senior Mobile Engineer → Mobile Team Lead**

> Software agency. Every project above is a client or internal engagement under a single employer — overlapping dates reflect parallel engagements, not separate jobs. I lead mobile delivery while staying hands-on in code: architectural decisions, code review, and mobile standards across the team.

Timeline entries, if the site renders a vertical timeline:

| Period | Engagement | Role |
|---|---|---|
| Jan 2025 – Present | MaxKids: Coloring World | Senior Flutter Developer |
| Dec 2024 – Present | Metal Men | Flutter Developer |
| Dec 2023 – Apr 2025 | Drone Inspection Controller | Android Developer, DJI Specialist |
| Aug 2023 – May 2025 | MiMesa | Mobile Team Lead |
| Jun 2020 – Aug 2023 | AvoMD | Mobile Team Lead |
| Apr 2020 – Oct 2024 | PhraseShare | Mobile Team Lead |
| Dec 2014 – 2020 | 25+ apps across React Native and native Android | Mobile Developer → Senior Mobile Engineer |

---

## 9. Education

**BS, Computer Science & Engineering**
University of Central Punjab (UCP), Lahore
2010 – 2014 · CGPA 3.23

---

## 10. Contact section copy

**`contact_heading`:** Get in touch

**`contact_body`:**
> I'm open to senior and lead mobile roles at product companies, and to selective contract work. Drone, hardware, and health-tech products are where my experience is least replaceable.
>
> Email is the fastest route.

**`contact_links`:**
- Email — bilalhaidermakki@gmail.com
- LinkedIn — linkedin.com/in/bilal-haider-makki
- Phone — +92 342-4449161

**`footer_line`:** Built by Bilal Haider Makki · Lahore, Pakistan

---

## 11. Publishing checks

Two things need your decision before this goes live, and one rule to hold.

1. **Joulea / the drone project is under NDA.** Your resume names the client and the federal end-users, but a resume goes to one reader and a website goes to everyone including that client. Decide whether the site names Joulea, names only the end-users (Georgia Tech, Oak Ridge, DOE, New Mexico Tech), or describes the work with no names at all. I've written it as "Drone Inspection Controller (Joulea)" with the end-users named — change or strip both if you're not comfortable. Also: no screenshots, no architecture diagrams, no internal screens.

2. **Metal Men CI/CD scope is unconfirmed.** I wrote "automating Android and iOS build and release steps" — deliberately narrower than "automated deployment." If the pipeline actually handles iOS code signing and store submission, upgrade the line. If it's build and test only, narrow it further. This is still an open item in `EXPERIENCE.md`.

3. **Don't add anything from the gaps list.** GraphQL, Apollo, React Query, Sentry, Jetpack Compose, Room, Riverpod, Bloc, GetX, Terraform, Firestore Security Rules, Detox, Appium, Reanimated, Skia, Zustand, TanStack Query — none of these belong in the skills grid. The website is the thing an interviewer reads before asking you about it.
