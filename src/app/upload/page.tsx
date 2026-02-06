"use client";

import { UploadForm } from "@/components/UploadForm";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Upload, Lock, FileText, Rocket } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const wallet = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!wallet.isConnected && !wallet.isLoading) {
      toast.error("Please connect your wallet to upload a dataset");
      router.push("/");
    }
  }, [wallet.isConnected, wallet.isLoading, router]);

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="p-4 bg-indigo-600/20 rounded-xl w-fit mx-auto mb-4">
            <Lock size={48} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            Authentication Required
          </p>
          <p className="text-slate-400 mt-2 mb-6">
            Please connect your wallet to upload a dataset
          </p>
          <Link
            href="/"
            className="btn-secondary inline-flex items-center gap-2"
          >
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="glass-card p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-blue-600/10 to-indigo-600/20 animate-gradient-shift" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl glow-indigo">
              <Upload size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black gradient-text-blue">Upload Dataset</h1>
          </div>
          <p className="text-lg text-slate-300 font-medium">
            Share your dataset with the community and earn 0G tokens
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8">
          <UploadForm
            onSuccess={(datasetId) => {
              toast.success("🎉 Dataset listed successfully!");
              router.push(`/dataset/${datasetId}`);
            }}
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="glass-card p-6 group hover-lift">
          <div className="p-3 bg-blue-600/20 rounded-xl w-fit mb-4 group-hover:bg-blue-600/40 transition-all">
            <FileText size={28} className="text-blue-400" />
          </div>
          <h3 className="font-bold text-white mb-2">1. Fill Details</h3>
          <p className="text-sm text-slate-400">
            Add title, description, category, and price for your dataset
          </p>
        </div>
        <div className="glass-card p-6 group hover-lift">
          <div className="p-3 bg-indigo-600/20 rounded-xl w-fit mb-4 group-hover:bg-indigo-600/40 transition-all">
            <Upload size={28} className="text-indigo-400" />
          </div>
          <h3 className="font-bold text-white mb-2">2. Upload File</h3>
          <p className="text-sm text-slate-400">
            Drag & drop or select your dataset file to upload
          </p>
        </div>
        <div className="glass-card p-6 group hover-lift">
          <div className="p-3 bg-emerald-600/20 rounded-xl w-fit mb-4 group-hover:bg-emerald-600/40 transition-all">
            <Rocket size={28} className="text-emerald-400" />
          </div>
          <h3 className="font-bold text-white mb-2">3. List It</h3>
          <p className="text-sm text-slate-400">
            Submit and your dataset goes live on the marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
