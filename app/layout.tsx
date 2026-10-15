import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SKY_INIT_SCRIPT } from "@/lib/sky-init-script";
import { SkyProvider } from "@/components/sky/SkyProvider";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
} from "@/lib/site";
import "./globals.css";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  weight: ["500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Joseph Gitau",
    SITE_NAME,
    "software engineer",
    "Rust",
    "Go",
    "TypeScript",
    "Python",
    "C#",
    "AI SRE",
    "Nairobi",
  ],
  authors: [{ name: SITE_NAME, url: "https://github.com/mfalme0" }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before first paint. Computes the visitor's sky from real solar
          maths and writes it as CSS custom properties, so there is no flash
          of a wrong-colour hero and no hydration mismatch.
        */}
        <script
          id="sky-init"
          dangerouslySetInnerHTML={{ __html: SKY_INIT_SCRIPT }}
        />
      </head>
      <body>
        <a href="#main" className="sr-only-focusable">
          Skip to content
        </a>
        <SkyProvider>{children}</SkyProvider>
        <Analytics />
      </body>
    </html>
  );
}