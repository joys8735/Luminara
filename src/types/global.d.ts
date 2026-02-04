// src/types/global.d.ts
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isConnected?: () => boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    selectedAddress: string | null;
    chainId: string;
    networkVersion: string;
  };
}