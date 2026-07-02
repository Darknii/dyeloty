import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Dyeloty — znajdź włóczkę z tej samej partii",
  description:
    "Serwis dla dziewiarek szukających włóczek po kolorze i numerze dye lotu.",
  openGraph: {
    title: "Dyeloty — znajdź włóczkę z tej samej partii",
    description:
      "Serwis dla dziewiarek szukających włóczek po kolorze i numerze dye lotu.",
    siteName: "Dyeloty",
    locale: "pl_PL",
    type: "website",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
