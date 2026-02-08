import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Clock,
  Coins,
  Gift,
  Info,
  Percent,
  Shield,
  Ticket,
  Wallet,
  X,
  History as HistoryIcon,
} from "lucide-react";

type PaymentMethod = "USDT" | "USDC" | "BNB" | "SOL";
type SalePhase = "upcoming" | "live" | "ended";
type PurchaseStatus = "pending" | "completed" | "failed";

interface Purchase {
  id: string;
  date: string;
  usdAmount: number;
  paymentCurrency: PaymentMethod;
  paymentAmount: number;
  paymentPrice: number;
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  referralCode?: string;
  txHash: string;
  priceImpact: number;
  isWhitelisted: boolean;
  status: PurchaseStatus;
}

interface ConfirmPurchaseModalProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
}

const fmtSpaceInt = (n: number) =>
  Math.round(Number(n || 0))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const fmtMoney = (n: number) => `$${fmtSpaceInt(n)}`;

const generateTxHash = () => {
  const chars =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < 44; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

const formatDateTime = (d: Date) =>
  d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

// простий відлік до дати
const useCountdown = (target: Date) => {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
};

// ================== Final Confirm Modal ==================
const ConfirmPurchaseModal: React.FC<ConfirmPurchaseModalProps> = ({
  open,
  purchase,
  onClose,
}) => {
  if (!open || !purchase) return null;

  const {
    usdAmount,
    paymentCurrency,
    paymentAmount,
    baseTokens,
    bonusTokens,
    totalTokens,
    txHash,
    status,
    referralCode,
  } = purchase;

  const statusColor =
    status === "completed"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/40"
      : status === "pending"
      ? "text-[#facc15] bg-[#facc15]/10 border-[#facc15]/40"
      : "text-red-400 bg-red-500/10 border-red-500/40";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-[#1f1f1f] bg-[#050816] p-6 overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
          >
            <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-30 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-4 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1 mb-2">
                    <Activity className="w-3 h-3 text-[#3b82f6]" />
                    <span className="text-[11px] text-[#a0a0a0]">
                      Token sale purchase summary
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#e0e0e0]">
                    Purchase completed
                  </h3>
                  <p className="mt-1 text-[11px] text-[#707070]">
                    Receipt preview for your contribution. You can use this
                    info later when claiming tokens.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status & tx */}
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${statusColor}`}
                >
                  <Shield className="w-3 h-3" />
                  <span className="font-semibold">
                    {status === "completed"
                      ? "Completed"
                      : status === "pending"
                      ? "Pending"
                      : "Failed"}
                  </span>
                </div>
                <div className="text-[#707070] text-right">
                  Tx hash:{" "}
                  <span className="text-[#e0e0e0] font-mono text-[10px]">
                    {txHash.slice(0, 6)}...{txHash.slice(-6)}
                  </span>
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3">
                  <div className="text-[#707070] mb-1">Paid</div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {fmtMoney(usdAmount)}
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1">
                    {paymentAmount.toFixed(2)} {paymentCurrency}
                  </div>
                </div>
                <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3">
                  <div className="text-[#707070] mb-1">
                    Tokens (base + bonus)
                  </div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {fmtSpaceInt(baseTokens)} +{" "}
                    <span className="text-[#22c1c3]">
                      {fmtSpaceInt(bonusTokens)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1">
                    Total:{" "}
                    <span className="text-[#e0e0e0] font-semibold">
                      {fmtSpaceInt(totalTokens)} SVT
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral */}
              <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3 text-[11px] space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-3 h-3 text-[#facc15]" />
                  <span className="text-[#e0e0e0] font-semibold">
                    Referral & bonuses
                  </span>
                </div>
                <div className="text-[#707070]">
                  Referral code:{" "}
                  <span className="text-[#e0e0e0] font-mono">
                    {referralCode || "not used"}
                  </span>
                </div>
                <div className="text-[#707070]">
                  Bonus tokens are already included in your total sale balance.
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-all"
              >
                Close
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ========= Claim Status Card =========
interface ClaimStats {
  totalPurchased: number;
  alreadyClaimed: number;
  claimable: number;
}

interface ClaimSectionProps {
  stats: ClaimStats;
  onClaim: () => void;
  onBackToSale: () => void;
}

const ClaimSection: React.FC<ClaimSectionProps> = ({
  stats,
  onClaim,
  onBackToSale,
}) => {
  const { totalPurchased, alreadyClaimed, claimable } = stats;

  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
      <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_60%)]" />
      <div className="relative z-10 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#3b82f6]" />
            <div>
              <h2 className="text-sm font-semibold text-[#e0e0e0]">
                Claim your tokens
              </h2>
              <p className="text-[11px] text-[#707070]">
                Claim becomes available after the sale ends and unlocks are
                enabled.
              </p>
            </div>
          </div>
          <button
            onClick={onBackToSale}
            className="inline-flex items-center gap-1 rounded-xl border border-[#1f1f1f] bg-[#050816] px-3 py-1 text-[11px] text-[#a0a0a0] hover:border-[#3b82f6]/60 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to sale
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3">
            <div className="text-[11px] text-[#707070] mb-1">
              Total purchased
            </div>
            <div className="text-sm font-semibold text-[#e0e0e0]">
              {fmtSpaceInt(totalPurchased)} SVT
            </div>
          </div>
          <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3">
            <div className="text-[11px] text-[#707070] mb-1">
              Already claimed
            </div>
            <div className="text-sm font-semibold text-[#e0e0e0]">
              {fmtSpaceInt(alreadyClaimed)} SVT
            </div>
          </div>
          <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3">
            <div className="text-[11px] text-[#707070] mb-1">
              Available to claim
            </div>
            <div className="text-sm font-semibold text-[#22c1c3]">
              {fmtSpaceInt(claimable)} SVT
            </div>
          </div>
        </div>

        <button
          disabled={claimable <= 0}
          onClick={onClaim}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            claimable <= 0
              ? "bg-[#050816] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
              : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          }`}
        >
          Claim now
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-[10px] text-[#707070]">
          Your purchased tokens are locked in the sale contract until the claim
          window is opened. This preview shows the amount you’ll be able to
          claim in the next unlock.
        </div>
      </div>
    </div>
  );
};

