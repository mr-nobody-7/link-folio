import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "LinkFolio - Beautiful Link-in-Bio",
  description:
    "Build your own beautiful link-in-bio site in seconds. No code. Just you.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  authors: [{ name: "LinkFolio" }],
  openGraph: {
    title: "LinkFolio - Beautiful Link-in-Bio",
    description:
      "Build your own beautiful link-in-bio site in seconds. No code. Just you.",
    type: "website",
    siteName: 'LinkFolio',
    images: ['/og-default.png'],
  },
  twitter: {
    card: "summary_large_image",
    site: '@linkfolio',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning={true}
      data-lt-installed="true"
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}
