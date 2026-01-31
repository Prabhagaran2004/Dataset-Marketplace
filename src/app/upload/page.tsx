"use client";

import { UploadForm } from "@/components/UploadForm";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

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
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Connecting wallet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Dataset</h1>
        <p className="text-gray-600">
          Share your dataset with the community and earn 0G tokens
        </p>
      </div>

      <div className="bg-white rounded-lg p-8">
        <UploadForm
          onSuccess={(datasetId) => {
            toast.success("Dataset listed successfully!");
            router.push(`/dataset/${datasetId}`);
          }}
        />
      </div>
    </div>
  );
}
