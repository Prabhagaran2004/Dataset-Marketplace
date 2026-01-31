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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <label className="block font-medium">Dataset File</label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            dragActive
              ? "border-primary bg-primary bg-opacity-5"
              : "border-gray-300"
          }`}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="font-medium mb-1">Drag and drop your file here</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="inline-block">
            <span className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-opacity-90">
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
          {file && <p className="text-sm text-primary mt-3">✓ {file.name}</p>}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium">
          Dataset Title *
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block font-medium">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          placeholder="Describe your dataset..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label htmlFor="category" className="block font-medium">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label htmlFor="price" className="block font-medium">
          Price (0G tokens) *
        </label>
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor="tags" className="block font-medium">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="e.g., customer-data, analytics, 2024"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      {/* Platform Fee Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Platform Fee</p>
          <p>A 2.5% platform fee will be deducted from each sale.</p>
        </div>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{progress.message}</span>
            <span>{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !file || !formData.title || !formData.price}
        className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? "Processing..." : "List Dataset"}
      </button>
    </form>
  );
}
