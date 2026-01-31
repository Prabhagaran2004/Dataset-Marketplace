"use client";

import { useEffect, useState } from "react";
import { DatasetCard } from "@/components/DatasetCard";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { Dataset } from "@/types";
import { Search, Loader } from "lucide-react";
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl p-12 text-white space-y-3 shadow-2xl">
        <h1 className="text-5xl font-black tracking-tight">
          Dataset Marketplace
        </h1>
        <p className="text-xl text-white/90 font-semibold">
          Discover, trade, and monetize datasets on the 0G blockchain
        </p>
      </div>

      {/* CTA */}
      {wallet.isConnected && (
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
          <h2 className="text-2xl font-bold mb-4">Ready to share your data?</h2>
          <Link
            href="/upload"
            className="inline-block px-8 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
          >
            📤 Upload Dataset Now
          </Link>
        </div>
      )}

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-4 text-purple-400 group-hover:text-purple-600 transition"
            size={22}
          />
          <input
            type="text"
            placeholder="Search datasets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-md hover:shadow-lg transition"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-300 shadow-sm hover:shadow-md ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-500 hover:text-purple-600"
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
            <Loader className="animate-spin text-purple-500" size={48} />
          </div>
          <p className="mt-4 text-lg text-gray-600 font-semibold">
            Loading datasets...
          </p>
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-200">
          <p className="text-2xl font-bold text-gray-700">No datasets found</p>
          <p className="text-gray-600 mt-2 text-lg">
            {searchTerm || selectedCategory !== "All"
              ? "Try adjusting your search filters"
              : "Be the first to list a dataset!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInScale">
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
