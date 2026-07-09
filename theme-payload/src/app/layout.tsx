import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/**
 * Mathematical Glass Intelligence (Brand Bible v1.2) type system.
 *
 *   Space Grotesk → --font-space-grotesk  (Display: page/section headings)
 *   Inter         → --font-inter          (Primary: all UI + body text)
 *   IBM Plex Mono → --font-mono           (technical labels, code, IDs, KPIs)
 *
 * globals.css composes --font-sans from --font-inter and --font-display from
 * --font-space-grotesk. Pretendard (Korean) loads from CDN in globals.css and
 * sits in the fallback stacks; Space Grotesk is Latin-only, so Korean glyphs in
 * a Display heading fall back to Pretendard automatically (Brand Bible §4.1).
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "itriX — Internal Operations",
  description:
    "Internal operations dashboard for the itriX AI Sales Engine — leads, pipeline, NDAs, evaluations, PoCs, and reporting.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
