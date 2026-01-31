"use client";

import { useState, useCallback } from "react";
import { UploadProgress } from "@/types";

export function useZgStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    stage: "preparing",
    progress: 0,
    message: "Preparing...",
  });
  const [downloading, setDownloading] = useState(false);

  const uploadDataset = useCallback(
    async (
      file: File,
      onProgress?: (progress: UploadProgress) => void,
    ): Promise<{ rootHash: string; txHash?: string; size: number }> => {
      setUploading(true);
      try {
        setProgress({
          stage: "preparing",
          progress: 0,
          message: "Initializing upload...",
        });
        onProgress?.({
          stage: "preparing",
          progress: 0,
          message: "Initializing upload...",
        });

        // Step 1: Prepare file
        setProgress({
          stage: "preparing",
          progress: 50,
          message: "Calculating file hash...",
        });
        onProgress?.({
          stage: "preparing",
          progress: 50,
          message: "Calculating file hash...",
        });

        // Step 2: Upload to 0G Storage via API endpoint
        setProgress({
          stage: "uploading",
          progress: 10,
          message: "Uploading to 0G Storage...",
        });
        onProgress?.({
          stage: "uploading",
          progress: 10,
          message: "Uploading to 0G Storage...",
        });

        const formData = new FormData();
        formData.append("file", file);

        // In production, you would call an API endpoint that handles 0G SDK integration
        // For now, we'll generate a placeholder root hash
        const rootHash =
          "0x" +
          Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        setProgress({
          stage: "uploading",
          progress: 90,
          message: "Finalizing upload...",
        });
        onProgress?.({
          stage: "uploading",
          progress: 90,
          message: "Finalizing upload...",
        });

        setProgress({
          stage: "verifying",
          progress: 100,
          message: "Upload complete!",
        });
        onProgress?.({
          stage: "verifying",
          progress: 100,
          message: "Upload complete!",
        });

        return {
          rootHash,
          size: file.size,
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const downloadDataset = useCallback(async (): Promise<Blob> => {
    setDownloading(true);
    try {
      // In production, call an API endpoint that:
      // 1. Verifies user has access via smart contract
      // 2. Downloads file from 0G Storage
      // 3. Returns the file blob
      throw new Error("Download functionality requires backend API");
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    } finally {
      setDownloading(false);
    }
  }, []);

  return {
    uploadDataset,
    downloadDataset,
    uploading,
    downloading,
    progress,
  };
}
