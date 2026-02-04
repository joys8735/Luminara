import React, { useState } from "react";
import { X, ArrowRight, DollarSign, Wallet } from "lucide-react";
import { usePlatformBalance } from "../context/PlatformBalanceContext";
import { motion, AnimatePresence } from "framer-motion";

export default function BalanceModal({ isOpen, onClose }) {
  const { balance, deposit, withdraw } = usePlatformBalance();
  const [amount, setAmount] = useState("");

  const handleDeposit = () => {
    const num = Number(amount);
    if (num <= 0) return;
    deposit(num);
    setAmount("");
  };

  const handleWithdraw = () => {
    const num = Number(amount);
    if (num <= 0) return;
    const ok = withdraw(num);
    if (!ok) alert("Not enough balance!");
    else setAmount("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6 relative"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <button
              className="absolute top-3 right-3 text-[#707070] hover:text-[#e0e0e0]"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-[#e0e0e0] mb-1">
              Platform Balance
            </h2>
            <p className="text-xs text-[#707070] mb-5">
              Use this balance for investments, staking and token purchases
            </p>

            {/* Balance Display */}
            <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-4 mb-5">
              <div className="text-xs text-[#707070]">Current Balance</div>
              <div className="text-xl font-bold text-[#3b82f6]">
                ${balance.toFixed(2)}
              </div>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label className="text-xs text-[#707070] block mb-1">Amount (USD)</label>
              <input
                type="number"
                className="w-full bg-[#0a0f1e] border border-[#1f1f1f] rounded-lg p-2 text-[#e0e0e0] text-sm"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-sm"
                onClick={handleDeposit}
              >
                Deposit
              </button>

              <button
                className="flex-1 py-2 bg-[#1f1f1f] hover:bg-[#222] text-[#e0e0e0] rounded-lg text-sm"
                onClick={handleWithdraw}
              >
                Withdraw
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
