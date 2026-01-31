import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import {
  CURRENT_NETWORK,
  MARKETPLACE_ABI,
  MARKETPLACE_CONTRACT_ADDRESS,
} from "./constants";

export async function getProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getSigner(
  provider: BrowserProvider,
): Promise<JsonRpcSigner> {
  return provider.getSigner();
}

export async function getMarketplaceContract(
  signer: JsonRpcSigner,
): Promise<Contract> {
  return new Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, signer);
}

export async function switchNetwork(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not found, add it
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
            chainName: CURRENT_NETWORK.name,
            rpcUrls: [CURRENT_NETWORK.rpc],
            blockExplorerUrls: [CURRENT_NETWORK.blockExplorer],
            nativeCurrency: {
              name: CURRENT_NETWORK.currency,
              symbol: CURRENT_NETWORK.currency,
              decimals: 18,
            },
          },
        ],
      });
      return true;
    }
    throw error;
  }
}

export function getBlockExplorerTxUrl(txHash: string): string {
  return `${CURRENT_NETWORK.blockExplorer}/tx/${txHash}`;
}

export function getBlockExplorerAddressUrl(address: string): string {
  return `${CURRENT_NETWORK.blockExplorer}/address/${address}`;
}
