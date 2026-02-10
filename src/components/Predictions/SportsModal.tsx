import React from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, TrendingUp, TrendingDown, Trophy, Users, Target } from 'lucide-react';

interface Pair {
  id: number;
  symbol: string;
  pair: string;
  price: number;
  change: number;
  high: number;
  low: number;
  open: number;
  vol: string;
  logo: string;
  mult: number;
}

interface SportsModalProps {
  pair: Pair;
  amount: string;
  setAmount: (val: string) => void;
  currency: 'USDT' | 'SOL';
  setCurrency: (val: 'USDT' | 'SOL') => void;
  onClose: () => void;
  onPlaceBet: (pairId: number, dir: 'up' | 'down') => void;
  connected: boolean;
  formatPriceSmart: (price: number) => string;
  possibleWin: (pairId: number, amount: string, currency: 'USDT' | 'SOL') => string;
}

const LIMITS = {
  USDT: { min: 5, max: 5000 },
  SOL: { min: 0.1, max: 50 },
};

export function SportsModal({
  pair,
  amount,
  setAmount,
  currency,
  setCurrency,
  onClose,
  onPlaceBet,
  connected,
  formatPriceSmart,
  possibleWin,
}: SportsModalProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-[#333]/70 backdrop-blur-sm overflow-y-auto flex items-center justify-center z-10 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative inset-2 lg:ml-36 ml-0 ui-inner rounded-2xl p-6 max-w-4xl w-full overflow-y-auto lg:overflow-hidden"
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.96 }}
      >
        <div className="relative space-y-5">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h3 className="text-sm ui-bg-text font-semibold">{pair.pair}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    Odds ×{pair.mult > 1.1 ? pair.mult.toFixed(2) : pair.mult.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#707070]">
                  <span>Sports prediction</span>
                  <span className="w-1 h-1 rounded-full bg-orange-500" />
                  <span>Event-based outcome</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Event info */}
            <div className="space-y-3">
              <div className="ui-card relative rounded-2xl p-5 space-y-4">
                <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-10 bg-[radial-gradient(circle_at_top,_#f97316_0,_transparent_65%)]" />
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#707070]">Event</div>
                    <div className="text-[16px] font-bold ui-bg-text">{pair.pair}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="ui-inner rounded-lg p-3">
                    <div className="text-[10px] text-[#707070] mb-1">Current odds</div>
                    <div className="text-lg font-bold text-orange-400">{pair.price.toFixed(2)}</div>
                  </div>
                  <div className="ui-inner rounded-lg p-3">
                    <div className="text-[10px] text-[#707070] mb-1">Trend</div>
                    <div className={`text-lg font-bold ${pair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Users className="w-4 h-4 text-[#3b82f6]" />
                    <span className="text-[#707070]">Total bets:</span>
                    <span className="ui-bg-text font-semibold">{pair.vol}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Target className="w-4 h-4 text-[#22c1c3]" />
                    <span className="text-[#707070]">Payout multiplier:</span>
                    <span className="text-orange-400 font-semibold">×{pair.mult.toFixed(2)}</span>
                  </div>
                </div>

                <div className="ui-inner rounded-lg p-3 text-[11px] text-[#a0a0a0]">
                  <div className="font-semibold text-[#eee] mb-1">About this event</div>
                  Predict the outcome of {pair.pair}. Your prediction will be settled based on the official event result. 
                  Higher odds mean higher potential returns but also indicate less certainty.
                </div>
              </div>

              {/* Stats card */}
              <div className="ui-card rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold ui-bg-text">Market sentiment</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#707070]">Bullish bets</span>
                    <span className="text-green-400 font-semibold">65%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '65%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#707070]">Bearish bets</span>
                    <span className="text-red-400 font-semibold">35%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-rose-400" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Betting form */}
            <div className="space-y-3">
              {/* Currency selector */}
              <div className="grid grid-cols-2 gap-3">
                {(['USDT', 'SOL'] as const).map((cur) => {
                  const active = currency === cur;
                  const lim = LIMITS[cur];
                  const icon = cur === 'USDT' ? 'usdt' : 'sol';

                  return (
                    <button
                      key={cur}
                      onClick={() => setCurrency(cur)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                        active ? 'border-orange-500/50 ui-card' : 'border-[#1f1f1f] bg-[#eee]/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={`/icons/${icon}.png`} className="w-6 h-6 object-contain" alt={cur} />
                      </div>
                      <div>
                        <div className="ui-bg-text font-semibold text-xs">{cur}</div>
                        <div className="text-[10px] text-[#707070]">
                          Min {lim.min} • Max {lim.max} {cur}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Amount input */}
              <div className="space-y-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`0.00 ${currency}`}
                    className="w-full pl-8 pr-3 font-semibold py-4 bg-[#eee]/5 rounded-xl ui-bg-text text-sm outline-none focus:border-orange-500/30"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[10, 25, 50, 100, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className="px-3 py-1.5 rounded-full bg-[#eee]/5 text-[#a0a0a0] hover:border-orange-500/50"
                    >
                      {v} {currency}
                    </button>
                  ))}
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div className="text-left text-[11px] text-[#707070]">
                    Potential win:{' '}
                    <span className="text-orange-400 font-semibold">~ {possibleWin(pair.id, amount, currency)}</span>
                  </div>
                )}
              </div>

              {/* Outcome buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onPlaceBet(pair.id, 'up')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> WIN
                </button>

                <button
                  onClick={() => onPlaceBet(pair.id, 'down')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" /> LOSE
                </button>
              </div>

              <div className="ui-inner rounded-lg p-3 text-[11px] text-[#a0a0a0]">
                <div className="font-semibold text-[#eee] mb-1">How it works</div>
                <ul className="space-y-1">
                  <li>• Choose WIN if you think the event will have a positive outcome</li>
                  <li>• Choose LOSE if you predict a negative outcome</li>
                  <li>• Predictions are settled based on official event results</li>
                  <li>• Higher odds = higher potential returns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
