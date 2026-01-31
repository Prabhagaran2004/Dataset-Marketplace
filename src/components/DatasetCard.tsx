"use client";

import { Dataset, DatasetMetadata } from "@/types";
import { formatPrice, formatFileSize, formatTimestamp } from "@/lib/utils";
import Link from "next/link";
import { Download } from "lucide-react";

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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-lg line-clamp-1">
            {metadata?.title || `Dataset #${dataset.id}`}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {metadata?.category || "Uncategorized"}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {metadata?.description || "No description"}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatFileSize(fileSize)}</span>
            <span>{metadata?.format || "Unknown"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="font-semibold text-lg">
                {formatPrice(dataset.price)} 0G
              </p>
            </div>
            {hasAccess && <Download size={20} className="text-primary" />}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Listed {formatTimestamp(dataset.timestamp)}
          </p>
        </div>
      </div>
    </Link>
  );
}
