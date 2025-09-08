import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipNavigation from "@/components/SkipNavigation";
import { createMetadata, createWebsiteSchema, createPersonSchema } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = createMetadata(
  "Petr Kindlmann | QA-Minded Developer",
  "QA automation engineer and full-stack developer building fast, beautiful, and reliable web applications with AI. Specializing in Playwright, TypeScript, React, and test automation."
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="theme-color" content="#0284c7" />
        <meta name="color-scheme" content="light" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              createWebsiteSchema(),
              createPersonSchema()
            ])
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased font-sans`} suppressHydrationWarning={true}>
        <SkipNavigation
          links={[
            { href: "#main-content", label: "Skip to main content" },
            { href: "#navigation", label: "Skip to navigation" },
            { href: "#footer", label: "Skip to footer" }
          ]}
        />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
