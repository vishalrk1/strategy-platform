import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientInitializer } from "@/components/ClientInitializer";
import AuthInitializer from "@/components/AuthInitializer";
import "./globals.css";
import clsx from "clsx";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pro Algo Trader - Trading Strategy App",
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
        className={clsx(inter.className)}
      >
        <ClientInitializer />
        <AuthInitializer />
        <div className="mx-auto min-h-screen overflow-x-hidden md:overflow-x-visible">
          <Navbar />
          <main className="flex-1 pt-20">{children}</main>
        </div>
      </body>
    </html>
  );
}
