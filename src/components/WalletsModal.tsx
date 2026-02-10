import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  X,
  Copy,
  ExternalLink,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Settings,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Clock,
  TrendingUp,
  Users,
  Award,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import { useVault } from "../hooks/useVault";

type Tab = "overview" | "transfer" | "activity" | "settings" | "stats";
type Asset = "NATIVE" | "USDT";
type FlowStep =
  | "idle"
  | "approving"
  | "approved"
  | "processing"
  | "done"
  | "error";
type Direction = "deposit" | "withdraw";

const CLUSTER: "testnet" | "mainnet" = "testnet";

const icons = {
  BNB: "/icons/bnb.png",
  USDT: "/icons/usdt.png",
  SVT: "/icons/price-icon-4.png",
};

const fmt2 = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmt4 = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
const shorten = (a?: string | null) =>
  a ? `${a.slice(0, 4)}...${a.slice(-4)}` : "—";

function openExplorer(address: string, cluster: "testnet" | "mainnet") {
  const url = `https://testnet.bscscan.com/address/${address}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green" | "warn" | "red";
}) {
  const cls =
    tone === "blue"
      ? "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#9cc0ff]"
      : tone === "green"
        ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]"
        : tone === "warn"
          ? "border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]"
          : tone === "red"
            ? "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fca5a5]"
            : "border-[#1f1f1f]/40 bg-[#050816]/70 text-[#a0a0a0]";
  return (
    <span className={`text-[10px] px-2 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl ui-card overflow-hidden relative">
      <img
        src="/icons/shape-4-1.png"
        className="opacity-35 absolute top-0 left-0"
        alt=""
      />
      <div className="pointer-events-none absolute -inset-0.5 opacity-15 card-gradient-soft" />
      <div className="relative px-4 py-3 border-b border-[#111827] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#e0e0e0]">{title}</div>
          {subtitle && (
            <div className="text-[11px] text-[#707070] mt-0.5">{subtitle}</div>
          )}
        </div>
        {right}
      </div>
      <div className="relative p-4">{children}</div>
    </div>
  );
}

