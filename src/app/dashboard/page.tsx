"use client";

import { useState, useEffect } from "react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { Dataset } from "@/types";
import { formatPrice, formatTimestamp } from "@/lib/utils";
import { AlertCircle, TrendingUp, ShoppingCart, Wallet } from "lucide-react";
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
      // For now, we'll use placeholder calculations
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertCircle
          size={20}
          className="text-yellow-600 flex-shrink-0 mt-0.5"
        />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Connect Wallet</p>
          <p>Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">
          Manage your datasets and track your earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Earnings
              </p>
              <p className="text-3xl font-bold mt-2">
                {formatPrice(totalEarnings)} 0G
              </p>
            </div>
            <Wallet size={32} className="text-primary opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold mt-2">{totalSales}</p>
            </div>
            <ShoppingCart size={32} className="text-primary opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Listings
              </p>
              <p className="text-3xl font-bold mt-2">{datasets.length}</p>
            </div>
            <TrendingUp size={32} className="text-primary opacity-20" />
          </div>
        </div>
      </div>

      {/* Withdraw Section */}
      {totalEarnings > 0n && (
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">Pending Earnings</h2>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold">
              {formatPrice(totalEarnings)} 0G
            </p>
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="px-6 py-2 bg-white text-primary rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </div>
      )}

      {/* Datasets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg">Your Datasets</h3>
        </div>

        {pageLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : datasets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No datasets yet. Start by uploading one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Root Hash
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Listed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datasets.map((dataset) => (
                  <tr key={dataset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium">
                      #{dataset.id}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-600">
                      {dataset.rootHash.slice(0, 10)}...
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold">
                      {formatPrice(dataset.price)} 0G
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          dataset.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {dataset.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
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
