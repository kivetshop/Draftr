import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Dots } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zenDots = Zen_Dots({
  variable: "--font-zen-dots",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Draftr — Ship your MVP in days, not months",
  description:
    "The all-in-one developer workspace designed to turn raw product ideas into production-ready software. Join the early waitlist for 40% off at launch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${zenDots.variable} h-full antialiased`}
    >
      <head>
        {/*
          Satoshi — loaded from Fontshare CDN.
          This is the correct place to load external fonts in Next.js App Router.
          Fontshare is free and reliable: https://www.fontshare.com/fonts/satoshi
        */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,600,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f5f5f5]">
        {children}
      </body>
    </html>
  );
}
