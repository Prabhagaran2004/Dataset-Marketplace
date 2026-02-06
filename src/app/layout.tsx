import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dataset Marketplace | 0G Chain",
  description: "Decentralized dataset marketplace powered by 0G Chain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0F0D] text-[#ECFDF5] bg-grid-pattern">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
