// hooks/useVault.ts - ДОДАЄМО USDT МЕТОДИ
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";
import { getProfileId } from "../lib/supabase"; // або правильний шлях

const CONTRACT_ADDRESS = "0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013";
const USDT_ADDRESS = "0x5d842eE37D3C5D3F34BFaB7824d6dC9149d83438";
const EDGE_FUNCTION_URL =
  "https://cnxyofqchoejrdrxdmwd.supabase.co/functions/v1/vault-sync";

// Повний ABI для контрактів
const VAULT_ABI = [
  {
    inputs: [],
    name: "createVault",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositBNB",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "usdtAmount",
        type: "uint256",
      },
    ],
    name: "depositPredictionWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "feeType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newPercent",
        type: "uint256",
      },
    ],
    name: "FeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PredictionExecuted",
    type: "event",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "status",
        type: "bool",
      },
    ],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "usdtAmount",
        type: "uint256",
      },
    ],
    name: "spendForPrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newCollector",
        type: "address",
      },
    ],
    name: "updateFeeCollector",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_depositFeePercent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_withdrawalFeePercent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_predictionFeePercent",
        type: "uint256",
      },
    ],
    name: "updateFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vaultAddress",
        type: "address",
      },
    ],
    name: "VaultCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawBNB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "approvedOperators",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "depositFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FEE_DENOMINATOR",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeCollector",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getBalances",
    outputs: [
      {
        internalType: "uint256",
        name: "bnbBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "usdtBalance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserVault",
    outputs: [
      {
        internalType: "uint256",
        name: "bnbBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "usdtBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalDeposited",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalWithdrawn",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "predictionFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDT_ADDRESS",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "vaults",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bnbBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "usdtBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalDeposited",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalWithdrawn",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawalFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const USDT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

const getSimpleVirtualAddress = (userAddress: string): string => {
  if (!userAddress || !ethers.isAddress(userAddress)) {
    return CONTRACT_ADDRESS;
  }
  
  // Беремо початок адреси юзера і замінюємо перші символи
  // Наприклад: 0xbddff812... -> 0xVLTbddff812...
  const short = userAddress.slice(2, 10); // Беремо 8 символів після 0x
  return `0xVLT${short}...${userAddress.slice(-4)}`;
};

export const useVault = () => {
  const { publicKey, signer, provider: walletProvider } = useWallet();
  const [vault, setVault] = useState<any>(null);
  const [externalUsdt, setExternalUsdt] = useState<number>(0);
  const [externalBnb, setExternalBnb] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [usdtContract, setUsdtContract] = useState<ethers.Contract | null>(
    null,
  );
  const [vaultContract, setVaultContract] = useState<ethers.Contract | null>(
    null,
  );

  // Ініціалізація контрактів
  useEffect(() => {
    if (signer) {
      const vault = new ethers.Contract(CONTRACT_ADDRESS, VAULT_ABI, signer);
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      setVaultContract(vault);
      setUsdtContract(usdt);
      console.log("Contracts initialized with signer");
    } else if (walletProvider) {
      const vault = new ethers.Contract(
        CONTRACT_ADDRESS,
        VAULT_ABI,
        walletProvider,
      );
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, walletProvider);
      setVaultContract(vault);
      setUsdtContract(usdt);
      console.log("Contracts initialized as read-only");
    }
  }, [signer, walletProvider]);

  // Отримання всіх балансів
  const fetchAllBalances = useCallback(async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get_balance",
          data: { user_address: publicKey },
        }),
      });

      const result = await response.json();
      console.log("All balances:", result);

      if (result.success) {
        setExternalBnb(parseFloat(result.external_bnb_balance) || 0);
        setExternalUsdt(parseFloat(result.external_usdt_balance) || 0);

        if (result.vault_exists) {
          setVault({
            user_id: publicKey,
            vault_address: CONTRACT_ADDRESS,
            bnb_balance: parseFloat(result.vault_bnb_balance) || 0,
            usdt_balance: parseFloat(result.vault_usdt_balance) || 0,
            exists: true,
          });
        } else {
          setVault({
            user_id: publicKey,
            vault_address: CONTRACT_ADDRESS,
            bnb_balance: 0,
            usdt_balance: 0,
            exists: false,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  }, [publicKey]);

  // Депозит USDT
  const depositUSDT = async (amount: number) => {
    if (!signer || !publicKey || !vaultContract || !usdtContract) {
      throw new Error("Підключ гаманець спочатку");
    }

    setLoading(true);
    try {
      // 1. Перевіряємо/створюємо vault
      const createVaultABI = [
        "function createVault() external returns (address)",
      ];
      const createContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        createVaultABI,
        signer,
      );

      try {
        await createContract.createVault().then((tx: any) => tx.wait());
        console.log("Vault created or already exists");
      } catch (error: any) {
        if (!error.message?.includes("Vault already exists")) {
          console.log("Vault might already exist");
        }
      }

      // 2. Перевіряємо allowance
      const amountWei = ethers.parseUnits(amount.toString(), 6); // USDT має 6 decimals
      const allowance = await usdtContract.allowance(
        publicKey,
        CONTRACT_ADDRESS,
      );

      if (allowance < amountWei) {
        console.log("Need to approve USDT...");
        toast.info("Надаю дозвіл на використання USDT...");

        const approveTx = await usdtContract.approve(
          CONTRACT_ADDRESS,
          amountWei,
        );
        await approveTx.wait();
        console.log("USDT approved");
        toast.success("Дозвіл надано!");
      }

      // 3. Робимо депозит USDT
      console.log("Depositing", amount, "USDT...");
      toast.info("Відправляю депозит USDT...");

      const tx = await vaultContract.depositUSDT(amountWei);
      console.log("USDT deposit tx sent:", tx.hash);
      toast.info(`Транзакція відправлена: ${tx.hash.slice(0, 10)}...`);

      const receipt = await tx.wait();

      try {
        await logTransaction({
          user_id: publicKey,
          type: "deposit",
          asset: "USDT",
          amount: amount,
          fee: amount * 0.001,
          net_amount: amount * 0.999,
          tx_hash: receipt.hash,
          from_address: publicKey,
          to_address: CONTRACT_ADDRESS,
          metadata: {
            method: "depositUSDT",
            asset_price: 1,
            timestamp: new Date().toISOString(),
          },
        });

        toast.success(`${amount} USDT успішно задепозитовано!`);
      } catch (logError) {
        console.error("Failed to log transaction (non-blocking):", logError);
        toast.success(
          `${amount} USDT успішно задепозитовано! (Transaction logged with error)`,
        );
      }

      // Оновлюємо баланс
      setTimeout(() => fetchAllBalances(), 3000);

      return { success: true, txHash: receipt.hash, amount };

      // 4. Оновлюємо баланс
      setTimeout(() => fetchAllBalances(), 3000);

      return {
        success: true,
        txHash: receipt.hash,
        amount: amount,
      };
    } catch (error: any) {
      console.error("USDT deposit failed:", error);

      let errorMessage = "Помилка депозиту USDT";
      if (error.message?.includes("user rejected")) {
        errorMessage = "Транзакцію відхилено в гаманці";
      } else if (error.message?.includes("insufficient")) {
        errorMessage = "Недостатньо USDT для депозиту";
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const depositBNB = async (amount: number) => {
    if (!signer || !vaultContract) throw new Error("No signer");
    setLoading(true);
    try {
      const tx = await vaultContract.depositBNB({
        value: ethers.parseEther(amount.toString()),
      });
      const receipt = await tx.wait();

      // ДОДАЄМО ЛОГУВАННЯ ТРАНЗАКЦІЇ
      try {
        await logTransaction({
          user_id: publicKey,
          type: "deposit",
          asset: "BNB",
          amount: amount,
          fee: amount * 0.001, // припустима комісія
          net_amount: amount * 0.999, // сума з урахуванням комісії
          tx_hash: receipt.hash,
          from_address: publicKey,
          to_address: CONTRACT_ADDRESS,
          metadata: {
            method: "depositBNB",
            asset_price: 300, // припустима ціна BNB в USDT
            timestamp: new Date().toISOString(),
          },
        });

        toast.success('Transaction confirmed!', {
      description: `${amount} BNB deposited successfully`,
      duration: 5000,
      action: {
    label: 'View',
    onClick: () => setWalletsOpen(true),
  },
});
      } catch (logError) {
        console.error("Failed to log transaction (non-blocking):", logError);
        toast.success(
          `${amount} BNB успішно задепозитовано! (Transaction logged with error)`,
        );
      }

      setTimeout(() => fetchAllBalances(), 3000);
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Оновлюємо функцію withdrawBNB
  // useVault.ts - оновлюємо withdrawBNB:

const withdrawBNB = async (amount: number) => {
  console.log('🟡 WITHDRAW_BNB START - amount:', amount);
  
  if (!signer || !vaultContract) {
    console.error('🔴 WITHDRAW_BNB error: No signer or contract');
    throw new Error("No signer");
  }
  
  setLoading(true);
  try {
    const amountWei = ethers.parseEther(amount.toString());
    console.log('🟡 Withdrawing BNB in wei:', amountWei);
    
    const tx = await vaultContract.withdrawBNB(amountWei);
    console.log('🟡 BNB withdraw tx sent:', tx.hash);
    
    toast.info(`Транзакція відправлена: ${tx.hash.slice(0, 10)}...`);
    
    const receipt = await tx.wait();
    console.log('🟡 BNB withdraw confirmed:', receipt);
    
    console.log('🟡 Attempting to log BNB withdrawal transaction...');
    
    const logResult = await logTransaction({
      user_id: publicKey,
      type: 'withdrawal',  // ⚠️ ЗМІНА: 'withdrawal' замість 'withdraw'
      asset: 'BNB',
      amount: amount,
      fee: amount * 0.001,
      net_amount: amount * 0.999,
      tx_hash: receipt.hash,
      from_address: CONTRACT_ADDRESS,
      to_address: publicKey,
      metadata: {
        method: 'withdrawBNB',
        asset_price: 300,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('🟡 Log transaction result:', logResult);
    
    if (logResult.success) {
      toast.success(`${amount} BNB успішно виведено!`);
    } else {
      console.error('🔴 Failed to log transaction:', logResult.error);
      toast.success(`${amount} BNB успішно виведено! (Log failed)`);
    }
    
    setTimeout(() => fetchAllBalances(), 3000);
    return { success: true, txHash: receipt.hash };
    
  } catch (error: any) {
    console.error('🔴 BNB WITHDRAW ERROR:', error);
    
    let errorMessage = "Помилка виведення BNB";
    if (error.message?.includes('user rejected')) {
      errorMessage = "Транзакцію відхилено в гаманці";
    } else if (error.message?.includes('insufficient')) {
      errorMessage = "Недостатньо коштів в vault";
    }
    
    toast.error(errorMessage);
    throw error;
  } finally {
    setLoading(false);
  }
};

  // Оновлюємо функцію createVault
  const createVault = async () => {
    if (!signer || !vaultContract) throw new Error("No signer");
    setLoading(true);
    try {
      const tx = await vaultContract.createVault();
      const receipt = await tx.wait();

      // ДОДАЄМО ЛОГУВАННЯ СТВОРЕННЯ VAULT
      try {
        await logTransaction({
          user_id: publicKey,
          type: "vault_created",
          asset: "VAULT",
          amount: 0,
          fee: 0,
          net_amount: 0,
          tx_hash: receipt.hash,
          from_address: publicKey,
          to_address: CONTRACT_ADDRESS,
          metadata: {
            method: "createVault",
            action: "vault_creation",
            timestamp: new Date().toISOString(),
          },
        });

        toast.success("Vault успішно створено!");
      } catch (logError) {
        console.error("Failed to log vault creation:", logError);
        toast.success("Vault створено! (Transaction logged with error)");
      }

      setTimeout(() => fetchAllBalances(), 2000);
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // useVault.ts - додаємо функції для історії
  const logTransaction = async (transactionData: any) => {
  try {
    const profileId = localStorage.getItem("profile_id");
    
    // ФІКС: Перетворюємо asset у верхній регістр
    const processedData = {
      ...transactionData,
      // Перетворюємо на верхній регістр і перевіряємо допустимі значення
      asset: transactionData.asset?.toUpperCase(),
      user_id: publicKey,
      profile_id: profileId,
    };

    // ФІКС: Перевірка на допустимі значення
    const allowedAssets = ['BNB', 'USDT', 'NATIVE'];
    if (!allowedAssets.includes(processedData.asset)) {
      console.warn('⚠️ Invalid asset type, defaulting to BNB:', processedData.asset);
      processedData.asset = 'BNB'; // або 'NATIVE' в залежності від контексту
    }

    console.log("🟡 LOG_TRANSACTION START", { profileId, processedData });

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "log_transaction",
        data: processedData, // Використовуємо оброблені дані
      }),
    });

      console.log("🟡 LOG_TRANSACTION RESPONSE", {
        status: response.status,
        ok: response.ok,
      });

      const responseText = await response.text();
      console.log("🟡 LOG_TRANSACTION RESPONSE TEXT:", responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log("🟡 LOG_TRANSACTION RESULT:", result);

      return result;
    } catch (error: any) {
      console.error("🔴 LOG_TRANSACTION ERROR:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const getTransactionHistory = async (limit = 50, profileId?: string) => {
  if (!publicKey) return [];

  try {
    const response = await fetch(
      "https://cnxyofqchoejrdrxdmwd.supabase.co/functions/v1/vault-sync",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get_transactions",
          data: {
            user_id: publicKey,
            profile_id: profileId, // ← передаємо profile_id
            limit,
          },
        }),
      },
    );

    const result = await response.json();
    return result.success ? result.transactions : [];
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return [];
  }
};

  // Вивід USDT
  // Додаємо виклик logTransaction для виводу USDT
  const withdrawUSDT = async (amount: number) => {
  console.log('🟡 WITHDRAW_USDT START - amount:', amount);
  
  if (!signer || !vaultContract || !vault?.exists) {
    console.error('🔴 WITHDRAW_USDT error: No signer or vault');
    throw new Error("Vault не завантажено або гаманець не підключено");
  }

  setLoading(true);
  try {
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    console.log('🟡 Withdrawing USDT in wei:', amountWei);

    toast.info("Відправляю вивід USDT...");
    const tx = await vaultContract.withdrawUSDT(amountWei);
    console.log('🟡 USDT withdraw tx sent:', tx.hash);
    toast.info(`Транзакція відправлена: ${tx.hash.slice(0, 10)}...`);

    const receipt = await tx.wait();
    console.log('🟡 USDT withdraw confirmed:', receipt);
    
    console.log('🟡 Attempting to log USDT withdrawal transaction...');
    
    const logResult = await logTransaction({
      user_id: publicKey,
      type: 'withdrawal',  // ⚠️ ЗМІНА: 'withdrawal' замість 'withdraw'
      asset: 'USDT',
      amount: amount,
      fee: amount * 0.001,
      net_amount: amount * 0.999,
      tx_hash: receipt.hash,
      from_address: CONTRACT_ADDRESS,
      to_address: publicKey,
      metadata: {
        method: 'withdrawUSDT',
        asset_price: 1,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('🟡 Log transaction result:', logResult);
    
    if (logResult.success) {
      toast.success(`${amount} USDT успішно виведено!`);
    } else {
      console.error('🔴 Failed to log transaction:', logResult.error);
      toast.success(`${amount} USDT успішно виведено! (Log failed)`);
    }

    setTimeout(() => fetchAllBalances(), 3000);

    return {
      success: true,
      txHash: receipt.hash,
      amount: amount,
    };
  } catch (error: any) {
    console.error('🔴 USDT WITHDRAW ERROR:', error);
    
    let errorMessage = "Помилка виведення USDT";
    if (error.message?.includes('user rejected')) {
      errorMessage = "Транзакцію відхилено в гаманці";
    } else if (error.message?.includes('insufficient')) {
      errorMessage = "Недостатньо коштів в vault";
    }
    
    toast.error(errorMessage);
    throw error;
  } finally {
    setLoading(false);
  }
};

  // Перевірка approve для USDT
  const checkUSDTApproval = async (amount: number): Promise<boolean> => {
    if (!publicKey || !usdtContract) return false;

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      const allowance = await usdtContract.allowance(
        publicKey,
        CONTRACT_ADDRESS,
      );
      return allowance >= amountWei;
    } catch (error) {
      console.error("Failed to check USDT approval:", error);
      return false;
    }
  };

  // Approve USDT
  const approveUSDT = async (amount: number) => {
    if (!signer || !usdtContract) {
      throw new Error("Підключ гаманець спочатку");
    }

    setLoading(true);
    try {
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      console.log("Approving", amount, "USDT...");

      toast.info("Надаю дозвіл...");
      const tx = await usdtContract.approve(CONTRACT_ADDRESS, amountWei);
      console.log("Approve tx sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Approve confirmed:", receipt);
      toast.success("Дозвіл надано!");

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error: any) {
      console.error("USDT approve failed:", error);
      toast.error("Помилка надання дозволу");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchAllBalances();
    }
  }, [publicKey, fetchAllBalances]);

  return {
    vault,
    loading,
    externalUsdt,
    externalBnb,

    // Для WalletsModal
    projectWalletAddress: vault?.vault_address || CONTRACT_ADDRESS,
    // projectWalletAddress: publicKey ? getSimpleVirtualAddress(publicKey) : CONTRACT_ADDRESS,
    projectBnb: vault?.bnb_balance || 0,
    projectUsdt: vault?.usdt_balance || 0,
getSimpleVirtualAddress, // ← додай це
    // USDT методи
    depositUSDT,
    withdrawUSDT,
    checkUSDTApproval,
    approveUSDT,
    
    // Історія транзакцій - ДОДАЄМО ТУТ!
    getTransactionHistory, // ← ОСЬ ЦЕ ДОДАЙ

    depositBNB,
    withdrawBNB,

    createVault,
    refreshVault: fetchAllBalances,
    syncWithContract: fetchAllBalances,
  };
};
function setWalletsOpen(arg0: boolean): void {
  throw new Error("Function not implemented.");
}

