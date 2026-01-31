interface Window {
  ethereum?: {
    request: (args: any) => Promise<any>;
    on?: (event: string, callback: any) => void;
    off?: (event: string, callback: any) => void;
  };
}
