import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rupomoti - Exquisite Pearl Jewelry",
  description: "Discover our collection of beautiful pearl jewelry pieces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <Providers>
          {/* Only render RootLayoutClient for non-admin routes */}
          {!children?.toString().includes('/admin') ? (
            <RootLayoutClient>{children}</RootLayoutClient>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
