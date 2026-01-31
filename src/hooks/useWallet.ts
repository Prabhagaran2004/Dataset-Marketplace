"use client";

import { useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";
import { switchNetwork, getProvider } from "@/lib/zgClient";
import { formatAddress } from "@/lib/utils";
import { WalletState } from "@/types";

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isLoading: false,
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (!window.ethereum) {
        setState((prev) => ({ ...prev, error: "MetaMask not installed" }));
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(accounts[0]);

        setState({
          address: accounts[0],
          balance: balance.toString(),
          chainId: Number(network.chainId),
          isConnected: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const accounts = await window.ethereum?.request({
        method: "eth_requestAccounts",
      });

      if (accounts?.length > 0) {
        const provider = await getProvider();
        await switchNetwork();

        const network = await provider.getNetwork();
        const balance = await provider.getBalance(accounts[0]);

        setState({
          address: accounts[0],
          balance: balance.toString(),
          chainId: Number(network.chainId),
          isConnected: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.message || "Failed to connect wallet",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    displayAddress: state.address ? formatAddress(state.address) : undefined,
  };
}
