import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePremium } from "../context/PremiumContext";
import {
  X,
  Lock,
  Unlock,
  ArrowRight,
  Info,
  Shield,
} from "lucide-react";


export default function InvestmentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  project,
}: any) {
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState<"BNB" | "USDT">("BNB");
  const [mode, setMode] = useState<"liquid" | "locked">("locked");
  const [autoReinvest, setAutoReinvest] = useState(true);

  if (!project) return null;

  const apy = Number(project.apy.replace("%", "")) || 0;
  const estimatedProfit = Number((amount * (apy / 100)).toFixed(2));
  const estimatedPayout = Number(amount + estimatedProfit).toFixed(2);

  const insurancePercentage = 20;

  const monthlyProfit = Number((amount * (apy / 12 / 100)).toFixed(3));
  const yearlyProfit = estimatedProfit;

  const { hasPremium } = usePremium();

  // PNG logos for tokens (BNB + USDT)
  const tokenLogos: Record<"BNB" | "USDT", string> = {
    BNB: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/vectors/bnb-2c9adc7qw85po528q8y3b.png/bnb-tss7lyzvhxyjfc9ivae0l.png?_a=DATAg1AAZAA0",
    USDT: "https://www.svgrepo.com/show/367256/usdt.svg",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed -inset-10 backdrop-blur bg-[#050816]/90 z-10 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full mt-10 ml-56 max-w-4xl bg-[#020203c9] rounded-xl p-6 max-h-[75vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#e0e0e0]">
                  Confirm Investment
                </h2>
                <p className="text-xs text-[#707070] mt-1">
                  {project.name} • Lock period: {project.lockPeriod}
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* MIN INVEST */}
                <div className="bg-[#1a1a1a]/70 relative border border-[#1f1f1f]/30 rounded-xl p-4">
                <img src="/icons/shape-4-1.png" className="opacity-35 absolute top-0 left-5" alt="" />
                <div className="pointer-events-none absolute -inset-0 rounded-2xl opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />
                  <div className="text-[11px] text-[#707070]">
                    Minimum Investment
                  </div>
                  <div className="text-[14px] font-semibold text-[#e0e0e0] mt-1">
                    {project.minInvestment} BNB
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1">
                    Displayed values below are for preview.
                  </div>
                </div>

                {/* TARGET RETURN */}
                <div className="bg-[#1a1a1a]/70 border border-[#1f1f1f]/30 rounded-xl p-4">
                  <div className="text-[11px] text-[#707070]">Target Return</div>
                  <div className="text-[14px] font-semibold text-[#3b82f6] mt-1">
                    {project.expectedReturn}
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1">
                    Based on current APY of this strategy.
                  </div>
                </div>

                {/* INSURANCE INDICATOR */}
                <div className="flex items-start gap-3 bg-[#1a1a1a]/70 border border-[#1f1f1f]/30 rounded-xl p-4">
                  <Shield className="w-5 h-5 text-[#22c55e] -mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-[#e0e0e0]">
                      Insurance Coverage
                    </div>

                    { hasPremium ? (
                    <p className="text-[11px] text-[#707070] leading-relaxed mt-1">
                      This fund provides{" "}
                      <span className="text-[#22c55e] font-semibold">
                        {insurancePercentage}%
                      </span>{" "}
                      coverage in case of market crash or liquidation event.
                    </p>
) : (

                    <p className="text-[11px] text-[#707070] leading-relaxed mt-1">
                      This fund provides{" "}
                      <span className="text-[red] font-semibold">
                        0%
                      </span>{" "}
                      • Upgrade to Premium to enable 20% downside protection
                    </p>
 )}

                  </div>
                </div>



                {/* IMPORTANT NOTES */}
                <div className="bg-[#111212]/10 border border-[#1f1f1f]/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-[#3b82f6]" />
                    <div className="text-[11px] text-[#707070] leading-relaxed">
                      • APY may change depending on market conditions.
                      <br />
                      • Locked mode cannot be exited early.
                      <br />
                      • Auto-compound applies only for locked investments.
                      <br />
                      • Insurance applies only for approved assets within the fund.
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-5">
                {/* MODE COMPARISON BLOCK */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setMode("liquid")}
                    className={`border rounded-xl p-4 cursor-pointer transition bg-[#1a1a1a]/70 hover:bg-[#1a1a1a] ${
                      mode === "liquid"
                        ? "border-[#3b82f6]/30"
                        : "border-[#1f1f1f]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Unlock className="w-3 h-3 text-[#22c55e]" />
                      <div className="font-semibold text-[#e0e0e0]">
                        Liquid Mode
                      </div>
                    </div>
                    <ul className="text-[11px] text-[#707070] leading-relaxed">
                      <li>• Lower APY</li>
                      <li>• Exit anytime</li>
                      <li>• No lock period</li>
                    </ul>
                  </div>

                  <div
                    onClick={() => setMode("locked")}
                    className={`border rounded-xl p-4 cursor-pointer transition bg-[#1a1a1a]/70 hover:bg-[#1a1a1a] ${
                      mode === "locked"
                        ? "border-[#3b82f6]/30"
                        : "border-[#1f1f1f]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-3 h-3 text-[#3b82f6]" />
                      <div className="font-semibold text-[#e0e0e0]">
                        Locked Mode
                      </div>
                    </div>
                    <ul className="text-[11px] text-[#707070] leading-relaxed">
                      <li>• Higher APY</li>
                      <li>• Auto-compound</li>
                      <li>• No early exit</li>
                    </ul>
                  </div>
                </div>

                {/* CURRENCY SWITCH WITH PNG LOGOS */}
                <div className="flex gap-2">
                  {(["BNB", "USDT"] as const).map((c) => {
                    const active = currency === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`flex-1 rounded-lg border px-3 py-2.5 text-sm transition flex items-center gap-3 ${
                          active
                            ? "border-[#3b82f6]/30 bg-[#1a1a1a]/70"
                            : "border-[#1f1f1f]/30 bg-[#050816] hover:border-[#3b82f6]/30"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                          <img
                            src={tokenLogos[c]}
                            alt={c}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold text-[#e0e0e0]">
                            {c}
                          </div>
                          <div className="text-[10px] text-[#707070]">
                            {c === "BNB"
                              ? "Main network token"
                              : "Stablecoin balance"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* AMOUNT */}
                <div>
                  <label className="block text-[10px] text-[#707070] mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={project.minInvestment}
                    placeholder="0"
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full rounded-lg font-semibold border border-[#1f1f1f]/60 bg-[#9cc0ff]/10 text-[#e0e0e0] px-3 py-2 outline-none focus:border-[#3b82f6]/60 text-sm"
                  />
                  <div className="text-[10px] text-[#707070] mt-1">
                    Min: {project.minInvestment} BNB • Currency switch is for display only.
                  </div>
                </div>

                {/* PROFIT INDICATOR */}
                <div className="bg-[#1a1a1a]/70 border border-[#1f1f1f]/60 rounded-2xl p-4 relative overflow-hidden">
                  <div className="pointer-events-none absolute -inset-0.5 opacity-15 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_45%)]" />
                  <div className="relative z-10 text-xs space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#a0a0a0]">Profit Preview</span>
                      <span className="text-[10px] text-[#707070]">
                        Mode:{" "}
                        <span className="text-[#e0e0e0] font-medium">
                          {mode === "locked" ? "Locked" : "Liquid"}
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between text-[#707070]">
                      <span>Monthly profit</span>
                      <span className="text-[#22c55e]">
                        +{monthlyProfit} {currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#707070]">
                      <span>Yearly APY profit</span>
                      <span className="text-[#22c55e]">
                        +{yearlyProfit} {currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#707070] pt-1 border-t border-[#1f1f1f]">
                      <span>Total payout</span>
                      <span className="text-[#e0e0e0]">
                        {estimatedPayout} {currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AUTO REINVEST */}
                <label className="flex items-center gap-2 text-xs text-[#e0e0e0] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoReinvest}
                    onChange={() => setAutoReinvest((v) => !v)}
                    className="sr-only"
                  />

                  <div
                    className={`relative w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                      ${autoReinvest ? "border-[#3b82f6]" : "border-[#1f1f1f]"}`}
                  >
                    {autoReinvest && (
                      <div className="absolute w-2 h-2 rounded-full bg-[#3b82f6]" />
                    )}
                  </div>

                  <span>Auto-reinvest after lock period</span>
                </label>

                {/* CONFIRM BUTTON */}
                <button
                  onClick={() => onConfirm(amount, currency, autoReinvest)}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-xl text-sm font-medium transition-all"
                >
                  Confirm Investment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
