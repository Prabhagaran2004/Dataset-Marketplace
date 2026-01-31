"use client";

import { useWallet } from "@/hooks/useWallet";
import { ShoppingCart, LogOut } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export function WalletConnect() {
  const wallet = useWallet();

  if (!wallet.isConnected) {
    return (
      <button
        onClick={wallet.connect}
        disabled={wallet.isLoading}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
      >
        {wallet.isLoading ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm text-gray-600">{wallet.displayAddress}</p>
        <p className="text-xs text-gray-500">
          {wallet.balance && formatPrice(BigInt(wallet.balance))} 0G
        </p>
      </div>
      <button
        onClick={wallet.disconnect}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        title="Disconnect"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}

export function Navbar() {
  const wallet = useWallet();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <ShoppingCart className="text-primary" size={28} />
            <span>Dataset Marketplace</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary transition"
            >
              Browse
            </Link>
            {wallet.isConnected && (
              <>
                <Link
                  href="/upload"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Upload
                </Link>
                <Link
                  href="/my-datasets"
                  className="text-gray-600 hover:text-primary transition"
                >
                  My Datasets
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
