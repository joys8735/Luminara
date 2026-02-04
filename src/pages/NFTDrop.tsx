import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { usePremium } from "../context/PremiumContext";
import { toast } from "sonner";
import {
  Gem,
  Clock,
  ChevronLeft,
  AlertCircle,
  Check,
  Percent,
  Users,
  Award,
  Shield,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Lock,
  Bot,
  BadgeCheck,
  Info,
  ExternalLink,
  Globe2,
  Coins,
  X,
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { motion } from "framer-motion";

type WalletType = "phantom" | "metamask" | "none";
type Step = "approve" | "confirm" | "success";

type Rarity = "Legendary" | "Epic" | "Rare" | "Common";

type PreviewNFT = {
  id: number;
  name: string;
  image: string;
  rarity: Rarity;
  estValue: number; // очікувана вартість після мінту (UI)
};

type MintHistoryItem = {
  id: string;
  ts: number;
  quantity: number;
  paymentMethod: string;
  totalPaid: number;
  cashback: number;
  txMock: string;
  ticketUnlocked: boolean;
};

type EligibilityState = {
  walletConnected: boolean;
  whitelist: boolean;
  proofOfTaskOk: boolean;
  meetsMax: boolean;
};

type TrustScore = {
  score: number;
  label: "Low" | "Medium" | "High";
  reasons: string[];
};

type Summary = {
  collection: string;
  quantity: number;
  paymentMethod: string;
  pricePer: number;
  total: number;
  cashback: number;
  maxPerTx: number;
  network: string;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const MINT_HISTORY_KEY = "solanaverse:nftDropHistory";

/** =======================
 *  NFT Card (preview grid)
 *  ======================= */
function NFTDropCard({
  nft,
  isPremium,
}: {
  nft: PreviewNFT;
  isPremium: boolean;
}) {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-[#3b82f6] transition-all duration-200">
      <div className="h-24 bg-[#050816]">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2.5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[11px] font-medium text-[#e0e0e0] truncate">
            {nft.name}
          </h4>
          <span className="text-[10px] text-[#9ca3af]">{nft.rarity}</span>
        </div>
        <div className="text-[11px] text-[#9ca3af]">
          Est. post-mint value:{" "}
          <span className="text-[#e5e5e5] font-semibold">
            {nft.estValue} SOL
          </span>
        </div>
        {/* {isPremium ? (
          <div className="text-[10px] text-[#22c55e] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Premium: higher chance for rare tiers (UI)</span>
          </div>
        ) : (
          <div className="text-[10px] text-[#707070]">
            Get Premium to increase rare drop chances (UI).
          </div>
        )} */}
      </div>
    </div>
  );
}

/** =======================
 *  Mint Steps Modal (UI)
 *  ======================= */
function MintStepsModal({
  open,
  step,
  approveState,
  confirmState,
  onClose,
  onApprove,
  onConfirm,
  summary,
  eligibility,
  trust,
}: {
  open: boolean;
  step: Step;
  approveState: "idle" | "pending" | "done";
  confirmState: "idle" | "pending" | "done";
  onClose: () => void;
  onApprove: () => void;
  onConfirm: () => void;
  summary: Summary;
  eligibility: EligibilityState;
  trust: TrustScore;
}) {
  if (!open) return null;

  const maxPerTx = summary.maxPerTx;

  const disabledReason = (() => {
    if (!eligibility.walletConnected) return "Connect wallet to continue";
    if (!eligibility.whitelist) return "Whitelist required (UI-only state)";
    if (!eligibility.proofOfTaskOk)
      return "Proof-of-task not completed (UI-only)";
    if (!eligibility.meetsMax) return `Max ${maxPerTx} per transaction`;
    return "";
  })();

  const canProceed = !disabledReason;
  const isApproveNeeded =
    summary.paymentMethod !== "SOL" && summary.paymentMethod !== "BNB";

  const networkLogoMap: Record<string, string> = {
    Solana: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    "BNB Chain":
      "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/vectors/bnb-2c9adc7qw85po528q8y3b.png/bnb-tss7lyzvhxyjfc9ivae0l.png?_a=DATAg1AAZAA0",
  };

  const tokenLogoMap: Record<string, string> = {
    SOL: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    USDC: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/2048px-Circle_USDC_Logo.svg.png",
    BNB: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/vectors/bnb-2c9adc7qw85po528q8y3b.png/bnb-tss7lyzvhxyjfc9ivae0l.png?_a=DATAg1AAZAA0",
    USDT: "https://www.svgrepo.com/show/367256/usdt.svg",
  };

  const networkLogo = networkLogoMap[summary.network] ?? null;
  const tokenLogo = tokenLogoMap[summary.paymentMethod] ?? null;

  const previewNFT = {
    name: "Celestial #1289",
    image:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=400&auto=format&fit=crop",
  };

  return (
    <div className="fixed -inset-5 lg:ml-64 backdrop-blur z-40 flex items-center justify-center bg-black/80 p-4 lg:p-3">
      <div className="w-full max-w-4xl lg:h-[80vh] h-[calc(100vh-2rem)] rounded-3xl ui-card shadow-2xl relative lg:overflow-hidden overflow-y-auto bottom-0 fixed">
        {/* glow */}
        <img
          src="../icons/abstract-technology-background-concept.jpg"
          className="opacity-15 absolute top-0 left-0"
          alt=""
        />
        <div className="absolute inset-0 pointer-events-none opacity-20 card-gradient-soft" />

        <div className="relative z-10 ">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#111827]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                <Gem className="w-4 h-4 text-[#facc15]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#e5e7eb]">
                  Mint steps
                </div>
                <div className="text-[11px] text-[#9ca3af]">
                  Approve → Confirm → Success (UI-only flow)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* network chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f2937] bg-[#020617]">
                {networkLogo && (
                  <div className="w-4 h-4 rounded-full overflow-hidden">
                    <img
                      src={networkLogo}
                      alt={summary.network}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                )}
                <span className="text-[10px] text-[#9ca3af]">
                  {summary.network}
                </span>
              </div>

              {/* token chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f2937] bg-[#020617]">
                {tokenLogo && (
                  <div className="w-4 h-4 rounded-full overflow-hidden">
                    <img
                      src={tokenLogo}
                      alt={summary.paymentMethod}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                )}
                <span className="text-[10px] text-[#9ca3af]">
                  Pay in{" "}
                  <span className="text-[#e5e7eb] font-medium">
                    {summary.paymentMethod}
                  </span>
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#9ca3af] hover:text-[#e5e7eb]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* body */}
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)] gap-4">
              {/* left: eligibility & preview */}
              <div className="space-y-3">
                {/* back link */}
                {/* <button
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[11px] text-[#9ca3af] hover:text-[#e5e7eb]"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back to NFT drop
                </button> */}

                {/* summary card */}
                <div className="rounded-2xl ui-card backdrop-blur-sm p-3 sm:p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-[11px] text-[#9ca3af]">
                        Collection
                      </div>
                      <div className="text-sm font-semibold text-[#e5e7eb]">
                        {summary.collection}
                      </div>
                      <div className="text-[11px] text-[#9ca3af]">
                        {summary.quantity} NFT{summary.quantity > 1 ? "s" : ""}{" "}
                        • Pay in{" "}
                        <span className="text-[#e5e7eb] font-medium">
                          {summary.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] space-y-1">
                      <div className="text-[#9ca3af]">Network</div>
                      <div className="text-[#e5e7eb] font-medium">
                        {summary.network}
                      </div>
                      <div className="text-[#707070]">
                        Max {summary.maxPerTx} / tx
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#111827] pt-3 mt-1 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#9ca3af]">Price per NFT</span>
                      <span className="text-[#e5e7eb] font-medium">
                        {summary.pricePer} {summary.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9ca3af]">Quantity</span>
                      <span className="text-[#e5e7eb] font-medium">
                        {summary.quantity}
                      </span>
                    </div>
                    {summary.cashback > 0 && (
                      <div className="flex items-center justify-between text-[#3b82f6]">
                        <span>Cashback (UI)</span>

                        <span className="font-medium">
                          -{summary.cashback} {summary.paymentMethod}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-[#111827] ">
                      <span className="text-[11px] text-[#e5e7eb]">Total</span>
                      <span className="text-xs  font-semibold text-[#e5e7eb]">
                        {summary.total} {summary.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* eligibility checklist */}
                <div className="rounded-2xl ui-card backdrop-blur-sm p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#3b82f6]" />
                      <div>
                        <div className="text-xs font-semibold text-[#e5e7eb]">
                          Eligibility check
                        </div>
                        <div className="text-[11px] text-[#9ca3af]">
                          UI-only checklist before mint
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Not enforced on-chain
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <Row
                      ok={eligibility.walletConnected}
                      label="Wallet connected"
                      desc="Connect your wallet to proceed with minting."
                    />
                    <Row
                      ok={eligibility.whitelist}
                      label="Whitelist"
                      desc="Simulated whitelist check (UI-only)."
                    />
                    <Row
                      ok={eligibility.proofOfTaskOk}
                      label="Proof-of-task"
                      desc="Optional off-chain task (UI-only, always OK)."
                    />
                    <Row
                      ok={eligibility.meetsMax}
                      label={`Max ${summary.maxPerTx} NFTs per tx`}
                      desc={`You are minting ${summary.quantity}.`}
                    />
                  </div>

                  {disabledReason && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-[#f97316]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{disabledReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* right: steps */}

              <div className="space-y-3">
                <div className="ui-card rounded-xl p-3 flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#1f1f1f] flex-shrink-0">
                    <img
                      src={previewNFT.image}
                      alt={previewNFT.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-[#707070]">
                        Random preview
                      </div>
                      <div className="text-xs font-semibold text-[#e0e0e0] truncate">
                        {previewNFT.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                      <Sparkles className="w-3 h-3 text-[#3b82f6]" />
                      <span>Final NFT will be revealed after mint.</span>
                    </div>
                  </div>
                </div>
                {/* step 1 */}
                {isApproveNeeded && (
                  <div
                    className={[
                      "rounded-2xl border p-3 sm:p-4 space-y-2 transition-all duration-200",
                      step === "approve"
                        ? "border-[#3b82f6]/60 bg-[#020617]"
                        : approveState === "done"
                          ? "border-[#22c55e]/10 bg-[#15803d]/10"
                          : "border-[#111827] bg-[#020617]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={[
                            "w-7 h-7 rounded-full flex items-center justify-center border",
                            approveState === "done"
                              ? "border-[#22c55e]/70 bg-[#15803d]/15"
                              : step === "approve"
                                ? "border-[#3b82f6]/70 bg-[#1d4ed8]/15"
                                : "border-[#374151] bg-[#020617]",
                          ].join(" ")}
                        >
                          {approveState === "done" ? (
                            <BadgeCheck className="w-4 h-4 text-[#22c55e]" />
                          ) : (
                            <Percent className="w-9 h-4 text-[#3b82f6]" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#e5e7eb]">
                            Step 1 · Approve token spend
                          </div>
                          <div className="text-[11px] w-48 text-[#9ca3af]">
                            Allow the contract to spend your{" "}
                            {summary.paymentMethod} for mint (UI-only).
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onApprove}
                        disabled={!canProceed || approveState !== "idle"}
                        className={[
                          "px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1",
                          !canProceed || approveState !== "idle"
                            ? "bg-[#111827] border border-[#111827] text-[#6b7280] cursor-not-allowed"
                            : "bg-[#3b82f6] text-white border border-[#60a5fa] hover:bg-[#2563eb]",
                        ].join(" ")}
                      >
                        {approveState === "pending" ? "Approving…" : "Approve"}
                        {approveState === "idle" && (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* step 2 */}
                <div
                  className={[
                    "rounded-2xl p-4 space-y-2 transition-all duration-200",
                    step === "confirm"
                      ? "border-[#3b82f6]/60 ui-card"
                      : confirmState === "done"
                        ? "border-[#22c55e]/10 backdrop-blur-sm bg-[#15803d]/10"
                        : "border-[#111827] bg-[#020617]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "w-7 h-7 rounded-full flex items-center justify-center border",
                          confirmState === "done"
                            ? "border-[#22c55e]/70 bg-[#15803d]/15"
                            : step === "confirm"
                              ? "border-[#eee]/70 bg-[#1d4ed8]/15"
                              : "border-[#374151] bg-[#020617]",
                        ].join(" ")}
                      >
                        {confirmState === "done" ? (
                          <BadgeCheck className="w-4 h-4 text-[#22ec55e]" />
                        ) : (
                          <Check className="w-9 h-4 text-[#eee]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#ddd]">
                          Step 2 · Confirm mint
                        </div>
                        <div className="text-[11px] w-48 text-[#aaa]/80">
                          Confirm mint transaction in your wallet (UI-only
                          flow).
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onConfirm}
                      disabled={
                        !canProceed ||
                        confirmState !== "idle" ||
                        (isApproveNeeded && approveState !== "done")
                      }
                      className={[
                        "px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1",
                        !canProceed ||
                        confirmState !== "idle" ||
                        (isApproveNeeded && approveState !== "done")
                          ? "bg-[#111827] border border-[#111827] text-[#6b7280] cursor-not-allowed"
                          : "bg-[#22c55e]/10 text-[#eee] border border-[#4ade80] hover:bg-[#16a34a]/30",
                      ].join(" ")}
                    >
                      {confirmState === "pending"
                        ? "Confirming…"
                        : "Confirm mint"}
                      {confirmState === "idle" && (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* step 3 / success */}
                {step === "success" && (
                  <div
                    className={[
                      "rounded-2xl border p-3 sm:p-4 space-y-2 bg-[#020617]",
                      step === "success"
                        ? "border-[#22c55e]/20"
                        : "border-[#111827]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full border border-[#22c55e]/70 bg-[#15803d]/15 flex items-center justify-center">
                        <Sparkles className="w-9 h-4 text-[#22c55e]" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#e5e7eb]">
                          Step 3 · Mint completed
                        </div>
                        <div className="text-[11px] text-[#9ca3af]">
                          After real integration, this step will show minted
                          NFTs and real tx hash.
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 rounded-xl border border-[#1f2937] bg-[#020617] p-3 text-[11px] text-[#9ca3af] flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-[#3b82f6] mt-0.5" />
                      <div>
                        <div className="font-medium text-[#e5e7eb] mb-0.5">
                          UI-only mint flow
                        </div>
                        <div>
                          When wired to smart contracts, this modal will:
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            <li>
                              Call mint function on your program / contract
                            </li>
                            <li>Track transaction status</li>
                            <li>Show minted NFTs and ticket unlock</li>
                            <li>
                              Apply real cashback from on-chain data (15–20%)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* trust helper */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** small row helper */
function Row({
  ok,
  label,
  desc,
}: {
  ok: boolean;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
          ok
            ? "border-[#22c55e]/60 bg-[#22c55e]/10"
            : "border-[#4b5563]/70 bg-[#020617]"
        }`}
      >
        {ok ? (
          <Check className="w-2.5 h-2.5 text-[#22c55e]" />
        ) : (
          <Lock className="w-2.5 h-2.5 text-[#4b5563]" />
        )}
      </div>
      <div>
        <div className="text-[11px] font-semibold text-[#e5e7eb]">{label}</div>
        <div className="text-[10px] text-[#9ca3af]">{desc}</div>
      </div>
    </div>
  );
}

/** =======================
 *  MAIN PAGE
 *  ======================= */
export function NFTDrop() {
  const { connected, walletType, addCashback } = useWallet() as any;
  const { isActivePremium } = usePremium() as any;

  const [paymentMethod, setPaymentMethod] = useState("SOL");
  const [quantity, setQuantity] = useState(1);

  const [stepsOpen, setStepsOpen] = useState(false);
  const [step, setStep] = useState<Step>("approve");
  const [approveState, setApproveState] = useState<"idle" | "pending" | "done">(
    "idle",
  );
  const [confirmState, setConfirmState] = useState<"idle" | "pending" | "done">(
    "idle",
  );

  const [history, setHistory] = useState<MintHistoryItem[]>([]);

  const whitelist = useMemo(() => {
    return connected ? true : false;
  }, [connected]);

  const dropDetails = {
  name: "SolanaVerse Celestials",
  description: (
    <>
      An exclusive collection of{" "}
      <span className="font-bold text-[#3b82f6]/80">7,777</span> unique celestial beings on
      Solana. Each NFT grants access to community perks, staking boosts, and
      future airdrops.
    </>
  ),
  totalSupply: 7777,
  minted: 2453,
    endDate: new Date("2026-12-31T23:59:59Z"),
    benefits: [
      "Exclusive community access",
      "Staking rewards up to 15% APY",
      "Priority whitelist for future drops",
      "Governance voting rights",
      "Free airdrops of partner projects",
    ],
    rarityDistribution: [
      { name: "Legendary", percentage: 1, count: 78 },
      { name: "Epic", percentage: 5, count: 389 },
      { name: "Rare", percentage: 14, count: 1089 },
      { name: "Common", percentage: 80, count: 6221 },
    ],
  };

  const priceMap: Record<string, number> = {
    SOL: 0.1,
    USDC: 2.5,
    BNB: 0.004,
    USDT: 2.5,
  };

  const paymentOptions =
    walletType === "phantom"
      ? [
          {
            value: "SOL",
            label: "SOL",
            logo: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
          },
          {
            value: "USDC",
            label: "USDC",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/2048px-Circle_USDC_Logo.svg.png",
          },
        ]
      : walletType === "metamask"
        ? [
            {
              value: "BNB",
              label: "BNB",
              logo: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/vectors/bnb-2c9adc7qw85po528q8y3b.png/bnb-tss7lyzvhxyjfc9ivae0l.png?_a=DATAg1AAZAA0",
            },
            {
              value: "USDT",
              label: "USDT",
              logo: "https://www.svgrepo.com/show/367256/usdt.svg",
            },
          ]
        : [];

  useEffect(() => {
    if (!paymentOptions.length) return;
    if (!paymentOptions.find((p) => p.value === paymentMethod)) {
      setPaymentMethod(paymentOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletType]);

  const totalPrice = useMemo(() => {
    const per = priceMap[paymentMethod] ?? 0;
    return per * quantity;
  }, [paymentMethod, quantity]);

  const cashbackPercent = isActivePremium ? 0.5 : 0.15;
  const cashbackPercentLabel = `${(cashbackPercent * 100).toFixed(0)}%`;

  const hasCashback = quantity >= 2;
  const cashbackAmount = hasCashback ? totalPrice * cashbackPercent : 0;

  const timeLeft = isPast(dropDetails.endDate)
    ? "Ended"
    : formatDistanceToNow(dropDetails.endDate, { addSuffix: false });

  const trust = useMemo<TrustScore>(() => {
    let score = 0;
    const reasons: string[] = [];

    if (connected) {
      score += 40;
      reasons.push("Wallet connected");
    } else {
      reasons.push("Connect wallet to increase trust");
    }

    if (whitelist) {
      score += 30;
      reasons.push("Whitelist status: OK (UI)");
    } else {
      reasons.push("Whitelist required (UI)");
    }

    if (history.length >= 1) {
      score += 20;
      reasons.push("Previous mint history detected");
    }

    if (isActivePremium) {
      score += 10;
      reasons.push("Premium active: higher future allocation weight (UI)");
    }

    score = clamp(score, 0, 100);
    const label: "Low" | "Medium" | "High" =
      score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
    return { score, label, reasons };
  }, [connected, whitelist, history.length, isActivePremium]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MINT_HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MINT_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const previewNFTs: PreviewNFT[] = [
    {
      id: 1,
      name: "Celestial #1289",
      image:
        "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=400&auto=format&fit=crop",
      rarity: "Legendary",
      estValue: 0.35,
    },
    {
      id: 2,
      name: "Celestial #2456",
      image:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop",
      rarity: "Epic",
      estValue: 0.22,
    },
    {
      id: 3,
      name: "Celestial #3789",
      image:
        "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=400&auto=format&fit=crop",
      rarity: "Rare",
      estValue: 0.16,
    },
    {
      id: 4,
      name: "Celestial #4567",
      image:
        "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop",
      rarity: "Common",
      estValue: 0.11,
    },
    {
      id: 5,
      name: "Celestial #8921",
      image:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop",
      rarity: "Epic",
      estValue: 0.24,
    },
  ];

  const eligibility = useMemo<EligibilityState>(() => {
    const maxPerTx = 10;
    return {
      walletConnected: !!connected,
      whitelist,
      proofOfTaskOk: true,
      meetsMax: quantity >= 1 && quantity <= maxPerTx,
    };
  }, [connected, whitelist, quantity]);

  const summary = useMemo<Summary>(() => {
    const maxPerTx = 10;
    const network: string =
      walletType === "phantom"
        ? "Solana"
        : walletType === "metamask"
          ? "BNB Chain"
          : "—";

    return {
      collection: dropDetails.name,
      quantity,
      paymentMethod,
      pricePer: priceMap[paymentMethod] ?? 0,
      total: totalPrice,
      cashback: cashbackAmount,
      maxPerTx,
      network,
    };
  }, [
    cashbackAmount,
    dropDetails.name,
    paymentMethod,
    quantity,
    totalPrice,
    walletType,
  ]);

  const openMintSteps = () => {
    if (!connected) return toast.error("Please connect your wallet first");

    setStepsOpen(true);

    const needsApprove = paymentMethod !== "SOL" && paymentMethod !== "BNB";
    setStep(needsApprove ? "approve" : "confirm");
    setApproveState(needsApprove ? "idle" : "done");
    setConfirmState("idle");
  };

  const handleApprove = () => {
    if (
      !eligibility.walletConnected ||
      !eligibility.whitelist ||
      !eligibility.proofOfTaskOk ||
      !eligibility.meetsMax
    ) {
      toast.error("Complete eligibility requirements first");
      return;
    }

    setApproveState("pending");
    toast.message("Approving token spend… (UI)");
    setTimeout(() => {
      setApproveState("done");
      setStep("confirm");
      toast.success("Approve complete");
    }, 900);
  };

  const handleConfirmMint = () => {
    if (
      !eligibility.walletConnected ||
      !eligibility.whitelist ||
      !eligibility.proofOfTaskOk ||
      !eligibility.meetsMax
    ) {
      toast.error("Complete eligibility requirements first");
      return;
    }

    const needsApprove = paymentMethod !== "SOL" && paymentMethod !== "BNB";
    if (needsApprove && approveState !== "done") {
      toast.error("Approve required first");
      return;
    }

    setConfirmState("pending");
    toast.message("Confirming mint… (UI)");
    setTimeout(() => {
      setConfirmState("done");
      setStep("success");

      if (hasCashback && typeof addCashback === "function") {
        try {
          addCashback(cashbackAmount);
          toast.success(
            `${cashbackPercentLabel} cashback added: ${cashbackAmount.toFixed(
              4,
            )} ${paymentMethod} `,
          );
        } catch {
          // ignore
        }
      }

      const ticketUnlocked = true;

      const item: MintHistoryItem = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        ts: Date.now(),
        quantity,
        paymentMethod,
        totalPaid: totalPrice,
        cashback: cashbackAmount,
        txMock: `0x${Math.random().toString(16).slice(2)}…${Math.random()
          .toString(16)
          .slice(2, 6)}`,
        ticketUnlocked,
      };
      setHistory((prev) => [item, ...prev].slice(0, 25));

      toast.success(
        `${quantity} NFT${quantity > 1 ? "s" : ""} minted successfully! (UI)`,
      );
    }, 1200);
  };

  const mintedPercent = (dropDetails.minted / dropDetails.totalSupply) * 100;
  const heroNetwork: string =
    walletType === "phantom"
      ? "Solana"
      : walletType === "metamask"
        ? "BNB Chain"
        : "Solana + BNB (UI)";
  const remainingSupply = dropDetails.totalSupply - dropDetails.minted;
  const timeLabel = timeLeft === "Ended" ? "Drop ended" : `${timeLeft} left`;

  return (
    <div className="space-y-6">
      {/* HERO / TOP BOARD */}
      <div className=" w-[120vh] rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1.2fr]pointer-events-none absolute -inset-0.5 opacity-10 card-gradient-soft" />
        <img
          src="public/back2.png"
          className="absolute w-full h-full inset-0 opacity-80 object-cover"
          alt=""
        />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* LEFT: title + опис */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1 text-[10px] text-[#9ca3af]">
              <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
              <span>NFT Drop</span>
              <span className="w-1 h-1 rounded-full bg-[#3b82f6]" />
              <span className="text-[#e5e5e5] font-medium">
                {dropDetails.name}
              </span>
              {isActivePremium && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] text-[#22c55e]">
                  Premium: Active
                </span>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold ui-bg-text">
                Mint your <br/>SolanaVerse <br />
                <motion.span
                  className="text-4xl font-bold"
                  style={{
                    background:
                      "linear-gradient(90deg, #3b82f6, #eeeeeeac, #a855f7)",
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
                  Celestials access pass
                </motion.span>
              </h1>
              <div className="mt-1 text-[11px]"></div>
              <p className="mt-1.5 text-xs md:text-sm text-[#9ca3af] max-w-xl">
                {dropDetails.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <div className="inline-flex items-center gap-1 rounded-full  bg-[#050816] px-2.5 py-1">
                <Users className="h-3.5 w-3.5 text-[#3b82f6]" />
                <span className="text-[#9ca3af]">Supply</span>
                <span className="text-[#e5e5e5] font-semibold">
                  {dropDetails.totalSupply.toLocaleString()}
                </span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full  bg-[#050816] px-2.5 py-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#3b82f6]" />
                <span className="text-[#9ca3af]">Minted</span>
                <span className="text-[#e5e5e5] font-semibold">
                  {dropDetails.minted.toLocaleString()} ·{" "}
                  {mintedPercent.toFixed(1)}%
                </span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full  bg-[#050816] px-2.5 py-1">
                <Clock className="h-3.5 w-3.5 text-[#3b82f6]" />
                <span className="text-[#9ca3af]">{timeLabel}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: network + залишок */}
          <div className="flex flex-col items-start md:items-end gap-2 text-[11px]">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#050816]/90 px-3 py-2">
              <Globe2 className="h-3.5 w-3.5 text-[#3b82f6]" />
              <div className="flex flex-col items-start md:items-start">
                <span className="text-[#9ca3af]">Current network</span>
                <span className="text-[#e5e5e5] font-semibold">
                  {heroNetwork}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl  px-3 py-2">
                <Gem className="h-3.5 w-3.5 text-[#facc15]" />
                <div className="flex flex-col items-start md:items-start">
                  <span className="text-[#9ca3af]">Remaining</span>
                  <span className="text-[#e5e5e5] font-semibold">
                    {remainingSupply.toLocaleString()} NFTs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.2fr] gap-6">
        {/* LEFT: Drop info */}
        <div className="space-y-4">
          {/* Drop status / прогрес */}
          <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f]/20 ui-card backdrop-blur p-4 md:p-5">
            {/* <div className="pointer-events-none absolute  -inset-0.5 opacity-10 card-gradient-soft" /> */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#0b1120] border border-[#1f1f1f] px-2.5 py-1 text-[10px] text-[#9ca3af]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e]/60 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    </span>
                    {timeLeft === "Ended" ? "Drop ended" : "Mint live (UI)"}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[#e5e7eb]">
                    {dropDetails.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    {dropDetails.description}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-[#9ca3af] mb-1">
                  <span>Mint progress</span>
                  <span>{mintedPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#020617] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22c55e]"
                    style={{
                      width: `${Math.max(0, Math.min(100, mintedPercent))}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[#6b7280]">
                  <span>{dropDetails.minted.toLocaleString()} minted</span>
                  <span>{remainingSupply.toLocaleString()} remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="rounded-xl ui-inner p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[#3b82f6]" />
                    <div>
                      <div className="text-[#9ca3af]">Mint price</div>
                      <div className="text-sm font-semibold text-[#e5e7eb]">
                        0.1 SOL / 2.5 USDT
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl ui-inner p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#3b82f6]" />
                    <div>
                      <div className="text-[#9ca3af]">Volume (UI)</div>
                      <div className="text-sm font-semibold text-[#e5e7eb]">
                        1.2K SOL
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Holder Benefits */}
          <div className="ui-card backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-sm font-semibold  text-[#e0e0e0] mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-[#3b82f6]" />
              Holder Benefits
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {dropDetails.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs text-[#a0a0a0] bg-[#050816]/60 p-2 rounded-lg transition-all hover:bg-[#050816]/90"
                >
                  <Check className="h-3 w-3 text-[#3b82f6] mt-0.5 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Rarity tiers & examples — компактна версія з 3 прикладами */}
          <div className="ui-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-[#3b82f6]" />
                <h3 className="text-sm font-semibold text-[#e0e0e0]">
                  Rarity tiers & examples
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#707070]">
                  {dropDetails.totalSupply.toLocaleString()} NFTs total
                </span>
                {isActivePremium && (
                  <div className="text-[10px] text-[#22c55e] mt-0.5">
                    Premium: higher chance for rare tiers
                  </div>
                )}
              </div>
            </div>

            {/* Горизонтальний скрол на мобілці, 3 карточки на десктопі */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {dropDetails.rarityDistribution.slice(0, 3).map((r) => {
                // тільки топ-3
                const exampleImage =
                  r.name === "Legendary"
                    ? "https://bnetcmsus-a.akamaihd.net/cms/page_media/H5TGNQZTDZ111737161225805.jpg"
                    : r.name === "Epic"
                      ? "https://unfocussed.com/cdn/shop/articles/Nebula_Eyes_and_Moonlit_Fur.png?v=1730776099"
                      : "https://images.fineartamerica.com/images-medium-5/phenax-god-of-deception-ryan-barger.jpg";

                return (
                  <div key={r.name} className="flex-shrink-0 w-full sm:w-auto">
                    <div className="space-y-2">
                      {/* Фото */}
                      <div className="h-64 rounded-lg overflow-hidden border border-[#1f1f1f]">
                        <img
                          src={exampleImage}
                          alt={`${r.name} example`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Назва + бар */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-[#a0a0a0] text-center">
                          <span className="text-[#e0e0e0]  font-semibold">
                            {" "}
                            {r.name}{" "}
                          </span>{" "}
                          {r.percentage}% • {r.count.toLocaleString()} NFTs
                        </div>
                        <div className="h-2 rounded-full bg-[#050816] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22c55e] transition-all duration-500"
                            style={{ width: `${r.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Common як текст, щоб не займати місце */}
            {dropDetails.rarityDistribution[3] && (
              <div className="mt-3 pt-3 border-t border-[#1f1f1f]/50 text-center text-[11px] text-[#a0a0a0]">
                Common: {dropDetails.rarityDistribution[3].percentage}% (
                {dropDetails.rarityDistribution[3].count.toLocaleString()} NFTs)
              </div>
            )}

            {!isActivePremium && (
              <div className="mt-3 text-[10px] text-[#707070] text-center">
                Upgrade to Premium for better odds on higher tiers (UI demo).
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Mint panel */}
        <div className="space-y-4">
          {!connected && (
            <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-4 w-4 text-[#a0a0a0] flex-shrink-0 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-xs font-medium text-[#e0e0e0]">
                    Wallet not connected
                  </h3>
                  <p className="mt-1 text-xs text-[#707070]">
                    Please connect your wallet to mint NFTs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mint box */}
      
          <div className="ui-card backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#e0e0e0] mb-4">
              Mint your NFTs
            </h3>

            <div className="space-y-4">
              {/* Quantity з quick buttons */}
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg overflow-hidden  flex-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 bg-[#050816]/70 hover:bg-[#1a1a1a] text-[#e0e0e0]"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const parsed = raw === "" ? 1 : parseInt(raw, 10);
                        setQuantity(clamp(parsed, 1, 10));
                      }}
                      className="w-full r text-center bg-[#050816]/70 text-[#e0e0e0] text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="px-3 py-1.5 bg-[#050816]/70 hover:bg-[#1a1a1a] hover:bg-[#1a1a1a] text-[#e0e0e0]"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {[1, 3, 5, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuantity(n)}
                        className={`px-4 py-2 text-[10px] rounded-lg border ${quantity === n ? "border-[#3b82f6] bg-[#050816]/10 text-[#e0e0e0]" : "border-[#eee]/20 text-[#707070]"}`}
                      >
                        {n === 10 ? "Max" : n}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-[#707070]">
                  Mint 2+ → cashback {isActivePremium ? "20%" : "15%"} (Premium
                  higher)
                </p>
              </div>

              {/* Payment method як чіпси */}
              {connected && paymentOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                    Pay with
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPaymentMethod(option.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-full border transition-all ${
                          paymentMethod === option.value
                            ? "border-[#3b82f6]/10 bg-[#3b82f6]/10 text-[#e0e0e0]"
                            : "border-[#1f1f1f]/20 ui-inner text-[#707070] hover:border-[#3b82f6]/40"
                        }`}
                      >
                        <img
                          src={option.logo}
                          alt={option.label}
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-xs">{option.label}</span>
                        <span className="text-[10px] text-[#a0a0a0]">
                          {priceMap[option.value]} {option.value}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary + CTA */}
              <div className="ui-inner shadow-lg rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#707070]">
                    {quantity} × {priceMap[paymentMethod]} {paymentMethod}
                  </span>
                  <span className="text-[#e0e0e0]">
                    {totalPrice} {paymentMethod}
                  </span>
                </div>
                {hasCashback && (
                  <div className="flex justify-between text-xs text-[#3b82f6]">
                    <span>Cashback ({cashbackPercentLabel})</span>
                    <span>
                      -{cashbackAmount} {paymentMethod}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#1f1f1f]/50 flex justify-between items-center">
                  <span className="text-sm text-[#e0e0e0]">Total</span>
                  <span className="text-sm font-bold text-[#e0e0e0]">
                    {totalPrice} {paymentMethod}
                  </span>
                </div>
                {isActivePremium && (
                  <p className="text-[10px] text-[#22c55e] text-center">
                    Premium benefits active
                  </p>
                )}
              </div>

              <button
                onClick={openMintSteps}
                disabled={!connected}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  !connected
                    ? "bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]"
                    : "bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                <Gem className="h-4 w-4" />
                {connected ? "Proceed to Mint" : "Connect Wallet"}
              </button>
            </div>
          </div>

          {/* Trust helper */}
          <div className="ui-card shadow-lg backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-xs font-semibold text-[#e0e0e0]">
                  Trust & safety (UI helper)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded-full border ${
                    trust.label === "High"
                      ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]"
                      : trust.label === "Medium"
                        ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                        : "border-[#f97316]/40 bg-[#f97316]/10 text-[#f97316]"
                  }`}
                >
                  {trust.label} trust
                </span>
                <span className="text-[#a0a0a0]">{trust.score}/100</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] text-[#a0a0a0]">
              {trust.reasons.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[#707070]">
              This block is only a UI helper and does not represent real audits.
            </p>
          </div>

          {/* Mint History — з реальними прев’ю NFT в кожному записі */}
          <div className="ui-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#3b82f6]" />
                <h3 className="text-sm font-semibold text-[#e0e0e0]">
                  Mint History
                </h3>
              </div>
              <span className="text-[10px] text-[#707070]">
                UI-only simulation
              </span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-[11px] text-[#a0a0a0]">
                No mints yet.
                <br />
                <span className="text-[10px] text-[#707070]">
                  Your minted Celestials will appear here
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 4).map((h, index) => {
                  // Масив реальних прев’ю (циклічно, щоб вистачило на всі записи)
                  const previewImages = [
                    "https://images.stockcake.com/public/6/9/a/69a33ae4-e361-4c6f-ba40-35d9a3400f37_large/celestial-beings-descend-stockcake.jpg", // celestial beings descend
                    "https://images.stockcake.com/public/d/b/2/db275e0d-76c8-4542-8913-abda43975768_large/celestial-light-princess-stockcake.jpg", // light princess
                    "https://images.stockcake.com/public/8/9/9/8993696b-13d0-457e-a375-3f168f23e45a_large/cosmic-goddess-awakens-stockcake.jpg", // cosmic goddess
                    "https://thumbs.dreamstime.com/b/angel-wings-glowing-ethereal-fantasy-art-stock-photo-generative-ai-embodying-beauty-celestial-spiritual-imagery-369325763.jpg", // glowing angel wings
                    "https://img.freepik.com/premium-photo/angel-warrior-with-glowing-wings_161362-107003.jpg", // golden warrior angel
                    "https://b2-backblaze-stackpath.b-cdn.net/3053764/htnsjo_c9d3098e4b082d7f14759a4685e22b8bff82e9fb.jpg", // golden-winged being
                  ];
                  const nftImage = previewImages[index % previewImages.length];

                  return (
                    <div
                      key={h.id}
                      className="ui-inner rounded-lg p-3 flex items-start gap-3 hover:border-[#3b82f6]/20 transition-all"
                    >
                      {/* Прев’ю NFT */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#1f1f1f] flex-shrink-0">
                        <img
                          src={nftImage}
                          alt="Minted Celestial"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Інфа */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-semibold text-[#e0e0e0]">
                            ×{h.quantity} Celestial{h.quantity > 1 ? "s" : ""} •{" "}
                            {h.paymentMethod}
                          </div>
                          <div className="text-[10px] text-[#707070]">
                            {formatDistanceToNow(h.ts, { addSuffix: true })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#a0a0a0]">
                            Paid:{" "}
                            <span className="text-[#e0e0e0] font-medium">
                              {h.totalPaid} {h.paymentMethod}
                            </span>
                          </span>

                          <div className="flex items-center gap-3">
                            {h.cashback > 0 && (
                              <span className="text-[#3b82f6] flex items-center gap-1 text-[10px]">
                                <Percent className="h-3 w-3" />+{h.cashback}{" "}
                                cashback
                              </span>
                            )}
                            {h.ticketUnlocked && (
                              <span className="text-[#22c55e] flex items-center gap-1 text-[10px]">
                                <BadgeCheck className="h-3 w-3" />
                                Ticket unlocked
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-1 text-[10px] text-[#707070] flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Tx: {h.txMock}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {history.length > 4 && (
                  <div className="text-center pt-2">
                    <button className="text-[11px] text-[#3b82f6] hover:text-[#e0e0e0] transition-colors">
                      Show all {history.length} records →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mint Steps Modal */}
      <MintStepsModal
        open={stepsOpen}
        step={step}
        approveState={approveState}
        confirmState={confirmState}
        onClose={() => setStepsOpen(false)}
        onApprove={handleApprove}
        onConfirm={handleConfirmMint}
        summary={summary}
        eligibility={eligibility}
        trust={trust}
      />
    </div>
  );
}

export default NFTDrop;
