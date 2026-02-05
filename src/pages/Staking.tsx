import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Link } from "react-router-dom";
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { toast } from "sonner";
import { usePremium } from '../context/PremiumContext';
import {
  AlertCircle,
  ArrowRight,
  Clock,
  DollarSign,
  Lock,
  Sparkles,
  TrendingUp,
  Unlock,
  Loader2,
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  History,
  ExternalLink,
} from 'lucide-react';

// Адреса контракта стейкінгу
const STAKING_CONTRACT_ADDRESS = "0x311B26B19c53db97456EC21b12b86f015393F1fA";
import STAKING_ABI from '@/abi/Staking_ABI.json';
import { span } from 'framer-motion/client';

// Адреса токенов
const USDT_ADDRESS = "0x5d842eE37D3C5D3F34BFaB7824d6dC9149d83438";
const REWARD_TOKEN_ADDRESS = "0x44a7217B6583265ba9579453cc91F110FdA71698";

// Адрес Chainlink oracle BNB/USD (BSC Mainnet)
const BNB_PRICE_FEED_ADDRESS = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";

// USDT ABI
const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

// Reward Token ABI
const REWARD_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Token logos
const tokenLogos: Record<'USDT' | 'BNB' | 'RWD', string> = {
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  RWD: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

type StakeCurrency = 'USDT' | 'BNB';

interface PoolInfo {
  id: number;
  title: string;
  apy: number;
  lockPeriod: number;
  minAmountUsd: number;
  minAmountUsdt: number;
  minAmountBnb: number;
}

interface TransactionHistory {
  timestamp: number;
  action: string;
  amount: number;
  isBNB: boolean;
  poolId: number;
  txHash?: string;
}

const formatCurrency = (val: number, currency: 'USD' | 'USDT' | 'BNB' | 'RWD') => {
  if (currency === 'USD') {
    return (
      <span className="text-lg font-semibold text-[#e0e0e0]">
        ${val.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    );
  }
  return (
    <span className="text-lg font-semibold text-[#e0e0e0]">
      {val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: currency === 'USDT' ? 2 : currency === 'BNB' ? 4 : 6,
      })} {currency}
    </span>
  );
};

