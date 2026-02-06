"use client";

import { useState, useEffect } from "react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { Dataset } from "@/types";
import { formatPrice, formatTimestamp } from "@/lib/utils";
import {
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Database,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const wallet = useWallet();
  const { fetchDatasets, withdrawEarnings, loading } = useMarketplace();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<bigint>(0n);
  const [totalSales, setTotalSales] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (wallet.isConnected) {
      loadDashboard();
    }
  }, [wallet.address, wallet.isConnected]);

  const loadDashboard = async () => {
    if (!wallet.address) return;

    setPageLoading(true);
    try {
      const allDatasets = await fetchDatasets();
      const userDatasets = allDatasets.filter(
        (d) => d.seller.toLowerCase() === wallet.address!.toLowerCase(),
      );

      setDatasets(userDatasets);

      // Calculate total sales and earnings
      let totalEarningsAmount = 0n;
      let totalSalesCount = 0;

      // In a real app, you'd fetch sales data from events or a backend
      totalEarningsAmount = userDatasets.reduce((sum, d) => sum + d.price, 0n);

      setTotalEarnings(totalEarningsAmount);
      setTotalSales(totalSalesCount);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const txHash = await withdrawEarnings();
      toast.success(`Withdrawal successful! TX: ${txHash.slice(0, 6)}...`);
      loadDashboard();
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed");
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="glass-card p-6 flex gap-3">
        <AlertCircle
          size={20}
          className="text-yellow-400 flex-shrink-0 mt-0.5"
        />
        <div className="text-sm">
          <p className="font-bold text-white">Connect Wallet</p>
          <p className="text-slate-400">
            Please connect your wallet to view your dashboard.
          </p>
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
            <LayoutDashboard className="text-white" size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Seller Dashboard</h1>
        <p className="text-slate-400">
          Manage your datasets and track your earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 group hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Total Earnings
              </p>
              <p className="text-3xl font-bold gradient-text-blue mt-2">
                {formatPrice(totalEarnings)} 0G
              </p>
            </div>
            <div className="p-3 bg-indigo-600/20 rounded-xl group-hover:bg-indigo-600/40 transition-all">
              <Wallet size={28} className="text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 group hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-white mt-2">{totalSales}</p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-xl group-hover:bg-blue-600/40 transition-all">
              <ShoppingCart size={28} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 group hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Active Listings
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {datasets.length}
              </p>
            </div>
            <div className="p-3 bg-emerald-600/20 rounded-xl group-hover:bg-emerald-600/40 transition-all">
              <TrendingUp size={28} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Section */}
      {totalEarnings > 0n && (
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-blue-600/10 to-indigo-600/20" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-3">
              Pending Earnings
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold gradient-text-blue">
                {formatPrice(totalEarnings)} 0G
              </p>
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datasets Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-indigo-500/20 flex items-center gap-3">
          <Database size={20} className="text-indigo-400" />
          <h3 className="font-bold text-lg text-white">Your Datasets</h3>
        </div>

        {pageLoading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : datasets.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="mx-auto text-slate-500 mb-4" size={48} />
            <p className="text-slate-400">
              No datasets yet. Start by uploading one!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Root Hash
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Listed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/10">
                {datasets.map((dataset) => (
                  <tr
                    key={dataset.id}
                    className="hover:bg-indigo-500/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      #{dataset.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">
                      {dataset.rootHash.slice(0, 10)}...
                    </td>
                    <td className="px-6 py-4 text-sm font-bold gradient-text-blue">
                      {formatPrice(dataset.price)} 0G
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          dataset.active
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {dataset.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatTimestamp(dataset.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
