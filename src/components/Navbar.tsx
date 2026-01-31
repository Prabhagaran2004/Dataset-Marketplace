"use client";

import { useWallet } from "@/hooks/useWallet";
import {
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Wallet,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";

export function WalletConnect() {
  const wallet = useWallet();
  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600 rounded-xl opacity-60 cursor-not-allowed flex items-center gap-2 whitespace-nowrap font-medium shadow-sm"
      >
        <span className="animate-pulse">⏳</span>
        Loading...
      </button>
    );
  }

  const handleConnect = async () => {
    try {
      setShowError(false);
      await wallet.connect();
    } catch (error) {
      setShowError(true);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={handleConnect}
          disabled={wallet.isLoading}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            {wallet.isLoading ? (
              <>
                <Zap size={18} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Connect Wallet
              </>
            )}
          </div>
        </button>
        {showError && wallet.error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2 rounded-lg border border-red-200 shadow-sm animate-shake">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{wallet.error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 px-5 py-3 rounded-xl border border-emerald-200 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <div className="flex items-center gap-2 animate-pulse">
        <CheckCircle
          size={20}
          className="text-emerald-500 group-hover:text-emerald-600 transition-colors"
        />
      </div>
      <div className="text-right min-w-fit">
        <p className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          {wallet.displayAddress}
        </p>
        <p className="text-xs font-semibold text-cyan-600">
          {wallet.balance && formatPrice(BigInt(wallet.balance))} 0G
        </p>
      </div>
      <button
        onClick={wallet.disconnect}
        className="p-2 text-gray-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 hover:text-red-600 rounded-lg transition-all duration-300 ml-2 hover:scale-110 hover:shadow-md group/btn"
        title="Disconnect Wallet"
      >
        <LogOut size={18} className="group-hover/btn:animate-bounce" />
      </button>
    </div>
  );
}

export function Navbar() {
  const wallet = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Browse", always: true },
    { href: "/upload", label: "Upload", protected: true },
    { href: "/my-datasets", label: "My Datasets", protected: true },
    { href: "/dashboard", label: "Dashboard", protected: true },
  ];

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg border-b-2 border-purple-200 shadow-2xl"
          : "bg-gradient-to-b from-slate-50 via-white to-white border-b-2 border-purple-100 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with Animation */}
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-2xl hover:opacity-80 transition-all duration-300 group"
          >
            <div className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl group-hover:shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <ShoppingCart className="text-white" size={28} />
            </div>
            <div>
              <span className="hidden sm:inline bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent font-black tracking-tight">
                Dataset
              </span>
              <div className="hidden sm:block text-xs font-bold text-transparent bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text tracking-widest">
                MARKETPLACE
              </div>
              <span className="sm:hidden text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {mounted &&
              navLinks.map((link, idx) => {
                const shouldShow = link.always || wallet.isConnected;
                if (!shouldShow) return null;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative text-gray-700 font-semibold text-lg hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text transition-all duration-300 group"
                  >
                    {link.label}
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500 rounded-full" />
                  </Link>
                );
              })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-300 hover:scale-110"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-purple-600" />
            ) : (
              <Menu size={24} className="text-purple-600" />
            )}
          </button>

          {/* Wallet Connect - Desktop */}
          <div className="hidden lg:block">
            <WalletConnect />
          </div>
        </div>

        {/* Mobile Menu */}
        {mounted && mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t-2 border-purple-200 pt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {navLinks.map((link) => {
              const shouldShow = link.always || wallet.isConnected;
              if (!shouldShow) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-transparent hover:bg-clip-text rounded-lg transition-all duration-300 group border-l-4 border-transparent hover:border-purple-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t-2 border-purple-200">
              <WalletConnect />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
