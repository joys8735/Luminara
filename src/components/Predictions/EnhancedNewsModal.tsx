import React from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, TrendingUp, TrendingDown, Newspaper, AlertCircle, BarChart2, ExternalLink, Calendar, Eye } from 'lucide-react';

interface EnhancedNewsModalProps {
  pair: any;
  amount: string;
  setAmount: (val: string) => void;
  currency: 'USDT' | 'SOL';
  setCurrency: (val: 'USDT' | 'SOL') => void;
  onClose: () => void;
  onPlaceBet: (pairId: number, dir: 'up' | 'down') => void;
  connected: boolean;
  possibleWin: (pairId: number, amount: string, currency: 'USDT' | 'SOL') => string;
}

const LIMITS = {
  USDT: { min: 5, max: 5000 },
  SOL: { min: 0.1, max: 50 },
};

export function EnhancedNewsModal({
  pair,
  amount,
  setAmount,
  currency,
  setCurrency,
  onClose,
  onPlaceBet,
  connected,
  possibleWin,
}: EnhancedNewsModalProps) {
  const sentimentColor = pair.change >= 2 ? 'text-green-400' : pair.change <= -2 ? 'text-red-400' : 'text-yellow-400';
  const sentimentLabel = pair.change >= 2 ? 'Bullish' : pair.change <= -2 ? 'Bearish' : 'Neutral';
  const sentimentBg = pair.change >= 2 ? 'bg-green-500/10' : pair.change <= -2 ? 'bg-red-500/10' : 'bg-yellow-500/10';

  // Mock дані - в реальності з API
  const newsDetails = {
    fullTitle: pair.name,
    description: pair.description || 'Major market event that could significantly impact cryptocurrency prices and overall market sentiment. Traders are closely monitoring this development.',
    source: pair.source || 'Reuters',
    publishedAt: pair.publishedAt || new Date().toISOString(),
    url: pair.url || '#',
    imageUrl: pair.imageUrl || null,
    relatedAssets: ['BTC', 'ETH', 'SOL'],
    historicalImpact: {
      similar: 5,
      avgChange: '+12.5%',
      timeframe: '24h',
    },
    aiAnalysis: {
      confidence: 78,
      factors: [
        { name: 'Market Sentiment', value: 85, positive: true },
        { name: 'Trading Volume', value: 72, positive: true },
        { name: 'Historical Pattern', value: 65, positive: false },
      ],
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#333]/70 backdrop-blur-sm overflow-y-auto flex items-center justify-center z-10 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative inset-2 lg:ml-36 ml-0 ui-inner rounded-2xl p-6 max-w-6xl w-full overflow-y-auto lg:overflow-hidden max-h-[90vh]"
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.96 }}
      >
        <div className="relative space-y-5">
          {/* 🔥 ENHANCED VERSION BADGE */}
          <div className="absolute top-0 right-0 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-bold animate-pulse z-50">
            ✨ ENHANCED VERSION
          </div>
          
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${sentimentBg} ${sentimentColor} border border-current/30`}>
                    {sentimentLabel}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    pair.impact === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                    pair.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    'bg-green-500/10 text-green-400 border border-green-500/30'
                  }`}>
                    {pair.impact?.toUpperCase() || 'MEDIUM'} Impact
                  </span>
                </div>
                <h3 className="text-sm ui-bg-text font-semibold mt-1 line-clamp-2">{newsDetails.fullTitle}</h3>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#707070]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(newsDetails.publishedAt).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>{newsDetails.source}</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: News Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* News Image */}
              {newsDetails.imageUrl && (
                <div className="ui-card rounded-2xl overflow-hidden">
                  <img 
                    src={newsDetails.imageUrl} 
                    alt="News" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* News Content */}
              <div className="ui-card rounded-2xl p-5 space-y-4">
                <div className="text-sm font-semibold ui-bg-text flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  News Summary
                </div>

                <p className="text-[12px] text-[#a0a0a0] leading-relaxed">
                  {newsDetails.description}
                </p>

                {newsDetails.url && newsDetails.url !== '#' && (
                  <a
                    href={newsDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read full article
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {/* Related Assets */}
                <div className="pt-3 border-t border-[#1f1f1f]">
                  <div className="text-[11px] text-[#707070] mb-2">Related Assets</div>
                  <div className="flex flex-wrap gap-2">
                    {newsDetails.relatedAssets.map((asset) => (
                      <span
                        key={asset}
                        className="px-3 py-1 rounded-full bg-[#eee]/5 text-[11px] ui-bg-text border border-[#1f1f1f]"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="ui-card rounded-2xl p-5 space-y-4">
                <div className="text-sm font-semibold ui-bg-text flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  AI Sentiment Analysis
                </div>

                {/* Confidence Score */}
                <div className="ui-inner rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#707070]">AI Confidence</span>
                    <span className="text-lg font-bold text-purple-400">{newsDetails.aiAnalysis.confidence}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${newsDetails.aiAnalysis.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Factors */}
                <div className="space-y-3">
                  <div className="text-[11px] text-[#707070]">Key Factors</div>
                  {newsDetails.aiAnalysis.factors.map((factor, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="ui-bg-text">{factor.name}</span>
                        <span className={factor.positive ? 'text-green-400' : 'text-red-400'}>
                          {factor.value}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
                        <div
                          className={`h-full ${factor.positive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
                          style={{ width: `${factor.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Impact */}
              <div className="ui-card rounded-2xl p-5 space-y-3">
                <div className="text-sm font-semibold ui-bg-text flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Historical Impact
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="ui-inner rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">{newsDetails.historicalImpact.similar}</div>
                    <div className="text-[10px] text-[#707070] mt-1">Similar Events</div>
                  </div>
                  <div className="ui-inner rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{newsDetails.historicalImpact.avgChange}</div>
                    <div className="text-[10px] text-[#707070] mt-1">Avg Change</div>
                  </div>
                  <div className="ui-inner rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">{newsDetails.historicalImpact.timeframe}</div>
                    <div className="text-[10px] text-[#707070] mt-1">Timeframe</div>
                  </div>
                </div>

                <div className="ui-inner rounded-lg p-3 text-[10px] text-[#a0a0a0]">
                  Based on {newsDetails.historicalImpact.similar} similar events in the past, the average market reaction 
                  was {newsDetails.historicalImpact.avgChange} within {newsDetails.historicalImpact.timeframe}.
                </div>
              </div>
            </div>

            {/* RIGHT: Prediction Form */}
            <div className="space-y-3">
              {/* Sentiment Score */}
              <div className="ui-card rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold ui-bg-text">Market Sentiment</div>

                <div className="ui-inner rounded-lg p-4 text-center">
                  <div className={`text-4xl font-bold ${sentimentColor}`}>
                    {pair.price.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1">Sentiment Score</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#707070]">Positive</span>
                    <span className="text-green-400 font-semibold">
                      {pair.change >= 0 ? (60 + pair.change * 2).toFixed(0) : (40 + pair.change).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                      style={{ width: `${pair.change >= 0 ? 60 + pair.change * 2 : 40 + pair.change}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#707070]">Negative</span>
                    <span className="text-red-400 font-semibold">
                      {pair.change >= 0 ? (40 - pair.change * 2).toFixed(0) : (60 - pair.change).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-400"
                      style={{ width: `${pair.change >= 0 ? 40 - pair.change * 2 : 60 - pair.change}%` }}
                    />
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
                        active ? 'border-blue-500/50 ui-card' : 'border-[#1f1f1f] bg-[#eee]/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={`/icons/${icon}.png`} className="w-6 h-6 object-contain" alt={cur} />
                      </div>
                      <div>
                        <div className="ui-bg-text font-semibold text-xs">{cur}</div>
                        <div className="text-[10px] text-[#707070]">
                          Min {lim.min} • Max {lim.max}
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
                    className="w-full pl-8 pr-3 font-semibold py-4 bg-[#eee]/5 rounded-xl ui-bg-text text-sm outline-none focus:border-blue-500/30"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[10, 25, 50, 100, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className="px-3 py-1.5 rounded-full bg-[#eee]/5 text-[#a0a0a0] hover:border-blue-500/50"
                    >
                      {v} {currency}
                    </button>
                  ))}
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div className="text-left text-[11px] text-[#707070]">
                    Potential return:{' '}
                    <span className="text-blue-400 font-semibold">~ {possibleWin(pair.id, amount, currency)}</span>
                  </div>
                )}
              </div>

              {/* Sentiment buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onPlaceBet(pair.id, 'up')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>BULLISH</span>
                  <span className="text-[10px] opacity-70">Positive Impact</span>
                </button>

                <button
                  onClick={() => onPlaceBet(pair.id, 'down')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90'
                  }`}
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>BEARISH</span>
                  <span className="text-[10px] opacity-70">Negative Impact</span>
                </button>
              </div>

              {/* Info */}
              <div className="ui-inner rounded-lg p-3 text-[10px] text-[#a0a0a0]">
                <div className="font-semibold text-[#eee] mb-1">How it works</div>
                <ul className="space-y-1">
                  <li>• BULLISH: Market will react positively</li>
                  <li>• BEARISH: Market will react negatively</li>
                  <li>• Settled based on market movement</li>
                  <li>• AI analysis helps predict outcome</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
