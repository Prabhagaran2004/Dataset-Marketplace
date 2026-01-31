import { ethers } from "ethers";

export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatPrice(price: bigint, decimals = 18): string {
  const formatted = ethers.formatUnits(price, decimals);
  const num = parseFloat(formatted);
  if (num < 0.001) return "<0.001";
  return num.toFixed(3);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function formatTimestamp(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function sanitizeInput(input: string, maxLength = 500): string {
  return input.slice(0, maxLength).trim();
}

export function validatePrice(price: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) {
      return { valid: false, error: "Price must be greater than 0" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid price format" };
  }
}

export function validateFileSize(
  size: number,
  maxSize = 10 * 1024 * 1024 * 1024,
): { valid: boolean; error?: string } {
  if (size === 0) {
    return { valid: false, error: "File is empty" };
  }
  if (size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${formatFileSize(maxSize)}`,
    };
  }
  return { valid: true };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