function TokenRow({
  icon,
  symbol,
  name,
  amount,
  usd,
  footer,
}: {
  icon: string;
  symbol: string;
  name?: string;
  amount: string;
  usd: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#9cc0ff]/10 backdrop-blur-sm p-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl ui-inner flex items-center justify-center overflow-hidden">
            <img src={icon} alt={symbol} className="w-5 h-5 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-[#e0e0e0] leading-tight">
              {symbol}
            </div>
            {name && (
              <div className="text-[10px] text-[#707070] truncate">{name}</div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[12px] font-semibold text-[#e0e0e0]">
            {amount}
          </div>
          <div className="text-[10px] text-[#707070]">{usd}</div>
        </div>
      </div>

      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
  tone = "blue",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "blue" | "neutral" | "green" | "warn";
}) {
  const cls =
    tone === "green"
      ? "border-[#22c55e]/50 bg-[#22c55e]/15 hover:bg-[#22c55e]/20 text-[#86efac]"
      : tone === "warn"
        ? "border-[#facc15]/50 bg-[#facc15]/10 hover:bg-[#facc15]/15 text-[#facc15]"
        : tone === "neutral"
          ? "border-[#eee]/5 ui-inner hover:bg-[#222]/50 text-[#e0e0e0]"
          : "border-[#3b82f6]/60 bg-[#3b82f6] hover:bg-[#2563eb] text-white";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-10 w-full rounded-xl border text-[12px] font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${cls}`}
    >
      {children}
    </button>
  );
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const normalized =
    parts.length <= 2 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
  const n = Number(normalized);
  return {
    normalized,
    n: Number.isFinite(n) ? n : 0,
    ok: Number.isFinite(n) && n > 0,
  };
}

type ActivityItem = {
  id: string;
  ts: number;
  direction: Direction;
  asset: Asset;
  amount: number;
  status: "success" | "pending" | "failed";
  txHash?: string;
  note?: string;
};

type PredictionStats = {
  totalBets: number;
  totalWon: number;
  winRate: number;
  favoriteAsset: string;
  biggestWin: number;
  totalVolume: number;
};

export function WalletsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { connected, publicKey, walletType, balance, disconnectWallet } =
    useWallet();

  const {
    vault,
    projectWalletAddress,
    getTransactionHistory,
    projectBnb,
    projectUsdt,
    externalUsdt,
    externalBnb,
    depositBNB,
    withdrawBNB,
    depositUSDT, // ← ДОДАЄМО
    withdrawUSDT, // ← ДОДАЄМО
    checkUSDTApproval, // ← ДОДАЄМО
    approveUSDT, // ← ДОДАЄМО
    createVault, // ← ДОДАЙ createVault ТУТ
    loading: vaultLoading,
  } = useVault();

  const [tab, setTab] = useState<Tab>("overview");
  const nativeSymbol = "BNB";
  const nativeIcon = icons.BNB;

  // Реальні ціни (потім з API)
  const [priceBnb] = useState<number>(350);
  const [priceUsdt] = useState<number>(1);

  const [predictionStats, setPredictionStats] = useState<PredictionStats>({
    totalBets: 0,
    totalWon: 0,
    winRate: 0,
    favoriteAsset: "BTC",
    biggestWin: 0,
    totalVolume: 0,
  });

  const usdExternal = externalBnb * priceBnb + externalUsdt * priceUsdt;
  const usdInternal = projectBnb * priceBnb + projectUsdt * priceUsdt;

  const [direction, setDirection] = useState<Direction>("deposit");
  const [asset, setAsset] = useState<Asset>("USDT");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<FlowStep>("idle");
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const actionKey = `${direction}_${asset}`;
  const vaultExists = vault?.exists || false;
  const vaultReady = vaultExists || Boolean(projectWalletAddress);

  const [activity, setActivity] = useState<ActivityItem[]>([]);

  async function getRealUsdtBalance(address: string): Promise<number> {
    try {
      const response = await fetch(
        "https://cnxyofqchoejrdrxdmwd.supabase.co/functions/v1/vault-sync",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get_balance",
            data: { user_address: address },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Повертаємо зовнішній USDT баланс (не з vault)
        return parseFloat(result.external_usdt_balance) || 0;
      }

      return 0;
    } catch (error) {
      console.error("Failed to fetch USDT balance:", error);
      return 0;
    }
  }

  // Mock: завантажити статистику предикшн
  useEffect(() => {
    if (connected) {
      // Тут буде запит до API предикшн
      setPredictionStats({
        totalBets: 24,
        totalWon: 14,
        winRate: 58.3,
        favoriteAsset: "ETH",
        biggestWin: 250,
        totalVolume: 1250,
      });
    }
  }, [connected]);

  const maxAmount = useMemo(() => {
    if (direction === "deposit") {
      if (asset === "NATIVE") return externalBnb;
      if (asset === "USDT") return externalUsdt;
      return 0;
    } else {
      if (asset === "NATIVE") return projectBnb;
      if (asset === "USDT") return projectUsdt;
      return 0;
    }
  }, [direction, asset, externalBnb, externalUsdt, projectBnb, projectUsdt]);

  const parsed = useMemo(() => parseAmount(amount), [amount]);

  const canAct = useMemo(() => {
    if (!connected) return false;
    if (!vaultReady) return false;
    if (!parsed.ok) return false;
    if (parsed.n > maxAmount) return false;
    if (direction === "withdraw" && asset === "NATIVE" && parsed.n > projectBnb)
      return false;
    if (direction === "withdraw" && asset === "USDT" && parsed.n > projectUsdt)
      return false;
    return true;
  }, [
    connected,
    vaultReady,
    parsed.ok,
    parsed.n,
    maxAmount,
    direction,
    asset,
    projectBnb,
    projectUsdt,
  ]);

  const badgeForStep = () => {
    if (step === "approving") return <Pill tone="warn">Approving…</Pill>;
    if (step === "approved") return <Pill tone="green">Approved</Pill>;
    if (step === "processing") return <Pill tone="warn">Processing…</Pill>;
    if (step === "done") return <Pill tone="green">Done</Pill>;
    if (step === "error") return <Pill tone="red">Error</Pill>;
    return <Pill>Ready</Pill>;
  };

  const copy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const refresh = async () => {
    toast.success("Refreshing data...");
    // Тут буде реальне оновлення балансів
  };

  const handleCreateVault = async () => {
    if (!connected || !publicKey) return toast.error("Connect wallet first");

    setStep("processing");
    try {
      // Викликаємо createVault з хука useVault
      const result = await createVault(); // ← переконайся, що createVault є в деструктуризації useVault()
      toast.success("Vault created successfully!");
      setStep("done");
      setTimeout(() => setStep("idle"), 1000);

      // Оновити баланси
      setTimeout(() => {
        // можна викликати refreshVault якщо він є
      }, 2000);
    } catch (error: any) {
      toast.error("Failed to create vault: " + error.message);
      setStep("error");
    }
  };

  // В функції approve додай перевірку для USDT:
  const approve = async () => {
    if (!canAct) return;
    setStep("approving");
    try {
      if (asset === "USDT") {
        await approveUSDT(parsed.n); // ← Виклик approve для USDT
        setApproved((p) => ({ ...p, [actionKey]: true }));
        setStep("approved");
        toast.success("USDT approved successfully");
      } else {
        // Для BNB approve не потрібен
        setApproved((p) => ({ ...p, [actionKey]: true }));
        setStep("approved");
        toast.success("Approved successfully");
      }
    } catch {
      toast.error("Approval failed");
      setStep("error");
    }
  };

  const loadTransactionHistory = async () => {
    try {
       const profileId = localStorage.getItem('profile_id');
    console.log('📤 Loading transactions for profile:', profileId);
     // Отримуємо всі транзакції для цього гаманця
    const allTransactions = await getTransactionHistory(50);
     // Фільтруємо на фронтенді по profile_id
    const userTransactions = allTransactions.filter((tx: { vault_profile_id: string | null; }) => 
      tx.vault_profile_id === profileId
    );
    console.log(`📊 All: ${allTransactions.length}, Filtered: ${userTransactions.length}`);
      

      if (!profileId) {
      console.error('❌ No profile_id found');
      return;
    }
    const transactions = await getTransactionHistory(20, profileId);
    console.log('📥 Transactions loaded:', transactions?.length);
      // Конвертуємо формат для твого ActivityItem[]
      const formatted = transactions.map((tx: any) => {
        // Конвертуємо asset з БД ('BNB', 'USDT') в наш Asset тип ('NATIVE', 'USDT')
        let asset: Asset = "USDT";
        if (tx.asset === "BNB" || tx.asset === "NATIVE") {
          asset = "NATIVE";
        } else if (tx.asset === "USDT") {
          asset = "USDT";
        }

        // Конвертуємо тип транзакції
        let direction: Direction = "deposit";
        if (tx.type === "withdrawal" || tx.type === "withdraw") {
          direction = "withdraw";
        } else if (tx.type === "deposit") {
          direction = "deposit";
        }

        return {
          id: tx.id,
          ts: new Date(tx.created_at).getTime(),
          direction,
          asset,
          amount: parseFloat(tx.amount),
          status: tx.status === "completed" ? "success" : "pending",
          txHash: tx.tx_hash,
          note: tx.metadata?.method || "Transaction",
        };
      });

      setActivity(formatted);
    } catch (error) {
      console.error("Failed to load transaction history:", error);
    }
  };

  // Викликай при зміні вкладки або після транзакції
  useEffect(() => {
    if (tab === "activity") {
      loadTransactionHistory();
    }
  }, [tab]);

  const confirmTransfer = async () => {
    if (!canAct) return;
    if (asset === "USDT" && !approved[actionKey]) {
      toast.error("Approve USDT first");
      return;
    }

    setStep("processing");

    try {
      if (direction === "deposit") {
        if (asset === "NATIVE") {
          await depositBNB(parsed.n);
        } else if (asset === "USDT") {
          await depositUSDT(parsed.n);
        }
      } else {
        if (asset === "NATIVE") {
          await withdrawBNB(parsed.n);
        } else if (asset === "USDT") {
          await withdrawUSDT(parsed.n);
        }
      }

      setStep("done");
      setAmount("");
      toast.success(
        `${direction === "deposit" ? "Deposit" : "Withdraw"} successful!`,
      );
      setTimeout(() => loadTransactionHistory(), 4000);
      setTab("activity");

      // БАЛАНСИ ОНОВЛЯТЬСЯ АВТОМАТИЧНО через setTimeout у методах хука
    } catch (error: any) {
      setStep("error");
      toast.error(`Transaction failed: ${error.message}`);
    }
  };

  const pushActivity = (item: Omit<ActivityItem, "id" | "ts">) => {
    const newItem: ActivityItem = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      ts: Date.now(),
      ...item,
    };
    setActivity((prev) => [newItem, ...prev].slice(0, 20));
  };

  const disconnect = () => {
    disconnectWallet();
    onClose();
  };

  const networkFee = "~0.0002 BNB";
  const approvalNeeded = asset === "USDT";

  const tabs = [
    { id: "overview", label: "Overview", icon: Wallet },
    { id: "transfer", label: "Transfer", icon: ArrowLeftRight },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  type Tab = (typeof tabs)[number]["id"];
  const activeIndex = tabs.findIndex((t) => t.id === tab);
  const tabCount = tabs.length;

  function AssetChip({
    active,
    onClick,
    icon,
    label,
    tone,
  }: {
    active: boolean;
    onClick: () => void;
    icon: string;
    label: string;
    tone: "blue" | "green";
  }) {
    return (
      <button
        onClick={onClick}
        className={`h-10 px-4 rounded-xl text-[11px] inline-flex items-center justify-center gap-2 transition-colors ${
          active
            ? `bg-[#9cc0ff]/10 border ${
                tone === "blue"
                  ? "border-[#3b82f6]/20 text-[#9cc0ff]"
                  : "border-[#22c55e]/20 text-[#86efac]"
              }`
            : "ui-inner text-[#e0e0e0]"
        }`}
      >
        <img src={icon} className="w-4 h-4" alt={label} />
        {label}
      </button>
    );
  }

  function InfoRow({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <div className="rounded-xl bg-[#050816]/60 p-3">
        <div className="text-[10px] text-[#707070]">{label}</div>
        <div className="mt-1 text-[11px] font-semibold text-[#e0e0e0]">
          {value}
        </div>
      </div>
    );
  }

  // Settings
  const [prefAutoLock, setPrefAutoLock] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<"15m" | "1h" | "off">(
    "1h",
  );
  const [trustedWallets, setTrustedWallets] = useState<string[]>([]);
  const [trustedInput, setTrustedInput] = useState("");

  const addTrusted = () => {
    const v = trustedInput.trim();
    if (!v) return;
    if (!v.startsWith("0x") || v.length !== 42) {
      toast.error("Invalid BNB address");
      return;
    }
    setTrustedWallets((p) => (p.includes(v) ? p : [v, ...p]));
    setTrustedInput("");
    toast.success("Address added to trusted list");
  };

  const removeTrusted = (address: string) => {
    setTrustedWallets((p) => p.filter((a) => a !== address));
    toast.success("Address removed");
  };

  if (!open) return null;

  function VaultAddressDisplay({
    userAddress,
    contractAddress,
  }: {
    userAddress?: string;
    contractAddress: string;
  }) {
    return (
      <div>
        <div className="text-[11px] text-[#e0e0e0] font-mono truncate">
          {userAddress
            ? `Vault for ${shorten(userAddress)}`
            : "— create vault to start"}
        </div>
        <div className="text-[10px] text-[#707070] flex items-center gap-1">
          <span>Contract:</span>
          <span className="font-mono">{shorten(contractAddress)}</span>
          <button
            onClick={() => copy(contractAddress)}
            className="ml-1 text-[#9cc0ff] hover:text-[#3b82f6]"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
  const CONTRACT_ADDRESS = "0x34f26715d6fCfCAbd3F3eDaa6936Ff120E99d013";
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[780px]">
        <div className="rounded-2xl bg-gradient-to-r from-[#0a101f]/80 to-[#253549]/50 backdrop-blur shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-[#1f1f1f]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  Wallet Center
                </div>
                <Pill tone="blue">{CLUSTER.toUpperCase()}</Pill>
                {badgeForStep()}
              </div>
              <div className="mt-1 text-[11px] text-[#707070] font-mono truncate">
                {publicKey ? shorten(publicKey) : "Connect wallet from sidebar"}{" "}
                • <span className="text-[#22c55e]">Connected</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="w-9 h-9 rounded-xl bg-[#9cc0ff]/10 hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-[#9cc0ff]" />
              </button>

              {connected && (
                <button
                  onClick={disconnect}
                  className="w-9 h-9 rounded-xl bg-[#fca5a5]/10 hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4 text-[#fca5a5]" />
                </button>
              )}

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-[#a0a0a0]" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-4">
            <div className="flex mb-3 items-center justify-between gap-3">
              <div className="relative rounded-xl ui-inner p-1">
                {/* moving indicator */}
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-[var(--bg-card)] shadow-xs transition-transform duration-300 ease-out"
                  style={{
                    width: `calc((100% - 14px) / ${tabCount})`,
                    transform: `translateX(calc(${activeIndex} * (100% - -6px / ${tabCount})))`,
                  }}
                />

                <div
                  className="relative z-10 grid"
                  style={{
                    gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))`,
                  }}
                >
                  {tabs.map((t) => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`h-8 px-3 rounded-xl text-[11px] inline-flex items-center justify-center gap-1 transition-colors ${
                          active
                            ? "text-[var(--text-main)]"
                            : "text-[var(--text-muted)] backdrop-blur hover:text-[var(--text-main)]"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            active
                              ? "text-[var(--accent-blue)]"
                              : "text-[var(--text-dim)]"
                          }`}
                        />
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 mr-2 px-3 ui-card rounded-xl p-2 w-56 items-center grid grid-cols-2">
                <div className="text-[10px] text-left text-[#707070]">
                  Vault total:
                </div>
                <div className="text-sm text-right font-semibold text-[#e0e0e0]">
                  <span className="text-[10px] font-normal">$</span>{" "}
                  {fmt2(usdInternal)}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {/* Body */}
              <div className="p-5 h-[68vh] overflow-y-auto">
                {tab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card
                      title="External Wallet"
                      subtitle={
                        <div className="flex items-center gap-2">
                          On-chain • BNB Smart Chain
                        </div>
                      }
                      right={
                        <div className="text-right">
                          <div className="text-[10px] text-[#707070]">
                            Total
                          </div>
                          <div className="text-sm text-right font-semibold text-[#e0e0e0]">
                            <span className="text-[10px] font-normal">$</span>{" "}
                            {fmt2(usdExternal)}
                          </div>
                        </div>
                      }
                    >
                      <div className="text-[11px] text-[#707070]">
                        Use this wallet to deposit into{" "}
                        <span className="text-[#e0e0e0] font-semibold">
                          Prediction Vault
                        </span>
                        .
                      </div>

                      <div className="mt-3 gap-2 grid grid-cols-1 lg:grid-cols-2">
                        <TokenRow
                          icon={nativeIcon}
                          symbol="BNB"
                          name="BNB Smart Chain"
                          amount={fmt4(externalBnb)}
                          usd={`$${fmt2(externalBnb * priceBnb)}`}
                        />
                        <TokenRow
                          icon={icons.USDT}
                          name="Tether"
                          symbol="USDT"
                          amount={fmt2(externalUsdt)}
                          usd={`$${fmt2(externalUsdt * priceUsdt)}`}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-[11px] text-[#a0a0a0]">
                          Total external:{" "}
                          <span className="text-[#e0e0e0] font-semibold">
                            ${fmt2(usdExternal)}
                          </span>
                        </div>

                        {publicKey && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => copy(publicKey)}
                              className="h-8 px-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] text-[10px] text-[#e0e0e0] inline-flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy
                            </button>
                            <button
                              onClick={() => openExplorer(publicKey, CLUSTER)}
                              className="h-8 px-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] text-[10px] text-[#e0e0e0] inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <PrimaryBtn
                          tone="neutral"
                          onClick={() => setTab("transfer")}
                        >
                          <ArrowDownToLine className="w-4 h-4" /> Deposit
                        </PrimaryBtn>
                        <PrimaryBtn
                          tone="neutral"
                          onClick={() => {
                            setDirection("withdraw");
                            setTab("transfer");
                          }}
                        >
                          <ArrowUpFromLine className="w-4 h-4" /> Withdraw
                        </PrimaryBtn>
                      </div>
                    </Card>

                    <Card
                      title="Prediction Vault"
                      subtitle="Internal vault for prediction markets"
                      right={<Pill tone="green">Active</Pill>}
                    >
                      <div className="rounded-xl bg-[var(--modal-block)] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[10px] text-[#707070]">
                              Vault Address
                            </div>
                            <div className="mt-1 text-[11px] text-[#e0e0e0] font-mono truncate">
                              {publicKey && (
                                <VaultAddressDisplay
                                  userAddress={publicKey}
                                  contractAddress={
                                    projectWalletAddress || CONTRACT_ADDRESS
                                  }
                                />
                              )}
                            </div>
                            <div className="text-[10px] text-[#707070] mt-1">
                              All prediction bets will use funds from this vault
                            </div>
                          </div>
                          {projectWalletAddress && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => copy(projectWalletAddress)}
                                className="h-8 px-2 rounded-lg ui-card hover:bg-[#222] text-[10px] text-[#e0e0e0] inline-flex items-center gap-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  openExplorer(projectWalletAddress, CLUSTER)
                                }
                                className="h-8 px-2 rounded-lg ui-card hover:bg-[#222] text-[10px] text-[#e0e0e0] inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {(!vault || !vault.exists) && ( // ← Додай цю умову
                        <div className="mt-3 text-center">
                          <button
                            onClick={handleCreateVault} // ← зміни тут на handleCreateVault
                            disabled={!connected || step === "processing"}
                            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] hover:opacity-90 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {step === "processing" ? (
                              <>
                                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Wallet className="w-4 h-4" />
                                Create Prediction Vault
                              </>
                            )}
                          </button>
                          <div className="mt-2 text-[10px] text-[#707070]">
                            Required to participate in prediction markets
                          </div>
                        </div>
                      )}

                      {vault?.exists && ( // ← показуємо тільки якщо vault існує
                        <>
                          <div className="mt-3 space-y-2">
                            <TokenRow
                              icon={nativeIcon}
                              symbol="BNB"
                              name="For gas fees"
                              amount={fmt4(projectBnb)}
                              usd={`$${fmt2(projectBnb * priceBnb)}`}
                              footer={
                                <div className="text-[10px] text-[#707070]">
                                  Keep some BNB for prediction transaction fees
                                </div>
                              }
                            />
                            <TokenRow
                              icon={icons.USDT}
                              symbol="USDT"
                              name="For predictions"
                              amount={fmt2(projectUsdt)}
                              usd={`$${fmt2(projectUsdt * priceUsdt)}`}
                              footer={
                                <div className="text-[10px] text-[#707070]">
                                  Main asset for prediction markets
                                </div>
                              }
                            />
                          </div>

                          <div className="mt-4 text-center">
                            <div className="text-[11px] text-[#a0a0a0] mb-2">
                              Ready for predictions:{" "}
                              <span className="text-[#22c55e] font-semibold">
                                ${fmt2(projectUsdt + projectBnb * priceBnb)}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate("/predictions")}
                              className="w-full h-10 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-2"
                            >
                              <TrendingUp className="w-4 h-4" />
                              Go to Predictions
                            </button>
                          </div>
                        </>
                      )}
                    </Card>
                  </div>
                )}

                {tab === "transfer" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                      {/* LEFT: Transfer panel */}
                      <div className="lg:col-span-6 space-y-3">
                        {/* FROM */}
                        <div className="rounded-2xl ui-card relative overflow-hidden p-4">
                          <div className="pointer-events-none absolute inset-0 opacity-10 card-gradient-soft" />

                          <div className="relative z-10 flex items-center justify-between">
                            <div className="text-[11px] text-[#707070]">
                              From
                              <span className="ml-2 text-[#a0a0a0]">
                                {direction === "deposit"
                                  ? "External Wallet"
                                  : "Prediction Vault"}
                              </span>
                            </div>

                            <div className="text-[10px] text-[#707070]">
                              Available:{" "}
                              <span className="text-[#e0e0e0] font-semibold">
                                {direction === "deposit"
                                  ? asset === "USDT"
                                    ? fmt2(externalUsdt)
                                    : fmt4(externalBnb)
                                  : asset === "USDT"
                                    ? fmt2(projectUsdt)
                                    : fmt4(projectBnb)}
                              </span>
                            </div>
                          </div>

                          <div className="relative z-10 mt-3 flex flex-wrap gap-2">
                            <AssetChip
                              active={asset === "NATIVE"}
                              onClick={() => setAsset("NATIVE")}
                              icon={nativeIcon}
                              label="BNB"
                              tone="blue"
                            />
                            <AssetChip
                              active={asset === "USDT"}
                              onClick={() => setAsset("USDT")}
                              icon={icons.USDT}
                              label="USDT"
                              tone="green"
                            />
                          </div>

                          <div className="relative z-10 mt-3 flex items-center gap-2">
                            <input
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="flex-1 h-12 rounded-xl bg-[#9cc0ff]/10 px-3 text-sm font-semibold text-[#e0e0e0] outline-none focus:ring-2 focus:ring-[#3b82f6]/50"
                            />
                            <button
                              onClick={() => setAmount(String(maxAmount))}
                              className="h-12 px-4 rounded-xl ui-card hover:bg-[#111] text-[11px] text-[#e0e0e0] inline-flex items-center gap-2 transition-colors"
                            >
                              <span className="text-[10px] text-[#707070]">
                                Max:
                              </span>
                              {asset === "USDT"
                                ? fmt2(maxAmount)
                                : fmt4(maxAmount)}
                            </button>
                          </div>

                          <div className="relative z-10 mt-2 space-y-1">
                            {!vaultReady && direction === "withdraw" && (
                              <div className="text-[10px] bg-[#fca5a5]/10 rounded-xl px-2 py-1 text-[#fca5a5] inline-flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Create
                                Vault first
                              </div>
                            )}
                            {parsed.ok && parsed.n > maxAmount && (
                              <div className="text-[10px] bg-[#fca5a5]/10 border border-[#fca5a5]/30 rounded-xl px-2 py-1 text-[#fca5a5] inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Not enough
                                balance
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direction toggle */}
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() =>
                              setDirection(
                                direction === "deposit"
                                  ? "withdraw"
                                  : "deposit",
                              )
                            }
                            className="w-12 h-12 rounded-full border border-[#1f1f1f] ui-inner hover:bg-[#111] transition-colors flex items-center justify-center"
                            title="Switch direction"
                          >
                            <RefreshCw className="w-5 h-5 text-[#a0a0a0]" />
                          </button>
                        </div>

                        {/* TO */}
                        <div className="rounded-2xl ui-card relative overflow-hidden p-4">
                          <div className="pointer-events-none absolute inset-0 opacity-10 card-gradient-soft" />

                          <div className="relative z-10 flex items-center justify-between">
                            <div className="text-[11px] text-[#707070]">
                              To
                              <span className="ml-2 text-[#a0a0a0]">
                                {direction === "deposit"
                                  ? "Prediction Vault"
                                  : "External Wallet"}
                              </span>
                            </div>
                          </div>

                          <div className="relative z-10 mt-3 rounded-xl border border-[#1f1f1f] bg-[#050816]/60 p-3">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#707070]">Amount</span>
                              <span className="text-[#e0e0e0] font-semibold">
                                {parsed.ok ? parsed.n : 0}{" "}
                                {asset === "NATIVE" ? "BNB" : "USDT"}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px]">
                              <span className="text-[#707070]">
                                Network fee
                              </span>
                              <span className="text-[#e0e0e0] font-semibold">
                                {networkFee}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px]">
                              <span className="text-[#707070]">Approval</span>
                              <span className="text-[#e0e0e0] font-semibold">
                                {approvalNeeded
                                  ? approved[actionKey]
                                    ? "Granted"
                                    : "Required"
                                  : "Not needed"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: Actions panel */}
                      <div className="lg:col-span-4 space-y-3">
                        <div className="rounded-2xl ui-card relative overflow-hidden p-4">
                          <div className="pointer-events-none absolute inset-0 opacity-10 card-gradient-soft" />

                          <div className="relative z-10">
                            <div className="flex items-center justify-between">
                              <div className="text-[12px] font-semibold text-[#e0e0e0]">
                                Actions
                              </div>
                              {badgeForStep()}
                            </div>

                            <div className="mt-3 space-y-2">
                              {approvalNeeded && !approved[actionKey] && (
                                <PrimaryBtn
                                  tone="neutral"
                                  disabled={
                                    !canAct ||
                                    step === "processing" ||
                                    step === "approving"
                                  }
                                  onClick={approve}
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  {step === "approving"
                                    ? "Approving..."
                                    : "Approve USDT"}
                                </PrimaryBtn>
                              )}

                              <PrimaryBtn
                                tone="blue"
                                disabled={
                                  !canAct ||
                                  step === "processing" ||
                                  step === "approving" ||
                                  (approvalNeeded && !approved[actionKey])
                                }
                                onClick={confirmTransfer}
                              >
                                {step === "processing" ? (
                                  <>
                                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirm{" "}
                                    {direction === "deposit"
                                      ? "Deposit"
                                      : "Withdraw"}
                                  </>
                                )}
                              </PrimaryBtn>

                              <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3 text-[10px] text-[#707070]">
                                <div className="flex items-center justify-between">
                                  <span>Vault USDT</span>
                                  <span className="text-[#e0e0e0] font-semibold">
                                    {fmt2(projectUsdt)}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between">
                                  <span>Vault BNB</span>
                                  <span className="text-[#e0e0e0] font-semibold">
                                    {fmt4(projectBnb)}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between">
                                  <span>Approval state</span>
                                  <span className="text-[#e0e0e0] font-semibold">
                                    {approvalNeeded
                                      ? approved[actionKey]
                                        ? "✓ Granted"
                                        : "✗ Required"
                                      : "✓ Not needed"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] text-[#707070]">
                                Funds in vault are immediately available for
                                prediction markets
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "stats" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card
                      title="Prediction Performance"
                      subtitle="Your stats in prediction markets"
                      right={<Pill tone="blue">Live</Pill>}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-[#050816]/70 p-3">
                          <div className="text-[10px] text-[#707070]">
                            Total Bets
                          </div>
                          <div className="mt-1 text-[14px] font-semibold text-[#e0e0e0]">
                            {predictionStats.totalBets}
                          </div>
                          <div className="mt-1 text-[10px] text-[#707070]">
                            All time
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#050816]/70 p-3">
                          <div className="text-[10px] text-[#707070]">
                            Win Rate
                          </div>
                          <div className="mt-1 text-[14px] font-semibold text-[#e0e0e0]">
                            {predictionStats.winRate}%
                          </div>
                          <div className="mt-1 text-[10px] text-[#707070]">
                            Success ratio
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#050816]/70 p-3">
                          <div className="text-[10px] text-[#707070]">
                            Total Won
                          </div>
                          <div className="mt-1 text-[14px] font-semibold text-[#e0e0e0]">
                            ${fmt2(predictionStats.totalWon)}
                          </div>
                          <div className="mt-1 text-[10px] text-[#707070]">
                            Net profit
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#050816]/70 p-3">
                          <div className="text-[10px] text-[#707070]">
                            Biggest Win
                          </div>
                          <div className="mt-1 text-[14px] font-semibold text-[#e0e0e0]">
                            ${fmt2(predictionStats.biggestWin)}
                          </div>
                          <div className="mt-1 text-[10px] text-[#707070]">
                            Single prediction
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-[#050816] p-3">
                        <div className="text-[11px] font-semibold text-[#e0e0e0] mb-2">
                          Insights
                        </div>
                        <div className="text-[10px] text-[#707070] space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Favorite asset:</span>
                            <span className="text-[#e0e0e0] font-semibold">
                              {predictionStats.favoriteAsset}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Total volume:</span>
                            <span className="text-[#e0e0e0] font-semibold">
                              ${fmt2(predictionStats.totalVolume)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Avg. bet size:</span>
                            <span className="text-[#e0e0e0] font-semibold">
                              $
                              {fmt2(
                                predictionStats.totalVolume /
                                  (predictionStats.totalBets || 1),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-center">
                        <button
                          onClick={() => navigate("/predictions")}
                          className="w-full h-10 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:opacity-90 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          View All Predictions
                        </button>
                      </div>
                    </Card>

                    <Card
                      title="Vault Utilization"
                      subtitle="How you use your vault"
                      right={<Pill tone="green">Active</Pill>}
                    >
                      <div className="space-y-3">
                        <div className="rounded-xl bg-[#050816]/70 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[11px] text-[#707070]">
                              USDT for Predictions
                            </div>
                            <div className="text-[11px] font-semibold text-[#e0e0e0]">
                              ${fmt2(projectUsdt * priceUsdt)}
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-[#0a0a0a] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a]"
                              style={{
                                width: `${Math.min(100, (projectUsdt / 1000) * 100)}%`,
                              }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] text-[#707070]">
                            {fmt2(projectUsdt)} USDT available for bets
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#050816]/70 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[11px] text-[#707070]">
                              BNB for Gas
                            </div>
                            <div className="text-[11px] font-semibold text-[#e0e0e0]">
                              ${fmt2(projectBnb * priceBnb)}
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-[#0a0a0a] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8]"
                              style={{
                                width: `${Math.min(100, (projectBnb / 0.5) * 100)}%`,
                              }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] text-[#707070]">
                            {fmt4(projectBnb)} BNB for transaction fees
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3">
                          <div className="text-[11px] font-semibold text-[#e0e0e0] mb-1">
                            Recommendations
                          </div>
                          <ul className="text-[10px] text-[#707070] list-disc list-inside space-y-1">
                            <li>Keep at least 0.01 BNB for gas fees</li>
                            <li>Deposit USDT before major prediction events</li>
                            <li>
                              Withdraw profits regularly to external wallet
                            </li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setTab("transfer");
                              setDirection("deposit");
                            }}
                            className="h-10 rounded-xl bg-[#3b82f6]/15 hover:bg-[#3b82f6]/25 border border-[#3b82f6]/30 text-[11px] text-[#9cc0ff] inline-flex items-center justify-center gap-2"
                          >
                            <ArrowDownToLine className="w-4 h-4" /> Add Funds
                          </button>
                          <button
                            onClick={() => {
                              setTab("transfer");
                              setDirection("withdraw");
                            }}
                            className="h-10 rounded-xl ui-inner hover:bg-[#222]/50 text-[11px] text-[#e0e0e0] inline-flex items-center justify-center gap-2"
                          >
                            <ArrowUpFromLine className="w-4 h-4" /> Withdraw
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {tab === "activity" && (
                  <Card
                    title="Activity"
                    subtitle="Recent vault transactions"
                    right={<Pill tone="blue">{activity.length} items</Pill>}
                  >
                    {activity.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-[11px] text-[#707070] mb-3">
                          No activity yet
                        </div>
                        <button
                          onClick={() => setTab("transfer")}
                          className="h-10 px-4 rounded-xl bg-[#3b82f6]/15 hover:bg-[#3b82f6]/25 border border-[#3b82f6]/30 text-[11px] text-[#9cc0ff] inline-flex items-center gap-2"
                        >
                          <ArrowDownToLine className="w-4 h-4" /> Make your
                          first deposit
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activity.map((a) => {
                          const isSuccess = a.status === "success";
                          const isPending = a.status === "pending";
                          const icon =
                            a.asset === "NATIVE" ? nativeIcon : icons.USDT;

                          return (
                            <div
                              key={a.id}
                              className="rounded-xl bg-[#050816]/70 hover:bg-[#050816] p-3 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                                    <img
                                      src={icon}
                                      className="w-5 h-5 object-contain"
                                      alt={a.asset}
                                    />
                                  </div>

                                  <div className="text-[12px] font-semibold text-[#e0e0e0]">
                                    <div className="mb-1">
                                      {isPending ? (
                                        <div className="text-[10px] text-yellow-500">
                                          Pending
                                        </div>
                                      ) : isSuccess ? (
                                        <div className="text-[10px] text-green-500">
                                          Success
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-red-500">
                                          Failed
                                        </div>
                                      )}
                                      {a.direction === "deposit"
                                        ? "Deposit"
                                        : "Withdraw"}{" "}
                                      {a.asset === "NATIVE" ? "BNB" : "USDT"}
                                    </div>
                                    <div className="text-[10px] text-[#707070] mt-0.5">
                                      {new Date(a.ts).toLocaleString()}
                                    </div>
                                    {/* {a.note && (
                                      <div className="text-[10px] text-[#a0a0a0] mt-0.5">
                                        {a.note}
                                      </div>
                                    )} */}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div
                                    className={`text-[14px] font-semibold ${
                                      a.direction === "deposit"
                                        ? "text-[#22c55e]"
                                        : "text-[#ef4444]"
                                    }`}
                                  >
                                    {a.direction === "deposit" ? "+" : "-"}{" "}
                                    {a.amount.toLocaleString(undefined, {
                                      maximumFractionDigits:
                                        a.asset === "NATIVE" ? 4 : 2,
                                    })}
                                    <span className="text-[10px] text-[#707070]">
                                      {" "}
                                      {a.asset === "NATIVE" ? "BNB" : "USDT"}
                                    </span>
                                  </div>
                                  {a.txHash && (
                                    <button
                                      onClick={() =>
                                        openExplorer(a.txHash!, CLUSTER)
                                      }
                                      className="text-[10px] text-[#3b82f6] hover:underline inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" /> View
                                      on explorer
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                )}

                {tab === "settings" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* LEFT: Security */}
                    <Card
                      title="Security Settings"
                      subtitle="Vault access & permissions"
                      right={<Pill tone="green">Secure</Pill>}
                    >
                      <div className="space-y-3">
                        <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3">
                          <div className="text-[11px] font-semibold text-[#e0e0e0] mb-2">
                            Session Security
                          </div>
                          <PrefToggle
                            label="Auto-lock vault"
                            desc="Lock vault after period of inactivity"
                            value={prefAutoLock}
                            onChange={setPrefAutoLock}
                          />
                          <div className="mt-2">
                            <div className="text-[10px] text-[#707070] mb-1">
                              Lock timeout
                            </div>
                            <select
                              value={sessionTimeout}
                              onChange={(e) =>
                                setSessionTimeout(e.target.value as any)
                              }
                              className="w-full h-9 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] px-3 text-[11px] text-[#e0e0e0] outline-none"
                            >
                              <option value="15m">15 minutes</option>
                              <option value="1h">1 hour</option>
                              <option value="off">Never</option>
                            </select>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3">
                          <div className="text-[11px] font-semibold text-[#e0e0e0] mb-2">
                            Approval Settings
                          </div>
                          <div className="text-[10px] text-[#707070] mb-2">
                            USDT approval status:{" "}
                            <span className="text-[#e0e0e0] font-semibold">
                              {approvalNeeded
                                ? approved[actionKey]
                                  ? "Granted"
                                  : "Not granted"
                                : "Not needed"}
                            </span>
                          </div>
                          {approvalNeeded && !approved[actionKey] && (
                            <button
                              onClick={approve}
                              className="w-full h-9 rounded-xl bg-[#3b82f6]/15 hover:bg-[#3b82f6]/25 border border-[#3b82f6]/30 text-[11px] text-[#9cc0ff] inline-flex items-center justify-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4" /> Grant USDT
                              Approval
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* RIGHT: Trusted Wallets */}
                    <Card
                      title="Trusted Addresses"
                      subtitle="Whitelist for quick withdrawals"
                      right={<Pill tone="warn">Beta</Pill>}
                    >
                      <div className="space-y-3">
                        <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3">
                          <div className="text-[11px] font-semibold text-[#e0e0e0] mb-2">
                            Add Trusted Wallet
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={trustedInput}
                              onChange={(e) => setTrustedInput(e.target.value)}
                              placeholder="0x..."
                              className="flex-1 h-9 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] px-3 text-[11px] text-[#e0e0e0] outline-none"
                            />
                            <button
                              onClick={addTrusted}
                              className="h-9 px-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] text-[11px] text-[#e0e0e0]"
                            >
                              Add
                            </button>
                          </div>
                          <div className="mt-2 text-[10px] text-[#707070]">
                            Add addresses you trust for faster withdrawals
                          </div>
                        </div>

                        {trustedWallets.length > 0 && (
                          <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3">
                            <div className="text-[11px] font-semibold text-[#e0e0e0] mb-2">
                              Trusted Wallets ({trustedWallets.length})
                            </div>
                            <div className="space-y-2">
                              {trustedWallets.map((wallet) => (
                                <div
                                  key={wallet}
                                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0a0a0a]"
                                >
                                  <div className="min-w-0">
                                    <div className="text-[11px] text-[#e0e0e0] font-mono truncate">
                                      {shorten(wallet)}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => copy(wallet)}
                                      className="w-7 h-7 rounded-lg bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center"
                                      title="Copy"
                                    >
                                      <Copy className="w-3 h-3 text-[#a0a0a0]" />
                                    </button>
                                    <button
                                      onClick={() => removeTrusted(wallet)}
                                      className="w-7 h-7 rounded-lg bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center"
                                      title="Remove"
                                    >
                                      <X className="w-3 h-3 text-[#fca5a5]" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] text-[#707070]">
                          Trusted wallets can bypass some security checks for
                          faster withdrawals. Use carefully.
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PrefToggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="rounded-xl ui-card w-full p-3 text-left hover:bg-[#111] transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-[#e0e0e0]">
            {label}
          </div>
          {desc && (
            <div className="text-[10px] text-[#707070] mt-0.5">{desc}</div>
          )}
        </div>

        <div
          className={`w-10 h-6 rounded-full border flex items-center px-1 transition-colors ${
            value
              ? "bg-[#22c55e]/20 border-[#22c55e]/30"
              : "bg-[#1a1a1a] border-[#1f1f1f]"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full transition-transform ${
              value
                ? "translate-x-4 bg-[#22c55e]"
                : "translate-x-0 bg-[#707070]"
            }`}
          />
        </div>
      </div>
    </button>
  );
}

export default WalletsModal;

function setAddress(vaultAddress: string) {
  throw new Error("Function not implemented.");
}
