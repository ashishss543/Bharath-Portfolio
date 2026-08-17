import type { Metadata } from "next";
import { Bebas_Neue, Oswald, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const oswald = Oswald({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Bharath — Creative Portfolio",
  description:
    "A cinematic creative portfolio. Frame by frame. Perspective in motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${oswald.variable} ${inter.variable}`}
    >
      <body className="antialiased bg-white text-neutral-900">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

