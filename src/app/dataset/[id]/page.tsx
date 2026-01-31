"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { Dataset, DatasetMetadata } from "@/types";
import {
  formatPrice,
  formatFileSize,
  formatTimestamp,
  formatAddress,
} from "@/lib/utils";
import {
  Download,
  ExternalLink,
  AlertCircle,
  Loader,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CURRENT_NETWORK } from "@/lib/constants";

export default function DatasetDetailPage() {
  const params = useParams();
  const datasetId = parseInt(params.id as string);

  const wallet = useWallet();
  const { getDataset, purchaseDataset, checkAccess, loading } =
    useMarketplace();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadDataset();
  }, [datasetId]);

  useEffect(() => {
    if (dataset && wallet.address) {
      checkUserAccess();
    }
  }, [dataset, wallet.address]);

  const loadDataset = async () => {
    setPageLoading(true);
    try {
      const data = await getDataset(datasetId);
      setDataset(data);

      // In a real app, fetch metadata from metadataURI
      // For now, use placeholder
      setMetadata({
        title: `Dataset #${datasetId}`,
        description:
          "A high-quality dataset for machine learning and analytics",
        category: "AI/ML",
        fileSize: 1024 * 1024 * 100, // 100MB
        format: "csv",
        tags: ["machine-learning", "analytics"],
        uploadDate: Date.now() / 1000,
      });
    } catch (error) {
      console.error("Failed to load dataset:", error);
      toast.error("Failed to load dataset");
    } finally {
      setPageLoading(false);
    }
  };

  const checkUserAccess = async () => {
    if (!wallet.address || !dataset) return;

    try {
      const access = await checkAccess(datasetId, wallet.address);
      setHasAccess(access);
    } catch (error) {
      console.error("Failed to check access:", error);
    }
  };

  const handlePurchase = async () => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!dataset) return;

    setPurchasing(true);
    try {
      await purchaseDataset(datasetId, formatPrice(dataset.price));
      toast.success("Purchase successful!");
      setHasAccess(true);
    } catch (error: any) {
      toast.error(error.message || "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={32} className="mx-auto text-red-500 mb-4" />
        <p className="text-xl text-gray-600">Dataset not found</p>
        <Link
          href="/"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  const isOwner =
    wallet.address &&
    dataset.seller.toLowerCase() === wallet.address.toLowerCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{metadata?.title}</h1>
            <p className="text-gray-600 mb-4">{metadata?.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Seller</span>
                <Link
                  href={`${CURRENT_NETWORK.blockExplorer}/address/${dataset.seller}`}
                  target="_blank"
                  className="font-mono text-primary hover:underline flex items-center gap-1"
                >
                  {formatAddress(dataset.seller)}
                  <ExternalLink size={14} />
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{metadata?.category}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">File Size</span>
                <span className="font-medium">
                  {formatFileSize(metadata?.fileSize || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Format</span>
                <span className="font-medium uppercase">
                  {metadata?.format}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Listed</span>
                <span className="font-medium">
                  {formatTimestamp(dataset.timestamp)}
                </span>
              </div>
            </div>

            {/* Tags */}
            {metadata?.tags && metadata.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Card */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-fit">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-3xl font-bold">
                  {formatPrice(dataset.price)} 0G
                </p>
              </div>

              {isOwner ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle
                    size={20}
                    className="text-blue-600 flex-shrink-0"
                  />
                  <p className="text-sm text-blue-800">This is your dataset</p>
                </div>
              ) : hasAccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle
                    size={20}
                    className="text-green-600 flex-shrink-0"
                  />
                  <p className="text-sm text-green-800">
                    You have access to this dataset
                  </p>
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || loading}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {purchasing ? "Processing..." : "Purchase Access"}
                </button>
              )}

              {hasAccess && !isOwner && (
                <button className="w-full px-4 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-opacity-90 flex items-center justify-center gap-2">
                  <Download size={20} />
                  Download Dataset
                </button>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                DATASET ID
              </p>
              <p className="font-mono text-sm text-gray-700 break-all">
                #{dataset.id}
              </p>

              <p className="text-xs text-gray-500 mb-2 font-medium mt-4">
                ROOT HASH
              </p>
              <p className="font-mono text-sm text-gray-700 break-all">
                {dataset.rootHash.slice(0, 16)}...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      {!dataset.active && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle
            size={20}
            className="text-yellow-600 flex-shrink-0 mt-0.5"
          />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Dataset Inactive</p>
            <p>This dataset is not currently available for purchase.</p>
          </div>
        </div>
      )}
    </div>
  );
}
