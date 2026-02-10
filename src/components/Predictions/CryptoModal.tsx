import React from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, TrendingUp, TrendingDown, BarChart3, Shield } from 'lucide-react';
import { TradingViewMiniChart } from '../TradingViewMiniChart';

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

interface CryptoModalProps {
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
  getRiskInfo: (pair: Pair) => { level: string; color: string; desc: string };
  miniStats: Record<number, { funding: number; volatility: number; deviation: number }>;
  extraStats: {
    spread: number;
    buyVolume: number;
    sellVolume: number;
    volatility1m: number;
    volatility5m: number;
    fundingRate: number;
    pressure: 'Bullish' | 'Bearish' | 'Neutral';
  };
}

const LIMITS = {
  USDT: { min: 5, max: 5000 },
  SOL: { min: 0.1, max: 50 },
};

export function CryptoModal({
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
  getRiskInfo,
  miniStats,
  extraStats,
}: CryptoModalProps) {
  const risk = getRiskInfo(pair);
  const ms = miniStats[pair.id];

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
              <div className="w-11 h-11 rounded-xl bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                <img
                  src={`/icons/${pair.logo}.png`}
                  alt={pair.pair}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h3 className="text-sm ui-bg-text font-semibold">{pair.pair}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full ui-card text-[#a0a0a0]">
                    Payout ×{pair.mult > 1.1 ? pair.mult.toFixed(2) : pair.mult.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#707070]">
                  <span>5m round</span>
                  <span className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                  <span>Crypto prediction</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: market snapshot */}
            <div className="space-y-2">
              <div className="ui-card relative rounded-2xl p-4 space-y-1 text-xs">
                <img src="/icons/shape-4-1.png" className="opacity-35 absolute -top-3 left-0" alt="" />
                <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#707070]">Current price</div>
                    <div className="text-[20px] font-bold ui-bg-text leading-tight">
                      {formatPriceSmart(pair.price)}
                    </div>
                    <div className="text-[11px] text-[#707070]">Entry locked when you confirm</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#707070]">24h change</div>
                    <div className={`text-[12px] font-semibold ${pair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                    </div>
                    <div className="mt-1 text-[11px] text-[#707070]">Vol {pair.vol}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-2 rounded-full mb-1 bg-[#020617] relative overflow-hidden">
                    {(() => {
                      const low = pair.low;
                      const high = pair.high === pair.low ? pair.low + 1 : pair.high;
                      const p = pair.price;
                      const pos = high === low ? 50 : Math.min(100, Math.max(0, ((p - low) / (high - low)) * 100));
                      return (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] shadow-[0_0_5px_#3b82f6] opacity-80" />
                          <div
                            className="absolute w-[8px] h-[8px] rounded-full border border-white/100 bg-[#eee]"
                            style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                          />
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#707070]">
                    <span>Low <span className="ui-bg-text">${formatPriceSmart(pair.low)}</span></span>
                    <span className="text-[#a0a0a0]">24h range</span>
                    <span>High <span className="ui-bg-text">${formatPriceSmart(pair.high)}</span></span>
                  </div>
                </div>

                <TradingViewMiniChart symbol={pair.symbol} height={80} interval="5" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#707070]">5m • BINANCE</span>
                </div>
              </div>

              {/* Extra stats */}
              <div className="ui-card rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
                  <span className="ui-bg-text font-semibold">Short-term stats</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-[#707070]">Volatility (1m)</div>
                    <div className="ui-bg-text font-semibold">{extraStats.volatility1m.toFixed(2)}%</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#707070]">Buy / Sell volume</div>
                    <div className="ui-bg-text font-semibold">
                      {extraStats.buyVolume.toFixed(1)}% / {extraStats.sellVolume.toFixed(1)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#707070]">Funding rate</div>
                    <div className="ui-bg-text font-semibold">{extraStats.fundingRate.toFixed(3)}%</div>
                  </div>

                  <div className="col-span-1">
                    <div className="text-[11px] text-[#707070]">Order flow pressure</div>
                    <div className="text-[11px]">
                      <span
                        className={
                          extraStats.pressure === 'Bullish'
                            ? 'text-green-400 font-semibold'
                            : extraStats.pressure === 'Bearish'
                            ? 'text-red-400 font-semibold'
                            : 'ui-bg-text font-semibold'
                        }
                      >
                        {extraStats.pressure}
                      </span>{' '}
                      • 5m volatility {extraStats.volatility5m.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: prediction form */}
            <div className="space-y-3">
              <div className="ui-card rounded-2xl p-4 text-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#050816] flex items-center justify-center border border-[#1f1f1f]">
                  <Shield className="w-5 h-5 text-[#22c1c3]" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#eee]/80">Risk profile</span>
                    <span className="text-[11px] font-semibold" style={{ color: risk.color }}>
                      {risk.level}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#22c1c3] via-[#3b82f6] to-[#a855f7]"
                      style={{
                        width: risk.level === 'Low' ? '35%' : risk.level === 'Medium' ? '70%' : '100%',
                      }}
                    />
                  </div>

                  <div className="text-[10px] text-[#707070]">
                    {risk.desc} {ms && <>• Vol {ms.volatility}% • Dev {ms.deviation}%</>}
                  </div>
                </div>
              </div>

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
                        active ? 'border-[#3b82f6] ui-card' : 'border-[#1f1f1f] bg-[#eee]/5'
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

              {/* Amount + quick buttons */}
              <div className="space-y-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`0.00 ${currency}`}
                    className="w-full pl-8 pr-3 font-semibold py-4 bg-[#eee]/5 rounded-xl ui-bg-text text-sm outline-none focus:border-[#3b82f6]/10"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[10, 25, 50, 100, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className="px-3 py-1.5 rounded-full bg-[#eee]/5 text-[#a0a0a0] hover:border-[#3b82f6]/70"
                    >
                      {v} {currency}
                    </button>
                  ))}
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div className="text-left text-[11px] text-[#707070]">
                    Possible payout:{' '}
                    <span className="text-[#646dbf] font-semibold">~ {possibleWin(pair.id, amount, currency)}</span>
                  </div>
                )}
              </div>

              {/* Direction buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onPlaceBet(pair.id, 'up')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-emerald-700 text-white hover:opacity-90'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> UP
                </button>

                <button
                  onClick={() => onPlaceBet(pair.id, 'down')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-[#631e1e] text-white hover:opacity-90'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" /> DOWN
                </button>
              </div>

              <div className="text-[11px] text-[#707070] text-center">
                You can cancel within <span className="text-[#3b82f6] font-semibold">20 seconds</span> after placing the
                prediction
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
