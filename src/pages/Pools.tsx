import React, { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";
import {
  Droplets,
  Waves,
  PiggyBank,
  Shield,
  ArrowRight,
  Info,
  LineChart,
  Filter,
  Zap,
  Coins,
  ArrowUpRight,
  Percent,
  X,
  Gift,
  Bot,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type TokenSymbol =
  | "SVT"
  | "USDT"
  | "USDC"
  | "BNB"
  | "SOL"
  | "ETH"
  | "XRP"
  | "DOGE";
type PoolType = "Core" | "Stable" | "Experimental";
type RiskLevel = "Low" | "Medium" | "High";
type ChainName = "BNB Chain" | "Solana" | "Ethereum";

interface Pool {
  id: number;
  label: string;
  tokens: TokenSymbol[];
  pairLabel: string;
  apr: number;
  tvlUsd: number;
  volume24h: number;
  fee: number;
  type: PoolType;
  boosted?: boolean;
  rewards: string[];
  chain: ChainName;
  risk: RiskLevel;
}

interface UserPosition {
  poolId: number;
  lpAmount: number;
  sharePct: number;
  earnedUsd: number;
  staked: boolean;
}

const TOKEN_META: Record<
  TokenSymbol,
  { name: string; symbol: TokenSymbol; logo: string; chain: ChainName }
> = {
  SVT: {
    name: "SolanaVerse Token",
    symbol: "SVT",
    logo: "/icons/svt.png",
    chain: "Solana",
  },
  USDT: {
    name: "Tether",
    symbol: "USDT",
    logo: "/icons/usdt.png",
    chain: "BNB Chain",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    logo: "/icons/usdc.png",
    chain: "Solana",
  },
  BNB: { name: "BNB", symbol: "BNB", logo: "/icons/bnb.png", chain: "BNB Chain" },
  SOL: { name: "Solana", symbol: "SOL", logo: "/icons/sol.png", chain: "Solana" },
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    logo: "/icons/eth.png",
    chain: "Ethereum",
  },
  XRP: { name: "XRP", symbol: "XRP", logo: "/icons/xrp.png", chain: "BNB Chain" },
  DOGE: {
    name: "Dogecoin",
    symbol: "DOGE",
    logo: "/icons/doge.png",
    chain: "BNB Chain",
  },
};

const POOLS: Pool[] = [
  {
    id: 1,
    label: "Core SVT liquidity",
    tokens: ["SVT", "USDT"],
    pairLabel: "SVT / USDT",
    apr: 42.5,
    tvlUsd: 185_000,
    volume24h: 52_300,
    fee: 0.25,
    type: "Core",
    boosted: true,
    rewards: ["SVT", "USDT"],
    chain: "BNB Chain",
    risk: "Medium",
  },
  {
    id: 2,
    label: "Stablecoin stability pool",
    tokens: ["USDT", "USDC"],
    pairLabel: "USDT / USDC",
    apr: 11.2,
    tvlUsd: 320_000,
    volume24h: 88_500,
    fee: 0.02,
    type: "Stable",
    rewards: ["SVT"],
    chain: "BNB Chain",
    risk: "Low",
  },
  {
    id: 3,
    label: "Blue-chip support",
    tokens: ["SVT", "SOL"],
    pairLabel: "SVT / SOL",
    apr: 35.8,
    tvlUsd: 97_500,
    volume24h: 23_800,
    fee: 0.25,
    type: "Core",
    boosted: true,
    rewards: ["SVT"],
    chain: "Solana",
    risk: "Medium",
  },
  {
    id: 4,
    label: "BNB routing pool",
    tokens: ["SVT", "BNB"],
    pairLabel: "SVT / BNB",
    apr: 29.4,
    tvlUsd: 74_200,
    volume24h: 19_300,
    fee: 0.25,
    type: "Core",
    rewards: ["SVT", "BNB"],
    chain: "BNB Chain",
    risk: "Medium",
  },
  {
    id: 5,
    label: "ETH satellite",
    tokens: ["SVT", "ETH"],
    pairLabel: "SVT / ETH",
    apr: 24.1,
    tvlUsd: 54_800,
    volume24h: 14_900,
    fee: 0.3,
    type: "Experimental",
    rewards: ["SVT"],
    chain: "Ethereum",
    risk: "High",
  },
  {
    id: 6,
    label: "Meme routing playground",
    tokens: ["SVT", "DOGE"],
    pairLabel: "SVT / DOGE",
    apr: 61.3,
    tvlUsd: 31_400,
    volume24h: 21_100,
    fee: 0.3,
    type: "Experimental",
    boosted: true,
    rewards: ["SVT", "DOGE"],
    chain: "BNB Chain",
    risk: "High",
  },
  {
    id: 7,
    label: "XRP bridge",
    tokens: ["SVT", "XRP"],
    pairLabel: "SVT / XRP",
    apr: 27.9,
    tvlUsd: 43_600,
    volume24h: 9_800,
    fee: 0.25,
    type: "Core",
    rewards: ["SVT"],
    chain: "BNB Chain",
    risk: "Medium",
  },
];

const INITIAL_POSITIONS: UserPosition[] = [
  {
    poolId: 1,
    lpAmount: 120.52,
    sharePct: 1.8,
    earnedUsd: 84.23,
    staked: true,
  },
  {
    poolId: 2,
    lpAmount: 540.0,
    sharePct: 0.9,
    earnedUsd: 35.11,
    staked: false,
  },
];

// helpers
const formatUsd = (value: number) =>
  `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

const formatUsdExact = (value: number) =>
  `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;

const getRiskBadgeClasses = (risk: RiskLevel) => {
  if (risk === "Low")
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40";
  if (risk === "Medium")
    return "bg-sky-500/10 text-sky-400 border border-sky-500/40";
  return "bg-red-500/10 text-red-400 border border-red-500/40";
};

const getTypeBadgeClasses = (type: PoolType) => {
  if (type === "Core")
    return "bg-[#111827] text-[#e0e0e0] border border-[#1f1f1f]";
  if (type === "Stable")
    return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
  return "bg-purple-500/10 text-purple-300 border border-purple-500/40";
};

// Add liquidity modal
interface AddLiquidityModalProps {
  pool: Pool;
  onClose: () => void;
  onConfirm: (amountUsd: number) => void;
}

const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({
  pool,
  onClose,
  onConfirm,
}) => {
  const [amountUsd, setAmountUsd] = useState("");
  const [error, setError] = useState("");

  const [t0, t1] = pool.tokens;
  const meta0 = TOKEN_META[t0];
  const meta1 = TOKEN_META[t1];

  const numericAmount = Number(amountUsd) || 0;
  const half = numericAmount / 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amountUsd);
    if (!value || value <= 0) {
      setError("Enter a positive amount");
      return;
    }
    setError("");
    onConfirm(value);
  };

  return (
    <AnimatePresence>
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
          <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
          <div className="relative z-10 space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1 mb-2">
                  <Droplets className="w-3 h-3 text-[#3b82f6]" />
                  <span className="text-[11px] text-[#a0a0a0]">
                    Add liquidity to {pool.pairLabel}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#e0e0e0]">
                  Provide liquidity
                </h3>
                <p className="mt-1 text-[11px] text-[#707070]">
                  Deposit both tokens to receive LP tokens and earn trading fees
                  plus rewards.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pair preview */}
            <div className="flex items-center gap-3 bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3">
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                  <img
                    src={meta0.logo}
                    alt={meta0.symbol}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="w-9 h-9 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                  <img
                    src={meta1.logo}
                    alt={meta1.symbol}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-[#e0e0e0]">
                      {pool.pairLabel}
                    </div>
                    <div className="text-[11px] text-[#707070]">
                      {meta0.name} • {meta1.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#707070]">APR</div>
                    <div className="text-sm font-semibold text-[#3b82f6] flex items-center gap-1">
                      {pool.apr.toFixed(1)}%
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded-full ${getTypeBadgeClasses(
                      pool.type
                    )}`}
                  >
                    {pool.type} pool
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${getRiskBadgeClasses(
                      pool.risk
                    )}`}
                  >
                    {pool.risk} risk
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#111827] text-[#a0a0a0] border border-[#1f1f1f]">
                    {pool.chain}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] text-[#a0a0a0]">
                  Total deposit (approx in USD)
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
                    step="0.01"
                    min={0}
                    className="w-full rounded-xl bg-[#050816] border border-[#1f1f1f] text-sm text-[#e0e0e0] pl-6 pr-3 py-2.5 outline-none focus:border-[#3b82f6]"
                  />
                </div>
                {error && <div className="text-[11px] text-red-400">{error}</div>}
              </div>

              {/* Split preview */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#707070]">{meta0.symbol} side</span>
                    <img
                      src={meta0.logo}
                      alt={meta0.symbol}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {half > 0 ? `$${half.toFixed(2)}` : "—"}
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1">
                    50% of deposit allocated
                  </div>
                </div>
                <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#707070]">{meta1.symbol} side</span>
                    <img
                      src={meta1.logo}
                      alt={meta1.symbol}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {half > 0 ? `$${half.toFixed(2)}` : "—"}
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1">
                    50% of deposit allocated
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#707070]">Estimated LP received</span>
                  <span className="text-[#e0e0e0] font-semibold">
                    {numericAmount > 0
                      ? (numericAmount / 10).toFixed(4)
                      : "0.0000"}{" "}
                    LP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#707070]">Fee tier</span>
                  <span className="text-[#e0e0e0] font-semibold">
                    {pool.fee.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[10px] text-[#707070]">
                  Values are estimates for preview only. Exact amounts will be
                  calculated on transaction.
                </div>
              </div>

              <button
                type="submit"
                className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-all"
              >
                Confirm deposit
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Manage position modal
interface ManagePositionModalProps {
  pool: Pool;
  position: UserPosition;
  onClose: () => void;
  onUpdate: (updated: UserPosition | null) => void;
}

const ManagePositionModal: React.FC<ManagePositionModalProps> = ({
  pool,
  position,
  onClose,
  onUpdate,
}) => {
  const [withdrawPct, setWithdrawPct] = useState(0);

  const remainingLp = position.lpAmount * (1 - withdrawPct / 100);
  const withdrawLp = position.lpAmount * (withdrawPct / 100);

  const handleApply = () => {
    if (withdrawPct === 100) {
      onUpdate(null);
      return;
    }
    const updated: UserPosition = {
      ...position,
      lpAmount: Number(remainingLp.toFixed(4)),
      sharePct: Number(
        Math.max(position.sharePct * (1 - withdrawPct / 100), 0.01).toFixed(2)
      ),
      earnedUsd: 0,
    };
    onUpdate(updated);
  };

  const handleClaim = () => {
    if (position.earnedUsd <= 0) {
      onClose();
      return;
    }
    const updated: UserPosition = {
      ...position,
      earnedUsd: 0,
    };
    onUpdate(updated);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#050816] p-6 overflow-hidden"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
        >
          <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-20 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_60%)]" />
          <div className="relative z-10 space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1 mb-2">
                  <LineChart className="w-3 h-3 text-[#22c1c3]" />
                  <span className="text-[11px] text-[#a0a0a0]">
                    Manage position in {pool.pairLabel}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#e0e0e0]">
                  Position controls
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current stats */}
            <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#707070]">LP tokens</span>
                <span className="text-[#e0e0e0] font-semibold">
                  {position.lpAmount.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#707070]">Pool share</span>
                <span className="text-[#e0e0e0] font-semibold">
                  {position.sharePct.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#707070]">Unclaimed rewards</span>
                <span className="text-[#22c1c3] font-semibold">
                  {formatUsdExact(position.earnedUsd)}
                </span>
              </div>
            </div>

            {/* Withdraw controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a0a0a0]">
                  Withdraw amount
                </span>
                <span className="text-[11px] text-[#707070]">
                  {withdrawPct}% selected
                </span>
              </div>
              <div className="flex gap-2">
                {[0, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setWithdrawPct(pct)}
                    className={`flex-1 rounded-full border px-2 py-1 text-[11px] transition-all ${
                      withdrawPct === pct
                        ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                        : "bg-[#050816] border-[#1f1f1f] text-[#a0a0a0]"
                    }`}
                  >
                    {pct === 0 ? "Keep all" : `${pct}%`}
                  </button>
                ))}
              </div>

              <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#707070]">Withdraw preview</span>
                  <span className="text-[#e0e0e0] font-semibold">
                    {withdrawLp > 0 ? withdrawLp.toFixed(4) : "0.0000"} LP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#707070]">Remaining position</span>
                  <span className="text-[#e0e0e0] font-semibold">
                    {remainingLp.toFixed(4)} LP
                  </span>
                </div>
                <div className="text-[10px] text-[#707070]">
                  Withdrawing reduces your pool share and resets displayed
                  rewards in this preview.
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleApply}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-all"
              >
                {withdrawPct === 100 ? "Exit pool" : "Apply changes"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClaim}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f1f1f] bg-[#050816] px-4 py-2 text-[11px] text-[#a0a0a0] hover:border-[#3b82f6]/60 transition-all"
              >
                Claim rewards only
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Pools: React.FC = () => {
  const { connected } = useWallet() as any;

  const [positions, setPositions] = useState<UserPosition[]>(INITIAL_POSITIONS);

  const [poolTypeFilter, setPoolTypeFilter] = useState<"all" | PoolType>("all");
  const [chainFilter, setChainFilter] = useState<"all" | ChainName>("all");
  const [search, setSearch] = useState("");

  const [addPool, setAddPool] = useState<Pool | null>(null);
  const [managePool, setManagePool] = useState<Pool | null>(null);

  const totalTVL = useMemo(
    () => POOLS.reduce((acc, p) => acc + p.tvlUsd, 0),
    []
  );

  // 🧮 агрегований юзер-репорт: TVL, daily / weekly, total earned
  const userSummary = useMemo(() => {
    let totalUserTVL = 0;
    let totalDaily = 0;
    let totalWeekly = 0;
    let totalEarned = 0;

    positions.forEach((pos) => {
      const pool = POOLS.find((p) => p.id === pos.poolId);
      if (!pool) return;
      const approxValue = (pool.tvlUsd * pos.sharePct) / 100;
      const daily = (approxValue * pool.apr) / 100 / 365;

      totalUserTVL += approxValue;
      totalDaily += daily;
      totalWeekly += daily * 7;
      totalEarned += pos.earnedUsd;
    });

    return {
      totalUserTVL,
      totalDaily,
      totalWeekly,
      totalEarned,
    };
  }, [positions]);

  const avgAPR = useMemo(() => {
    if (!POOLS.length) return 0;
    const sum = POOLS.reduce((acc, p) => acc + p.apr, 0);
    return Number((sum / POOLS.length).toFixed(1));
  }, []);

  const filteredPools = useMemo(() => {
    let list = [...POOLS];

    if (poolTypeFilter !== "all") {
      list = list.filter((p) => p.type === poolTypeFilter);
    }
    if (chainFilter !== "all") {
      list = list.filter((p) => p.chain === chainFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const pair = p.pairLabel.toLowerCase();
        const label = p.label.toLowerCase();
        const tokens = p.tokens
          .map((t) => TOKEN_META[t].symbol.toLowerCase())
          .join(" ");
        return (
          pair.includes(q) ||
          label.includes(q) ||
          tokens.includes(q) ||
          p.chain.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [poolTypeFilter, chainFilter, search]);

  const userPositionsDetailed = useMemo(
    () =>
      positions
        .map((pos) => {
          const pool = POOLS.find((p) => p.id === pos.poolId);
          if (!pool) return null;
          return { pos, pool };
        })
        .filter(
          (x): x is { pos: UserPosition; pool: Pool } => x !== null
        ),
    [positions]
  );

  // Для Rewards center — ТОП позицій за earnedUsd
  const topPositionsForRewards = useMemo(() => {
    const sorted = [...userPositionsDetailed].sort(
      (a, b) => b.pos.earnedUsd - a.pos.earnedUsd
    );
    return sorted.slice(0, 3);
  }, [userPositionsDetailed]);

  // AI helper — вибираємо найцікавіші пули за APR * volume
  const aiSuggestedPools = useMemo(() => {
    return [...POOLS]
      .sort(
        (a, b) =>
          b.apr * b.volume24h - a.apr * a.volume24h
      )
      .slice(0, 3);
  }, []);

  const handleAddLiquidityClick = (pool: Pool) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    setAddPool(pool);
  };

  const handleConfirmAdd = (pool: Pool, amountUsd: number) => {
    setPositions((prev) => {
      const existing = prev.find((p) => p.poolId === pool.id);
      if (existing) {
        const updated: UserPosition = {
          ...existing,
          lpAmount: Number((existing.lpAmount + amountUsd / 10).toFixed(4)),
          sharePct: Number(
            Math.min(existing.sharePct + 0.25, 100).toFixed(2)
          ),
          earnedUsd: Number(
            (
              existing.earnedUsd +
              amountUsd * (pool.apr / 100) * 0.01
            ).toFixed(2)
          ),
          staked: true,
        };
        return prev.map((p) => (p.poolId === pool.id ? updated : p));
      }
      const newPos: UserPosition = {
        poolId: pool.id,
        lpAmount: Number((amountUsd / 10).toFixed(4)),
        sharePct: 0.5,
        earnedUsd: Number(
          (amountUsd * (pool.apr / 100) * 0.01).toFixed(2)
        ),
        staked: true,
      };
      return [...prev, newPos];
    });
    toast.success(`Liquidity added to ${pool.pairLabel}`);
  };

  const handleManageClick = (pool: Pool) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    const hasPosition = positions.some((p) => p.poolId === pool.id);
    if (!hasPosition) {
      setAddPool(pool);
    } else {
      setManagePool(pool);
    }
  };

  const handleUpdatePosition = (pool: Pool, updated: UserPosition | null) => {
    setPositions((prev) => {
      if (!updated) {
        return prev.filter((p) => p.poolId !== pool.id);
      }
      const exists = prev.some((p) => p.poolId === pool.id);
      if (!exists) return prev;
      return prev.map((p) => (p.poolId === pool.id ? updated : p));
    });

    if (!updated) {
      toast.success(`Position closed in ${pool.pairLabel}`);
    } else {
      toast.success(`Position updated in ${pool.pairLabel}`);
    }
  };

  const currentManagePosition =
    (managePool &&
      positions.find((p) => p.poolId === managePool.id)) ||
    null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
              <Droplets className="w-3 h-3 text-[#3b82f6]" />
              <span className="text-[11px] text-[#a0a0a0]">
                Multi-chain liquidity for SVT, USDT, USDC, BNB, SOL, ETH, XRP,
                DOGE
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#e0e0e0]">
              Liquidity Pools & Yield Farming
            </h1>
            <p className="text-sm text-[#a0a0a0]">
              Provide liquidity to core and experimental pools, earn rewards and
              route swaps across BNB Chain, Solana and Ethereum.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-end gap-2">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              <span className="text-[#a0a0a0]">
                Core pools audited • Experimental pools highlighted
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#050816] border border-[#1f1f1f] px-2 py-1">
                <Coins className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-[11px] text-[#e0e0e0]">
                  SVT, USDT, USDC, BNB, SOL, ETH, XRP, DOGE
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#050816] border border-[#1f1f1f] px-2 py-1">
                <LineChart className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-[11px] text-[#a0a0a0]">
                  Core, stable and experimental strategies
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

  {/* TVL */}
  <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
    {/* ICON AS BACKGROUND */}
    <PiggyBank className="absolute -right-6 -top-4 h-24 w-24 text-[#3b82f6] opacity-[0.05] blur-[1px]" />

    <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
    <div className="relative z-10">
      <div className="text-lg font-semibold text-[#e0e0e0]">
        {formatUsd(totalTVL)}
      </div>
      <div className="text-xs text-[#707070]">Total value locked</div>
    </div>
  </div>

  {/* Pools */}
  <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
    <Waves className="absolute -right-6 -top-4 h-24 w-24 text-[#22c1c3] opacity-[0.05] blur-[1px]" />

    <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_70%)]" />
    <div className="relative z-10">
      <div className="text-lg font-semibold text-[#e0e0e0]">
        {POOLS.length}
      </div>
      <div className="text-xs text-[#707070]">Active pools</div>
    </div>
  </div>

  {/* APR */}
  <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
    <Percent className="absolute -right-6 -top-4 h-24 w-24 text-[#a855f7] opacity-[0.05] blur-[1px]" />

    <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_70%)]" />
    <div className="relative z-10">
      <div className="text-lg font-semibold text-[#3b82f6]">
        {avgAPR}%
      </div>
      <div className="text-xs text-[#707070]">
        Average APR across all pools
      </div>
    </div>
  </div>

  {/* User share */}
  <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
    <Zap className="absolute -right-6 -top-4 h-24 w-24 text-[#facc15] opacity-[0.05] blur-[1px]" />

    <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#facc15_0,_transparent_70%)]" />
    <div className="relative z-10">
      <div className="text-lg font-semibold text-[#e0e0e0]">
        {formatUsd(userSummary.totalUserTVL)}
      </div>
      <div className="text-xs text-[#707070]">
        Your share (estimated)
      </div>
    </div>
  </div>

</div>


      {/* Filters */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
            <Filter className="w-3 h-3 text-[#3b82f6]" />
            <span className="text-[11px] text-[#a0a0a0]">
              Filter pools by type, chain or token
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "Core", "Stable", "Experimental"] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() =>
                    setPoolTypeFilter(type === "all" ? "all" : type)
                  }
                  className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${
                    poolTypeFilter === type
                      ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                      : "bg-[#050816] border-[#1f1f1f] text-[#e0e0e0]"
                  }`}
                >
                  {type === "all" ? "All types" : type}
                </button>
              )
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "BNB Chain", "Solana", "Ethereum"] as const).map(
              (chain) => (
                <button
                  key={chain}
                  onClick={() =>
                    setChainFilter(chain === "all" ? "all" : chain)
                  }
                  className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${
                    chainFilter === chain
                      ? "bg-[#111827] border-[#3b82f6] text-[#e0e0e0]"
                      : "bg-[#050816] border-[#1f1f1f] text-[#a0a0a0]"
                  }`}
                >
                  {chain === "all" ? "All networks" : chain}
                </button>
              )
            )}
          </div>
          
        </div>
      </div>

      {/* Layout: pools list + sidebar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Pools list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#e0e0e0]">
                  Available pools
                </h2>
                <span className="text-[11px] text-[#707070]">
                  {filteredPools.length} pools shown
                </span>
              </div>

              {filteredPools.length === 0 ? (
                <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-6 text-center text-xs text-[#707070]">
                  No pools match your filters. Try another network, type or
                  token.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPools.map((pool) => {
                    const hasPosition = positions.some(
                      (x) => x.poolId === pool.id
                    );
                    const [t0, t1] = pool.tokens;
                    const meta0 = TOKEN_META[t0];
                    const meta1 = TOKEN_META[t1];

                    return (
                     <div
  key={pool.id}
  className="relative bg-[#050816] border border-[#1f1f1f] rounded-xl px-3 py-2.5 hover:border-[#3b82f6]/70 transition-all overflow-hidden"
>
  <div className="pointer-events-none absolute right-0 top-0 h-full opacity-5">
    <LineChart className="w-16 h-16 text-[#3b82f6]" />
  </div>

  <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    {/* LEFT: logo + pair + chips + stats */}
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      {/* Logo + pair + chips */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
            <img
              src={meta0.logo}
              alt={meta0.symbol}
              className="w-4 h-4 object-contain"
            />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
            <img
              src={meta1.logo}
              alt={meta1.symbol}
              className="w-4 h-4 object-contain"
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold text-[#e0e0e0]">
              {pool.pairLabel}
            </span>
            {pool.boosted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/40 px-2 py-0.5 text-[10px] text-[#3b82f6] font-semibold">
                <Zap className="w-3 h-3" />
                Boosted
              </span>
            )}
            {hasPosition && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                <Droplets className="w-3 h-3" />
                You provide
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${getTypeBadgeClasses(
                pool.type
              )}`}
            >
              {pool.type}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${getRiskBadgeClasses(
                pool.risk
              )}`}
            >
              {pool.risk} risk
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#111827] text-[#a0a0a0] border border-[#1f1f1f]">
              {pool.chain}
            </span>
          </div>
        </div>
      </div>

      {/* Compact stats row */}
      <div className="grid grid-cols-3 gap-2 text-[10px] md:text-[11px]">
        <div>
          <div className="text-[#707070]">APR</div>
          <div className="flex items-center gap-1 text-[13px] font-semibold text-[#3b82f6]">
            {pool.apr.toFixed(1)}%
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
        <div>
          <div className="text-[#707070]">TVL</div>
          <div className="text-[13px] font-semibold text-[#e0e0e0]">
            {formatUsd(pool.tvlUsd)}
          </div>
        </div>
        <div>
          <div className="text-[#707070]">24h vol / fee</div>
          <div className="text-[11px] text-[#a0a0a0]">
            {formatUsd(pool.volume24h)} • {pool.fee.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>

    {/* RIGHT: actions компактніше */}
    <div className="flex flex-col md:flex-col gap-1.5 w-full md:w-40">
      {hasPosition && (
        <div className="text-[10px] text-emerald-400 text-center">
          Position active
        </div>
      )}
      <button
        onClick={() => handleAddLiquidityClick(pool)}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
          connected
            ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            : "bg-[#050816] border border-[#1f1f1f] text-[#707070]"
        }`}
        disabled={!connected}
      >
        Add liquidity
        <ArrowRight className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleManageClick(pool)}
        className="w-full rounded-lg border border-[#1f1f1f] bg-[#050816] px-3 py-1.5 text-[11px] text-[#a0a0a0] hover:border-[#3b82f6]/50 transition-all"
      >
        {hasPosition ? "Manage position" : "Start position"}
      </button>
    </div>
  </div>
</div>

                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: rewards center + your liquidity + AI helper + explainer */}
        <div className="space-y-4">
          {/* Rewards center */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center">
                    <Gift className="w-4 h-4 text-[#22c55e]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      Rewards center
                    </div>
                    <div className="text-[11px] text-[#707070]">
                      Aggregate view of all LP rewards
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#707070]">
                  {userPositionsDetailed.length} positions
                </span>
              </div>

              <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#707070]">
                    Unclaimed rewards
                  </span>
                  <span className="text-sm font-semibold text-[#22c55e]">
                    {formatUsdExact(userSummary.totalEarned)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#707070]">
                    Est. daily yield
                  </span>
                  <span className="text-[11px] font-semibold text-[#e0e0e0]">
                    {formatUsdExact(userSummary.totalDaily)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#707070]">
                    Est. weekly yield
                  </span>
                  <span className="text-[11px] font-semibold text-[#e0e0e0]">
                    {formatUsdExact(userSummary.totalWeekly)}
                  </span>
                </div>
                <button className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#22c55e]/10 px-3 py-2 text-[11px] font-medium text-[#22c55e] border border-[#22c55e]/40 hover:bg-[#16a34a]/20 transition-all">
                  <Gift className="w-3 h-3" />
                  Harvest all rewards (preview)
                </button>
              </div>

              {topPositionsForRewards.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] text-[#707070]">
                    Top earning positions
                  </div>
                  {topPositionsForRewards.map(({ pos, pool }) => {
                    const dailyApprox = (() => {
                      const value =
                        (pool.tvlUsd * pos.sharePct) / 100;
                      return (value * pool.apr) / 100 / 365;
                    })();
                    const weeklyApprox = dailyApprox * 7;

                    return (
                      <div
                        key={pos.poolId}
                        className="flex items-center justify-between rounded-lg border border-[#1f1f1f] bg-[#050816] px-3 py-2"
                      >
                        <div>
                          <div className="text-[11px] font-semibold text-[#e0e0e0]">
                            {pool.pairLabel}
                          </div>
                          <div className="text-[10px] text-[#707070]">
                            Daily {formatUsdExact(dailyApprox)} • Weekly{" "}
                            {formatUsdExact(weeklyApprox)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-[#707070]">
                            Unclaimed
                          </div>
                          <div className="text-[11px] font-semibold text-[#22c55e]">
                            {formatUsdExact(pos.earnedUsd)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Your positions */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#e0e0e0]">
                  Your liquidity
                </h2>
                <span className="text-[11px] text-[#707070]">
                  {userPositionsDetailed.length} positions
                </span>
              </div>

              {userPositionsDetailed.length === 0 ? (
                <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-4 text-xs text-[#707070]">
                  Once you provide liquidity, your positions will appear here
                  with allocation and earned rewards.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {userPositionsDetailed.map(({ pos, pool }) => {
                    const approxValue =
                      (pool.tvlUsd * pos.sharePct) / 100;
                    const daily =
                      (approxValue * pool.apr) / 100 / 365;
                    const weekly = daily * 7;

                    return (
                      <div
                        key={pos.poolId}
                        className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                              <img
                                src={TOKEN_META[pool.tokens[0]].logo}
                                alt={pool.tokens[0]}
                                className="w-4 h-4 object-contain"
                              />
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#e0e0e0]">
                                {pool.pairLabel}
                              </div>
                              <div className="text-[11px] text-[#707070]">
                                Share {pos.sharePct.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-[#707070]">
                              LP tokens
                            </div>
                            <div className="text-[13px] font-semibold text-[#e0e0e0]">
                              {pos.lpAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#707070]">
                          <div>
                            Earned:{" "}
                            <span className="text-[#22c1c3] font-semibold">
                              {formatUsdExact(pos.earnedUsd)}
                            </span>
                          </div>
                          <div>
                            Status:{" "}
                            <span className="font-semibold text-[#e0e0e0]">
                              {pos.staked
                                ? "Staked in farming"
                                : "Wallet only"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#707070]">
                          <div>
                            Est. daily:{" "}
                            <span className="text-[#e0e0e0] font-semibold">
                              {formatUsdExact(daily)}
                            </span>
                          </div>
                          <div>
                            Est. weekly:{" "}
                            <span className="text-[#e0e0e0] font-semibold">
                              {formatUsdExact(weekly)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* AI helper */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#a855f7]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      Best pools for you
                    </div>
                    <div className="text-[11px] text-[#707070]">
                      Based on APR, volume and pool type
                    </div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-[#facc15]" />
              </div>

              <div className="space-y-2">
                {aiSuggestedPools.map((pool) => {
                  const [t0, t1] = pool.tokens;
                  const meta0 = TOKEN_META[t0];
                  const meta1 = TOKEN_META[t1];

                  return (
                    <div
                      key={pool.id}
                      className="flex items-center justify-between rounded-lg border border-[#1f1f1f] bg-[#050816] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative flex -space-x-2">
                          <img
                            src={meta0.logo}
                            alt={meta0.symbol}
                            className="w-5 h-5 rounded-full border border-[#050816]"
                          />
                          <img
                            src={meta1.logo}
                            alt={meta1.symbol}
                            className="w-5 h-5 rounded-full border border-[#050816]"
                          />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-[#e0e0e0]">
                            {pool.pairLabel}
                          </div>
                          <div className="text-[10px] text-[#707070]">
                            APR {pool.apr.toFixed(1)}% • TVL{" "}
                            {formatUsd(pool.tvlUsd)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddLiquidityClick(pool)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#3b82f6]/50 bg-[#0b1120] px-2.5 py-1.5 text-[11px] font-medium text-[#e0e0e0] hover:bg-[#111827] transition-all"
                      >
                        Add
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-[#707070]">
                Suggestions are informational only and do not constitute
                financial advice.
              </div>
            </div>
          </div>

          {/* Explainer */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-[#3b82f6]" />
              <h3 className="text-sm font-semibold text-[#e0e0e0]">
                How pools work
              </h3>
            </div>
            <div className="space-y-2 text-xs text-[#a0a0a0]">
              <p>
                When you provide liquidity, you deposit two tokens into a pool
                (for example SVT / USDT) and receive LP tokens that represent
                your share.
              </p>
              <p>
                Trading fees and farming rewards are distributed between
                liquidity providers proportional to their share. Boosted pools
                give extra SVT rewards for early supporters.
              </p>
              <p>
                Core pools are designed for long-term routing and stability,
                stable pools focus on minimal volatility, and experimental pools
                are higher risk with new strategies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {addPool && (
        <AddLiquidityModal
          pool={addPool}
          onClose={() => setAddPool(null)}
          onConfirm={(amount) => {
            handleConfirmAdd(addPool, amount);
            setAddPool(null);
          }}
        />
      )}

      {managePool && currentManagePosition && (
        <ManagePositionModal
          pool={managePool}
          position={currentManagePosition}
          onClose={() => setManagePool(null)}
          onUpdate={(updated) => {
            handleUpdatePosition(managePool, updated);
            setManagePool(null);
          }}
        />
      )}
    </div>
  );
};

export default Pools;
