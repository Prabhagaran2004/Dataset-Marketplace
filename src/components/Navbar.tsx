"use client";

import { useWallet } from "@/hooks/useWallet";
import {
  Database,
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button disabled className="btn-secondary opacity-60 cursor-not-allowed flex items-center gap-2">
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
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          {wallet.isLoading ? (
            <>
              <Zap size={18} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={18} />
              Connect Wallet
            </>
          )}
        </button>
        {showError && wallet.error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{wallet.error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 glass-card-light px-4 py-2">
      <CheckCircle size={18} className="text-emerald-400" />
      <div className="text-right min-w-fit">
        <p className="text-sm font-bold text-white">{wallet.displayAddress}</p>
        <p className="text-xs text-indigo-300">
          {wallet.balance && formatPrice(BigInt(wallet.balance))} 0G
        </p>
      </div>
      <button
        onClick={wallet.disconnect}
        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
        title="Disconnect Wallet"
      >
        <LogOut size={18} />
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
          ? "glass-card border-b border-indigo-500/20 shadow-lg shadow-indigo-500/10"
          : "bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-2xl hover:opacity-80 transition-all duration-300 group"
          >
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105">
              <Database className="text-white" size={26} />
            </div>
            <div>
              <span className="hidden sm:block gradient-text-blue font-black text-xl tracking-tight">
                Dataset Marketplace
              </span>
              <span className="sm:hidden gradient-text-blue font-black">DM</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {mounted &&
              navLinks.map((link) => {
                const shouldShow = link.always || wallet.isConnected;
                if (!shouldShow) return null;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative text-slate-300 font-semibold hover:text-white transition-all duration-300 group py-2"
                  >
                    {link.label}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full" />
                  </Link>
                );
              })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Wallet Connect - Desktop */}
          <div className="hidden lg:block">
            <WalletConnect />
          </div>
        </div>

        {/* Mobile Menu */}
        {mounted && mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-700 pt-4 space-y-2 animate-fade-in-up">
            {navLinks.map((link) => {
              const shouldShow = link.always || wallet.isConnected;
              if (!shouldShow) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-slate-300 font-semibold hover:text-white hover:bg-indigo-500/20 rounded-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-700">
              <WalletConnect />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
