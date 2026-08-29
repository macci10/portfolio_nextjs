import type { Metadata, Viewport } from "next";
import { Backdrop } from "@/components/Backdrop";
import { SkipLink } from "@/components/SkipLink";
import { MotionProvider } from "@/components/MotionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { body, display, mono } from "./fonts";
import { SITE } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  // Every relative URL below — canonicals, OG images — resolves against this.
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.metaTitle,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.metaDescription,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.linkedin }],
  creator: SITE.name,
  keywords: [
    "React Native",
    "Flutter",
    "Android",
    "iOS",
    "Kotlin",
    "Swift",
    "mobile engineer",
    "mobile team lead",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: SITE.metaTitle,
    description: SITE.ogBlurb,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.metaTitle,
    description: SITE.ogBlurb,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  // ThemeToggle keeps this in step with the resolved theme at runtime.
  themeColor: "#0d1128",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // next-themes writes data-theme before paint; the mismatch warning it would
    // otherwise trigger is expected and suppressed.
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <ThemeProvider>
          <MotionProvider>
            <SkipLink />
            <Backdrop />
            {children}
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
