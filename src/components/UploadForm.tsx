"use client";

import { useState } from "react";
import { Upload, AlertCircle, FileText, Tag, DollarSign, Loader } from "lucide-react";
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
      <div className="space-y-3">
        <label className="flex items-center gap-2 font-bold text-lg text-white">
          <Upload size={20} className="text-emerald-400" />
          Dataset File <span className="text-red-400">*</span>
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            dragActive
              ? "border-emerald-500 bg-emerald-500/20 scale-[1.02]"
              : "border-emerald-500/30 bg-white/[0.03] hover:bg-emerald-500/10 hover:border-emerald-500/50"
          }`}
        >
          <Upload
            className={`mx-auto mb-3 transition-colors ${dragActive ? "text-emerald-400" : "text-emerald-200/30"}`}
            size={40}
          />
          <p className="font-bold text-white mb-1 text-lg">
            Drag and drop your file here
          </p>
          <p className="text-sm text-emerald-200/40 mb-4">or click to browse</p>
          <label className="inline-block">
            <span className="btn-primary cursor-pointer">
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
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <FileText size={16} className="text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <label htmlFor="title" className="flex items-center gap-2 font-bold text-lg text-white">
          <FileText size={20} className="text-emerald-400" />
          Dataset Title <span className="text-red-400">*</span>
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
          className="input-dark w-full"
        />
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label htmlFor="description" className="flex items-center gap-2 font-bold text-lg text-white">
          <FileText size={20} className="text-emerald-400" />
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          placeholder="Describe your dataset in detail..."
          rows={4}
          className="input-dark w-full resize-none"
        />
      </div>

      {/* Category */}
      <div className="space-y-3">
        <label htmlFor="category" className="flex items-center gap-2 font-bold text-lg text-white">
          <Tag size={20} className="text-emerald-400" />
          Category <span className="text-red-400">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          disabled={isLoading}
          className="input-dark w-full"
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
        <label htmlFor="price" className="flex items-center gap-2 font-bold text-lg text-white">
          <DollarSign size={20} className="text-emerald-400" />
          Price (0G tokens) <span className="text-red-400">*</span>
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
            className="input-dark w-full pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">
            0G
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label htmlFor="tags" className="flex items-center gap-2 font-bold text-lg text-white">
          <Tag size={20} className="text-emerald-400" />
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
          className="input-dark w-full"
        />
      </div>

      {/* Platform Fee Info */}
      <div className="glass-card-light p-4 flex gap-3">
        <AlertCircle size={24} className="text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-white">Platform Fee</p>
          <p className="text-emerald-200/40">
            A 2.5% platform fee will be deducted from each sale.
          </p>
        </div>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="space-y-3 glass-card-light p-4">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-white">{progress.message}</span>
            <span className="font-bold text-emerald-400">{progress.progress}%</span>
          </div>
          <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !file || !formData.title || !formData.price}
        className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader size={20} className="animate-spin" />
            Processing...
          </span>
        ) : (
          "🚀 List Dataset"
        )}
      </button>
    </form>
  );
}
