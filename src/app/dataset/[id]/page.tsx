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
  Database,
  User,
  Tag,
  FileText,
  Calendar,
  Hash,
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
        <Loader className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-12 glass-card">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <p className="text-xl text-white font-bold">Dataset not found</p>
        <Link
          href="/"
          className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block font-medium"
        >
          ← Back to marketplace
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
      <div className="glass-card p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl glow-indigo">
                <Database className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {metadata?.title}
            </h1>
            <p className="text-slate-400 mb-6">{metadata?.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-indigo-500/20">
                <span className="text-slate-400 flex items-center gap-2">
                  <User size={16} className="text-indigo-400" />
                  Seller
                </span>
                <Link
                  href={`${CURRENT_NETWORK.blockExplorer}/address/${dataset.seller}`}
                  target="_blank"
                  className="font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {formatAddress(dataset.seller)}
                  <ExternalLink size={14} />
                </Link>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-indigo-500/20">
                <span className="text-slate-400 flex items-center gap-2">
                  <Tag size={16} className="text-indigo-400" />
                  Category
                </span>
                <span className="font-medium text-white">
                  {metadata?.category}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-indigo-500/20">
                <span className="text-slate-400 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  File Size
                </span>
                <span className="font-medium text-white">
                  {formatFileSize(metadata?.fileSize || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-indigo-500/20">
                <span className="text-slate-400 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  Format
                </span>
                <span className="font-medium text-white uppercase">
                  {metadata?.format}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-indigo-500/20">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-400" />
                  Listed
                </span>
                <span className="font-medium text-white">
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
                    className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Card */}
          <div className="glass-card-light p-6 h-fit">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Price</p>
                <p className="text-3xl font-bold gradient-text-blue">
                  {formatPrice(dataset.price)} 0G
                </p>
              </div>

              {isOwner ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle
                    size={20}
                    className="text-blue-400 flex-shrink-0"
                  />
                  <p className="text-sm text-blue-300">This is your dataset</p>
                </div>
              ) : hasAccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle
                    size={20}
                    className="text-emerald-400 flex-shrink-0"
                  />
                  <p className="text-sm text-emerald-300">
                    You have access to this dataset
                  </p>
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {purchasing ? "Processing..." : "Purchase Access"}
                </button>
              )}

              {hasAccess && !isOwner && (
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Download size={20} />
                  Download Dataset
                </button>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-indigo-500/20">
              <p className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1">
                <Hash size={12} />
                DATASET ID
              </p>
              <p className="font-mono text-sm text-slate-300 break-all">
                #{dataset.id}
              </p>

              <p className="text-xs text-slate-500 mb-2 font-medium mt-4 flex items-center gap-1">
                <Hash size={12} />
                ROOT HASH
              </p>
              <p className="font-mono text-sm text-slate-300 break-all">
                {dataset.rootHash.slice(0, 16)}...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      {!dataset.active && (
        <div className="glass-card p-4 flex gap-3 border-l-4 border-yellow-500">
          <AlertCircle
            size={20}
            className="text-yellow-400 flex-shrink-0 mt-0.5"
          />
          <div className="text-sm">
            <p className="font-bold text-white">Dataset Inactive</p>
            <p className="text-slate-400">
              This dataset is not currently available for purchase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
