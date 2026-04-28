import type { Metadata } from "next";
import { Outfit, Instrument_Serif } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Queen's Corn | Premium Popcorn & Experiences",
  description: "Handcrafted gourmet popcorn for the royalty in you. Experience the finest flavors at The Queen's Corn.",
  icons: {
    icon: "/favicon.webp",
    apple: "/favicon.webp",
  },
  openGraph: {
    title: "The Queen's Corn | Premium Popcorn & Experiences",
    description: "Arizona's favorite handcrafted kettle corn. Pure ingredients, hand-stirred excellence.",
    url: "https://the-queens-corn.vercel.app",
    siteName: "The Queen's Corn",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Queen's Corn - Premium Handcrafted Popcorn",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="grain-overlay"></div>
        <Navbar />
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
