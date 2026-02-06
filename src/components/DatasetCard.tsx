"use client";

import { Dataset, DatasetMetadata } from "@/types";
import { formatPrice, formatFileSize, formatTimestamp } from "@/lib/utils";
import Link from "next/link";
import { Download, Database, Tag, Clock, FileText } from "lucide-react";

interface DatasetCardProps {
  dataset: Dataset;
  metadata?: DatasetMetadata;
  hasAccess?: boolean;
}

export function DatasetCard({
  dataset,
  metadata,
  hasAccess,
}: DatasetCardProps) {
  const fileSize = metadata?.fileSize || 0;

  return (
    <Link href={`/dataset/${dataset.id}`}>
      <div className="glass-card overflow-hidden hover-lift group cursor-pointer">
        {/* Header */}
        <div className="p-5 border-b border-indigo-500/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:gradient-text-blue transition-all duration-300">
                {metadata?.title || `Dataset #${dataset.id}`}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Tag size={14} className="text-indigo-400" />
                <span className="text-sm text-indigo-300 font-medium">
                  {metadata?.category || "Uncategorized"}
                </span>
              </div>
            </div>
            <div className="p-2 bg-indigo-600/20 rounded-lg group-hover:bg-indigo-600/40 transition-all duration-300">
              <Database size={20} className="text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-400 line-clamp-2">
            {metadata?.description || "No description available"}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <FileText size={12} />
              <span>{formatFileSize(fileSize)}</span>
            </div>
            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-medium">
              {metadata?.format || "Unknown"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-900/50 border-t border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Price</p>
              <p className="font-bold text-xl gradient-text-blue">
                {formatPrice(dataset.price)} 0G
              </p>
            </div>
            {hasAccess && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <Download size={16} className="text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">Owned</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 mt-3">
            <Clock size={12} />
            <span>Listed {formatTimestamp(dataset.timestamp)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
