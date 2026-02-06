"use client";

import { useEffect, useState } from "react";
import { DatasetCard } from "@/components/DatasetCard";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { Dataset } from "@/types";
import { Search, Loader, Database, Upload, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export default function Home() {
  const { fetchDatasets, checkAccess } = useMarketplace();
  const wallet = useWallet();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userAccess, setUserAccess] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (wallet.isConnected && datasets.length > 0) {
      checkAccessForUser();
    }
  }, [wallet.address, datasets]);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const data = await fetchDatasets();
      setDatasets(data.filter((d) => d.active));
    } catch (error) {
      console.error("Failed to load datasets:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAccessForUser = async () => {
    if (!wallet.address) return;

    const accessSet = new Set<number>();
    for (const dataset of datasets) {
      const hasAccess = await checkAccess(dataset.id, wallet.address);
      if (hasAccess) {
        accessSet.add(dataset.id);
      }
    }
    setUserAccess(accessSet);
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      searchTerm === "" ||
      dataset.metadataURI.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All";
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="glass-card p-12 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-blue-600/20 to-indigo-600/20 animate-gradient-shift" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl glow-indigo">
              <Database className="text-white" size={32} />
            </div>
            <Sparkles className="text-indigo-400 animate-pulse" size={24} />
          </div>
          <h1 className="text-5xl font-black tracking-tight gradient-text-blue">
            Dataset Marketplace
          </h1>
          <p className="text-xl text-slate-300 font-medium mt-2">
            Discover, trade, and monetize datasets on the 0G blockchain
          </p>
        </div>
      </div>

      {/* CTA */}
      {wallet.isConnected && (
        <div className="glass-card p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 group-hover:from-indigo-600/20 group-hover:to-blue-600/20 transition-all duration-500" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to share your data?</h2>
            <Link
              href="/upload"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Upload size={18} />
              Upload Dataset Now
            </Link>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-4 text-indigo-400 group-hover:text-indigo-300 transition"
            size={22}
          />
          <input
            type="text"
            placeholder="Search datasets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dark w-full pl-12"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30"
                  : "glass-card-light text-slate-300 hover:text-white hover:border-indigo-500/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Datasets Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="relative w-20 h-20">
            <Loader className="animate-spin text-indigo-400" size={48} />
          </div>
          <p className="mt-4 text-lg text-slate-400 font-semibold">
            Loading datasets...
          </p>
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className="text-center py-16 glass-card border border-dashed border-indigo-500/30">
          <Database className="mx-auto text-indigo-400 mb-4" size={48} />
          <p className="text-2xl font-bold text-white">No datasets found</p>
          <p className="text-slate-400 mt-2 text-lg">
            {searchTerm || selectedCategory !== "All"
              ? "Try adjusting your search filters"
              : "Be the first to list a dataset!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              hasAccess={userAccess.has(dataset.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
