export interface Dataset {
  id: number;
  seller: string;
  rootHash: string;
  metadataURI: string;
  price: bigint;
  timestamp: bigint;
  active: boolean;
}

export interface DatasetMetadata {
  title: string;
  description: string;
  category: string;
  fileSize: number;
  format: string;
  previewRootHash?: string;
  tags: string[];
  uploadDate: number;
}

export interface UploadProgress {
  stage: "preparing" | "uploading" | "verifying";
  progress: number;
  message: string;
}

export interface TransactionResult {
  txHash: string;
  status: "pending" | "success" | "error";
  message?: string;
}

export interface WalletState {
  address?: string;
  balance?: string;
  chainId?: number;
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
}
