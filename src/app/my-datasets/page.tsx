"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { Dataset } from "@/types";
import { DatasetCard } from "@/components/DatasetCard";
import { Loader, AlertCircle, Database, ShoppingBag, Upload } from "lucide-react";

export default function MyDatasetsPage() {
  const wallet = useWallet();
  const { fetchDatasets, checkAccess } = useMarketplace();

  const [purchased, setPurchased] = useState<Dataset[]>([]);
  const [uploaded, setUploaded] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"purchased" | "uploaded">(
    "purchased",
  );

  useEffect(() => {
    if (wallet.isConnected) {
      loadDatasets();
    }
  }, [wallet.address, wallet.isConnected]);

  const loadDatasets = async () => {
    if (!wallet.address) return;

    setLoading(true);
    try {
      const allDatasets = await fetchDatasets();

      // Filter purchased datasets
      const purchasedList: Dataset[] = [];
      for (const dataset of allDatasets) {
        const hasAccess = await checkAccess(dataset.id, wallet.address);
        if (
          hasAccess &&
          dataset.seller.toLowerCase() !== wallet.address.toLowerCase()
        ) {
          purchasedList.push(dataset);
        }
      }

      // Filter uploaded datasets
      const uploadedList = allDatasets.filter(
        (d) => d.seller.toLowerCase() === wallet.address!.toLowerCase(),
      );

      setPurchased(purchasedList);
      setUploaded(uploadedList);
    } catch (error) {
      console.error("Failed to load datasets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="glass-card p-6 flex gap-3">
        <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-white">Connect Wallet</p>
          <p className="text-slate-400">Please connect your wallet to view your datasets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl glow-indigo">
            <Database className="text-white" size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">My Datasets</h1>
        <p className="text-slate-400">
          Manage your dataset purchases and listings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-indigo-500/20">
        <button
          onClick={() => setActiveTab("purchased")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "purchased"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <ShoppingBag size={18} />
          Purchased ({purchased.length})
        </button>
        <button
          onClick={() => setActiveTab("uploaded")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "uploaded"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Upload size={18} />
          Uploaded ({uploaded.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-indigo-400" size={32} />
        </div>
      ) : activeTab === "purchased" ? (
        <div>
          {purchased.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <ShoppingBag className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="text-slate-400">No purchased datasets yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchased.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  hasAccess={true}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {uploaded.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <Upload className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="text-slate-400">No uploaded datasets yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploaded.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
