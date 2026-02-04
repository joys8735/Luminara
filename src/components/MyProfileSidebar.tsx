import React, { useMemo, useState } from "react";
import {
  X,
  User,
  Star,
  Copy,
  ArrowRight,
  Activity,
  LogOut,
  Wallet,
  Layers,
  Sparkles,
  BadgeCheck,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Info,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type WalletMenuItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

type WalletType = "phantom" | "metamask" | "unknown";

type Asset = "SOL" | "USDC" | "BNB" | "USDT";

type Props = {
  show: boolean;
  onClose: () => void;

  connected: boolean;
  publicKey?: string; // external wallet address

  // External wallet balances (provide what you have; component will choose by wallet type)
  solBalance?: number;
  usdcBalance?: number;
  bnbBalance?: number;
  usdtBalance?: number;

  // Token
  tokenSymbol: string; // e.g. "SVT"
  tokenName?: string; // e.g. "SolanaVerse Token"
  tokenLogoUrl?: string; // optional logo
  svtBalance: number;
  tokenPrice: number;

  // Project vault address (CoreVault contract address)
  projectWalletAddress?: string;

  // Project balances (from CoreVault mapping)
  projectSol?: number;
  projectUsdc?: number;
  projectBnb?: number;
  projectUsdt?: number;

  walletMenuItems: WalletMenuItem[];
  onMenuClick: (path: string) => void;
  onDisconnect: () => void;

  // actions (UI)
  // old actions (still supported)
  onDepositToProjectWallet?: (asset: "SOL" | "USDT", amount: number) => Promise<void> | void;
  onWithdrawFromProjectWallet?: (asset: "SOL" | "USDT", amount: number) => Promise<void> | void;

  // new actions (preferred)
  onDepositToAddress?: (asset: Asset, amount: number, toAddress: string) => Promise<void> | void;
  onWithdrawToAddress?: (asset: Asset, amount: number, toAddress: string) => Promise<void> | void;

  onRefresh?: () => Promise<void> | void;
};

type Step = "approve" | "transfer" | "success";
type AsyncState = "idle" | "pending" | "done";
type TabMode = "project" | "address";

function detectWalletType(addr?: string): WalletType {
  if (!addr) return "unknown";
  if (addr.startsWith("0x")) return "metamask";
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) return "phantom";
  return "unknown";
}

