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
  authors: [{ name: "LinkFolio" }],
  openGraph: {
    title: "LinkFolio - Beautiful Link-in-Bio",
    description:
      "Build your own beautiful link-in-bio site in seconds. No code. Just you.",
    type: "website",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lovable_dev",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
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
