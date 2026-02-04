import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Shield,
  Info,
  Activity,
  Clock,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export type InvestmentMode = "liquid" | "locked" | "high-risk";

export interface ActiveInvestment {
  id: number;
  projectId: number;
  fundName: string;
  amount: number;
  currency: "USDT" | "SOL";
  apy: number; // 26.4
  mode: InvestmentMode;
  since: string; // ISO string
  lockDaysLeft?: number;
  autoReinvest: boolean;
  insuranceEnabled: boolean;
  volatility?: number; // 0–100
  inflow?: number; // 0–100
  liquidity?: number; // 0–100
  devScore?: number; // 0–100
}

interface ActiveInvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string | null;
  investments: ActiveInvestment[];
  onExitInvestment?: (id: number) => void;
}

function formatShortWallet(addr?: string | null): string {
  if (!addr) return "Not linked";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function diffDays(fromIso: string): number {
  const from = new Date(fromIso).getTime();
  if (Number.isNaN(from)) return 0;
  const now = Date.now();
  return Math.max(0, Math.floor((now - from) / (1000 * 60 * 60 * 24)));
}

function calcProfit(inv: ActiveInvestment): number {
  const days = diffDays(inv.since);
  if (days <= 0) return 0;
  const dailyRate = inv.apy / 100 / 365; // спрощено
  const profit = inv.amount * dailyRate * days;
  return Number(profit.toFixed(2));
}

function calcPortfolioHealth(investments: ActiveInvestment[]): number {
  if (investments.length === 0) return 0;

  const base = 80;
  const highRiskShare =
    investments.filter((i) => i.mode === "high-risk").length /
    investments.length;

  const avgVol =
    investments.reduce((acc, i) => acc + (i.volatility ?? 15), 0) /
    investments.length;
  const avgLiq =
    investments.reduce((acc, i) => acc + (i.liquidity ?? 80), 0) /
    investments.length;
  const avgDev =
    investments.reduce((acc, i) => acc + (i.devScore ?? 85), 0) /
    investments.length;

  let score = base;
  score -= highRiskShare * 25;
  score -= Math.max(0, avgVol - 15) * 0.7;
  score += (avgLiq - 70) * 0.4;
  score += (avgDev - 80) * 0.3;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export default function ActiveInvestmentsModal({
  isOpen,
  onClose,
  walletAddress,
  investments,
  onExitInvestment,
}: ActiveInvestmentsModalProps) {
  const [payoutCountdown, setPayoutCountdown] = useState<string>("");

  // Global next payout countdown (24h cycle)
  useEffect(() => {
    if (!isOpen || investments.length === 0) return;

    const nextTs = Date.now() + 24 * 60 * 60 * 1000; // 24h
    const timer = setInterval(() => {
      const diff = nextTs - Date.now();
      if (diff <= 0) {
        setPayoutCountdown("00h 00m 00s");
        clearInterval(timer);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setPayoutCountdown(
        `${h.toString().padStart(2, "0")}h ${m
          .toString()
          .padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, investments.length]);

  const summary = useMemo(() => {
    if (investments.length === 0) {
      return {
        totalCount: 0,
        totalAmount: 0,
        lockedCount: 0,
        liquidCount: 0,
        avgApy: 0,
      };
    }

    const totalAmount = investments.reduce((acc, i) => acc + i.amount, 0);
    const lockedCount = investments.filter((i) => i.mode === "locked").length;
    const liquidCount = investments.filter((i) => i.mode === "liquid").length;

    const avgApy =
      investments.reduce((acc, i) => acc + i.apy, 0) / investments.length;

    return {
      totalCount: investments.length,
      totalAmount,
      lockedCount,
      liquidCount,
      avgApy: Number(avgApy.toFixed(1)),
    };
  }, [investments]);

  const portfolioHealth = useMemo(
    () => calcPortfolioHealth(investments),
    [investments]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed -inset-10 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1f1f1f] bg-[#050816] p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#e0e0e0]">
                  Your Active Investments
                </h2>
                <div className="mt-1 text-xs text-[#707070]">
                  Linked to wallet:{" "}
                  <span className="font-mono text-[#e0e0e0]">
                    {formatShortWallet(walletAddress)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Top stats */}
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0f1e] p-3">
                <div className="text-[11px] text-[#707070]">Total Investments</div>
                <div className="mt-1 text-lg font-semibold text-[#e0e0e0]">
                  {summary.totalCount}
                </div>
              </div>
              <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0f1e] p-3">
                <div className="text-[11px] text-[#707070]">
                  Total Amount (all)
                </div>
                <div className="mt-1 flex items-center gap-1 text-lg font-semibold text-[#e0e0e0]">
                  <DollarSign className="h-4 w-4 text-[#3b82f6]" />
                  {summary.totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] text-[#707070]">
                  Across USDT / SOL funds
                </div>
              </div>
              <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0f1e] p-3">
                <div className="text-[11px] text-[#707070]">
                  Locked vs Liquid
                </div>
                <div className="mt-1 text-lg font-semibold text-[#e0e0e0]">
                  {summary.lockedCount} / {summary.liquidCount}
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#111827]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] via-[#22c1c3] to-[#a855f7]"
                    style={{
                      width:
                        summary.totalCount === 0
                          ? "0%"
                          : `${(summary.lockedCount /
                              Math.max(summary.totalCount, 1)) *
                              100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0f1e] p-3">
                <div className="text-[11px] text-[#707070]">
                  Avg APY (applied)
                </div>
                <div className="mt-1 text-lg font-semibold text-[#3b82f6]">
                  {summary.avgApy}%
                </div>
              </div>
            </div>

            {/* Next payout + health */}
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0f1e] p-3 flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#3b82f6]" />
                <div>
                  <div className="text-xs text-[#707070]">
                    Next Payout Countdown
                  </div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {investments.length === 0
                      ? "No active payouts"
                      : payoutCountdown || "calculating..."}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0f1e] p-3">
                <div className="mb-1 flex items-center justify-between text-xs text-[#707070]">
                  <span>Portfolio Health</span>
                  <span
                    className={
                      portfolioHealth >= 75
                        ? "text-green-400"
                        : portfolioHealth >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {portfolioHealth >= 75
                      ? "Strong"
                      : portfolioHealth >= 50
                      ? "Moderate"
                      : "Fragile"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#22c1c3]" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      {portfolioHealth}/100
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#111827]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#22c1c3] via-[#3b82f6] to-[#a855f7]"
                        style={{ width: `${portfolioHealth}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-[#707070]">
                      Based on volatility, liquidity, inflow and dev score
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table of investments */}
            {investments.length === 0 ? (
              <div className="mt-4 rounded-xl border border-[#1f1f1f] bg-[#0a0f1e] p-6 text-center text-sm text-[#707070]">
                You don't have any active investments yet.
              </div>
            ) : (
              <div className="mt-2 overflow-x-auto rounded-xl border border-[#1f1f1f] bg-[#050816]">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1f1f1f] bg-[#050816] text-[#707070]">
                      <th className="px-4 py-2 font-medium">Fund</th>
                      <th className="px-4 py-2 font-medium">Amount</th>
                      <th className="px-4 py-2 font-medium">Mode</th>
                      <th className="px-4 py-2 font-medium">APY</th>
                      <th className="px-4 py-2 font-medium">Since</th>
                      <th className="px-4 py-2 font-medium">Insurance</th>
                      <th className="px-4 py-2 font-medium">Profit</th>
                      <th className="px-4 py-2 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => {
                      const profit = calcProfit(inv);
                      const days = diffDays(inv.since);
                      const isLocked = inv.mode === "locked";
                      const isHighRisk = inv.mode === "high-risk";

                      return (
                        <tr
                          key={inv.id}
                          className="border-t border-[#1f1f1f] hover:bg-[#0a0f1e]"
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="text-[11px] font-semibold text-[#e0e0e0]">
                              {inv.fundName}
                            </div>
                            <div className="text-[10px] text-[#707070]">
                              ID #{inv.projectId}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-[11px] text-[#e0e0e0]">
                              {inv.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              {inv.currency}
                            </div>
                            <div className="text-[10px] text-[#707070]">
                              Auto-Reinvest:{" "}
                              <span
                                className={
                                  inv.autoReinvest
                                    ? "text-[#3b82f6]"
                                    : "text-[#707070]"
                                }
                              >
                                {inv.autoReinvest ? "ON" : "OFF"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-[11px]">
                              {isHighRisk ? (
                                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                                  🚀 High-Risk
                                </span>
                              ) : isLocked ? (
                                <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                                  Locked
                                </span>
                              ) : (
                                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                                  Liquid
                                </span>
                              )}
                            </div>
                            {isLocked && inv.lockDaysLeft !== undefined && (
                              <div className="mt-1 text-[10px] text-[#707070]">
                                {inv.lockDaysLeft} days left
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-[11px] font-semibold text-[#3b82f6]">
                              {inv.apy.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-[11px] text-[#e0e0e0]">
                              {new Date(inv.since).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-[#707070]">
                              {days} days ago
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {inv.insuranceEnabled ? (
                              <div className="flex items-center gap-1 text-[11px] text-[#e0e0e0]">
                                <Shield className="h-3.5 w-3.5 text-[#3b82f6]" />
                                20% protected
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] text-[#fbbf24]">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                No insurance
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div
                              className={`text-[11px] font-semibold ${
                                profit >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {profit >= 0 ? "+" : ""}
                              {profit} USDT
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex justify-end gap-2">
                              {onExitInvestment && !isLocked && (
                                <button
                                  onClick={() =>
                                    onExitInvestment && onExitInvestment(inv.id)
                                  }
                                  className="rounded-lg bg-red-600/10 px-3 py-1 text-[11px] font-medium text-red-400 hover:bg-red-600/20"
                                >
                                  Exit
                                </button>
                              )}
                              {/* можеш додати ще кнопки тут */}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* APR → APY + Insurance explain */}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-[#1f1f1f] bg-[#050816] p-3 text-xs">
                <Info className="mt-0.5 h-4 w-4 text-[#3b82f6]" />
                <div>
                  <div className="mb-1 font-semibold text-[#e0e0e0]">
                    APR → APY Explainer
                  </div>
                  <p className="text-[#a0a0a0]">
                    APR is a flat yearly rate. APY includes{" "}
                    <span className="font-semibold text-[#3b82f6]">
                      compounding
                    </span>{" "}
                    of rewards. Your funds are calculated using APY with daily
                    accruals, which results in a slightly higher real yield over
                    time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#1f1f1f] bg-[#050816] p-3 text-xs">
                <Shield className="mt-0.5 h-4 w-4 text-[#3b82f6]" />
                <div>
                  <div className="mb-1 font-semibold text-[#e0e0e0]">
                    DeFi Insurance Vault — 20% Capital Shield
                  </div>
                  <p className="text-[#a0a0a0]">
                    For insured funds, up to{" "}
                    <span className="font-semibold text-[#e0e0e0]">
                      20% of your initial capital
                    </span>{" "}
                    is protected in case of critical protocol failures or
                    severe, unexpected market events.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
