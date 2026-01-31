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
      <body className="bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 min-h-screen relative">
        {/* Animated Background Gradient */}
        <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: "2s" }}></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: "4s" }}></div>
        </div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">{children}</main>
      </body>
    </html>
  );
}