// =================== Main Page ===================
const TOKEN_LOGOS: Record<PaymentMethod, string> = {
  USDT: "/icons/usdt.png",
  USDC: "/icons/usdc.png",
  BNB: "/icons/bnb.png",
  SOL: "/icons/sol.png",
};

const PAYMENT_PRICE: Record<PaymentMethod, number> = {
  USDT: 1,
  USDC: 1,
  BNB: 580, // умовно
  SOL: 180, // умовно
};

const TOKEN_PRICE_USD = 0.02; // 0.02 USDT за SVT

const TokenSale: React.FC = () => {
  const { connected, wallet } = useWallet() as any;
  const [view, setView] = useState<"sale" | "claim">("sale");

  // sale dates
  const saleStart = useMemo(
    () => new Date(Date.now() - 1000 * 60 * 60 * 6),
    []
  );
  const saleEnd = useMemo(
    () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    []
  );
  const countdownToEnd = useCountdown(saleEnd);
  const countdownToStart = useCountdown(saleStart);

  const salePhase: SalePhase = useMemo(() => {
    const now = new Date();
    if (now < saleStart) return "upcoming";
    if (now > saleEnd) return "ended";
    return "live";
  }, [saleStart, saleEnd, countdownToEnd.totalSeconds]);

  const [amountUsd, setAmountUsd] = useState<string>("");
  const [paymentCurrency, setPaymentCurrency] =
    useState<PaymentMethod>("USDT");
  const [referralCode, setReferralCode] = useState<string>("");

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [claimedTotal, setClaimedTotal] = useState<number>(0);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<Purchase | null>(null);

  const walletAddress =
    wallet && wallet.publicKey && wallet.publicKey.toBase58
      ? wallet.publicKey.toBase58()
      : "";

  // Derived sale stats
  const totalUsdRaised = useMemo(
    () => purchases.reduce((acc, p) => acc + p.usdAmount, 0),
    [purchases]
  );
  const totalTokensSold = useMemo(
    () => purchases.reduce((acc, p) => acc + p.totalTokens, 0),
    [purchases]
  );

  const claimStats: ClaimStats = useMemo(() => {
    const totalPurchased = totalTokensSold;
    const alreadyClaimed = claimedTotal;
    const claimable =
      salePhase === "ended"
        ? Math.max(totalPurchased - alreadyClaimed, 0)
        : 0;
    return { totalPurchased, alreadyClaimed, claimable };
  }, [totalTokensSold, claimedTotal, salePhase]);

  // airdrop tickets: 1 ticket per 500 SVT
  const totalTickets = Math.floor(totalTokensSold / 500);
  const airdropBoost =
    totalTokensSold >= 20_000
      ? "x3 boost"
      : totalTokensSold >= 10_000
      ? "x2 boost"
      : totalTokensSold > 0
      ? "x1 baseline"
      : "no tickets yet";

  const airdropTier =
    totalTokensSold >= 30_000
      ? "Diamond allocation tier"
      : totalTokensSold >= 15_000
      ? "Gold allocation tier"
      : totalTokensSold >= 5_000
      ? "Silver allocation tier"
      : "Entry allocation tier";

  const parsedUsd = Number(amountUsd) || 0;
  const estimatedTokens = parsedUsd > 0 ? parsedUsd / TOKEN_PRICE_USD : 0;
  const bonusTokens =
    estimatedTokens > 0
      ? estimatedTokens *
        (estimatedTokens >= 20_000 ? 0.15 : estimatedTokens >= 10_000 ? 0.1 : 0.05)
      : 0;
  const totalTokensPreview = estimatedTokens + bonusTokens;

  const paymentPrice = PAYMENT_PRICE[paymentCurrency];
  const paymentAmount =
    paymentPrice > 0 ? parsedUsd / paymentPrice : 0;

  const handleBuy = () => {
    if (salePhase === "upcoming") {
      toast.error("Sale has not started yet");
      return;
    }
    if (salePhase === "ended") {
      toast.error("Sale has already ended");
      return;
    }
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!parsedUsd || parsedUsd <= 0) {
      toast.error("Enter an amount in USD");
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const txHash = generateTxHash();
    const now = new Date();

    const purchase: Purchase = {
      id,
      date: now.toISOString(),
      usdAmount: parsedUsd,
      paymentCurrency,
      paymentAmount,
      paymentPrice,
      baseTokens: estimatedTokens,
      bonusTokens,
      totalTokens: totalTokensPreview,
      referralCode: referralCode || undefined,
      txHash,
      priceImpact: 0.02, // умовно
      isWhitelisted: true,
      status: "completed",
    };

    setPurchases((prev) => [purchase, ...prev]);
    setLastPurchase(purchase);
    setConfirmModalOpen(true);
    setAmountUsd("");
    toast.success("Purchase simulated – check summary and history");
  };

  const handleClaim = () => {
    if (claimStats.claimable <= 0) {
      toast.error("Nothing to claim yet");
      return;
    }
    setClaimedTotal((prev) => prev + claimStats.claimable);
    toast.success(`Claimed ${fmtSpaceInt(claimStats.claimable)} SVT`);
  };

  const buyDisabledReason =
  !connected ? "Connect wallet" :
  salePhase !== "live" ? "Sale not live" :
  parsedUsd < 50 ? "Min $50" :
  null;


  const saleStatusLabel =
    salePhase === "upcoming"
      ? "Sale has not started"
      : salePhase === "live"
      ? "Token sale is live"
      : "Sale finished";

  const saleStatusColor =
    salePhase === "upcoming"
      ? "text-[#facc15]"
      : salePhase === "live"
      ? "text-emerald-400"
      : "text-[#707070]";

  return (
    <div className="space-y-6 pb-8">
      {/* HERO / HEADER */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1 text-[11px] text-[#a0a0a0] hover:border-[#3b82f6]/70 hover:text-[#e0e0e0] transition-all"
        >
          <ArrowLeft className="w-3 h-3 text-[#3b82f6]" />
          <span>Back</span>
        </button>

        {/* Quick Stats Badge */}
        <div className="flex gap-3 text-[11px]">
          <div className="px-3 py-1 rounded-full bg-[#050816]/80 border border-[#1f1f1f] text-[#a0a0a0]">
            <span className="text-emerald-400 font-semibold">{salePhase === 'live' ? '🟢 LIVE' : salePhase === 'upcoming' ? '🟡 UPCOMING' : '⚪ ENDED'}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#050816]/80 border border-[#1f1f1f] text-[#a0a0a0]">
            Progress: <span className="text-[#22c1c3] font-semibold">{Math.min(100, Math.round((totalTokensSold / 100000) * 100))}%</span>
          </div>
        </div>
      </div>

      {/* MAIN PROGRESS + STATS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Progress Visualization */}
        <div className="lg:col-span-2 backdrop-blur-md bg-black/20 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#e0e0e0]">Sale Progress</h3>
              <span className="text-[#3b82f6] font-bold text-xl">{Math.min(100, Math.round((totalTokensSold / 100000) * 100))}%</span>
            </div>

            {/* Large Progress Bar */}
            <div className="space-y-2">
              <div className="h-6 bg-[#050816] border border-[#1f1f1f] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#3b82f6] via-[#22c1c3] to-[#a855f7] relative"
                  style={{
                    width: `${Math.min(100, (totalTokensSold / 100000) * 100)}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalTokensSold / 100000) * 100)}%` }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle,_rgba(255,255,255,0.3),_transparent)]" />
                </motion.div>
              </div>
              <div className="flex justify-between text-[10px] text-[#707070]">
                <span>{fmtSpaceInt(totalTokensSold)} SVT sold</span>
                <span>Target: 100,000 SVT</span>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#050816] border border-[#1f1f1f] rounded-lg p-2 text-center">
                <div className="text-[#707070] mb-1">Bronze</div>
                <div className="text-[#e0e0e0] font-bold">0%</div>
              </div>
              <div className="bg-[#050816] border border-[#1f1f1f] rounded-lg p-2 text-center">
                <div className="text-[#a0a0a0] mb-1">Silver</div>
                <div className="text-[#e0e0e0] font-bold">{Math.min(100, Math.round((totalTokensSold / 30000) * 100))}%</div>
              </div>
              <div className="bg-[#050816] border border-[#1f1f1f] rounded-lg p-2 text-center">
                <div className="text-[#f59e0b] mb-1">Gold+</div>
                <div className="text-[#e0e0e0] font-bold">{Math.max(0, Math.round(((totalTokensSold - 30000) / 70000) * 100))}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_60%)]" />
          <div className="relative z-10 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3b82f6]" />
              <div>
                <div className="text-[#707070]">Time remaining</div>
                <div className="text-sm font-bold text-[#e0e0e0]">
                  {salePhase === "ended" ? "Sale Ended" : `${countdownToEnd.days}d ${countdownToEnd.hours}h`}
                </div>
              </div>
            </div>
            <div className="h-px bg-[#1f1f1f]" />
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#22c1c3]" />
              <div>
                <div className="text-[#707070]">Your allocation</div>
                <div className="text-sm font-bold text-[#e0e0e0]">
                  {claimStats.totalPurchased > 0 ? fmtSpaceInt(claimStats.totalPurchased) : "None yet"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all">
  {/* BACKGROUND GLOW */}
  <div className="pointer-events-none absolute -inset-0.5 opacity-10
    bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />

  <div className="relative z-10 flex flex-col gap-5">
    {/* TOP ROW */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* LEFT */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
          <Activity className="w-3 h-3 text-[#3b82f6]" />
          <span className={`text-[11px] ${saleStatusColor}`}>
            {saleStatusLabel}
          </span>
        </div>

        <h1 className="text-3xl font-semibold text-white leading-tight">
          Buy SVT early.<br />
          <span className="text-[#3b82f6]">
            Earn bonuses + referrals.
          </span>
        </h1>

        <p className="text-sm text-[#a0a0a0] max-w-md">
          Early participants receive tiered bonuses, referral rewards
          and priority airdrop eligibility.
        </p>
      </div>

      {/* RIGHT */}
      <div className="space-y-3 text-xs">
        {/* WALLET */}
        <div className="flex items-center justify-end gap-2">
          <div className="w-9 h-9 rounded-full bg-[#050816] border border-[#1f1f1f]
            flex items-center justify-center">
            <Wallet className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-right">
            <div className="text-[11px] text-[#707070]">
              Wallet
            </div>
            <div className="text-[11px] text-[#e0e0e0] font-mono">
              {connected && walletAddress
                ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                : "Not connected"}
            </div>
          </div>
        </div>

        {/* TIMER */}
        <div className="bg-[#050816] border border-[#1f1f1f]
          rounded-xl px-3 py-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <Clock className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-[11px] text-[#707070]">
              {salePhase === "upcoming"
                ? "Starts in"
                : salePhase === "live"
                ? "Ends in"
                : "Ended"}
            </span>
          </div>

          {salePhase !== "ended" && (
            <div className="mt-1 text-sm font-semibold text-[#e0e0e0]">
              {salePhase === "upcoming"
                ? `${countdownToStart.days}d ${countdownToStart.hours}h ${countdownToStart.minutes}m ${countdownToStart.seconds}s`
                : `${countdownToEnd.days}d ${countdownToEnd.hours}h ${countdownToEnd.minutes}m ${countdownToEnd.seconds}s`}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* DIVIDER */}
    <div className="h-px bg-[#1f1f1f]" />

    {/* COMPACT STATS */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
      {/* SOLD */}
      <div className="flex items-center gap-3">
        <Coins className="w-4 h-4 text-[#3b82f6]" />
        <div>
          <div className="text-[#e0e0e0] font-semibold text-sm">
            {fmtSpaceInt(totalTokensSold)} SVT
          </div>
          <div className="text-[#707070]">
            Tokens sold
          </div>
        </div>
      </div>

      {/* AIRDROP */}
      <div className="flex items-center gap-3">
        <Gift className="w-4 h-4 text-[#facc15]" />
        <div>
          <div className="text-[#e0e0e0] font-semibold text-sm">
            {totalTickets} tickets
          </div>
          <div className="text-[#707070]">
            Airdrop boost {airdropBoost}
          </div>
        </div>
      </div>

      {/* RAISED */}
      <div className="flex items-center gap-3 sm:justify-end">
        <Ticket className="w-4 h-4 text-[#fb923c]" />
        <div className="sm:text-right">
          <div className="text-[#e0e0e0] font-semibold text-sm">
            {fmtMoney(totalUsdRaised)}
          </div>
          <div className="text-[#707070]">
            Total raised
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


      

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: SALE / CLAIM SWITCH */}
        <div className="lg:col-span-2 space-y-4">
          {/* Toggle row */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`px-3 py-1 rounded-full border ${
                  view === "sale"
                    ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                    : "bg-[#050816] border-[#1f1f1f] text-[#a0a0a0]"
                } cursor-pointer`}
                onClick={() => setView("sale")}
              >
                Token sale
              </span>
              <span
                className={`px-3 py-1 rounded-full border ${
                  view === "claim"
                    ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                    : "bg-[#050816] border-[#1f1f1f] text-[#a0a0a0]"
                } cursor-pointer`}
                onClick={() => setView("claim")}
              >
                Claim SVT
              </span>
            </div>
            <div className="text-[11px] text-[#707070]">
              Referral, airdrop & tickets work across both views.
            </div>
          </div>

          {view === "sale" ? (
            // ========== SALE FORM ==========
            <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all">
              <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
              <div className="relative z-10 space-y-5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#e0e0e0]">
                      Buy SVT tokens
                    </h2>
                    <p className="mt-1 text-[11px] text-[#707070]">
                      Choose currency, enter amount in USD and get a live
                      preview of base + bonus tokens you’ll receive.
                    </p>
                  </div>
                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl px-3 py-2 text-right">
                    <div className="text-[11px] text-[#707070]">
                      Referral support
                    </div>
                    <div className="text-[11px] text-[#e0e0e0]">
                      Used:{" "}
                      <span className="font-mono">
                        {referralCode || "none"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["USDT", "USDC", "BNB", "SOL"] as PaymentMethod[]).map(
                    (pm) => {
                      const active = paymentCurrency === pm;
                      const price = PAYMENT_PRICE[pm];
                      return (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => setPaymentCurrency(pm)}
                          className={`flex items-center h-14 gap-2 rounded-xl border px-3 py-2 text-left text-[11px] transition-all ${
                            active
                              ? "bg-[#050816] border-[#3b82f6]"
                              : "bg-[#050816] border-[#1f1f1f]"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                            <img
                              src={TOKEN_LOGOS[pm]}
                              alt={pm}
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                          <div>
                            <div className="text-[#e0e0e0] font-semibold">
                              {pm}
                            </div>
                            <div className="text-[10px] text-[#707070]">
                              1 {pm} ≈ ${price.toFixed(2)}
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Amount + referral */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[11px] text-[#a0a0a0]">
                      Contribution amount (in USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#707070]">
                        $
                      </span>
                      <input
                        type="number"
                        value={amountUsd}
                        onChange={(e) => setAmountUsd(e.target.value)}
                        placeholder="0.00"
                        min={0}
                        step="10"
                        className="w-full font-semibold h-12 rounded-xl bg-[#050816] border border-[#1f1f1f] text-sm text-[#e0e0e0] pl-6 pr-3 py-2.5 outline-none focus:border-[#3b82f6]"
                      />
                    </div>
                      <div className="flex flex-wrap gap-2 mt-2">
    {[50, 100, 200, 500, 1000].map((v) => (
      <button
        key={v}
        type="button"
        onClick={() => setAmountUsd(String(v))}
        className="px-8 py-2 rounded-xl border border-[#1f1f1f] bg-[#050816] text-[11px] text-[#a0a0a0] focus:border-[#3b82f6]/70 hover:text-[#e0e0e0] transition-all"
      >
        ${v}
      </button>
    ))}
  </div>

                    <div className="flex gap-2 text-[11px] text-[#707070]">
                      <span>Min: $50 • Max (UI-only): $50,000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] text-[#a0a0a0]">
                      Referral code (optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="friend123 or ID"
                      className="w-full rounded-xl h-12 bg-[#050816] border border-[#1f1f1f] text-xs text-[#e0e0e0] px-3 py-2.5 outline-none focus:border-[#3b82f6]"
                    />
                    <div className="text-[10px] text-[#707070]">
                      Referral bonuses are tracked off-chain for now.
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3">
                    <div className="text-[#707070] mb-1 ">
                      You pay ({paymentCurrency})
                    </div>
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      {paymentAmount > 0
                        ? paymentAmount.toFixed(2)
                        : "0.00"}{" "}
                      {paymentCurrency}
                    </div>
                    <div className="text-[10px] text-[#707070] mt-1">
                      Rate based on current USD approximation
                    </div>
                  </div>

                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3">
                    <div className="text-[#707070] mb-1">
                      Base SVT allocation
                    </div>
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      {fmtSpaceInt(estimatedTokens)} SVT
                    </div>
                    <div className="text-[10px] text-[#707070] mt-1">
                      {TOKEN_PRICE_USD.toFixed(3)} USDT per SVT
                    </div>
                  </div>

                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3">
                    <div className="text-[#707070] mb-1">
                      Bonus & total SVT
                    </div>
                    <div className="text-sm font-semibold text-[#22c1c3]">
                      +{fmtSpaceInt(bonusTokens)} bonus
                    </div>
                    <div className="text-[10px] text-[#707070] mt-1">
                      Total:{" "}
                      <span className="text-[#e0e0e0] font-semibold">
                        {fmtSpaceInt(totalTokensPreview)} SVT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info + button */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start w-2/3 gap-2 text-[11px] text-[#707070]">
                    <Info className="w-3 h-3 text-[#3b82f6] mt-0.5" />
                    <span>
                      This section only simulates allocations for interface
                      testing. Exact allocations and vesting will be handled
                      on-chain in the final contracts.
                    </span>
                  </div>
                  
                  <button
                    onClick={handleBuy}
                    disabled={
                      !connected || !parsedUsd || parsedUsd < 50 || salePhase !== "live"
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-12 py-3 text-sm font-medium transition-all ${
                      !connected ||
                      !parsedUsd ||
                      parsedUsd < 50 ||
                      salePhase !== "live"
                        ? "bg-[#050816] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
                        : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                    }`}
                  >
                    <span>
  {buyDisabledReason ?? "Buy token"}
</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ========== CLAIM VIEW ==========
            <ClaimSection
              stats={claimStats}
              onClaim={handleClaim}
              onBackToSale={() => setView("sale")}
            />
          )}

          
        </div>

        {/* RIGHT: HISTORY + EXTRA INFO */}
        <div className="space-y-4">
          {/* History */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-[#3b82f6]" />
                  <h3 className="text-sm font-semibold text-[#e0e0e0]">
                    Purchase history
                  </h3>
                </div>
                <span className="text-[11px] text-[#707070]">
                  {purchases.length} records
                </span>
              </div>

              {purchases.length === 0 ? (
                <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-4 text-center text-[#707070] text-xs">
                  No purchases yet. Your contributions will appear here with
                  tx preview and token amounts.
                </div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scroll">
                  {purchases.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#050816] border border-[#1f1f1f] rounded-xl px-3 py-2 text-[11px] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#e0e0e0] font-semibold">
                          {fmtMoney(p.usdAmount)} →{" "}
                          {fmtSpaceInt(p.totalTokens)} SVT
                        </span>
                        <span className="text-[#707070]">
                          {formatDateTime(new Date(p.date))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#707070]">
                          Paid: {p.paymentAmount.toFixed(3)}{" "}
                          {p.paymentCurrency}
                          {p.referralCode && (
                            <span className="ml-1 text-[#a0a0a0]">
                              • ref:{" "}
                              <span className="font-mono">
                                {p.referralCode}
                              </span>
                            </span>
                          )}
                        </span>
                        <span className="text-[#707070] font-mono">
                          {p.txHash.slice(0, 5)}...{p.txHash.slice(-4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          

          {/* Footer timer / info */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3b82f6]" />
                <h3 className="text-sm font-semibold text-[#e0e0e0]">
                  Sale window information
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-[#707070]">
                  Current phase:{" "}
                  <span className={saleStatusColor}>{saleStatusLabel}</span>
                </div>
                {salePhase !== "ended" && (
                  <div className="text-[11px] text-[#707070]">
                    Time left:{" "}
                    <span className="text-[#e0e0e0] font-semibold">
                      {countdownToEnd.days}d {countdownToEnd.hours}h{" "}
                      {countdownToEnd.minutes}m {countdownToEnd.seconds}s
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-[#707070]">
                Once the token sale is fully implemented on-chain, this section
                can pull live phase data, vesting info and real allocation
                limits from the smart contract, while preserving the same
                layout.
              </p>
            </div>
          </div>
          {/* Airdrop & tickets */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
              <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_60%)]" />
              <div className="relative z-10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#3b82f6]" />
                    <h3 className="text-xs font-semibold text-[#e0e0e0]">
                      Airdrop tickets
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#707070]">
                    1 ticket / 500 SVT
                  </span>
                </div>
                <div className="text-2xl font-semibold text-[#e0e0e0]">
                  {totalTickets}{" "}
                  <span className="text-sm text-[#707070]">tickets</span>
                </div>
                <div className="text-[11px] text-[#707070]">
                  Tier:{" "}
                  <span className="text-[#e0e0e0] font-semibold">
                    {airdropTier}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#050816] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#22c1c3] via-[#3b82f6] to-[#a855f7]"
                    style={{
                      width: `${Math.min(
                        100,
                        (totalTokensSold / 30000) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[#707070]">
                  Tickets and tiers accumulate with every simulated purchase and
                  can be used later for allocation & bonus logic.
                </div>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
              <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_60%)]" />
              <div className="relative z-10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#facc15]" />
                    <h3 className="text-sm font-semibold text-[#e0e0e0]">
                      Referral & boost
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#707070]">
                    UI-only boost preview
                  </span>
                </div>
                <div className="text-[11px] text-[#707070]">
                  Current boost:{" "}
                  <span className="text-[#e0e0e0] font-semibold">
                    {airdropBoost}
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] text-[#707070]">
                  <li>• Referral codes can increase ticket weight later</li>
                  <li>• Higher total SVT purchases unlock better tiers</li>
                  <li>• Perfect for testing future logic for boosts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final confirm modal */}
      <ConfirmPurchaseModal
        open={confirmModalOpen}
        purchase={lastPurchase}
        onClose={() => setConfirmModalOpen(false)}
      />
    </div>
  );
};

export default TokenSale;
