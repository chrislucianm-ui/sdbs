import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import * as db from "@/lib/db";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0b1329",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://stdbintercollege.org"),
  title: {
    default: "St. D.B. Inter College & St. John Bosco School | Prayagraj",
    template: "%s | St. D.B. Inter College & St. John Bosco School"
  },
  description:
    "Official portal for St. D.B. Inter College & St. John Bosco School, Naini, Prayagraj. Recognized as the Best School in Prayagraj offering quality education. Admissions 2026 open now for CBSE School Prayagraj and UP Board streams. Best School in Naini.",
  keywords: [
    "St. John Bosco School",
    "St. D.B. Inter College",
    "CBSE School Prayagraj",
    "Best School in Prayagraj",
    "School in Naini",
    "Admissions 2026",
    "Best School in Naini Prayagraj",
    "Naini Prayagraj Uttar Pradesh India",
    "Bosco school Naini",
    "Co-educational school Prayagraj"
  ],
  authors: [{ name: "School IT Cell" }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.jpg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://stdbintercollege.org",
    title: "St. D.B. Inter College & St. John Bosco School | Prayagraj",
    description: "Official portal for St. D.B. Inter College & St. John Bosco School, Naini, Prayagraj. Best School in Prayagraj offering CBSE School Prayagraj & UP Board streams. Admissions 2026 open now.",
    siteName: "St. D.B. Inter College",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "St. D.B. Inter College Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "St. D.B. Inter College & St. John Bosco School | Prayagraj",
    description: "Shaping future leaders through academic and holistic excellence at Naini, Prayagraj. CBSE School Prayagraj & UP Board streams. Admissions 2026 Open.",
    images: ["/logo.jpg"],
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await db.getSettings();
  const favicon = settings.faviconUrl || "/favicon.ico";

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="shortcut icon" href={favicon} />
      </head>
      <body
        className={`${outfit.variable} ${playfair.variable} font-sans min-h-full bg-white text-navy-900 selection:bg-gold-500 selection:text-navy-950 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