const formatCurrencySmall = (val: number, currency: 'USD' | 'USDT' | 'BNB' | 'RWD') => {
  if (currency === 'USD') {
    return `$${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'USDT' ? 2 : currency === 'BNB' ? 4 : 6,
  })} ${currency}`;
};

const formatFromWei = (wei: ethers.BigNumberish, decimals: number = 18): number => {
  return parseFloat(ethers.formatUnits(wei, decimals));
};

const formatFromUSDT = (value: ethers.BigNumberish): number => {
  return parseFloat(ethers.formatUnits(value, 6));
};

const toUSDT = (amount: number): ethers.BigNumberish => {
  return ethers.parseUnits(amount.toString(), 6);
};

const toBNB = (amount: number): ethers.BigNumberish => {
  return ethers.parseEther(amount.toString());
};

const usdToBnb = (usd: number, bnbPrice: number): number => {
  return bnbPrice > 0 ? usd / bnbPrice : usd / 300;
};

// Демо пули
const DEMO_POOLS: PoolInfo[] = [
  {
    id: 0,
    title: 'Flexible Stable Pool',
    apy: 6,
    lockPeriod: 0,
    minAmountUsd: 100,
    minAmountUsdt: 100,
    minAmountBnb: usdToBnb(100, 300),
  },
  {
    id: 1,
    title: '90d Boosted Pool',
    apy: 14,
    lockPeriod: 90,
    minAmountUsd: 250,
    minAmountUsdt: 250,
    minAmountBnb: usdToBnb(250, 300),
  },
  {
    id: 2,
    title: '180d Max Yield Pool',
    apy: 20,
    lockPeriod: 180,
    minAmountUsd: 500,
    minAmountUsdt: 500,
    minAmountBnb: usdToBnb(500, 300),
  },
];

// ================== АДМИН КОМПОНЕНТЫ ==================

interface AdminPoolFormData {
  title: string;
  apy: string;
  lockPeriod: string;
  minAmountUsd: string;
}

interface TokenApprovalStatus {
  usdt: boolean;
  reward: boolean;
}

const AdminModal = ({ 
  isOpen, 
  onClose, 
  isOwner,
  tokenApprovalStatus,
  onApproveTokens,
  onToggleStaking,
  stakingActive,
  onFundRewards,
  onWithdrawTokens,
  onWithdrawBNB,
  onCreatePool,
  rewardTokenBalance,
  contractBNBBalance,
  bnbPrice,
  onSetBnbPriceFeed,
}: {
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  tokenApprovalStatus: TokenApprovalStatus;
  onApproveTokens: (token: 'USDT' | 'RWD') => Promise<void>;
  onToggleStaking: (status: boolean) => Promise<void>;
  stakingActive: boolean;
  onFundRewards: (amount: number) => Promise<void>;
  onWithdrawTokens: (token: 'USDT' | 'RWD') => Promise<void>;
  onWithdrawBNB: () => Promise<void>;
  onCreatePool: (data: AdminPoolFormData) => Promise<void>;
  rewardTokenBalance: number;
  contractBNBBalance: number;
  bnbPrice: number;
  onSetBnbPriceFeed: (feedAddress: string) => Promise<void>;
}) => {
  const [activeTab, setActiveTab] = useState<'pools' | 'tokens' | 'settings'>('pools');
  const [isLoading, setIsLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [bnbPriceFeedInput, setBnbPriceFeedInput] = useState('');
  const [poolForm, setPoolForm] = useState<AdminPoolFormData>({
    title: '',
    apy: '',
    lockPeriod: '',
    minAmountUsd: '',
  });

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poolForm.title || !poolForm.apy || !poolForm.lockPeriod || !poolForm.minAmountUsd) {
      alert('Please fill all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await onCreatePool(poolForm);
      setPoolForm({ title: '', apy: '', lockPeriod: '', minAmountUsd: '' });
    } catch (error) {
      console.error('Error creating pool:', error);
      alert(error instanceof Error ? error.message : 'Failed to create pool');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundRewards = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      alert('Please enter valid amount');
      return;
    }
    
    setIsLoading(true);
    try {
      await onFundRewards(parseFloat(fundAmount));
      setFundAmount('');
    } catch (error) {
      console.error('Error funding rewards:', error);
      alert(error instanceof Error ? error.message : 'Failed to fund rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBnbPriceFeed = async () => {
    if (!bnbPriceFeedInput) {
      alert('Please enter valid BNB price feed address');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSetBnbPriceFeed(bnbPriceFeedInput);
      setBnbPriceFeedInput('');
    } catch (error) {
      console.error('Error setting BNB price feed:', error);
      alert(error instanceof Error ? error.message : 'Failed to set BNB price feed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !isOwner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md rounded-2xl ui-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#3b82f6]" />
            <h3 className="text-lg font-semibold text-[#e0e0e0]">Admin Panel</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-[#1f1f1f]"
          >
            <svg className="h-5 w-5 text-[#707070]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-[#1f1f1f]">
          <button
            onClick={() => setActiveTab('pools')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'pools'
                ? 'border-b-2 border-[#3b82f6] text-[#3b82f6]'
                : 'text-[#707070] hover:text-[#a0a0a0]'
            }`}
          >
            Pools
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'tokens'
                ? 'border-b-2 border-[#3b82f6] text-[#3b82f6]'
                : 'text-[#707070] hover:text-[#a0a0a0]'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'settings'
                ? 'border-b-2 border-[#3b82f6] text-[#3b82f6]'
                : 'text-[#707070] hover:text-[#a0a0a0]'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Pools Tab */}
        {activeTab === 'pools' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-[#e0e0e0]">Create New Pool</h4>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${stakingActive ? 'text-[#22c55e]' : 'text-[#dc2626]'}`}>
                  {stakingActive ? 'Active' : 'Paused'}
                </span>
                <button
                  onClick={() => onToggleStaking(!stakingActive)}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    stakingActive
                      ? 'border border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10'
                      : 'border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10'
                  }`}
                >
                  {stakingActive ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#a0a0a0]">
                  Pool Title
                </label>
                <input
                  type="text"
                  value={poolForm.title}
                  onChange={(e) => setPoolForm({...poolForm, title: e.target.value})}
                  placeholder="e.g., Flexible Stable Pool"
                  className="w-full rounded-xl ui-inner px-3 py-2.5 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#a0a0a0]">
                    APY (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={poolForm.apy}
                    onChange={(e) => setPoolForm({...poolForm, apy: e.target.value})}
                    placeholder="6.0"
                    className="w-full rounded-xl ui-inner px-3 py-2.5 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#a0a0a0]">
                    Lock Period (days)
                  </label>
                  <input
                    type="number"
                    value={poolForm.lockPeriod}
                    onChange={(e) => setPoolForm({...poolForm, lockPeriod: e.target.value})}
                    placeholder="0 for flexible"
                    className="w-full rounded-xl ui-inner px-3 py-2.5 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#a0a0a0]">
                  Minimum Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={poolForm.minAmountUsd}
                  onChange={(e) => setPoolForm({...poolForm, minAmountUsd: e.target.value})}
                  placeholder="100.00"
                  className="w-full rounded-xl ui-inner px-3 py-2.5 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                  required
                />
                <div className="mt-1 text-xs text-[#707070]">
                  Will be converted to USDT and BNB based on Chainlink price
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg border border-[#3b82f6] bg-[#3b82f6] py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Pool'}
              </button>
            </form>
          </div>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#e0e0e0]">Token Approvals</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-[#1f1f1f] p-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={tokenLogos.USDT}
                      alt="USDT"
                      className="h-6 w-6"
                    />
                    <span className="text-sm font-medium text-[#e0e0e0]">USDT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tokenApprovalStatus.usdt ? (
                      <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#dc2626]" />
                    )}
                    <button
                      onClick={() => onApproveTokens('USDT')}
                      disabled={tokenApprovalStatus.usdt}
                      className={`rounded px-3 py-1 text-xs font-medium ${
                        tokenApprovalStatus.usdt
                          ? 'bg-[#22c55e]/20 text-[#22c55e]'
                          : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
                      }`}
                    >
                      {tokenApprovalStatus.usdt ? 'Approved' : 'Approve'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#1f1f1f] p-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={tokenLogos.RWD}
                      alt="Reward Token"
                      className="h-6 w-6"
                    />
                    <span className="text-sm font-medium text-[#e0e0e0]">Reward Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tokenApprovalStatus.reward ? (
                      <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#dc2626]" />
                    )}
                    <button
                      onClick={() => onApproveTokens('RWD')}
                      disabled={tokenApprovalStatus.reward}
                      className={`rounded px-3 py-1 text-xs font-medium ${
                        tokenApprovalStatus.reward
                          ? 'bg-[#22c55e]/20 text-[#22c55e]'
                          : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
                      }`}
                    >
                      {tokenApprovalStatus.reward ? 'Approved' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#e0e0e0]">Fund Rewards</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Amount in RWD"
                  className="flex-1 rounded-xl ui-inner px-3 py-2.5 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                />
                <button
                  onClick={handleFundRewards}
                  disabled={isLoading || !fundAmount}
                  className="rounded-lg border border-[#3b82f6] bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-50"
                >
                  Fund
                </button>
              </div>
              <div className="text-xs text-[#707070]">
                Contract balance: {rewardTokenBalance.toFixed(2)} RWD
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#e0e0e0]">Chainlink Settings</h4>
              <div className="rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-3">
                <div className="text-sm text-[#3b82f6]">
                  Current BNB Price: ${bnbPrice.toFixed(2)}
                </div>
                <div className="mt-1 text-xs text-[#3b82f6]/80">
                  From Chainlink oracle: {BNB_PRICE_FEED_ADDRESS}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#a0a0a0]">
                  Set New BNB Price Feed Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bnbPriceFeedInput}
                    onChange={(e) => setBnbPriceFeedInput(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 rounded-xl ui-inner px-3 py-2.5 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                  />
                  <button
                    onClick={handleSetBnbPriceFeed}
                    disabled={isLoading || !bnbPriceFeedInput}
                    className="rounded-lg border border-[#3b82f6] bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
                <div className="text-xs text-[#707070]">
                  Current feed: {BNB_PRICE_FEED_ADDRESS.substring(0, 10)}...
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#e0e0e0]">Emergency Actions</h4>
              <div className="rounded-lg border border-[#dc2626]/30 bg-[#dc2626]/10 p-3">
                <p className="text-xs text-[#dc2626]/80">
                  Use only in emergency situations
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onWithdrawTokens('USDT')}
                  className="rounded-lg border border-[#dc2626] bg-[#dc2626]/10 px-3 py-2 text-xs font-medium text-[#dc2626] hover:bg-[#dc2626]/20"
                >
                  Withdraw USDT
                </button>
                <button
                  onClick={() => onWithdrawTokens('RWD')}
                  className="rounded-lg border border-[#dc2626] bg-[#dc2626]/10 px-3 py-2 text-xs font-medium text-[#dc2626] hover:bg-[#dc2626]/20"
                >
                  Withdraw RWD
                </button>
              </div>

              <button
                onClick={onWithdrawBNB}
                className="w-full rounded-lg border border-[#dc2626] bg-[#dc2626]/10 py-2.5 text-sm font-medium text-[#dc2626] hover:bg-[#dc2626]/20"
              >
                Withdraw BNB ({contractBNBBalance.toFixed(4)} BNB)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Круговий таймер
const UnlockCountdownRing = ({
  lockPeriod,
  stakedDate,
  now,
}: {
  lockPeriod: number;
  stakedDate: Date;
  now: Date;
}) => {
  if (lockPeriod === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1f1f1f] ui-inner">
            <Unlock className="h-4 w-4 text-[#22c55e]" />
          </div>
        </div>
        <div className="text-xs">
          <div className="font-semibold text-[#e0e0e0]">No lock period</div>
          <div className="text-[#707070]">Flexible pool • withdraw anytime</div>
        </div>
      </div>
    );
  }

  const endDate = new Date(stakedDate);
  endDate.setDate(endDate.getDate() + lockPeriod);

  const total = lockPeriod * 86400 * 1000;
  const elapsed = Math.min(
    Math.max(now.getTime() - stakedDate.getTime(), 0),
    total
  );
  const progress = total === 0 ? 1 : elapsed / total;

  const canUnstake = now > endDate;
  const daysLeft = canUnstake
    ? 0
    : Math.ceil((endDate.getTime() - now.getTime()) / (86400 * 1000));

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <svg width={48} height={48} className="-rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#050816ba"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={canUnstake ? '#22c55e' : '#3b82f6'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {canUnstake ? (
            <Unlock className="h-4 w-4 text-[#22c55e]" />
          ) : (
            <Lock className="h-4 w-4 text-[#3b82f6]" />
          )}
        </div>
      </div>
      <div className="text-xs">
        <div className="font-semibold text-[#e0e0e0]">
          {canUnstake ? 'Unlocked' : `${daysLeft} days left`}
        </div>
        <div className="text-[#707070]">
          {Math.round(progress * 100)}% of staking period completed
        </div>
      </div>
    </div>
  );
};

const StakingOption = ({
  pool,
  bnbPrice,
  onStake,
  stakingActive,

}: {
  pool: PoolInfo;
  bnbPrice: number;
  onStake: (
    amount: number,
    currency: StakeCurrency,
    poolId: number
  ) => Promise<void>;
  stakingActive: boolean;

}) => {
  const { signer, publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<StakeCurrency>('USDT');
  const [isLoading, setIsLoading] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState<number>(0);
  const [bnbBalance, setBnbBalance] = useState<number>(0);
  const [realMinAmount, setRealMinAmount] = useState<{
    usdt: number;
    bnb: number;
    usd: number;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!signer || !publicKey) return;
      
      try {
        // USDT баланс
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
        const usdtBal = await usdtContract.balanceOf(publicKey);
        setUsdtBalance(formatFromUSDT(usdtBal));
        
        // BNB баланс
        const bnbBal = await signer.provider!.getBalance(publicKey);
        setBnbBalance(formatFromWei(bnbBal));

        // Отримуємо реальні дані пулу з контракта
        const stakingContract = new ethers.Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_ABI,
          signer
        );
        
        try {
          const poolData = await stakingContract.getPool(pool.id);
          const minAmountUsd = formatFromWei(poolData[3]);
          
          setRealMinAmount({
            usd: minAmountUsd,
            usdt: minAmountUsd,
            bnb: usdToBnb(minAmountUsd, bnbPrice),
          });
        } catch (error) {
          console.warn('Could not load real pool data, using defaults');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [signer, publicKey, pool.id, bnbPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakingActive) {
      alert('Staking is currently paused');
      return;
    }
    
    const value = parseFloat(amount);
    
    const minAmount = realMinAmount 
      ? (currency === 'USDT' ? realMinAmount.usdt : realMinAmount.bnb)
      : (currency === 'USDT' ? pool.minAmountUsdt : pool.minAmountBnb);
    
    if (!value || value < minAmount) {
      alert(`Minimum amount is ${minAmount.toFixed(currency === 'USDT' ? 2 : 4)} ${currency}`);
      return;
    }
    
    setIsLoading(true);
    try {
      await onStake(value, currency, pool.id);
      setAmount('');
    } catch (error: any) {
      console.error('Staking error:', error);
      alert(error.reason || error.message || 'Staking failed');
    } finally {
      setIsLoading(false);
    }
  };

  const currentBalance = currency === 'USDT' ? usdtBalance : bnbBalance;
  const minAmount = realMinAmount 
    ? (currency === 'USDT' ? realMinAmount.usdt : realMinAmount.bnb)
    : (currency === 'USDT' ? pool.minAmountUsdt : pool.minAmountBnb);
   
    const { hasPremium, expiresAt } = usePremium();
    const isLocked = pool.id === 0 && !hasPremium;
    // console.log("pool", pool.id, "hasPremium", hasPremium, "locked", isLocked);


  return (
    <div
  className={`relative overflow-hidden rounded-2xl ui-card p-5 space-y-4 ${
    isLocked ? "opacity-60 " : ""
  }`}
>

{isLocked && (
  <div className="border-2  border-yellow-400/15 absolute inset-0 z-20 flex items-center justify-center bg-black/40  rounded-2xl">
    <div className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500/40 to-amber-500/40 px-4 py-3">
      <span className="text-xs font-semibold text-yellow-400">
        Premium Pool • Closed
      </span>
      <span className="text-[11px] text-[#d4b106]">
        Buy premium to unlock
      </span>
<Link
  to="/sub"
  className="mt-1 inline-flex items-center gap-2 rounded-full bg-yellow-500/40 px-4 py-1.5 text-[11px] text-white hover:bg-[#2563eb] transition-all"
>
  Get Premium & win smarter
  <ArrowRight className="w-3 h-3" />
</Link>
      
    </div>
  </div>
)}

{/* {pool.id === 0 && (
  <div className="absolute top-3 right-3 z-30 rounded-full bg-yellow-500/20 px-2 py-1">
    <span className="text-[10px] font-semibold text-yellow-400">
      Premium
    </span>
  </div>
)} */}

      <div className="pointer-events-none absolute -inset-4 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)] opacity-10" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#e0e0e0]">{pool.title}</h3>
            <p className="mt-1 text-[11px] text-[#707070] w-[200px]">
              Choose token, enter amount and lock period to start earning.
            </p>
          </div>
          <div className="rounded-full border border-[#1f1f1f]/20 bg-[#3b82f6]/15 px-2 py-1">
            <span className="text-xs font-semibold text-[#3b82f6]">
              {pool.apy}% APR
            </span>
          </div>
        </div>

        {/* Token selector */}
        <div className="flex gap-2">
          {(['USDT', 'BNB'] as const).map((token) => {
            const active = currency === token;
            const balance = token === 'USDT' ? usdtBalance : bnbBalance;
            const minAmountForToken = realMinAmount 
              ? (token === 'USDT' ? realMinAmount.usdt : realMinAmount.bnb)
              : (token === 'USDT' ? pool.minAmountUsdt : pool.minAmountBnb);
            
            return (
              <button
                key={token}
                type="button"
                onClick={() => setCurrency(token)}
                className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-all ${
                  active
                    ? 'border-[#3b82f6] bg-[#9cc0ff]/10 hover:border-[#3b82f6]/50'
                    : 'border-[#1f1f1f]/10 ui-inner hover:border-[#3b82f6]/50'
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full">
                  <img
                    src={tokenLogos[token]}
                    alt={token}
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#e0e0e0]">{token}</div>
                  <div className="text-[10px] text-[#707070]">
                    Min: {minAmountForToken.toFixed(token === 'USDT' ? 2 : 4)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#707070]">Lock period</span>
            <span className="font-medium text-[#e0e0e0]">
              {pool.lockPeriod === 0 ? 'No lock' : `${pool.lockPeriod} days`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#707070]">Minimum ({currency})</span>
            <span className="font-medium text-[#e0e0e0]">
              {minAmount.toFixed(currency === 'USDT' ? 2 : 4)} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#707070]">Minimum (USD)</span>
            <span className="font-medium text-[#e0e0e0]">
              ${(realMinAmount?.usd || pool.minAmountUsd).toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[#a0a0a0]">
              Amount to stake ({currency})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minAmount}
                max={currentBalance}
                placeholder={`Min: ${minAmount.toFixed(currency === 'USDT' ? 2 : 4)}`}
                className="w-full rounded-xl ui-inner px-3 py-3 font-semibold text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs text-[#707070]">{currency}</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-[#707070]">
              Available: {currentBalance.toFixed(currency === 'USDT' ? 2 : 4)} {currency}
              {amount && parseFloat(amount) > currentBalance && (
                <span className="ml-2 text-red-500">Insufficient balance</span>
              )}
              {amount && parseFloat(amount) < minAmount && (
                <span className="ml-2 text-red-500">
                  Below minimum ({minAmount.toFixed(currency === 'USDT' ? 2 : 4)} {currency})
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !amount || 
              parseFloat(amount) < minAmount || 
              isLoading || 
              parseFloat(amount) > currentBalance ||
              !stakingActive
            }
            className={`flex w-full items-center justify-center rounded-lg py-3 text-xs font-medium transition-all ${
              !amount || 
              parseFloat(amount) < minAmount || 
              isLoading || 
              parseFloat(amount) > currentBalance ||
              !stakingActive
                ? 'cursor-not-allowed ui-inner text-[#707070]'
                : 'border border-[#3b82f6]/70 bg-[#3b82f6] text-white hover:bg-[#2563eb]'
            }`}
          >
            {isLoading ? (
              'Processing...'
            ) : !stakingActive ? (
              'Staking Paused'
            ) : (
              <>
                Stake {currency}
                <ArrowRight className="ml-1.5 h-3 w-3" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

type StakedItemData = {
  stakeId: number;
  title: string;
  amount: number;
  apy: number;
  lockPeriod: number;
  stakedDate: Date;
  currency: StakeCurrency;
  rewards: number;
  canUnstake: boolean;
};

const StakedItem = ({
  item,
  onUnstake,
  onClaim,
  airdropMultiplier,
}: {
  item: StakedItemData;
  onUnstake: (stakeId: number) => Promise<void>;
  onClaim: (stakeId: number) => Promise<void>;
  airdropMultiplier: number;
}) => {
  const { stakeId, title, amount, apy, lockPeriod, stakedDate, currency, rewards, canUnstake } = item;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUnstake = async () => {
    if (!canUnstake) return;
    setIsProcessing(true);
    try {
      await onUnstake(stakeId);
    } catch (error: any) {
      alert(error.reason || error.message || 'Unstaking failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaim = async () => {
    if (rewards <= 0) return;
    setIsProcessing(true);
    try {
      await onClaim(stakeId);
    } catch (error: any) {
      alert(error.reason || error.message || 'Claiming rewards failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl ui-card backdrop-blur-sm p-5 space-y-4">
      <div className="pointer-events-none absolute -inset-0.5 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)] opacity-10" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="absolute flex -ml-24 mt-2 h-48 w-48 items-center justify-center rounded-full">
              <img
                src={tokenLogos[currency]}
                alt={currency}
                className="h-48 w-48 opacity-10 object-contain"
              />
            </div>
           

            <div>
              <h3 className="text-sm font-semibold text-[#e0e0e0]">
                {title}
              </h3>
              <div className="text-[10px] text-[#707070]">
                {currency} staking position
              </div>
            </div>
          </div>
          <div className="rounded-full border border-[#1f1f1f]/20 bg-[#3b82f6]/15 px-2 py-1">
            <span className="text-xs font-semibold text-[#3b82f6]">
              {apy}% APR
            </span>
          </div>
        </div>

        <UnlockCountdownRing
          lockPeriod={lockPeriod}
          stakedDate={stakedDate}
          now={new Date()}
        />

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#707070]">Staked amount</span>
            <span className="font-medium text-[#e0e0e0]">
              {amount.toLocaleString(undefined, {
                minimumFractionDigits: currency === 'USDT' ? 2 : 4,
                maximumFractionDigits: currency === 'USDT' ? 2 : 6,
              })} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#707070]">Pending rewards</span>
            <span className="font-medium text-[#3b82f6]">
              +{rewards.toFixed(4)} RWD
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#707070]">Airdrop boost</span>
            <span className="font-medium text-[#e0e0e0]">
              ×{airdropMultiplier}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {rewards > 0 && (
            <button
              onClick={handleClaim}
              disabled={isProcessing}
              className="flex w-full items-center justify-center rounded-lg py-2 text-xs font-medium text-[#facc15] transition-all hover:bg-[#0b1120] border border-[#facc15]/30"
            >
              {isProcessing ? 'Processing...' : `Claim ${rewards.toFixed(4)} RWD`}
            </button>
          )}

          <button
            onClick={handleUnstake}
            disabled={!canUnstake || isProcessing}
            className={`flex w-full items-center justify-center rounded-lg py-3 text-xs font-medium transition-all ${
              !canUnstake
                ? 'cursor-not-allowed border border-[#1f1f1f] bg-[#0b0b0b] text-[#707070]'
                : 'border border-[#3b82f6]/70 bg-[#3b82f6] text-white hover:bg-[#2563eb]'
            }`}
          >
            {isProcessing ? (
              'Processing...'
            ) : canUnstake ? (
              <>
                <Unlock className="mr-2 h-3 w-3" />
                Unstake
              </>
            ) : (
              <>
                <Lock className="mr-2 h-3 w-3" />
                Locked
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const TransactionHistoryModal = ({
  isOpen,
  onClose,
  transactions,
  bnbPrice,
}: {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionHistory[];
  bnbPrice: number;
}) => {
  if (!isOpen) return null;

  const getTransactionColor = (action: string) => {
    switch (action) {
      case 'Stake': return 'text-blue-500';
      case 'Unstake': return 'text-green-500';
      case 'Claim': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatTransactionAmount = (tx: TransactionHistory) => {
    if (tx.action === 'Claim') {
      return `${tx.amount.toFixed(4)} RWD`;
    }
    return `${tx.amount.toLocaleString(undefined, {
      minimumFractionDigits: tx.isBNB ? 4 : 2,
      maximumFractionDigits: tx.isBNB ? 6 : 2,
    })} ${tx.isBNB ? 'BNB' : 'USDT'}`;
  };

  const formatTransactionUsdValue = (tx: TransactionHistory) => {
    if (tx.action === 'Claim') {
      const usdValue = tx.amount * 0.23; // RWD price = $0.23
      return `≈ $${usdValue.toFixed(2)}`;
    }
    const usdValue = tx.isBNB ? tx.amount * bnbPrice : tx.amount;
    return `≈ $${usdValue.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-2xl rounded-2xl ui-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#3b82f6]" />
            <h3 className="text-lg font-semibold text-[#e0e0e0]">Transaction History</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-[#1f1f1f]"
          >
            <svg className="h-5 w-5 text-[#707070]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#707070]">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="rounded-lg border border-[#1f1f1f] p-4 hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getTransactionColor(tx.action)}`}>
                        {tx.action}
                      </span>
                      {tx.poolId >= 0 && tx.action !== 'Claim' && (
                        <span className="text-xs text-[#707070]">Pool #{tx.poolId}</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-[#707070]">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      {formatTransactionAmount(tx)}
                    </div>
                    <div className="mt-1 text-xs text-[#707070]">
                      {formatTransactionUsdValue(tx)}
                    </div>
                  </div>
                </div>
                {tx.txHash && (
                  <a
                    href={`https://bscscan.com/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-xs text-[#3b82f6] hover:text-[#2563eb]"
                  >
                    View on BscScan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export function Staking() {
  const { connected, provider, signer, publicKey } = useWallet();
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stakedItems, setStakedItems] = useState<StakedItemData[]>([]);
  const [stakingOptions, setStakingOptions] = useState<PoolInfo[]>(DEMO_POOLS);
  const [bnbPrice, setBnbPrice] = useState<number>(300);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string>('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [stakingActive, setStakingActive] = useState(true);
  const [tokenApprovalStatus, setTokenApprovalStatus] = useState<TokenApprovalStatus>({
    usdt: false,
    reward: false,
  });
  const [rewardTokenBalance, setRewardTokenBalance] = useState<number>(0);
  const [contractBNBBalance, setContractBNBBalance] = useState<number>(0);
  const [claimedRewards, setClaimedRewards] = useState<number>(0);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [recentTxHashes, setRecentTxHashes] = useState<{[key: string]: string}>({});
  
  const isInitialLoad = useRef(true);
  const lastLoadTime = useRef(0);

  // Таймер для оновлення часу
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Перевірка чи користувач є власником контракта
  const checkIfOwner = useCallback(async () => {
    if (!signer || !publicKey) return false;
    
    try {
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        signer
      );
      
      const ownerAddress = await contract.owner();
      const isUserOwner = ownerAddress.toLowerCase() === publicKey.toLowerCase();
      setIsOwner(isUserOwner);
      return isUserOwner;
    } catch (error) {
      console.error('Error checking owner:', error);
      return false;
    }
  }, [signer, publicKey]);

  // Перевірка стану стейкінгу
  const checkStakingStatus = useCallback(async () => {
    if (!provider) return;
    
    try {
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        provider
      );
      
      const status = await contract.stakingActive();
      setStakingActive(status);
    } catch (error) {
      console.error('Error checking staking status:', error);
    }
  }, [provider]);

  // Получение цены BNB из контракта (Chainlink)
  const getBnbPriceFromContract = useCallback(async () => {
    if (!provider) return 300;
    
    try {
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        provider
      );
      
      const bnbPriceWei = await contract.getBnbPrice();
      const price = formatFromWei(bnbPriceWei);
      setBnbPrice(price);
      return price;
    } catch (error) {
      console.error('Error getting BNB price from Chainlink, using fallback:', error);
      setBnbPrice(300);
      return 300;
    }
  }, [provider]);

  // Получение заклейменных наград
  const getClaimedRewards = useCallback(async () => {
    if (!provider || !publicKey) return;
    
    try {
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        provider
      );
      
      const claimed = await contract.getClaimedRewards(publicKey);
      setClaimedRewards(formatFromWei(claimed));
    } catch (error) {
      console.error('Error getting claimed rewards:', error);
    }
  }, [provider, publicKey]);

  // Получение истории транзакций с контракта
  const getTransactionHistoryFromContract = useCallback(async () => {
    if (!provider || !publicKey) return;
    
    try {
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        provider
      );
      
      const txCount = await contract.getUserTransactionsCount(publicKey);
      const count = Number(txCount);
      
      const transactions: TransactionHistory[] = [];
      
      // Получаем последние 20 транзакций
      for (let i = Math.max(0, count - 20); i < count; i++) {
        try {
          const tx = await contract.getUserTransaction(publicKey, i);
          
          // Форматируем amount в зависимости от типа транзакции
          let amount: number;
          if (tx.action === "Claim") {
            // Для Claim: amount уже в правильном формате (18 decimals для reward токена)
            amount = formatFromWei(tx.amount); // 18 decimals
          } else {
            // Для Stake/Unstake: разный формат для BNB и USDT
            amount = tx.isBNB 
              ? formatFromWei(tx.amount, 18) // BNB: 18 decimals
              : formatFromUSDT(tx.amount);   // USDT: 6 decimals
          }
          
          // Добавляем txHash из локального хранилища
          const txKey = `${tx.action}_${tx.timestamp}_${amount}`;
          const txHash = recentTxHashes[txKey] || '';
          
          transactions.push({
            timestamp: Number(tx.timestamp),
            action: tx.action,
            amount: amount,
            isBNB: tx.isBNB,
            poolId: Number(tx.poolId),
            txHash: txHash,
          });
        } catch (error) {
          console.error(`Error loading transaction ${i}:`, error);
        }
      }
      
      setTransactionHistory(transactions.reverse()); // Новые сверху
    } catch (error) {
      console.error('Error loading transaction history from contract:', error);
    }
  }, [provider, publicKey, recentTxHashes]);

  // Сохраняем txHash после успешной транзакции
  const saveTxHash = useCallback((action: string, amount: number, txHash: string) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const txKey = `${action}_${timestamp}_${amount}`;
    
    setRecentTxHashes(prev => ({
      ...prev,
      [txKey]: txHash
    }));
    
    // Сохраняем в localStorage для persistence
    try {
      const saved = JSON.parse(localStorage.getItem('recentTxHashes') || '{}');
      saved[txKey] = txHash;
      localStorage.setItem('recentTxHashes', JSON.stringify(saved));
    } catch (error) {
      console.error('Error saving tx hash to localStorage:', error);
    }
  }, []);

  // Загружаем сохраненные txHashes из localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentTxHashes') || '{}');
      setRecentTxHashes(saved);
    } catch (error) {
      console.error('Error loading tx hashes from localStorage:', error);
    }
  }, []);

  // Перевірка апрувів токенів
  const checkTokenApprovals = useCallback(async () => {
    if (!signer || !publicKey) return;
    
    try {
      // Перевірка USDT апрува
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const usdtAllowance = await usdtContract.allowance(publicKey, STAKING_CONTRACT_ADDRESS);
      const usdtApproved = usdtAllowance > ethers.parseUnits("1000000", 6);
      
      // Перевірка Reward Token апрува
      const rewardContract = new ethers.Contract(REWARD_TOKEN_ADDRESS, REWARD_TOKEN_ABI, signer);
      const rewardAllowance = await rewardContract.allowance(publicKey, STAKING_CONTRACT_ADDRESS);
      const rewardApproved = rewardAllowance > ethers.parseUnits("1000000", 18);
      
      setTokenApprovalStatus({
        usdt: usdtApproved,
        reward: rewardApproved,
      });
    } catch (error) {
      console.error('Error checking token approvals:', error);
    }
  }, [signer, publicKey]);

  // Перевірка балансів контракта
  const checkContractBalances = useCallback(async () => {
    if (!provider) return;
    
    try {
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        provider
      );
      
      const rewardBalance = await contract.getRewardTokenBalance();
      setRewardTokenBalance(formatFromWei(rewardBalance));
      
      const bnbBalance = await provider.getBalance(STAKING_CONTRACT_ADDRESS);
      setContractBNBBalance(formatFromWei(bnbBalance));
    } catch (error) {
      console.error('Error checking contract balances:', error);
    }
  }, [provider]);

  // Безпечне отримання даних пулу
  const safeGetPool = useCallback(async (contract: ethers.Contract, poolId: number, currentBnbPrice: number) => {
    try {
      const pool = await contract.getPool(poolId);
      
      let title = '';
      try {
        title = pool[0] || `Pool ${poolId}`;
      } catch (e) {
        console.warn(`Error parsing title for pool ${poolId}:`, e);
        title = `Pool ${poolId}`;
      }
      
      const apy = Number(pool[1] || 10);
      const lockPeriod = Number(pool[2] || 0);
      const minAmountWei = pool[3];
      const minAmountUsd = formatFromWei(minAmountWei);
      
      return {
        id: poolId,
        title,
        apy,
        lockPeriod,
        minAmountUsd,
        minAmountUsdt: minAmountUsd,
        minAmountBnb: usdToBnb(minAmountUsd, currentBnbPrice || 300),
      };
    } catch (error) {
      console.error(`Error loading pool ${poolId}:`, error);
      return DEMO_POOLS[poolId] || DEMO_POOLS[0];
    }
  }, []);

  // Завантаження даних з контракта
  const loadContractData = useCallback(async (forceRefresh = false) => {
    const nowTime = Date.now();
    if (!forceRefresh && nowTime - lastLoadTime.current < 5000) {
      return;
    }
    
    if (!provider || !publicKey) {
      console.log('No provider or publicKey');
      return;
    }

    if (isInitialLoad.current) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);
    
    try {
      console.log('Loading contract data...');
      lastLoadTime.current = nowTime;

      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        provider
      );

      console.log('Contract instance created');
      
      // Завантажити ціну BNB з Chainlink
      const contractBnbPrice = await getBnbPriceFromContract();
      
      // Завантажити пули
      try {
        const poolsCount = await contract.getPoolsCount();
        const poolsCountNum = Number(poolsCount);
        console.log('Pools count from contract:', poolsCountNum);
        
        if (poolsCountNum > 0) {
          const pools: PoolInfo[] = [];
          
          const poolPromises = [];
          for (let i = 0; i < poolsCountNum; i++) {
            poolPromises.push(safeGetPool(contract, i, contractBnbPrice || 300));
          }
          
          const loadedPools = await Promise.all(poolPromises);
          pools.push(...loadedPools.filter(p => p !== null));
          
          setStakingOptions(pools);
          console.log('Real pools loaded:', pools.length);
          
          if (isOwner) {
            setInfo(`Loaded ${pools.length} pool(s) from contract`);
          }
        } else {
          console.log('No pools in contract, using demo pools');
          setStakingOptions(DEMO_POOLS);
          if (isOwner) {
            setInfo('No pools found in contract. Using demo pools.');
          }
        }
      } catch (err: any) {
        console.error('Cannot load pools from contract:', err);
        setStakingOptions(DEMO_POOLS);
        if (isOwner) {
          setInfo('Demo mode: Unable to load pools from contract');
        }
      }

      // Завантажити стейки користувача
      try {
        const stakesCount = await contract.getUserStakesCount(publicKey);
        const stakesCountNum = Number(stakesCount);
        console.log('User stakes count:', stakesCountNum);
        
        const stakes: StakedItemData[] = [];

        for (let i = 0; i < stakesCountNum; i++) {
          try {
            const stake = await contract.getStake(publicKey, i);
            
            const rewardsWei = await contract.calculateRewards(publicKey, i);
            const rewards = formatFromWei(rewardsWei);
            
            const stakedDate = new Date(Number(stake.stakeTime) * 1000);
            
            const poolId = Number(stake.poolId);
            const pool = stakingOptions[poolId] || DEMO_POOLS[poolId] || DEMO_POOLS[0];
            const endDate = new Date(stakedDate);
            endDate.setDate(endDate.getDate() + pool.lockPeriod);
            
            stakes.push({
              stakeId: i,
              title: pool.title,
              amount: stake.isBNB 
                ? formatFromWei(stake.amount, 18)
                : formatFromUSDT(stake.amount),
              apy: pool.apy,
              lockPeriod: pool.lockPeriod,
              stakedDate,
              currency: stake.isBNB ? 'BNB' : 'USDT',
              rewards,
              canUnstake: new Date().getTime() > endDate.getTime() || pool.lockPeriod === 0,
            });
          } catch (error) {
            console.error(`Error loading stake ${i}:`, error);
          }
        }

        setStakedItems(stakes);
        console.log('Staked items loaded:', stakes.length);
      } catch (err) {
        console.log('Cannot load user stakes from contract');
      }

      // Завантажити додаткові дані
      await Promise.all([
        getClaimedRewards(),
        getTransactionHistoryFromContract(),
      ]);

      // Перевіряємо чи користувач є власником
      if (signer) {
        const isUserOwner = await checkIfOwner();
        if (isUserOwner) {
          await Promise.all([
            checkStakingStatus(),
            checkTokenApprovals(),
            checkContractBalances(),
          ]);
        }
      }

    } catch (error: any) {
      console.error('Error loading contract data:', error);
      setError(error.message || 'Failed to load contract data');
      if (isOwner) {
        setInfo('Demo mode: Error loading contract data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isInitialLoad.current = false;
    }
  }, [
    provider, publicKey, stakingOptions, safeGetPool, getBnbPriceFromContract, 
    checkIfOwner, checkStakingStatus, checkTokenApprovals, checkContractBalances,
    getClaimedRewards, getTransactionHistoryFromContract, isOwner, now
  ]);

  // Основний useEffect для завантаження даних
  useEffect(() => {
    console.log('Connected:', connected, 'Provider:', !!provider, 'PublicKey:', !!publicKey);
    
    if (connected && provider && publicKey) {
      loadContractData(true);
    } else {
      setStakedItems([]);
      setStakingOptions(DEMO_POOLS);
      setIsOwner(false);
      setInfo('');
      setClaimedRewards(0);
      setTransactionHistory([]);
    }
  }, [connected, provider, publicKey]);

  // Оновлення даних кожні 30 секунд
  useEffect(() => {
    if (!connected || !provider || !publicKey) return;
    
    const intervalId = setInterval(() => {
      loadContractData(false);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [connected, provider, publicKey, loadContractData]);

  // ================== АДМИН ФУНКЦИИ ==================

  const handleApproveTokens = async (token: 'USDT' | 'RWD') => {
    if (!signer) throw new Error('No signer available');

    try {
      let tokenContract;
      
      if (token === 'USDT') {
        tokenContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      } else {
        tokenContract = new ethers.Contract(REWARD_TOKEN_ADDRESS, REWARD_TOKEN_ABI, signer);
      }
      
      const maxAmount = ethers.MaxUint256;
      const tx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, maxAmount);
      await tx.wait();
      
      await checkTokenApprovals();
      
    } catch (error: any) {
      console.error('Error approving tokens:', error);
      throw new Error(error.reason || error.message || 'Approval failed');
    }
  };

  const handleToggleStaking = async (status: boolean) => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      const tx = await contract.toggleStaking(status);
      await tx.wait();
      
      await checkStakingStatus();
      
    } catch (error: any) {
      console.error('Error toggling staking:', error);
      throw new Error(error.reason || error.message || 'Failed to toggle staking');
    }
  };

  const handleFundRewards = async (amount: number) => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    const rewardContract = new ethers.Contract(REWARD_TOKEN_ADDRESS, REWARD_TOKEN_ABI, signer);

    try {
      const amountWei = ethers.parseEther(amount.toString());
      
      const allowance = await rewardContract.allowance(await signer.getAddress(), STAKING_CONTRACT_ADDRESS);
      
      if (allowance < amountWei) {
        const approveTx = await rewardContract.approve(STAKING_CONTRACT_ADDRESS, amountWei);
        await approveTx.wait();
      }
      
      const tx = await contract.fundRewards(amountWei);
      await tx.wait();
      
      await checkContractBalances();
      
    } catch (error: any) {
      console.error('Error funding rewards:', error);
      throw new Error(error.reason || error.message || 'Failed to fund rewards');
    }
  };

  const handleWithdrawTokens = async (token: 'USDT' | 'RWD') => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      const tokenAddress = token === 'USDT' ? USDT_ADDRESS : REWARD_TOKEN_ADDRESS;
      const tx = await contract.emergencyWithdraw(tokenAddress, await signer.getAddress());
      await tx.wait();
      
      await checkContractBalances();
      
    } catch (error: any) {
      console.error('Error withdrawing tokens:', error);
      throw new Error(error.reason || error.message || 'Failed to withdraw tokens');
    }
  };

  const handleWithdrawBNB = async () => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      const tx = await contract.emergencyWithdrawBNB(await signer.getAddress());
      await tx.wait();
      
      await checkContractBalances();
      
    } catch (error: any) {
      console.error('Error withdrawing BNB:', error);
      throw new Error(error.reason || error.message || 'Failed to withdraw BNB');
    }
  };

  const handleCreatePool = async (data: AdminPoolFormData) => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      const minAmountWei = ethers.parseEther(data.minAmountUsd);
      
      console.log(`Creating pool: ${data.title}, APY: ${data.apy}%, Lock: ${data.lockPeriod} days, Min: ${data.minAmountUsd} USD`);
      
      const tx = await contract.addPool(
        data.title,
        parseFloat(data.apy),
        parseInt(data.lockPeriod),
        minAmountWei
      );
      
      // Сохраняем tx hash
      saveTxHash('CreatePool', parseFloat(data.minAmountUsd), tx.hash);
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Pool created successfully!');
      
      await loadContractData(true);
      
    } catch (error: any) {
      console.error('Error creating pool:', error);
      throw new Error(error.reason || error.message || 'Failed to create pool');
    }
  };

  const handleSetBnbPriceFeed = async (feedAddress: string) => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      const tx = await contract.setBnbPriceFeed(feedAddress);
      await tx.wait();
      
      // Обновляем цену BNB
      await getBnbPriceFromContract();
      
    } catch (error: any) {
      console.error('Error setting BNB price feed:', error);
      throw new Error(error.reason || error.message || 'Failed to set BNB price feed');
    }
  };

  // ================== ПОЛЬЗОВАТЕЛЬСКИЕ ФУНКЦИИ ==================

  const handleStake = async (amount: number, currency: StakeCurrency, poolId: number) => {
    if (!signer || !publicKey) throw new Error('No signer available');
    if (!stakingActive) throw new Error('Staking is currently paused');

    if (poolId >= stakingOptions.length) {
      throw new Error(`Pool ${poolId} does not exist. Available pools: 0 to ${stakingOptions.length - 1}`);
    }

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      if (currency === 'USDT') {
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
        const amountWei = toUSDT(amount);
        
        console.log(`Staking ${amount} USDT to pool ${poolId}`);
        
        const allowance = await usdtContract.allowance(publicKey, STAKING_CONTRACT_ADDRESS);
        
        if (allowance < amountWei) {
          console.log('Approving USDT...');
          const approveTx = await usdtContract.approve(STAKING_CONTRACT_ADDRESS, amountWei);
          await approveTx.wait();
          console.log('USDT approved!');
        }
        
        console.log('Staking USDT...');
        const tx = await contract.stakeUSDT(poolId, amountWei);
        
        // Сохраняем tx hash
        saveTxHash('Stake', amount, tx.hash);
        
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('USDT staked successfully!');
      } else {
        const amountWei = toBNB(amount);
        console.log(`Staking ${amount} BNB to pool ${poolId}`);
        
        const tx = await contract.stakeBNB(poolId, { value: amountWei });
        
        // Сохраняем tx hash
        saveTxHash('Stake', amount, tx.hash);
        
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('BNB staked successfully!');
      }

      await loadContractData(true);
    } catch (error: any) {
      console.error('Staking failed:', error);
      throw new Error(error.reason || error.message || 'Staking failed');
    }
  };

  const handleUnstake = async (stakeId: number) => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      console.log('Unstaking stake ID:', stakeId);
      const tx = await contract.unstake(stakeId);
      
      // Сохраняем tx hash
      saveTxHash('Unstake', stakeId, tx.hash);
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Unstaked successfully!');
      
      await loadContractData(true);
    } catch (error: any) {
      console.error('Unstaking failed:', error);
      throw new Error(error.reason || error.message || 'Unstaking failed');
    }
  };

  const handleClaim = async (stakeId: number) => {
    if (!signer) throw new Error('No signer available');

    const contract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      signer
    );

    try {
      console.log('Claiming rewards for stake ID:', stakeId);
      const tx = await contract.claimRewards(stakeId);
      
      // Получаем количество наград для сохранения
      const rewards = await contract.calculateRewards(await signer.getAddress(), stakeId);
      const rewardsAmount = formatFromWei(rewards);
      
      // Сохраняем tx hash
      saveTxHash('Claim', rewardsAmount, tx.hash);
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Rewards claimed successfully!');
      
      await loadContractData(true);
    } catch (error: any) {
      console.error('Claiming rewards failed:', error);
      throw new Error(error.reason || error.message || 'Claiming rewards failed');
    }
  };

  // ================== РАСЧЕТЫ ==================

  const calculateTotalStakedUsd = () => {
    return stakedItems.reduce((total, item) => {
      if (item.currency === 'USDT') return total + item.amount;
      return total + (item.amount * bnbPrice);
    }, 0);
  };

  const calculateTotalRewardsUsd = () => {
    return stakedItems.reduce((total, item) => {
      return total + (item.rewards * 0.23); // RWD price = $0.23
    }, 0);
  };

  const totalStakedUsd = calculateTotalStakedUsd();
  const totalRewardsUsd = calculateTotalRewardsUsd();
  
  const totalUSDT = stakedItems
    .filter(i => i.currency === 'USDT')
    .reduce((t, i) => t + i.amount, 0);
  
  const totalBNB = stakedItems
    .filter(i => i.currency === 'BNB')
    .reduce((t, i) => t + i.amount, 0);

  const getAirdropMultiplier = (total: number) => {
    if (total >= 100_000) return 8;
    if (total >= 50_000) return 4;
    if (total >= 10_000) return 2;
    if (total > 0) return 1;
    return 0;
  };

  const airdropMultiplier = getAirdropMultiplier(totalStakedUsd);

  return (
    <div className="space-y-6">
      {/* Header з кнопками */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#e0e0e0]">
            USDT & BNB Staking
          </h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">
            Stake stablecoins and BNB into curated pools to earn yield,
            boost airdrops and support the ecosystem.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 rounded-lg border border-[#3b82f6] bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb]"
          >
            <History className="h-4 w-4" />
            History
          </button>
          {isOwner && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-2 rounded-lg border border-[#3b82f6] bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb]"
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Інформаційні повідомлення */}
      {isOwner && info && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-start">
            <AlertCircle className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <div>
              <h3 className="text-xs font-medium text-blue-500">
                Admin Info
              </h3>
              <p className="mt-1 text-xs text-blue-400/80">
                {info}
                {!stakingActive && (
                  <span className="ml-2 font-semibold">• Staking is PAUSED</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start">
            <AlertCircle className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <div>
              <h3 className="text-xs font-medium text-red-500">
                Error Loading Data
              </h3>
              <p className="mt-1 text-xs text-red-400/80">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview + stats */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50">
            <div className="flex items-center gap-2 rounded-lg bg-[#121212] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-[#3b82f6]" />
              <span className="text-sm text-[#e0e0e0]">Loading staking data...</span>
            </div>
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          {/* Main overview card */}
          <div className="relative overflow-hidden rounded-2xl ui-card backdrop-blur-sm p-5 space-y-4">
            <div className="pointer-events-none absolute -inset-0.5 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)] opacity-10" />
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs text-[#707070]">Portfolio overview</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-[#e0e0e0]">Staked:</span>
                  {formatCurrency(totalStakedUsd, 'USD')}
                </div>
                <div className="mt-1 text-xs text-[#a0a0a0]">
                  USDT: {totalUSDT.toLocaleString(undefined, { minimumFractionDigits: 2 })} • BNB:{' '}
                  {totalBNB.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}
                </div>
                <div className="mt-1 text-xs text-[#a0a0a0]">
                  Claimed rewards: {claimedRewards.toFixed(4)} RWD
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-[#050816] px-2.5 py-1 text-[#a0a0a0]">
                    Positions: {stakedItems.length}
                  </span>
                  <span className="rounded-full bg-[#050816] px-2.5 py-1 text-[#a0a0a0]">
                    Airdrop boost ×{airdropMultiplier}
                  </span>
                  <span className="rounded-full bg-[#050816] px-2.5 py-1 text-[#a0a0a0]">
                    BNB: ${bnbPrice.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-[#050816] px-2.5 py-1 text-[#a0a0a0]">
                    Transactions: {transactionHistory.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-[#707070]">Pending rewards</div>
                <div className="flex items-center gap-2 text-lg font-semibold text-[#3b82f6]">
                  <TrendingUp className="h-5 w-5" />
                  {formatCurrency(totalRewardsUsd, 'USD')}
                </div>
                <div className="text-[10px] text-[#707070]">
                  RWD = $0.23 • BNB from Chainlink
                </div>
              </div>
            </div>
          </div>

          {/* Small stats cards */}
          <div className="grid grid-cols-2 h-24 gap-3">
            <div className="relative overflow-hidden rounded-2xl ui-card backdrop-blur-sm p-4 space-y-1">
              <div className="pointer-events-none absolute -inset-0.5 opacity-10" />
              <div className="relative z-10">
                <DollarSign className="absolute right-0 h-24 w-24 opacity-10 text-[#3b82f6]" />
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  {formatCurrencySmall(totalStakedUsd, 'USD')}
                </div>
                <div className="text-xs text-[#707070]">
                  Total value locked in pools
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl ui-card backdrop-blur-sm p-4 space-y-1">
              <div className="pointer-events-none absolute -inset-0.5 bg-[radial-gradient(circle_at_top,_#facc15_0,_transparent_70%)] opacity-10" />
              <div className="relative z-10">
                <Sparkles className="absolute right-0 h-24 w-24 opacity-10 text-[#facc15]" />
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  ×{airdropMultiplier}
                </div>
                <div className="text-xs text-[#707070]">
                  Current airdrop multiplier tier
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!connected && (
        <div className="rounded-2xl border border-[#1f1f1f] bg-[#121212] p-4">
          <div className="flex">
            <AlertCircle className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-[#a0a0a0]" />
            <div>
              <h3 className="text-xs font-medium text-[#e0e0e0]">
                Wallet not connected
              </h3>
              <p className="mt-1 text-xs text-[#707070]">
                Connect your wallet to start staking USDT and BNB.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning if staking is paused */}
      {connected && !stakingActive && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex">
            <AlertCircle className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
            <div>
              <h3 className="text-xs font-medium text-yellow-500">
                Staking is Paused
              </h3>
              <p className="mt-1 text-xs text-yellow-400/80">
                New stakes are currently disabled. You can still claim rewards and unstake.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Your staked positions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#e0e0e0]">
            Your staked positions
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-[#707070]">
            <Clock className="h-3.5 w-3.5" />
            Updated in real time
            {isRefreshing && (
              <Loader2 className="h-3 w-3 animate-spin text-[#3b82f6]" />
            )}
          </div>
        </div>

        {stakedItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stakedItems.map((item) => (
              <StakedItem
                key={item.stakeId}
                item={item}
                onUnstake={handleUnstake}
                onClaim={handleClaim}
                airdropMultiplier={airdropMultiplier || 1}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl ui-inner p-6 text-center">
            <p className="text-sm text-[#707070]">
              {connected 
                ? "You have no active USDT or BNB stakes yet." 
                : "Connect your wallet to view your staked positions."}
            </p>
          </div>
        )}
      </div>
      

      {/* Staking pools */}
      {connected && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#e0e0e0]">
              Staking pools
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#707070]">
              {stakingOptions.length} pool(s) available
              {isRefreshing && (
                <Loader2 className="h-3 w-3 animate-spin text-[#3b82f6]" />
              )}
            </div>
          </div>
          
          {stakingOptions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
              {stakingOptions.map((pool) => (
                <div key={pool.id} className="flex flex-col gap-2">
                  <StakingOption
                    pool={pool}
                    bnbPrice={bnbPrice}
                    onStake={handleStake}
                    stakingActive={stakingActive}
                  />
                  <p className="px-1 text-xs text-[#707070]">
                    {pool.lockPeriod === 0 
                      ? 'Flexible pool with no lock period' 
                      : `${pool.lockPeriod}-day lock with boosted APR`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl ui-inner p-6 text-center">
              <p className="text-sm text-[#707070]">
                No staking pools available.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Модалка адмін панелі */}
      <AdminModal
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        isOwner={isOwner}
        tokenApprovalStatus={tokenApprovalStatus}
        onApproveTokens={handleApproveTokens}
        onToggleStaking={handleToggleStaking}
        stakingActive={stakingActive}
        onFundRewards={handleFundRewards}
        onWithdrawTokens={handleWithdrawTokens}
        onWithdrawBNB={handleWithdrawBNB}
        onCreatePool={handleCreatePool}
        rewardTokenBalance={rewardTokenBalance}
        contractBNBBalance={contractBNBBalance}
        bnbPrice={bnbPrice}
        onSetBnbPriceFeed={handleSetBnbPriceFeed}
      />

      {/* Модалка истории транзакций */}
      <TransactionHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        transactions={transactionHistory}
        bnbPrice={bnbPrice}
      />
    </div>
  );
}

export default Staking;