function shortAddress(addr?: string) {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatUSD(v: number) {
  return `$${v.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function classNames(...vals: Array<string | false | null | undefined>) {
  return vals.filter(Boolean).join(" ");
}

function TokenChip(props: {
  symbol: string;
  name?: string;
  logoUrl?: string;
  value: string | number;
  usd?: number;
  highlight?: boolean;
}) {
  const { symbol, name, logoUrl, value, usd, highlight } = props;
  return (
    <div
      className={classNames(
        "flex items-center justify-between rounded-2xl border px-3 py-2.5",
        highlight
          ? "bg-[#111827] border-[#111827]/60 "
          : "bg-[#111827] border-[#111827]"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#020617] border border-[#1e293b] flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} className="w-7 h-7 object-cover" />
          ) : (
            <span className="text-[11px] font-semibold text-[#e5e7eb]">{symbol}</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#e5e7eb] leading-tight">{symbol}</span>
          {name && <span className="text-[10px] text-[#6b7280] leading-tight truncate max-w-[120px]">{name}</span>}
        </div>
      </div><Link to="/token" className="text-[11px] font-semibold text-[#e5e7eb] leading-tight">Buy token</Link>
      <div className="text-right">
        <div className="text-[11px] font-semibold text-[#e5e7eb] leading-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {usd !== undefined && (
          <div className="text-[10px] text-[#9ca3af] leading-tight">{formatUSD(usd)}</div>
        )}
      </div>
    </div>
  );
}

function BalanceChip(props: {
  label: string;
  logoUrl?: string;
  value: string;
  usd?: number;
}) {
  const { label, logoUrl, value, usd } = props;
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#050816] border border-[#111827] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#020617] border border-[#1e293b] flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} className="w-6 h-6 object-cover" />
          ) : (
            <span className="text-[10px] font-semibold text-[#e5e7eb]">{label}</span>
          )}
        </div>
        <span className="text-[11px] font-medium text-[#e5e7eb]">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-[11px] text-[#e5e7eb] font-semibold">{value}</div>
        {usd !== undefined && (
          <div className="text-[10px] text-[#9ca3af]">{formatUSD(usd)}</div>
        )}
      </div>
    </div>
  );
}

function StepRow(props: {
  title: string;
  desc: string;
  active?: boolean;
  done?: boolean;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void | Promise<void>;
}) {
  const { title, desc, active, done, actionLabel, actionDisabled, onAction } = props;
  return (
    <div
      className={classNames(
        "flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5",
        done
          ? "border-[#22c55e]/40 bg-[#022c22]"
          : active
          ? "border-[#3b82f6]/50 bg-[#020617]"
          : "border-[#111827] bg-[#020617]"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={classNames(
            "w-6 h-6 rounded-full flex items-center justify-center border",
            done
              ? "border-[#22c55e]/60 bg-[#15803d]/20"
              : active
              ? "border-[#3b82f6]/60 bg-[#1d4ed8]/20"
              : "border-[#374151] bg-[#020617]"
          )}
        >
          {done ? (
            <BadgeCheck className="w-3.5 h-3.5 text-[#22c55e]" />
          ) : active ? (
            <Activity className="w-3.5 h-3.5 text-[#3b82f6]" />
          ) : (
            <Star className="w-3.5 h-3.5 text-[#6b7280]" />
          )}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#e5e7eb]">{title}</div>
          <div className="text-[10px] text-[#9ca3af]">{desc}</div>
        </div>
      </div>
      {actionLabel && (
        <button
          disabled={actionDisabled}
          onClick={onAction}
          className={classNames(
            "px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1",
            actionDisabled
              ? "bg-[#020617] border border-[#111827] text-[#6b7280] cursor-not-allowed"
              : "bg-[#3b82f6] text-white border border-[#60a5fa] hover:bg-[#2563eb]"
          )}
        >
          {actionLabel}
          {!actionDisabled && <ArrowRight className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

function ModalShell(props: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { title, subtitle, onClose, children } = props;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur p-5 sm:p-5">
      <div className="w-full max-w-2xl rounded-3xl bg-[#111827] shadow-3xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_45%)]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#111827]">
            <div>
              <div className="text-sm font-semibold text-[#e5e7eb]">{title}</div>
              {subtitle && <div className="text-[11px] text-[#9ca3af]">{subtitle}</div>}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#9ca3af] hover:text-[#e5e7eb]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MyProfileSidebar(props: Props) {
  const {
    show,
    onClose,
    connected,
    publicKey,

    solBalance = 0,
    usdcBalance = 0,
    bnbBalance = 0,
    usdtBalance = 0,

    tokenSymbol,
    tokenName,
    tokenLogoUrl,
    svtBalance,
    tokenPrice,

    projectWalletAddress,

    projectSol = 0,
    projectUsdc = 0,
    projectBnb = 0,
    projectUsdt = 0,

    walletMenuItems,
    onMenuClick,
    onDisconnect,

    onDepositToProjectWallet,
    onWithdrawFromProjectWallet,

    onDepositToAddress,
    onWithdrawToAddress,

    onRefresh,
  } = props;

  const walletType = useMemo(() => detectWalletType(publicKey), [publicKey]);

  const externalAssets = useMemo(() => {
    if (walletType === "metamask") return ["BNB", "USDT"] as Asset[];
    if (walletType === "phantom") return ["SOL", "USDC"] as Asset[];
    // unknown -> show sol/usdc as default
    return ["SOL", "USDC"] as Asset[];
  }, [walletType]);

  const projectAssets = externalAssets;

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // deposit flow
  const [depTab, setDepTab] = useState<TabMode>("project");
  const [asset, setAsset] = useState<Asset>(externalAssets[1] ?? "USDC"); // stable default
  const [amount, setAmount] = useState("25");
  const [toAddress, setToAddress] = useState(""); // for address tab
  const [step, setStep] = useState<Step>("approve");
  const [approveState, setApproveState] = useState<AsyncState>("idle");
  const [transferState, setTransferState] = useState<AsyncState>("idle");

  // withdraw
  const [wTab, setWTab] = useState<TabMode>("project");
  const [wAsset, setWAsset] = useState<Asset>(externalAssets[1] ?? "USDC");
  const [wAmount, setWAmount] = useState("10");
  const [wToAddress, setWToAddress] = useState("");

  const priceNative = useMemo(() => {
    // UI-only prices; wire later
    return walletType === "metamask" ? 310 : 25;
  }, [walletType]);

  const getExternal = (a: Asset) => {
    if (a === "SOL") return solBalance;
    if (a === "USDC") return usdcBalance;
    if (a === "BNB") return bnbBalance;
    return usdtBalance;
  };

  const getProject = (a: Asset) => {
    if (a === "SOL") return projectSol;
    if (a === "USDC") return projectUsdc;
    if (a === "BNB") return projectBnb;
    return projectUsdt;
  };

  const externalUsd = useMemo(() => {
    const native = walletType === "metamask" ? bnbBalance * priceNative : solBalance * priceNative;
    const stable = walletType === "metamask" ? usdtBalance : usdcBalance;
    return native + stable;
  }, [walletType, bnbBalance, solBalance, usdtBalance, usdcBalance, priceNative]);

  const projectUsd = useMemo(() => {
    const native = walletType === "metamask" ? projectBnb * priceNative : projectSol * priceNative;
    const stable = walletType === "metamask" ? projectUsdt : projectUsdc;
    return native + stable + svtBalance * tokenPrice;
  }, [walletType, projectBnb, projectSol, projectUsdt, projectUsdc, svtBalance, tokenPrice, priceNative]);

  const hasProjectValue = projectUsd > 0 || svtBalance > 0;

  const disabledReason = useMemo(() => {
    if (!connected) return "Connect wallet first";
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return "Enter a valid amount";

    if (depTab === "address") {
      const t = toAddress.trim();
      if (!t) return "Enter receiver address";
      if (!validateAddressByWalletType(walletType, t)) return "Invalid address format";
    }
    return "";
  }, [connected, amount, depTab, toAddress, walletType]);

  const canProceed = disabledReason === "";

  const copyText = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const openDeposit = () => {
    if (!connected) return toast.error("Connect wallet first");

    setDepositOpen(true);
    setDepTab("project");
    setStep("approve");
    setApproveState("idle");
    setTransferState("idle");

    // reset
    setAsset(externalAssets[1] ?? "USDC");
    setToAddress("");
  };

  const openWithdraw = () => {
    if (!connected) return toast.error("Connect wallet first");

    setWithdrawOpen(true);
    setWTab("project");
    setWAsset(externalAssets[1] ?? "USDC");
    setWToAddress("");
  };

  const requiresApprove = (a: Asset) => a === "USDT" || a === "USDC";

  const onApprove = async () => {
    if (!canProceed) return toast.error(disabledReason);
    if (!requiresApprove(asset)) {
      setApproveState("done");
      setStep("transfer");
      return;
    }
    setApproveState("pending");
    await new Promise((r) => setTimeout(r, 700));
    setApproveState("done");
    toast.success("Approve done (UI)");
    setStep("transfer");
  };

  const onTransfer = async () => {
    if (!canProceed) return toast.error(disabledReason);
    if (requiresApprove(asset) && approveState !== "done") return toast.error("Approve first");

    setTransferState("pending");
    await new Promise((r) => setTimeout(r, 850));

    const n = Number(amount);

    // decide receiver
    const receiver =
      depTab === "project" ? (projectWalletAddress || "") : toAddress.trim();

    if (depTab === "address" && onDepositToAddress) {
      await onDepositToAddress(asset, n, receiver);
    } else if (depTab === "project" && onDepositToAddress && projectWalletAddress) {
      await onDepositToAddress(asset, n, projectWalletAddress);
    } else if (depTab === "project" && onDepositToProjectWallet && (asset === "SOL" || asset === "USDT")) {
      // backward compat old handler
      await onDepositToProjectWallet(asset, n);
    } else {
      toast("UI only", { description: "Hook onDepositToAddress to make real transfer." });
    }

    setTransferState("done");
    toast.success("Transfer completed (UI)");
    setStep("success");
  };

  const onWithdraw = async () => {
    const n = Number(wAmount);
    if (!Number.isFinite(n) || n <= 0) return toast.error("Enter a valid amount");

    const receiver = wTab === "project" ? (publicKey || "") : wToAddress.trim();
    if (wTab === "address") {
      if (!receiver) return toast.error("Enter receiver address");
      if (!validateAddressByWalletType(walletType, receiver)) return toast.error("Invalid address format");
    }

    if (onWithdrawToAddress) {
      await onWithdrawToAddress(wAsset, n, receiver);
    } else if (onWithdrawFromProjectWallet && (wAsset === "SOL" || wAsset === "USDT")) {
      await onWithdrawFromProjectWallet(wAsset, n);
    } else {
      toast("UI only", { description: "Hook onWithdrawToAddress to make real transfer." });
    }

    toast.success("Withdraw requested (UI)");
    setWithdrawOpen(false);
  };

  const logoByAsset: Partial<Record<Asset, string>> = {
    SOL: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    USDC:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/2048px-Circle_USDC_Logo.svg.png",
    BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    USDT:
      "https://cryptologos.cc/logos/tether-usdt-logo.png",
  };

  const sidebarBg =
    "radial-gradient(circle_at_top,_rgba(56,189,248,0.14)_0,_transparent_55%), #020617";

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md h-full bg-[#111827] shadow-2xl relative overflow-hidden"
        style={{ background: sidebarBg }}
      >
        
        {/* Header */}
        <div className="relative z-10 flex items-start justify-between p-4 ">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                <User className="w-4 h-4 text-[#3b82f6]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#e0e0e0]">My Profile</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      connected
                        ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]"
                        : "border-[#f97316]/40 bg-[#f97316]/10 text-[#f97316]"
                    }`}
                  >
                    {connected ? "Connected" : "Offline"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#3b82f6]/25 bg-[#3b82f6]/10 text-[#a9c7ff]">
                    {walletType === "metamask"
                      ? "MetaMask"
                      : walletType === "phantom"
                      ? "Phantom"
                      : "Wallet"}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#9ca3af]">
                  <Wallet className="w-3 h-3 text-[#3b82f6]" />
                  <span className="font-mono truncate max-w-[180px]">
                    {publicKey ? shortAddress(publicKey) : "No wallet connected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 ">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#9ca3af] hover:text-[#e5e7eb]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={() => onRefresh()}
                  className="px-2 py-1 rounded-full border border-[#1f2937] bg-[#020617] text-[10px] text-[#9ca3af] hover:text-[#e5e7eb]"
                >
                  Refresh
                </button>
              )}
              <button
                onClick={onDisconnect}
                className="px-2 py-1 rounded-full border border-[#1f2937] bg-[#020617] text-[10px] text-[#f97316] hover:text-[#fdba74] flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_45%)]" />

        <div className="relative z-10 p-4 space-y-4 overflow-y-auto max-h-[calc(100%-106px)]">
          {/* Overview cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* External wallet */}
            <div className="bg-[#111827] border border-[#111827] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#a855f7]" />
                  <div className="text-xs font-semibold text-[#e0e0e0]">External Wallet</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                  <Activity className="w-3 h-3 text-[#22c55e]" />
                  <span>On-chain</span>
                  <span className="text-[#6b7280]">• Read-only</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] text-[#9ca3af]">Total</div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {formatUSD(externalUsd)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#9ca3af]">
                  <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span>Use this wallet to deposit into Project Vault.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {externalAssets.map((a) => {
                  const v = getExternal(a);
                  const usd =
                    a === "SOL" || a === "BNB" ? v * priceNative : v;
                  return (
                    <BalanceChip
                      key={a}
                      label={a}
                      logoUrl={logoByAsset[a]}
                      value={a === "SOL" || a === "BNB" ? v.toFixed(4) : v.toFixed(2)}
                      usd={usd}
                    />
                  );
                })}
              </div>

              <div className="text-[10px] text-[#707070] mt-2">
                Total external:{" "}
                <span className="text-[#e0e0e0] font-semibold">{formatUSD(externalUsd)}</span>
              </div>
            </div>

            {/* Project Vault */}
            <div className="bg-gradient-to-br from-[#3b82f6]/5 to-[#00d1ff]/5  rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-[#e0e0e0] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#3b82f6]" />
                  Project Vault
                </div>

                <span className="text-[10px] px-2 py-1 rounded-full border border-[#3b82f6]/20 bg-[#3b82f6]/5 text-[#a9c7ff]">
                  On-chain balance
                </span>
              </div>

              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#707070]">Project Address</div>
                    <div className="text-[11px] text-[#e0e0e0] font-mono truncate">
                      {projectWalletAddress || "Vault address not set"}
                    </div>
                  </div>
                  <button
                    onClick={() => projectWalletAddress && copyText(projectWalletAddress)}
                    disabled={!projectWalletAddress}
                    className="text-[#3b82f6] hover:opacity-90 disabled:opacity-40"
                    title="Copy project address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {projectWalletAddress && (
                  <div className="mt-2 text-[10px] text-[#707070] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#3b82f6]" />
                    You can deposit directly to this address.
                  </div>
                )}
              </div>

              {!hasProjectValue ? (
                <div className="mt-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#facc15] mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-[#e0e0e0]">Your project vault is empty</div>
                    <div className="text-[11px] text-[#a0a0a0] mt-1">
                      Deposit funds to start investing, staking and using in-app features.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <TokenChip
                      symbol={tokenSymbol}
                      name={tokenName}
                      logoUrl={tokenLogoUrl}
                      value={svtBalance.toLocaleString()}
                      usd={svtBalance * tokenPrice}
                      highlight
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {projectAssets.map((a) => {
                        const v = getProject(a);
                        const usd =
                          a === "SOL" || a === "BNB" ? v * priceNative : v;
                        return (
                          <BalanceChip
                            key={a}
                            label={a}
                            logoUrl={logoByAsset[a]}
                            value={a === "SOL" || a === "BNB" ? v.toFixed(4) : v.toFixed(2)}
                            usd={usd}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-[#707070] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                    <span className="text-[#a5b4fc]">
                      Internal vault used for staking, investing and in-app operations.
                    </span>
                  </div>

                  <div className="text-[10px] text-[#707070] mt-1.5">
                    Total project:{" "}
                    <span className="text-[#e0e0e0] font-semibold">{formatUSD(projectUsd)}</span>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={openDeposit}
                  className="py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-semibold flex items-center justify-center gap-2 text-white shadow-[0_0_20px_rgba(37,99,235,0.55)]"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Deposit
                </button>
                <button
                  onClick={openWithdraw}
                  className="py-2 rounded-xl bg-[#020617] border border-[#1f2937] text-xs font-semibold flex items-center justify-center gap-2 text-[#e5e7eb] hover:bg-[#030712]"
                >
                  <ArrowUpFromLine className="w-4 h-4" />
                  Withdraw
                </button>
              </div>
            </div>

            {/* Quick navigation */}
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-2">
              {walletMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => onMenuClick(item.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#111827] text-xs text-left text-[#e5e7eb]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#020617] border border-[#1f2937] flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-[#60a5fa]" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4b5563]" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deposit modal */}
        {depositOpen && (
          <ModalShell
            title="Deposit"
            subtitle="Project Vault / To Address • Approve → Transfer (UI)"
            onClose={() => setDepositOpen(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#111827] border border-[#1f1f1f] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#e0e0e0]">Deposit Details</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDepTab("project")}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border ${
                        depTab === "project"
                          ? "bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#e0e0e0]"
                          : "bg-[#0a0a0a] border-[#1f1f1f] text-[#a0a0a0] hover:text-[#e0e0e0]"
                      }`}
                    >
                      Project Vault
                    </button>
                    <button
                      onClick={() => setDepTab("address")}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border ${
                        depTab === "address"
                          ? "bg-[#111827] border-[#1f2937] text-[#e5e7eb]"
                          : "bg-[#0a0a0a] border-[#1f1f1f] text-[#a0a0a0] hover:text-[#e0e0e0]"
                      }`}
                    >
                      To Address
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-[#a0a0a0] mb-1.5">Asset</div>
                    <div className="flex flex-wrap gap-1.5">
                      {externalAssets.map((a) => (
                        <button
                          key={a}
                          onClick={() => setAsset(a)}
                          className={`px-2.5 py-1 rounded-full text-[10px] border flex items-center gap-1 ${
                            asset === a
                              ? "bg-[#1d4ed8]/20 border-[#2563eb] text-[#e5e7eb]"
                              : "bg-[#0a0a0a] border-[#1f2937] text-[#9ca3af] hover:text-[#e5e7eb]"
                          }`}
                        >
                          <span>{a}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {depTab === "address" && (
                    <div>
                      <div className="text-[11px] text-[#a0a0a0] mb-1.5">Receiver address</div>
                      <input
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        placeholder={walletType === "metamask" ? "0x..." : "Solana address"}
                        className="w-full px-3 py-2 rounded-xl bg-[#020617] border border-[#1f2937] text-[#e5e7eb] text-sm outline-none focus:border-[#3b82f6]/60"
                      />
                      <div className="mt-1 text-[10px] text-[#707070] flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-[#3b82f6]" />
                        Send directly from external wallet to any address.
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[11px] text-[#a0a0a0] mb-1.5">Amount</div>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#020617] border border-[#1f2937] text-[#e5e7eb] text-sm outline-none focus:border-[#3b82f6]/60"
                    />
                    <div className="mt-1 flex items-center justify-between text-[10px] text-[#707070]">
                      <span>
                        From:{" "}
                        <span className="text-[#e5e7eb] font-semibold">
                          {walletType === "metamask" ? "External (BNB / USDT)" : "External (SOL / USDC)"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-1 text-[10px] text-[#f97316] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{disabledReason || "UI-only demo steps, wire your own handlers."}</span>
                </div>
              </div>

              <div className="space-y-2">
                <StepRow
                  title="1. Approve"
                  desc={requiresApprove(asset) ? "Required for token transfers (UI)." : "Not required for native coin."}
                  active={step === "approve"}
                  done={approveState === "done" || !requiresApprove(asset)}
                  actionLabel={approveState === "pending" ? "Approving…" : "Approve"}
                  actionDisabled={!canProceed || !requiresApprove(asset) || approveState !== "idle"}
                  onAction={onApprove}
                />

                <StepRow
                  title="2. Transfer"
                  desc={depTab === "project" ? "To Project Vault (on-chain balance)." : "To any address."}
                  active={step === "transfer"}
                  done={transferState === "done"}
                  actionLabel={transferState === "pending" ? "Transferring…" : "Transfer"}
                  actionDisabled={
                    !canProceed ||
                    transferState !== "idle" ||
                    (requiresApprove(asset) && approveState !== "done")
                  }
                  onAction={onTransfer}
                />

                <div
                  className={`rounded-xl border p-3 ${
                    step === "success"
                      ? "border-[#22c55e]/40 bg-[#022c22]"
                      : "border-[#1f2937] bg-[#020617]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BadgeCheck
                      className={`w-4 h-4 ${
                        step === "success" ? "text-[#22c55e]" : "text-[#6b7280]"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#e5e7eb]">
                        {step === "success" ? "Deposit complete" : "Waiting for steps"}
                      </div>
                      <div className="text-[10px] text-[#9ca3af]">
                        {step === "success"
                          ? "Funds should appear in your Project Vault shortly."
                          : "Approve and transfer to simulate full flow."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalShell>
        )}

        {/* Withdraw modal */}
        {withdrawOpen && (
          <ModalShell
            title="Withdraw"
            subtitle="From Project Vault to your wallet or another address (UI)."
            onClose={() => setWithdrawOpen(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#e5e7eb]">Withdraw Details</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWTab("project")}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border ${
                        wTab === "project"
                          ? "bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#e5e7eb]"
                          : "bg-[#0a0a0a] border-[#1f1f1f] text-[#9ca3af]"
                      }`}
                    >
                      My Wallet
                    </button>
                    <button
                      onClick={() => setWTab("address")}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border ${
                        wTab === "address"
                          ? "bg-[#111827] border-[#1f2937] text-[#e5e7eb]"
                          : "bg-[#0a0a0a] border-[#1f1f1f] text-[#9ca3af]"
                      }`}
                    >
                      To Address
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-[#a0a0a0] mb-1.5">Asset</div>
                    <div className="flex flex-wrap gap-1.5">
                      {projectAssets.map((a) => (
                        <button
                          key={a}
                          onClick={() => setWAsset(a)}
                          className={`px-2.5 py-1 rounded-full text-[10px] border flex items-center gap-1 ${
                            wAsset === a
                              ? "bg-[#1d4ed8]/20 border-[#2563eb] text-[#e5e7eb]"
                              : "bg-[#0a0a0a] border-[#1f2937] text-[#9ca3af] hover:text-[#e5e7eb]"
                          }`}
                        >
                          <span>{a}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {wTab === "address" && (
                    <div>
                      <div className="text-[11px] text-[#a0a0a0] mb-1.5">Receiver address</div>
                      <input
                        value={wToAddress}
                        onChange={(e) => setWToAddress(e.target.value)}
                        placeholder={walletType === "metamask" ? "0x..." : "Solana address"}
                        className="w-full px-3 py-2 rounded-xl bg-[#020617] border border-[#1f2937] text-[#e5e7eb] text-sm outline-none focus:border-[#3b82f6]/60"
                      />
                    </div>
                  )}

                  <div>
                    <div className="text-[11px] text-[#a0a0a0] mb-1.5">Amount</div>
                    <input
                      value={wAmount}
                      onChange={(e) => setWAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#020617] border border-[#1f2937] text-[#e5e7eb] text-sm outline-none focus:border-[#3b82f6]/60"
                    />
                    <div className="mt-1 text-[10px] text-[#707070] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-[#facc15]" />
                      <span>Make sure you have enough balance in your Project Vault.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-[#020617] border border-[#111827] p-3">
                  <div className="text-xs font-semibold text-[#e5e7eb] mb-1.5">Route</div>
                  <div className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
                    <Layers className="w-3.5 h-3.5 text-[#3b82f6]" />
                    <span>From Project Vault</span>
                    <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                    {wTab === "project" ? (
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-[#22c55e]" />
                        <span>Your wallet ({shortAddress(publicKey) || "N/A"})</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5 text-[#a855f7]" />
                        <span>Custom address</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onWithdraw}
                  className="w-full py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.55)]"
                >
                  <ArrowUpFromLine className="w-4 h-4" />
                  Confirm Withdraw (UI)
                </button>

                <div className="rounded-xl border border-[#1f2937] bg-[#020617] p-3 text-[10px] text-[#9ca3af]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-3 h-3 text-[#facc15]" />
                    <span>Note</span>
                  </div>
                  <div>
                    This withdraw modal is UI-only. Wire it with your onWithdrawToAddress / CoreVault logic to make it
                    real.
                  </div>
                </div>
              </div>
            </div>
          </ModalShell>
        )}
      </div>
    </div>
  );
}

function genEvmAddress() {
  // Pure UI helper from old flow – now unused for real funds
  const b = randomBytes(20);
  const hex = Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}

function genSolAddress() {
  // Solana pubkey is 32 bytes base58
  const b = randomBytes(32);
  return bytesToBase58(b);
}

function validateAddressByWalletType(walletType: WalletType, addr: string) {
  const a = addr.trim();
  if (walletType === "metamask") return /^0x[a-fA-F0-9]{40}$/.test(a);
  if (walletType === "phantom") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
  return a.length > 0;
}

// stubbed helpers for UI-only mode
function randomBytes(len: number): Uint8Array {
  const a = new Uint8Array(len);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(a);
  } else {
    for (let i = 0; i < len; i++) a[i] = Math.floor(Math.random() * 256);
  }
  return a;
}

// super–minimal base58 just for UI demo
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function bytesToBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  let digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      const x = digits[j] * 256 + carry;
      digits[j] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let zeros = 0;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) zeros++;
  let result = "";
  for (let i = 0; i < zeros; i++) result += "1";
  for (let i = digits.length - 1; i >= 0; i--) result += ALPHABET[digits[i]];
  return result;
}

export default MyProfileSidebar;
