import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { usePremium } from "../context/PremiumContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PremiumFeaturesSection from "../components/PremiumFeaturesSection";
import {
  Crown,
  Stars,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Coins,
  Loader2,
  Settings,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  Key,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type BillingCycle = "monthly" | "yearly";
type PurchaseToken = "USDT" | "BNB";
type PremiumModalMode = "purchase" | "manage" | "admin";

const Subscription: React.FC = () => {
  const { connected, walletAddress, signer, walletType, isConnecting } = useWallet() as any;

  const {
    hasPremium,
    expiresAt,
    isLoading,
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
  } = usePremium();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseToken, setPurchaseToken] = useState<PurchaseToken>("USDT");
  const [modalMode, setModalMode] = useState<PremiumModalMode>("purchase");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [bnbPrice, setBnbPrice] = useState<string>("0");
  const [bnbAmount, setBnbAmount] = useState<string>("0");
  const [usdtAmount, setUsdtAmount] = useState<string>("0");
  const [currentBnbAmount, setCurrentBnbAmount] = useState<string>("0");
  const [currentUsdtAmount, setCurrentUsdtAmount] = useState<string>("0");
  const [usdtBalance, setUsdtBalance] = useState<string>("0");
  const [usdtAllowance, setUsdtAllowance] = useState<string>("0");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  // Додаємо нові стани
  const [priceLoading, setPriceLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [isWalletReady, setIsWalletReady] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);
  const walletCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const priceMonthly = 2.99;
  const priceYearly = 29;
  const currentPrice = billingCycle === "monthly" ? priceMonthly : priceYearly;
  const perMonth = billingCycle === "monthly" ? priceMonthly : priceYearly / 12;

  // Адмін адреси (заміни на свої)
  const ADMIN_ADDRESSES = [
    "0xbddff8122d35b01fd0b16194d8d1a0a9056f5b0a", // Твій адмін гаманець
  ];

  const isAdmin = connected && walletAddress && ADMIN_ADDRESSES.includes(walletAddress.toLowerCase());
  // Ефект для перевірки готовності гаманця
  useEffect(() => {
    const checkWalletConnection = () => {
      // Якщо гаманець підключено та є адреса, вважаємо готовим
      if (connected && walletAddress) {
        setIsWalletReady(true);
        setIsCheckingWallet(false);
        if (walletCheckTimeoutRef.current) {
          clearTimeout(walletCheckTimeoutRef.current);
        }
        return true;
      }
      return false;
    };

    if (isConnecting) {
      setIsCheckingWallet(true);
      // Спроба перевірити кожні 500ms протягом 10 секунд
      let attempts = 0;
      const maxAttempts = 20; // 10 секунд (20 * 500ms)

      const attemptConnection = () => {
        if (checkWalletConnection() || attempts >= maxAttempts) {
          if (walletCheckTimeoutRef.current) {
            clearTimeout(walletCheckTimeoutRef.current);
          }
          if (attempts >= maxAttempts) {
            setIsCheckingWallet(false);
            setIsWalletReady(false);
            toast.error("Wallet connection timeout. Please reconnect manually.");
          }
          return;
        }

        attempts++;
        walletCheckTimeoutRef.current = setTimeout(attemptConnection, 500);
      };

      attemptConnection();
    } else if (connected) {
      checkWalletConnection();
    } else {
      setIsWalletReady(false);
      setIsCheckingWallet(false);
    }

    return () => {
      if (walletCheckTimeoutRef.current) {
        clearTimeout(walletCheckTimeoutRef.current);
      }
    };
  }, [connected, walletAddress, isConnecting]);

  // Отримуємо ціни
  useEffect(() => {
    if (!connected) return;

    let intervalId: NodeJS.Timeout | null = null;

    const fetchPrices = async () => {
      setPriceLoading(true);
      try {
        const bnbPriceValue = await getBnbPrice();
        setBnbPrice(parseFloat(bnbPriceValue).toFixed(2));

        const isMonthly = billingCycle === "monthly";
        const bnbAmountValue = await calculateBnbAmount(isMonthly);
        const usdtAmountValue = await getPriceInUSDT(isMonthly);

        setBnbAmount(bnbAmountValue);
        setUsdtAmount(usdtAmountValue);
        setCurrentBnbAmount(bnbAmountValue);
        setCurrentUsdtAmount(usdtAmountValue);

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching prices:", error);
        if (!bnbPrice) {
          setBnbPrice("400.00");
          setBnbAmount(billingCycle === "monthly" ? "0.0033" : "0.032");
          setUsdtAmount(billingCycle === "monthly" ? "2.99" : "29.00");
        }
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrices();

    intervalId = setInterval(fetchPrices, 60000); // 60 сек — оптимально

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connected, billingCycle, getBnbPrice, calculateBnbAmount, getPriceInUSDT]);

  useEffect(() => {
    if (purchaseToken === "BNB") {
      setCurrentBnbAmount(bnbAmount);
    } else {
      setCurrentUsdtAmount(usdtAmount);
    }
  }, [purchaseToken, bnbAmount, usdtAmount]);

  // Виправлена перевірка allowance - тільки коли гаманець готовий
  const checkAllowance = useCallback(async () => {
    if (!isWalletReady || !connected || !walletAddress || purchaseToken !== "USDT") {
      setNeedsApproval(false);
      return;
    }

    setIsCheckingWallet(true);
    try {
      const allowanceInfo = await checkUSDTAllowance();
      setUsdtBalance(allowanceInfo.balance);
      setUsdtAllowance(allowanceInfo.allowance);
      setNeedsApproval(!allowanceInfo.hasAllowance);
    } catch (error) {
      console.error("Error checking allowance:", error);
      setNeedsApproval(false);
    } finally {
      setIsCheckingWallet(false);
    }
  }, [isWalletReady, connected, walletAddress, purchaseToken, checkUSDTAllowance]);

  // Запускаємо checkAllowance ТІЛЬКИ після підключення гаманця та відкриття модалки
  useEffect(() => {
    if (isWalletReady && connected && walletAddress && purchaseToken === "USDT" && purchaseOpen) {
      checkAllowance();
    } else {
      setNeedsApproval(false);
      setUsdtBalance("0");
      setUsdtAllowance("0");
    }
  }, [isWalletReady, connected, walletAddress, purchaseToken, purchaseOpen, checkAllowance]);

  const formatExpiry = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeUntilExpiry = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  };

  const handleSubscribeClick = () => {
    if (!connected) {
      toast.error("Connect your wallet before activating Premium");
      return;
    }

    if (walletType !== 'metamask') {
      toast.error("Premium subscription requires MetaMask (EVM wallet)");
      return;
    }

    if (hasPremium) {
      setModalMode("manage");
    } else {
      setModalMode("purchase");
    }

    setPurchaseOpen(true);
  };

  const handleApproveUSDT = async () => {
    if (!connected || !walletAddress) return;

    setIsApproving(true);
    try {
      toast.info('Please confirm the USDT approval transaction in your wallet...');

      await approveUSDT(currentUsdtAmount, billingCycle === "monthly");

      // Оновлюємо статус
      await checkAllowance();

      // Примусово скидаємо needsApproval після успішного апруву
      setNeedsApproval(false);

      toast.success('USDT approved successfully! You can now proceed with payment.');

    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(`Approval failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!connected || !walletAddress || !signer) {
      toast.error("Wallet not properly connected. Please reconnect your wallet.");
      return;
    }

    if (purchaseToken === "USDT" && needsApproval) {
      toast.error("Please approve USDT spending first");
      return;
    }

    setIsProcessing(true);
    try {
      const isMonthly = billingCycle === "monthly";
      const payWithBNB = purchaseToken === "BNB";

      await subscribe(isMonthly, payWithBNB, currentBnbAmount);

      setPurchaseOpen(false);
      toast.success(`🎉 Premium activated successfully!`);
    } catch (error: any) {
      console.error("Purchase error details:", error);

      if (error.message.includes("Wallet not properly connected")) {
        toast.error("Please check your wallet connection and try again.");
      } else if (error.message.includes("insufficient funds") || error.message.includes("Insufficient")) {
        toast.error(`Insufficient ${purchaseToken} balance for this transaction`);
      } else if (error.message.includes("user rejected") || error.message.includes("ACTION_REJECTED")) {
        toast.error("Transaction was rejected");
      } else if (error.message.includes("allowance")) {
        toast.error("Please approve USDT spending first");
      } else {
        toast.error(`Transaction failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPlan = async () => {
    if (!hasPremium) {
      toast("No active Premium plan to cancel");
      return;
    }

    setIsProcessing(true);
    try {
      await cancelSubscription();
      toast.success("✅ Premium plan cancelled successfully");
      setPurchaseOpen(false);
    } catch (error: any) {
      console.error("Cancel error:", error);

      if (error.message.includes("user rejected") || error.message.includes("denied")) {
        toast.error("Transaction was rejected");
      } else {
        toast.error(`Cancellation failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedTokenAmount = () => {
    if (purchaseToken === "USDT") {
      return `${currentUsdtAmount} USDT`;
    }
    return `${parseFloat(currentBnbAmount).toFixed(6)} BNB (≈ $${currentPrice.toFixed(2)})`;
  };

  // Адмін функції
  const handleLoadAdminInfo = async () => {
    setAdminLoading(true);
    try {
      const info = await adminGetContractInfo();
      setAdminInfo(info);
    } catch (error) {
      console.error("Error loading admin info:", error);
      toast.error("Failed to load admin info");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminWithdraw = async () => {
    try {
      await adminWithdraw("0x0000000000000000000000000000000000000000", "0.1");
      toast.success("Withdrawal successful!");
      await handleLoadAdminInfo();
    } catch (error) {
      toast.error("Withdrawal failed");
    }
  };

  const handlePauseContract = async () => {
    try {
      await adminPauseContract();
      toast.success("Contract paused!");
      await handleLoadAdminInfo();
    } catch (error) {
      toast.error("Pause failed");
    }
  };

  const handleUnpauseContract = async () => {
    try {
      await adminUnpauseContract();
      toast.success("Contract unpaused!");
      await handleLoadAdminInfo();
    } catch (error) {
      toast.error("Unpause failed");
    }
  };

  const premiumDestinations = [
    {
      key: "predictions",
      title: "Predictions Arena",
      desc: "AI hints, premium stats, streaks & risk profile for short-term rounds.",
      to: "/predictions",
      label: "Trading / Predictions",
    },
    {
      key: "rewards",
      title: "Daily Rewards & Airdrops",
      desc: "Better multipliers, more tickets and visibility for time-limited rewards.",
      to: "/rewards",
      label: "Quests & Airdrops",
    },
    {
      key: "staking",
      title: "Staking & Pools (soon)",
      desc: "Smarter pool suggestions and APY helpers once staking UI is fully wired.",
      to: "/staking",
      label: "Staking & Pools",
    },
  ];

  const renderActionButton = (text: string, onClick: () => void, loading: boolean) => (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || !connected || walletType !== 'metamask'}
      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${connected && walletType === 'metamask' && !loading
          ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          : "bg-[#121212] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
        }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {text}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-2">
      {/* Адмін панель (тільки для адмінів) */}
      {isAdmin && (
        <div className="ui-inner border border-purple-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Admin Panel</h2>
            </div>
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex items-center gap-2 rounded-lg bg-[#eee]/10 hover:bg-[#eee]/25 px-3 py-1.5 text-sm text-[#eee] transition-all"
            >
              <Settings className="w-4 h-4" />
              {adminOpen ? "Hide" : "Show"} Admin
            </button>
          </div>

          {adminOpen && (
            <div className="space-y-4">
              <div className="grid mt-4 grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={handleLoadAdminInfo}
                  disabled={adminLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 px-4 py-3 text-sm text-white transition-all"
                >
                  {adminLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Load Contract Info
                </button>

                <button
                  onClick={handlePauseContract}
                  className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 px-4 py-3 text-sm text-white transition-all"
                >
                  <PauseCircle className="w-4 h-4" />
                  Pause Contract
                </button>

                <button
                  onClick={handleUnpauseContract}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 px-4 py-3 text-sm text-white transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  Unpause Contract
                </button>
              </div>
              

              {adminInfo && (
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-[#050816] rounded-lg p-3">
                      <div className="text-[10px] text-[#a0a0a0]">Total Subscriptions</div>
                      <div className="text-lg font-semibold text-white">{adminInfo.totalSubscriptions}</div>
                    </div>
                    <div className="bg-[#050816] rounded-lg p-3">
                      <div className="text-[10px] text-[#a0a0a0]">Total Revenue</div>
                      <div className="text-lg font-semibold text-white">${parseFloat(adminInfo.totalRevenueUSD).toFixed(2)}</div>
                    </div>
                    <div className="bg-[#050816] rounded-lg p-3">
                      <div className="text-[10px] text-[#a0a0a0]">Contract Status</div>
                      <div className={`text-lg font-semibold ${adminInfo.isPaused ? 'text-red-400' : 'text-green-400'}`}>
                        {adminInfo.isPaused ? 'PAUSED' : 'ACTIVE'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[#a0a0a0]">
                    <div className="flex items-center justify-between">
                      <span>BNB Price:</span>
                      <span className="text-white">${parseFloat(adminInfo.bnbPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Monthly Price (BNB):</span>
                      <span className="text-white">{parseFloat(adminInfo.monthlyPriceBNB).toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Yearly Price (BNB):</span>
                      <span className="text-white">{parseFloat(adminInfo.yearlyPriceBNB).toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* HERO */}
      <div className="ui-card backdrop-blur-sm rounded-2xl p-6 md:p-7 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-15 card-gradient-soft" />
        <img src="/back2.png" className="absolute top-0 left-0 w-full h-full object-cover" alt="" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full ui-inner px-3 py-1 text-[11px] text-[#a0a0a0]">
              <Crown className="w-3 h-3 text-[#facc15]" />
              SolanaVerse Premium • one subscription across the whole app
            </div>

            <h1 className="text-4xl font-bold ui-bg-text">
              Upgrade your experience with{" "} <br />
              <motion.span
                className="text-4xl font-bold"
                style={{
                  background:
                    "linear-gradient(90deg, #3b82f6, #eee, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% 100%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                SolanaVerse Premium
              </motion.span>
            </h1>
            <p className="text-sm md:text-[13px] text-[#a0a0a0] leading-relaxed">
              Unlock AI-based suggestions, better yield visibility, boosted rewards
              and access multipliers across staking, predictions and airdrop missions.
              One small subscription – more context and more smart decisions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="inline-flex items-center gap-2 rounded-full ui-inner px-3 py-1">
                <Stars className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-[#e0e0e0]">
                  Plan status:{" "}
                  {hasPremium && expiresAt ? (
                    <span className="text-emerald-400">
                      Active • valid until {formatExpiry(expiresAt)}
                      {getTimeUntilExpiry() && (
                        <span className="text-[#a0a0a0] text-[10px] ml-1">
                          ({getTimeUntilExpiry()} left)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[#f97373]">Not active</span>
                  )}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full ui-inner px-3 py-1">
                <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-[#a0a0a0]">
                  Billed {billingCycle === "monthly" ? "monthly" : "yearly"} • cancel anytime
                </span>
              </div>
            </div>
          </div>

          {/* Pricing card */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-[#1e293b]/90 backdrop-blur rounded-2xl p-5 relative overflow-hidden">
              {/* <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_top,_#facc15_0,_transparent_60%)]" /> */}
              <div className="relative z-10 space-y-4 text-xs">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl ui-inner flex items-center justify-center">
                      <Crown className="w-4 h-4 text-[#facc15]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-[#e0e0e0]">
                          Premium plan
                        </div>
                        {hasPremium ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#022c22]/40 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#111827] border border-[#27272a] px-2 py-0.5 text-[10px] text-[#a0a0a0]">
                            <Clock className="w-3 h-3" />
                            Not active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] w-44 text-[#707070]">
                        One small subscription layer on top of your SolanaVerse flow.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 rounded-full bg-[#121212] border border-[#1f1f1f] px-2 py-1 text-[10px]">
                      <Zap className="w-3 h-3 text-[#3b82f6]" />
                      <span className="text-[#a0a0a0]">
                        {billingCycle === "yearly" ? "Best value" : "Flexible"}
                      </span>
                    </div>
                    {hasPremium && expiresAt && (
                      <span className="text-[10px] text-[#a0a0a0]">
                        Valid until{" "}
                        <span className="text-[#e0e0e0] font-semibold">
                          {formatExpiry(expiresAt)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#a0a0a0]">Choose billing cycle</span>
                  <div className="relative ui-inner border border-[#1f1f1f] py-1.5 rounded-full p-2">
                    {/* Анімований бекграунд слайдер */}
                    <div
                      className={`absolute top-1 h-[calc(100%-0.5rem)] rounded-full bg-gradient-to-r from-[#6b21a8] to-[#3b82f6] transition-all duration-300 ease-in-out ${billingCycle === "monthly"
                          ? "left-1 w-[70px]"
                          : "left-[70px] w-[88px]"
                        }`}
                    />

                    <div className="relative flex items-center gap-1 z-10">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-1.5 py-0.5 rounded-full transition-colors duration-300 ease-in-out relative z-20 w-[60px] ${billingCycle === "monthly"
                            ? "text-white"
                            : "text-[#a0a0a0] hover:text-[#d1d5db]"
                          }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-3.5 py-0.5 rounded-full transition-colors duration-300 ease-in-out relative z-20 w-[85px] flex items-center justify-center ${billingCycle === "yearly"
                            ? "text-white"
                            : "text-[#a0a0a0] hover:text-[#d1d5db]"
                          }`}
                      >
                        Yearly
                        <span className={`ml-1 text-[9px] transition-colors duration-300 ease-in-out ${billingCycle === "yearly"
                            ? "text-white font-medium"
                            : "text-[#bfdbfe]"
                          }`}>
                          save
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <div className="flex items-end gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] text-[#707070]">$</span>
                      <span className="text-3xl font-semibold text-[#e0e0e0]">
                        {currentPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#707070]">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#3b82f6]">
                      ≈ ${perMonth.toFixed(2)}/month effective
                    </span>
                  </div>
                  <div className="text-[10px] text-[#707070]">
                    Billed in{" "}
                    <span className="text-[#e0e0e0] font-medium">
                      {billingCycle === "monthly" ? "monthly" : "yearly"}
                    </span>{" "}
                    cycles • cancel anytime.
                  </div>
                </div>

                {/* Mini perks */}
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded-lg bg-[#eee]/5 px-2 py-1.5">
                    <div className="text-[#e0e0e0] font-semibold">AI layer</div>
                    <div className="text-[#707070]">Signals & risk zones</div>
                  </div>
                  <div className="rounded-lg bg-[#eee]/5 px-2 py-1.5">
                    <div className="text-[#e0e0e0] font-semibold">Boosts</div>
                    <div className="text-[#707070]">Extra rewards</div>
                  </div>
                  <div className="rounded-lg bg-[#eee]/5 px-2 py-1.5">
                    <div className="text-[#e0e0e0] font-semibold">Priority</div>
                    <div className="text-[#707070]">Future launches</div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="space-y-2">
                  {/* Кнопка Activate Premium з вашим стилем */}
                  <button
                    onClick={handleSubscribeClick}
                    disabled={isLoading || !connected || walletType !== 'metamask'}
                    className={`btn-gradient group relative w-full h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-1000 overflow-hidden active:scale-95 ${(isLoading || !connected || walletType !== 'metamask') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <div className="btn-inner absolute w-[99.5%] h-[95%] rounded-xl flex items-center justify-center transition-all duration-1000 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:to-transparent">
                      <span className="flex items-center gap-1 text-[#ffd277] font-semibold">
                        {isLoading ? (
                          "Processing..."
                        ) : (
                          <>
                            {hasPremium ? "Manage / extend Premium" : "Activate Premium"}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </div>
                  </button>

                  {/* Кнопка Cancel Plan */}
                  {/* Кнопка Cancel Plan - показується тільки для преміум користувачів */}
                  {hasPremium && (
                    <button
                      type="button"
                      onClick={handleCancelPlan}
                      disabled={isLoading}
                      className={`w-full rounded-xl border px-4 py-2 text-[11px] transition-all ${!isLoading
                          ? "border-[#1f1f1f] bg-[#121212] text-[#a0a0a0] hover:border-[#3b82f6]/60 hover:text-[#3b82f6] cursor-pointer"
                          : "border-[#1f1f1f] bg-[#121212] text-[#444] cursor-not-allowed"
                        }`}
                    >
                      {isLoading ? "Processing..." : "Cancel plan"}
                    </button>
                  )}

                  {/* Повідомлення про підключення гаманця */}
                  {!connected && (
                    <div className="text-[10px] text-[#707070] text-center">
                      Connect your wallet first to activate Premium for this account.
                    </div>
                  )}

                  {/* Повідомлення про тип гаманця */}
                  {connected && walletType !== 'metamask' && (
                    <div className="text-[10px] text-yellow-500 text-center">
                      Premium subscription requires MetaMask (EVM wallet)
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 text-[10px] text-[#707070]">
                  <AlertCircle className="w-7 h-7 -mt-1.5 text-[#fbbf24]" />
                  <p className="text-[11px] leading-relaxed">
                    Real on-chain subscription powered by smart contracts.
                    Payments are processed instantly and status is verified on-chain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-xs text-[#a0a0a0]">
        Status:{" "}
        {hasPremium ? (
          <span className="text-emerald-400 font-semibold">
            Active until {expiresAt ? formatExpiry(expiresAt) : "—"}
            {getTimeUntilExpiry() && (
              <span className="text-[#a0a0a0] text-[10px] ml-1">
                ({getTimeUntilExpiry()} left)
              </span>
            )}
          </span>
        ) : (
          <span className="text-[#f97373] font-semibold">Not active</span>
        )}
      </div>

      {/* PREMIUM FEATURES SECTION */}
      <PremiumFeaturesSection 
        hasPremium={hasPremium} 
        walletAddress={walletAddress}
      />

      {/* PURCHASE MODAL */}
      <AnimatePresence>
        {purchaseOpen && (
          <motion.div
            className="fixed  -inset-5 backdrop-blur z-40 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl ui-card p-6 overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
            >
              <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_50%)]" />

              <div className="relative z-10 text-xs">
                {modalMode === "purchase" ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full ui-inner px-3 py-1 mb-2">
                          <Coins className="w-3 h-3 text-[#3b82f6]" />
                          <span className="text-[11px] text-[#a0a0a0]">
                            Pay Premium subscription with crypto
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold text-[#e0e0e0]">
                          Confirm your Premium plan
                        </h3>
                        <p className="mt-1 text-[11px] text-[#707070]">
                          All transactions are processed on-chain via smart contracts.
                        </p>
                      </div>
                      <button
                        onClick={() => setPurchaseOpen(false)}
                        className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Token selector */}
                    <div className="space-y-2">
                      <span className="text-[11px] text-[#a0a0a0]">Select token</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(["USDT", "BNB"] as PurchaseToken[]).map((token) => (
                          <button
                            key={token}
                            type="button"
                            onClick={() => setPurchaseToken(token)}
                            disabled={isProcessing}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] transition-all ${purchaseToken === token
                                ? "border-[#3b82f6] ui-inner"
                                : "border-[#1f1f1f]/10 ui-inner hover:border-[#3b82f6]/50"
                              }`}
                          >
                            <img
                              src={`/icons/${token.toLowerCase()}.png`}
                              alt={token}
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                e.currentTarget.src = `/icons/default.png`;
                              }}
                            />
                            <div className="text-left">
                              <div className="text-[#e0e0e0] font-semibold">{token}</div>
                              <div className="text-[10px] text-[#707070]">
                                Pay with {token}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>


                    </div>

                    {/* USDT Approval Section */}



                    {/* Price summary */}
                    <div className="ui-inner rounded-xl p-3 text-[11px] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[#a0a0a0]">Plan & billing cycle</span>
                        <span className="text-[#eee]/80 font-semibold">
                          Premium • {billingCycle === "monthly" ? "Monthly" : "Yearly"}
                        </span>
                      </div>
                      {purchaseToken === "BNB" && lastUpdated && bnbPrice !== "0" && (

                        <div className="flex items-center justify-between">
                          <span className="text-[#3b82f6]">Current BNB price</span>

                          <div className="flex items-center2">
                            {priceLoading ? (
                              <span className="text-[#3b82f6] flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Updating...
                              </span>
                            ) : (
                              <span className="text-[#3b82f6] font-semibold">


                                ${bnbPrice}
                              </span>
                            )}
                          </div>
                        </div>

                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[#a0a0a0]">Amount to pay</span>
                        <div className="flex items-center gap-2">
                          {priceLoading ? (
                            <span className="text-[#707070] animate-pulse">Calculating...</span>
                          ) : purchaseToken === "BNB" ? (
                            <span className="text-[#eee]/80 font-semibold">
                              {parseFloat(currentBnbAmount).toFixed(6)} BNB (≈ ${currentPrice.toFixed(2)})
                            </span>
                          ) : (
                            <span className="text-[#e2e8f0]/70 font-semibold">
                              {currentUsdtAmount} USDT (≈ ${currentPrice.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#a0a0a0]">Value</span>
                        <span className="text-[#e2e8f0]/70 text-[14px] font-bold">
                          {currentPrice.toFixed(2)} USD
                        </span>
                      </div>
                      {hasPremium && expiresAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#a0a0a0]">Current valid until</span>
                          <span className="text-[#e2e8f0]/70 font-semibold">
                            {formatExpiry(expiresAt)}
                          </span>
                        </div>
                      )}
                      <div className="flex text-[10px] text-[#707070] pt-2 border-t border-[#eee]/30">
                        New subscription will extend your current expiry date.
                        {purchaseToken === "BNB" && lastUpdated && (
                          <div className="flex-1 text-[10px] text-[#707070] text-right">
                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>

                        )}
                      </div>
                    </div>


                    {purchaseToken === "USDT" && connected && (
                      <div className="ui-card rounded-lg p-3 text-[11px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#a0a0a0]">USDT Balance:</span>
                          <span className="text-[#e2e8f0]/70 font-semibold">{usdtBalance} USDT</span>
                        </div>

                        {needsApproval ? (
                          <div className="space-y-2">
                            <div className="text-[10px] text-yellow-500">
                              Approval required before purchase. You need to grant permission once.
                            </div>
                            <button
                              type="button"
                              onClick={handleApproveUSDT}
                              disabled={isApproving || isProcessing}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 px-4 py-3 text-xs font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isApproving ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                'Approve USDT Spending'
                              )}
                            </button>
                            <div className="text-[9px] text-[#707070]">
                              This is a one-time permission for the contract to transfer USDT from your wallet.
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-500">
                            ✓ USDT spending approved. You can proceed with payment.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Confirm button */}
                    {/* Confirm button */}
                    {(purchaseToken !== "USDT" || !needsApproval) && (
                      <button
                        type="button"
                        onClick={handleConfirmPurchase}
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] px-4 py-2.5 text-xs font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing transaction...
                          </>
                        ) : (
                          <>
                            Confirm payment in {purchaseToken}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}

                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1 mb-2">
                          <Crown className="w-3 h-3 text-[#facc15]" />
                          <span className="text-[11px] text-[#a0a0a0]">
                            Manage your SolanaVerse Premium
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#e0e0e0]">
                          Premium is active
                        </h3>
                        <p className="mt-1 text-[11px] text-[#707070]">
                          See where Premium helps you right now and adjust your plan if needed.
                        </p>
                      </div>
                      <button
                        onClick={() => setPurchaseOpen(false)}
                        className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status */}
                    <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#707070]">Status</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#707070]">Valid until</span>
                        <span className="text-[#e0e0e0] font-semibold">
                          {expiresAt ? formatExpiry(expiresAt) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#707070]">Time remaining</span>
                        <span className="text-[#e0e0e0] font-semibold">
                          {getTimeUntilExpiry() || "—"}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#707070] pt-2 border-t border-[#1f1f1f]">
                        Status verified on-chain for wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="space-y-2">
                      <span className="text-[11px] text-[#a0a0a0]">
                        Premium is now active in these modules:
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {premiumDestinations.map((item) => (
                          <Link
                            key={item.key}
                            to={item.to}
                            className="flex items-center justify-between rounded-xl border border-[#1f1f1f] bg-[#050816] px-3 py-2 hover:border-[#3b82f6]/70 transition-all"
                            onClick={() => setPurchaseOpen(false)}
                          >
                            <div>
                              <div className="text-[11px] text-[#707070]">{item.label}</div>
                              <div className="text-[12px] font-semibold text-[#e0e0e0]">
                                {item.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#3b82f6]">
                              Go to module
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setModalMode("purchase")}
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f1f1f] bg-[#121212] px-4 py-2 text-[11px] text-[#e0e0e0] hover:border-[#3b82f6]/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Extend / renew plan
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPlan}
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-[11px] text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing cancellation...
                          </>
                        ) : (
                          "Cancel Premium"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;