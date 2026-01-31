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
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">Dataset Marketplace</h1>
        <p className="text-xl text-gray-600">
          Discover and trade datasets on the 0G blockchain
        </p>
      </div>

      {/* CTA */}
      {wallet.isConnected && (
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-3">Ready to share your data?</h2>
          <Link
            href="/upload"
            className="inline-block px-6 py-2 bg-white text-primary rounded-lg font-medium hover:bg-opacity-90"
          >
            Upload Dataset
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Datasets Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-primary" size={32} />
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No datasets found</p>
          <p className="text-sm text-gray-400 mt-2">
            Be the first to list a dataset!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
