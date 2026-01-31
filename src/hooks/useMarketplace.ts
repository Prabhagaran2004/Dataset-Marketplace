"use client";

import { useState, useCallback } from "react";
import { Contract, parseUnits } from "ethers";
import { getProvider, getSigner, getMarketplaceContract } from "@/lib/zgClient";
import { Dataset } from "@/types";

export function useMarketplace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listDataset = useCallback(
    async (
      rootHash: string,
      price: string,
      metadataURI: string,
    ): Promise<{ datasetId: number; txHash: string }> => {
      setLoading(true);
      setError(null);
      try {
        const provider = await getProvider();
        const signer = await getSigner(provider);
        const contract = await getMarketplaceContract(signer);

        const priceInWei = parseUnits(price, 18);
        const tx = await contract.listDataset(
          rootHash,
          metadataURI,
          priceInWei,
        );
        const receipt = await tx.wait();

        // Extract dataset ID from event
        let datasetId = 0;
        if (receipt?.logs) {
          for (const log of receipt.logs) {
            try {
              const parsed = contract.interface.parseLog(log);
              if (parsed?.name === "DatasetListed") {
                datasetId = parseInt(parsed.args[0]);
                break;
              }
            } catch (e) {
              // Continue if parsing fails
            }
          }
        }

        return {
          datasetId,
          txHash: tx.hash,
        };
      } catch (err: any) {
        const message = err?.reason || err?.message || "Failed to list dataset";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const purchaseDataset = useCallback(
    async (datasetId: number, price: string): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const provider = await getProvider();
        const signer = await getSigner(provider);
        const contract = await getMarketplaceContract(signer);

        const priceInWei = parseUnits(price, 18);
        const tx = await contract.purchaseDataset(datasetId, {
          value: priceInWei,
        });
        await tx.wait();

        return tx.hash;
      } catch (err: any) {
        const message =
          err?.reason || err?.message || "Failed to purchase dataset";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const checkAccess = useCallback(
    async (datasetId: number, userAddress: string): Promise<boolean> => {
      try {
        const provider = await getProvider();
        const contract = new Contract(
          process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || "",
          [
            "function hasAccess(uint256 id, address user) external view returns (bool)",
          ],
          provider,
        );

        return await contract.hasAccess(datasetId, userAddress);
      } catch (err) {
        console.error("Error checking access:", err);
        return false;
      }
    },
    [],
  );

  const getDataset = useCallback(
    async (datasetId: number): Promise<Dataset | null> => {
      try {
        const provider = await getProvider();
        const contract = new Contract(
          process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || "",
          [
            "function getDataset(uint256 id) external view returns (address, bytes32, string, uint256, uint256, bool)",
          ],
          provider,
        );

        const [seller, rootHash, metadataURI, price, timestamp, active] =
          await contract.getDataset(datasetId);

        return {
          id: datasetId,
          seller,
          rootHash,
          metadataURI,
          price,
          timestamp,
          active,
        };
      } catch (err) {
        console.error("Error fetching dataset:", err);
        return null;
      }
    },
    [],
  );

  const fetchDatasets = useCallback(async (): Promise<Dataset[]> => {
    try {
      const provider = await getProvider();
      const contract = new Contract(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || "",
        [
          "function datasetCount() external view returns (uint256)",
          "function getDataset(uint256 id) external view returns (address, bytes32, string, uint256, uint256, bool)",
        ],
        provider,
      );

      const count = await contract.datasetCount();
      const datasets: Dataset[] = [];

      for (let i = 1; i <= count; i++) {
        const [seller, rootHash, metadataURI, price, timestamp, active] =
          await contract.getDataset(i);
        datasets.push({
          id: i,
          seller,
          rootHash,
          metadataURI,
          price,
          timestamp,
          active,
        });
      }

      return datasets;
    } catch (err) {
      console.error("Error fetching datasets:", err);
      return [];
    }
  }, []);

  const withdrawEarnings = useCallback(async (): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const provider = await getProvider();
      const signer = await getSigner(provider);
      const contract = await getMarketplaceContract(signer);

      const tx = await contract.withdrawFunds();
      await tx.wait();

      return tx.hash;
    } catch (err: any) {
      const message =
        err?.reason || err?.message || "Failed to withdraw earnings";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDatasetStatus = useCallback(
    async (datasetId: number): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const provider = await getProvider();
        const signer = await getSigner(provider);
        const contract = await getMarketplaceContract(signer);

        const tx = await contract.toggleDatasetStatus(datasetId);
        await tx.wait();

        return tx.hash;
      } catch (err: any) {
        const message =
          err?.reason || err?.message || "Failed to toggle dataset status";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updatePrice = useCallback(
    async (datasetId: number, newPrice: string): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const provider = await getProvider();
        const signer = await getSigner(provider);
        const contract = await getMarketplaceContract(signer);

        const priceInWei = parseUnits(newPrice, 18);
        const tx = await contract.updatePrice(datasetId, priceInWei);
        await tx.wait();

        return tx.hash;
      } catch (err: any) {
        const message = err?.reason || err?.message || "Failed to update price";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    listDataset,
    purchaseDataset,
    checkAccess,
    getDataset,
    fetchDatasets,
    withdrawEarnings,
    toggleDatasetStatus,
    updatePrice,
  };
}
