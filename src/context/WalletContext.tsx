import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";

type WalletType = "phantom" | "metamask" | null;

// Новый интерфейс для walletState
interface WalletState {
  isConnected: boolean;
  walletType: WalletType;
  evmAddress: string | null;
  solanaAddress: string | null;
  evmBalance: string;
  solanaBalance: string;
}

interface WalletContextType {
  // Старые поля
  connected: boolean;
  publicKey: string | null;
  walletAddress: string | null;
  balance: number;
  chainId: number | null;
  isCorrectNetwork: boolean;
  walletType: WalletType;
  cashbackBalance: number;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  
  // Новое поле
  walletState: WalletState;
  
  // Методы
  connectWallet: (type: WalletType) => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  disconnectWallet: () => void;
  generateAddress: () => string;
  addCashback: (amount: number) => void;
  withdrawCashback: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  walletAddress: null,
  balance: 0,
  chainId: null,
  isCorrectNetwork: false,
  walletType: null,
  cashbackBalance: 0,
  provider: null,
  signer: null,
  
  // Дефолтное значение для walletState
  walletState: {
    isConnected: false,
    walletType: null,
    evmAddress: null,
    solanaAddress: null,
    evmBalance: '0',
    solanaBalance: '0',
  },
  
  connectWallet: async () => {},
  switchNetwork: async () => {},
  disconnectWallet: () => {},
  generateAddress: () => "",
  addCashback: () => {},
  withdrawCashback: () => {},
});

export const useWallet = () => useContext(WalletContext);

const LAST_WALLET_KEY = "sv_last_wallet";
const TARGET_CHAIN_ID = 97; // BSC Testnet

// ========== EVM (MetaMask) провайдер ==========
function pickEvmProvider(): any | null {
  const eth: any = (window as any).ethereum;
  if (!eth) return null;

  if (eth.targetProvider?.request) return eth.targetProvider;

  if (Array.isArray(eth.providers)) {
    return eth.providers.find((p: any) => p?.request) || null;
  }

  if (Array.isArray(eth.detected)) {
    return eth.detected.find((p: any) => p?.request) || null;
  }

  if (eth.request) return eth;

  return null;
}

async function evmRequestAccounts(): Promise<string[]> {
  const provider = pickEvmProvider();
  if (!provider) throw new Error("MetaMask не знайдено");
  return await provider.request({ method: "eth_requestAccounts" });
}

async function evmGetAccounts(): Promise<string[]> {
  const provider = pickEvmProvider();
  if (!provider) return [];
  try {
    return await provider.request({ method: "eth_accounts" }) || [];
  } catch {
    return [];
  }
}

async function getChainId(): Promise<number | null> {
  try {
    const provider = pickEvmProvider();
    if (!provider) return null;
    
    const chainIdHex = await provider.request({ method: "eth_chainId" });
    return parseInt(chainIdHex, 16);
  } catch {
    return null;
  }
}

// ========== Phantom (Solana) ==========
function pickPhantomProvider(): any | null {
  const w: any = window as any;
  return w?.phantom?.solana || w?.solana || null;
}

function getPublicKey(provider: any): string | null {
  return provider?.publicKey?.toString?.() || null;
}

async function phantomConnect(provider: any): Promise<string> {
  if (provider?.isConnected && provider.publicKey) {
    return getPublicKey(provider)!;
  }

  try {
    const resp = await provider.connect();
    return getPublicKey(resp || provider)!;
  } catch (e: any) {
    if (String(e).toLowerCase().includes("pending") || String(e).includes("already")) {
      throw new Error("Phantom: підключення вже в процесі. Відкрийте розширення.");
    }
    throw e;
  }
}

