"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { Dataset } from "@/types";
import { DatasetCard } from "@/components/DatasetCard";
import { Loader, AlertCircle } from "lucide-react";

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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertCircle
          size={20}
          className="text-yellow-600 flex-shrink-0 mt-0.5"
        />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Connect Wallet</p>
          <p>Please connect your wallet to view your datasets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Datasets</h1>
        <p className="text-gray-600">
          Manage your dataset purchases and listings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("purchased")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "purchased"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Purchased ({purchased.length})
        </button>
        <button
          onClick={() => setActiveTab("uploaded")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "uploaded"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Uploaded ({uploaded.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-primary" size={32} />
        </div>
      ) : activeTab === "purchased" ? (
        <div>
          {purchased.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No purchased datasets yet
            </p>
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
            <p className="text-center text-gray-500 py-8">
              No uploaded datasets yet
            </p>
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
