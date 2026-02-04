// context/PremiumContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import PremiumSubscriptionABI from '../abi/PremiumSubscription.json';

interface PremiumContextType {
  hasPremium: boolean;
  expiresAt: string | null;
  expiryTimestamp: number | null;
  isYearly: boolean;
  daysLeft: number;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
  subscribe: (isMonthly: boolean, payWithBNB: boolean, bnbAmount?: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  calculateBnbAmount: (isMonthly: boolean) => Promise<string>;
  getBnbPrice: () => Promise<string>;
  getPriceInUSDT: (isMonthly: boolean) => Promise<string>;
  getPriceInBNB: (isMonthly: boolean) => Promise<string>;
  approveUSDT: (amount: string, isMonthly: boolean) => Promise<boolean>;
  checkUSDTAllowance: () => Promise<{
    hasAllowance: boolean;
    balance: string;
    allowance: string;
  }>;
  // Адмін функції
  adminWithdraw: (tokenAddress: string, amount: string) => Promise<void>;
  adminSetBnbPriceFeed: (newFeed: string) => Promise<void>;
  adminPauseContract: () => Promise<void>;
  adminUnpauseContract: () => Promise<void>;
  adminGetContractInfo: () => Promise<{
    totalSubscriptions: string;
    totalRevenueUSD: string;
    bnbPrice: string;
    monthlyPriceBNB: string;
    yearlyPriceBNB: string;
    isPaused: boolean;
  }>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// 🔥 ЗАМІНИ НА СВОЇ АДРЕСИ
const CONTRACT_ADDRESS = '0xB729325A157c258b9E2Ad5cF4De4D4fB0852a2ED'; // Твій контракт
const USDT_ADDRESS = '0x5d842eE37D3C5D3F34BFaB7824d6dC9149d83438'; // USDT 

// USDT ABI (мінімальний)
const USDT_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  }
];

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected, walletAddress, provider, signer } = useWallet() as any;
  const [hasPremium, setHasPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getContract = useCallback(() => {
    if (!signer && !provider) return null;
    const contractProvider = signer || provider;
    
    try {
      if (!PremiumSubscriptionABI || !PremiumSubscriptionABI.abi) {
        throw new Error('ABI not loaded correctly');
      }
      
      return new ethers.Contract(
        CONTRACT_ADDRESS,
        PremiumSubscriptionABI.abi,
        contractProvider
      );
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  }, [signer, provider]);

  const checkPremiumStatus = useCallback(async () => {
    if (!connected || !walletAddress) {
      resetState();
      return;
    }

    try {
      setIsLoading(true);
      const contract = getContract();
      if (!contract) return;

      const [isActive, expiry, isYearlyPlan, daysRemaining] = await contract.getSubscriptionStatus(walletAddress);
      
      setHasPremium(isActive);
      setIsYearly(isYearlyPlan);
      setDaysLeft(Number(daysRemaining));
      
      if (isActive && expiry > 0) {
        const expiryDate = new Date(Number(expiry) * 1000);
        setExpiresAt(expiryDate.toISOString());
        setExpiryTimestamp(Number(expiry));
      } else {
        setExpiresAt(null);
        setExpiryTimestamp(null);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      resetState();
    } finally {
      setIsLoading(false);
    }
  }, [connected, walletAddress, getContract]);

  const resetState = () => {
    setHasPremium(false);
    setExpiresAt(null);
    setExpiryTimestamp(null);
    setIsYearly(false);
    setDaysLeft(0);
  };

  const approveUSDT = async (amount: string, isMonthly: boolean): Promise<boolean> => {
    if (!signer || !walletAddress) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      
      // Даємо дозвіл трохи більший ніж потрібно
      const amountInWei = isMonthly 
        ? ethers.parseUnits("3", 6) // 3.5 USDT для місячної
        : ethers.parseUnits("30", 6); // 30 USDT для річної
      
      console.log('Approving USDT amount:', ethers.formatUnits(amountInWei, 6));
      
      const tx = await usdtContract.approve(CONTRACT_ADDRESS, amountInWei);
      console.log('Approve transaction sent:', tx.hash);
      
      toast.info(`Approving USDT... ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      console.log('Approve confirmed');
      
      toast.success('USDT approved successfully!');
      return true;
    } catch (error: any) {
      console.error('Approve error:', error);
      throw new Error(`USDT approval failed: ${error.message || 'Unknown error'}`);
    }
    
  };

  const checkUSDTAllowance = async (): Promise<{
    hasAllowance: boolean;
    balance: string;
    allowance: string;
  }> => {
    if (!signer || !walletAddress) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      
      // Перевіряємо баланс
      const balance = await usdtContract.balanceOf(walletAddress);
      const balanceFormatted = ethers.formatUnits(balance, 6);
      
      // Перевіряємо allowance
      const allowance = await usdtContract.allowance(walletAddress, CONTRACT_ADDRESS);
      const allowanceFormatted = ethers.formatUnits(allowance, 6);
      
      // Потрібна сума для перевірки
      const requiredAmount = ethers.parseUnits("3", 6); // Мінімум 3 USDT
      const hasAllowance = allowance >= requiredAmount;
      
      return {
        hasAllowance,
        balance: balanceFormatted,
        allowance: allowanceFormatted
      };
    } catch (error: any) {
      console.error('Error checking allowance:', error);
      throw new Error(`Failed to check allowance: ${error.message || 'Unknown error'}`);
    }
  };

  const subscribe = async (isMonthly: boolean, payWithBNB: boolean, bnbAmount?: string) => {
    if (!connected || !signer || !walletAddress) {
      throw new Error('Wallet not properly connected. Please check your wallet connection.');
    }
    
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
    setIsLoading(true);
    try {
      let tx;
      
      if (payWithBNB) {
        // BNB оплата
        const value = ethers.parseEther(bnbAmount || '0');
        
        if (isMonthly) {
          tx = await contract.subscribeMonthly({ value });
        } else {
          tx = await contract.subscribeYearly({ value });
        }
      } else {
        // USDT оплата
        if (isMonthly) {
          tx = await contract.subscribeMonthly();
        } else {
          tx = await contract.subscribeYearly();
        }
      }
      
      console.log('Transaction sent:', tx.hash);
      toast.info(`Transaction sent: ${tx.hash.slice(0, 10)}...`);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      toast.success('Premium activated successfully!');
      
      await checkPremiumStatus();
      return receipt;
    } catch (error: any) {
      console.error("Subscribe error details:", error);
      
      let errorMessage = 'Transaction failed';
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient balance';
      } else if (error.message.includes('allowance')) {
        errorMessage = 'USDT approval required. Please approve USDT spending first.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!connected || !signer || !walletAddress) {
      throw new Error('Wallet not properly connected');
    }
    
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
    setIsLoading(true);
    try {
      const tx = await contract.cancelSubscription();
      console.log('Cancellation transaction:', tx.hash);
      toast.info(`Cancellation sent: ${tx.hash.slice(0, 10)}...`);
      
      await tx.wait();
      toast.success('Premium cancelled successfully!');
      await checkPremiumStatus();
    } catch (error: any) {
      console.error('Cancel error:', error);
      
      let errorMessage = 'Cancellation failed';
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBnbAmount = async (isMonthly: boolean): Promise<string> => {
    const contract = getContract();
    if (!contract) {
      // Fallback значення
      return isMonthly ? '0.0033' : '0.032';
    }
    
    try {
      const bnbAmount = await contract.getPriceInBNB(isMonthly);
      return ethers.formatEther(bnbAmount);
    } catch (error) {
      console.error("Error calculating BNB amount:", error);
      // Fallback значення
      return isMonthly ? '0.0033' : '0.032';
    }
  };

  const getBnbPrice = async (): Promise<string> => {
    const contract = getContract();
    if (!contract) {
      return "400.00";
    }
    
    try {
      const result = await contract.getContractInfo();
      const bnbPrice = result[2];
      return ethers.formatUnits(bnbPrice, 8);
    } catch (error) {
      console.error('Error getting BNB price:', error);
      return "400.00";
    }
  };

  const getPriceInUSDT = async (isMonthly: boolean): Promise<string> => {
    const contract = getContract();
    if (!contract) {
      return isMonthly ? "2.99" : "29.00";
    }
    
    try {
      const usdtAmount = await contract.getPriceInUSDT(isMonthly);
      return ethers.formatUnits(usdtAmount, 6);
    } catch (error) {
      console.error('Error getting USDT price:', error);
      return isMonthly ? "2.99" : "29.00";
    }
  };

  const getPriceInBNB = async (isMonthly: boolean): Promise<string> => {
    return calculateBnbAmount(isMonthly);
  };

  // ============ АДМІН ФУНКЦІ Ї ============
  
  const adminWithdraw = async (tokenAddress: string, amount: string): Promise<void> => {
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.withdraw(tokenAddress, ethers.parseEther(amount));
      await tx.wait();
      toast.success('Withdrawal successful!');
    } catch (error: any) {
      console.error('Admin withdraw error:', error);
      throw new Error(`Withdrawal failed: ${error.message}`);
    }
  };

  const adminSetBnbPriceFeed = async (newFeed: string): Promise<void> => {
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.setBnbPriceFeed(newFeed);
      await tx.wait();
      toast.success('BNB price feed updated!');
    } catch (error: any) {
      console.error('Admin set price feed error:', error);
      throw new Error(`Update failed: ${error.message}`);
    }
  };

  const adminPauseContract = async (): Promise<void> => {
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.pause();
      await tx.wait();
      toast.success('Contract paused!');
    } catch (error: any) {
      console.error('Admin pause error:', error);
      throw new Error(`Pause failed: ${error.message}`);
    }
  };

  const adminUnpauseContract = async (): Promise<void> => {
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.unpause();
      await tx.wait();
      toast.success('Contract unpaused!');
    } catch (error: any) {
      console.error('Admin unpause error:', error);
      throw new Error(`Unpause failed: ${error.message}`);
    }
  };

  const adminGetContractInfo = async (): Promise<{
    totalSubscriptions: string;
    totalRevenueUSD: string;
    bnbPrice: string;
    monthlyPriceBNB: string;
    yearlyPriceBNB: string;
    isPaused: boolean;
  }> => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const [totalSubs, totalRevUSD, bnbPrice, monthlyPriceBNB, yearlyPriceBNB] = 
        await contract.getContractInfo();
      
      const isPaused = await contract.paused();
      
      return {
        totalSubscriptions: totalSubs.toString(),
        totalRevenueUSD: ethers.formatUnits(totalRevUSD, 18),
        bnbPrice: ethers.formatUnits(bnbPrice, 8),
        monthlyPriceBNB: ethers.formatEther(monthlyPriceBNB),
        yearlyPriceBNB: ethers.formatEther(yearlyPriceBNB),
        isPaused
      };
    } catch (error: any) {
      console.error('Admin get info error:', error);
      throw new Error(`Failed to get contract info: ${error.message}`);
    }
  };

  useEffect(() => {
    if (connected && walletAddress) {
      checkPremiumStatus();
      const interval = hasPremium ? setInterval(checkPremiumStatus, 120000) : null;
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      resetState();
    }
  }, [connected, walletAddress, checkPremiumStatus, hasPremium]);

  return (
    <PremiumContext.Provider
      value={{
        hasPremium,
        expiresAt,
        expiryTimestamp,
        isYearly,
        daysLeft,
        isLoading,
        checkPremiumStatus,
        subscribe,
        cancelSubscription,
        calculateBnbAmount,
        getBnbPrice,
        getPriceInUSDT,
        getPriceInBNB,
        approveUSDT,
        checkUSDTAllowance,
        // Адмін функції
        adminWithdraw,
        adminSetBnbPriceFeed,
        adminPauseContract,
        adminUnpauseContract,
        adminGetContractInfo,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};