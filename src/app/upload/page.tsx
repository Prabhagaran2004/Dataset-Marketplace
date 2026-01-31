"use client";

import { UploadForm } from "@/components/UploadForm";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Upload, Lock } from "lucide-react";
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
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-12 rounded-2xl text-center border-2 border-purple-200 shadow-xl">
          <Lock size={48} className="mx-auto text-purple-600 mb-4" />
          <p className="text-2xl font-bold text-gray-800">
            Authentication Required
          </p>
          <p className="text-gray-600 mt-2 mb-6">
            Please connect your wallet to upload a dataset
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl p-12 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <Upload size={36} />
          <h1 className="text-4xl font-black">Upload Dataset</h1>
        </div>
        <p className="text-lg text-white/90 font-semibold">
          Share your dataset with the community and earn 0G tokens
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
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
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">1️⃣</div>
          <h3 className="font-bold text-gray-800 mb-2">Fill Details</h3>
          <p className="text-sm text-gray-600">
            Add title, description, category, and price for your dataset
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">2️⃣</div>
          <h3 className="font-bold text-gray-800 mb-2">Upload File</h3>
          <p className="text-sm text-gray-600">
            Drag & drop or select your dataset file to upload
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
          <div className="text-3xl font-bold text-emerald-600 mb-2">3️⃣</div>
          <h3 className="font-bold text-gray-800 mb-2">List It</h3>
          <p className="text-sm text-gray-600">
            Submit and your dataset goes live on the marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