async function phantomAutoReconnect(provider: any): Promise<string | null> {
  try {
    const resp = await provider.connect({ onlyIfTrusted: true });
    return getPublicKey(resp || provider);
  } catch {
    return null;
  }
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  
  // Новое состояние walletState
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletType: null,
    evmAddress: null,
    solanaAddress: null,
    evmBalance: '0',
    solanaBalance: '0',
  });

  const connectingRef = useRef(false);

  // Функція для перевірки мережі
  const checkNetwork = (currentChainId: number | null) => {
    if (!currentChainId) {
      setIsCorrectNetwork(false);
      return;
    }
    setIsCorrectNetwork(currentChainId === TARGET_CHAIN_ID);
  };

  // Функція для отримання USDT балансу
  const getUsdtBalance = async (address: string) => {
    if (!provider || walletType !== "metamask") return '0';
    
    try {
      // USDT на BSC Testnet
      const usdtAddress = '0x5d842eE37D3C5D3F34BFaB7824d6dC9149d83438'; // Адреса USDT контракту на тестнеті
      const abi = ['function balanceOf(address) view returns (uint256)'];
      const contract = new ethers.Contract(usdtAddress, abi, provider);
      
      const balance = await contract.balanceOf(address);
      return ethers.formatUnits(balance, 6); // USDT має 6 decimals
    } catch (error) {
      console.error('Failed to get USDT balance:', error);
      return '0';
    }
  };

  // Функція для перемикання мережі
  const switchNetwork = async (targetChainId: number) => {
    const evmProvider = pickEvmProvider();
    if (!evmProvider) {
      throw new Error('MetaMask not installed');
    }

    try {
      await evmProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      const newChainId = await getChainId();
      setChainId(newChainId);
      checkNetwork(newChainId);
      
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await addNetwork(targetChainId);
          const newChainId = await getChainId();
          setChainId(newChainId);
          checkNetwork(newChainId);
        } catch (addError: any) {
          throw new Error(`Please add network ${targetChainId} to MetaMask first`);
        }
      } else {
        throw error;
      }
    }
  };

  // Додавання нової мережі
  const addNetwork = async (targetChainId: number) => {
    const evmProvider = pickEvmProvider();
    if (!evmProvider) return;

    const networks: Record<number, any> = {
      56: {
        chainId: "0x38",
        chainName: "Binance Smart Chain Mainnet",
        nativeCurrency: {
          name: "BNB",
          symbol: "BNB",
          decimals: 18,
        },
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.com"],
      },
      97: {
        chainId: "0x61",
        chainName: "Binance Smart Chain Testnet",
        nativeCurrency: {
          name: "BNB",
          symbol: "BNB",
          decimals: 18,
        },
        rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
        blockExplorerUrls: ["https://testnet.bscscan.com"],
      },
    };

    const networkConfig = networks[targetChainId];
    if (!networkConfig) {
      throw new Error(`Network ${targetChainId} not supported`);
    }

    await evmProvider.request({
      method: "wallet_addEthereumChain",
      params: [networkConfig],
    });
  };

  // Обновленная функция для получения реального баланса EVM
  const getEvmBalance = async (address: string, provider: ethers.BrowserProvider): Promise<number> => {
    try {
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      return parseFloat(balanceEth);
    } catch (error) {
      console.error('Failed to get EVM balance:', error);
      return 0;
    }
  };

  // Обновленная функция setSession
  const setSession = async (type: WalletType, address: string, customBalance?: number) => {
    setPublicKey(address);
    setWalletAddress(address);
    setConnected(true);
    setWalletType(type);
    
    let newBalance = 0;
    let evmBalance = '0';
    let solanaBalance = '0';
    
    if (type === "metamask") {
      const evmProvider = pickEvmProvider();
      if (evmProvider) {
        const ethersProvider = new ethers.BrowserProvider(evmProvider);
        const ethersSigner = await ethersProvider.getSigner();
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        
        // Получаем реальный баланс
        newBalance = await getEvmBalance(address, ethersProvider);
        evmBalance = newBalance.toString();
        
        const currentChainId = await getChainId();
        setChainId(currentChainId);
        checkNetwork(currentChainId);
      }
    } else if (type === "phantom") {
      // Для Phantom используем переданный баланс или устанавливаем дефолтный
      newBalance = customBalance || 2.45;
      solanaBalance = newBalance.toString();
      setProvider(null);
      setSigner(null);
      setChainId(null);
      setIsCorrectNetwork(false);
    }
    
    setBalance(newBalance);
    
    // Обновляем walletState
    setWalletState({
      isConnected: true,
      walletType: type,
      evmAddress: type === "metamask" ? address : null,
      solanaAddress: type === "phantom" ? address : null,
      evmBalance: evmBalance,
      solanaBalance: solanaBalance,
    });
  };

  const clearSession = () => {
    setConnected(false);
    setPublicKey(null);
    setWalletAddress(null);
    setBalance(0);
    setWalletType(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    
    // Очищаем walletState
    setWalletState({
      isConnected: false,
      walletType: null,
      evmAddress: null,
      solanaAddress: null,
      evmBalance: '0',
      solanaBalance: '0',
    });
  };

  const connectWallet = async (type: WalletType) => {
    if (!type || connectingRef.current) return;

    connectingRef.current = true;
    try {
      if (type === "metamask") {
        const accounts = await evmRequestAccounts();
        if (accounts[0]) {
          await setSession("metamask", accounts[0]);
          localStorage.setItem(LAST_WALLET_KEY, "metamask");
          toast.success("MetaMask connected!");
        }
      } else if (type === "phantom") {
        const provider = pickPhantomProvider();
        if (!provider) throw new Error("Phantom не знайдено");
        const pk = await phantomConnect(provider);
        await setSession("phantom", pk, 2.45); // Можно передать дефолтный баланс
        localStorage.setItem(LAST_WALLET_KEY, "phantom");
        toast.success("Phantom підключено!");
      }
    } catch (error: any) {
      toast.error(error.message || "Не вдалося підключити гаманець");
    } finally {
      connectingRef.current = false;
    }
  };

  const disconnectWallet = () => {
    clearSession();
    localStorage.removeItem(LAST_WALLET_KEY);
    toast.info("Wallet disconnected");
  };

  useEffect(() => {
    if (!connected || walletType !== "metamask" || !publicKey || !provider) return;
    
    const updateBalance = async () => {
      try {
        const newBalance = await getEvmBalance(publicKey, provider);
        setBalance(newBalance);
        
        // Оновити walletState
        setWalletState(prev => ({
          ...prev,
          evmBalance: newBalance.toString()
        }));
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    };
    
    updateBalance();
    const interval = setInterval(updateBalance, 30000); // Кожні 30 секунд
    
    return () => clearInterval(interval);
  }, [connected, walletType, publicKey, provider]);

  // Авто-підключення при перезавантаженні
  useEffect(() => {
    const last = localStorage.getItem(LAST_WALLET_KEY) as WalletType;
    if (!last) return;

    const tryReconnect = async () => {
      if (last === "metamask") {
        const accounts = await evmGetAccounts();
        if (accounts[0]) await setSession("metamask", accounts[0]);
      } else if (last === "phantom") {
        const provider = pickPhantomProvider();
        if (provider) {
          const pk = await phantomAutoReconnect(provider);
          if (pk) await setSession("phantom", pk, 2.45);
        }
      }
    };

    tryReconnect();
  }, []);

  // Обробка зміни акаунтів та мережі у MetaMask
  useEffect(() => {
    const evmProvider = pickEvmProvider();
    if (!evmProvider || walletType !== "metamask") return;

    const onAccountsChanged = async (accounts: string[]) => {
      if (accounts?.[0]) {
        await setSession("metamask", accounts[0]);
      } else {
        clearSession();
      }
    };

    const onChainChanged = async (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      checkNetwork(newChainId);
      
      if (walletType === "metamask") {
        const ethersProvider = new ethers.BrowserProvider(evmProvider);
        const ethersSigner = await ethersProvider.getSigner();
        setProvider(ethersProvider);
        setSigner(ethersSigner);
      }
    };

    evmProvider.on("accountsChanged", onAccountsChanged);
    evmProvider.on("chainChanged", onChainChanged);

    return () => {
      evmProvider.removeListener("accountsChanged", onAccountsChanged);
      evmProvider.removeListener("chainChanged", onChainChanged);
    };
  }, [walletType]);

  const value = useMemo(
    () => ({
      connected,
      publicKey,
      walletAddress,
      balance,
      chainId,
      isCorrectNetwork,
      walletType,
      cashbackBalance,
      provider,
      signer,
      
      // Добавляем walletState
      walletState,
      
      connectWallet,
      switchNetwork,
      disconnectWallet,
      generateAddress: () => "fake_" + Math.random().toString(36).slice(2, 15),
      addCashback: (amount: number) => setCashbackBalance(prev => prev + amount),
      withdrawCashback: () => setCashbackBalance(0),
    }),
    [
      connected, publicKey, walletAddress, balance, chainId, 
      isCorrectNetwork, walletType, cashbackBalance, provider, 
      signer, walletState
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};