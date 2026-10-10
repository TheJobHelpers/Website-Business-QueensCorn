import type { Metadata } from "next";
import { Outfit, Instrument_Serif } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://the-queens-corn.vercel.app"),
  title: "The Queen's Corn | Hand-Popped Kettle Corn in Arizona",
  description: "Hand-popped kettle corn from Arizona's farmers' markets. Order online for free market pickup or Arizona shipping, or raise 50% for your school.",
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
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CartProvider>
          <div className="grain-overlay"></div>
          <Navbar />
          <CartDrawer />
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
