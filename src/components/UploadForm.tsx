"use client";

import { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { useZgStorage } from "@/hooks/useZgStorage";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";
import { CATEGORIES } from "@/lib/constants";
import { sanitizeInput, validatePrice, validateFileSize } from "@/lib/utils";
import toast from "react-hot-toast";

interface UploadFormProps {
  onSuccess?: (datasetId: number) => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const wallet = useWallet();
  const { uploadDataset, uploading, progress } = useZgStorage();
  const { listDataset, loading: listing } = useMarketplace();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    price: "",
    tags: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizeInput(value),
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!file) {
      toast.error("Please select a dataset file");
      return;
    }

    const fileSizeValidation = validateFileSize(file.size);
    if (!fileSizeValidation.valid) {
      toast.error(fileSizeValidation.error!);
      return;
    }

    const priceValidation = validatePrice(formData.price);
    if (!priceValidation.valid) {
      toast.error(priceValidation.error!);
      return;
    }

    setSubmitting(true);
    try {
      // Upload dataset to 0G Storage
      toast.loading("Uploading dataset to 0G Storage...");
      const uploadResult = await uploadDataset(file, (progress) => {
        console.log("Upload progress:", progress);
      });

      // Create metadata
      // const metadata = {
      //   title: formData.title,
      //   description: formData.description,
      //   category: formData.category,
      //   fileSize: file.size,
      //   format: file.name.split('.').pop() || 'unknown',
      //   tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      //   uploadDate: Math.floor(Date.now() / 1000),
      //   ...(previewFile && { previewRootHash: 'placeholder' }),
      // };

      // Create metadata JSON and upload it (in real app, upload this too)
      const metadataURI = `ipfs://placeholder-metadata-${Date.now()}`;

      // List dataset on marketplace
      toast.loading("Listing dataset on marketplace...");
      const { datasetId } = await listDataset(
        uploadResult.rootHash,
        formData.price,
        metadataURI,
      );

      toast.success("Dataset listed successfully!");
      onSuccess?.(datasetId);

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "Other",
        price: "",
        tags: "",
      });
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload dataset");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = uploading || listing || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* File Upload */}
      <div className="space-y-3">
        <label className="block font-bold text-lg text-gray-800">
          📁 Dataset File *
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            dragActive
              ? "border-purple-500 bg-purple-50 scale-105"
              : "border-purple-300 bg-purple-50/50 hover:bg-purple-50"
          }`}
        >
          <Upload
            className={`mx-auto mb-3 transition-colors ${dragActive ? "text-purple-600" : "text-purple-400"}`}
            size={40}
          />
          <p className="font-bold text-gray-800 mb-1 text-lg">
            Drag and drop your file here
          </p>
          <p className="text-sm text-gray-600 mb-4">or click to browse</p>
          <label className="inline-block">
            <span className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg cursor-pointer hover:from-purple-600 hover:to-pink-600 font-semibold transition-all hover:shadow-lg">
              Browse Files
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
              accept="*/*"
            />
          </label>
          {file && (
            <p className="text-sm text-purple-700 mt-4 font-semibold">
              ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <label
          htmlFor="title"
          className="block font-bold text-lg text-gray-800"
        >
          📝 Dataset Title *
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          placeholder="e.g., Customer Demographics Dataset"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-medium transition-all hover:border-purple-300"
        />
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label
          htmlFor="description"
          className="block font-bold text-lg text-gray-800"
        >
          📄 Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          placeholder="Describe your dataset in detail. Include what data it contains, size, format, and any other relevant information..."
          rows={5}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-medium transition-all hover:border-purple-300"
        />
      </div>

      {/* Category */}
      <div className="space-y-3">
        <label
          htmlFor="category"
          className="block font-bold text-lg text-gray-800"
        >
          🏷️ Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-medium transition-all hover:border-purple-300 bg-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <label
          htmlFor="price"
          className="block font-bold text-lg text-gray-800"
        >
          💰 Price (0G tokens) *
        </label>
        <div className="relative">
          <input
            id="price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-medium transition-all hover:border-purple-300 pr-12"
          />
          <span className="absolute right-4 top-3 text-gray-600 font-bold">
            0G
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label htmlFor="tags" className="block font-bold text-lg text-gray-800">
          🏷️ Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="e.g., customer-data, analytics, 2024"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-medium transition-all hover:border-purple-300"
        />
      </div>

      {/* Platform Fee Info */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3 shadow-md">
        <AlertCircle
          size={24}
          className="text-blue-600 flex-shrink-0 mt-0.5 font-bold"
        />
        <div className="text-sm">
          <p className="font-bold text-blue-900">⚠️ Platform Fee</p>
          <p className="text-blue-800">
            A 2.5% platform fee will be deducted from each sale.
          </p>
        </div>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="space-y-3 bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-purple-900">
              {progress.message}
            </span>
            <span className="font-bold text-purple-600">
              {progress.progress}%
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !file || !formData.title || !formData.price}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:scale-105 active:scale-95"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Processing...
          </span>
        ) : (
          "🚀 List Dataset"
        )}
      </button>
    </form>
  );
}
