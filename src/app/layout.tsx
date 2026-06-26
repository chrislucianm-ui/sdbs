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

export const metadata: Metadata = {
  title: "St. D.B. Inter College & St. John Bosco School | Prayagraj",
  description:
    "Educational portal for St. D.B. Inter College & St. John Bosco School, Naini, Prayagraj. Shaping future leaders through academic and holistic excellence.",
  keywords: [
    "St. D.B. Inter College",
    "St. John Bosco School",
    "Naini school",
    "Prayagraj schools",
    "Best inter college Prayagraj",
    "Bosco school Naini",
    "Admissions 2026 Prayagraj",
  ],
  authors: [{ name: "School IT Cell" }],
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
