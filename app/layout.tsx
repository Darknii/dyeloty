import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppHeader from "./AppHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dyeloty.pl"),
  title: "Dyeloty — znajdź włóczkę z tej samej partii",
  description:
    "Serwis dla dziewiarek szukających włóczek po kolorze i numerze dye lotu.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Dyeloty — znajdź włóczkę z tej samej partii",
    description:
      "Serwis dla dziewiarek szukających włóczek po kolorze i numerze dye lotu.",
    url: "/",
    siteName: "Dyeloty",
    images: [
      {
        url: "/images/hero-yarn-bowl.png",
        alt: "Pastelowe włóczki w misce",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dyeloty — znajdź włóczkę z tej samej partii",
    description:
      "Serwis dla dziewiarek szukających włóczek po kolorze i numerze dye lotu.",
    images: ["/images/hero-yarn-bowl.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><AppHeader />{children}</body>
    </html>
  );
}
