import type { Metadata, Viewport } from "next";
import { Backdrop } from "@/components/Backdrop";
import { SkipLink } from "@/components/SkipLink";
import { MotionProvider } from "@/components/MotionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { body, display, mono } from "./fonts";
import { SITE } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.metaTitle,
  description: SITE.metaDescription,
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
