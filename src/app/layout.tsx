import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaunchCommerce — Multi-Tenant E-Commerce Builder SaaS",
  description:
    "Launch and scale your branded online storefront in seconds. Complete with custom themes, inventory, order processing, and payment gateways.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
