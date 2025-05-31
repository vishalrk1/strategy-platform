import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { ClientInitializer } from "@/components/ClientInitializer";
import AuthInitializer from "@/components/AuthInitializer";
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
  title: "TradeBot Op - Trading Strategy App",
  description:
    "Advanced trading strategies with real-time market data and Fyers integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientInitializer />
        <AuthInitializer />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-20">{children}</main>
        </div>
      </body>
    </html>
  );
}
