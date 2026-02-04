// components/MarketSentiment.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';

export function MarketSentiment() {
  const [sentiment, setSentiment] = useState({
    bullish: 78,
    bearish: 22,
    avgPrediction: 65234,
    totalPredictions: 1234,
    confidence: 85,
  });

  const [sentimentHistory, setSentimentHistory] = useState<number[]>([
    65, 68, 72, 70, 75, 78, 76, 78
  ]);

  // Оновлення настроїв в реальному часі
  useEffect(() => {
    const interval = setInterval(() => {
      setSentiment(prev => ({
        ...prev,
        bullish: Math.min(95, Math.max(5, prev.bullish + (Math.random() > 0.5 ? 1 : -1))),
        bearish: 100 - prev.bullish,
        totalPredictions: prev.totalPredictions + Math.floor(Math.random() * 10),
        confidence: Math.min(95, Math.max(60, prev.confidence + (Math.random() > 0.5 ? 1 : -1))),
      }));

      // Оновлюємо історію
      setSentimentHistory(prev => {
        const newHistory = [...prev, sentiment.bullish];
        return newHistory.slice(-8); // Зберігаємо останні 8 значень
      });
    }, 10000); // Оновлення кожні 10 секунд

    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (value: number) => {
    if (value >= 70) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentIcon = () => {
    if (sentiment.bullish >= 70) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (sentiment.bullish >= 50) return <BarChart3 className="w-4 h-4 text-yellow-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="ui-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c1c3] to-[#3b82f6] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Market Sentiment</h3>
            <p className="text-[11px] text-[#707070]">Community predictions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getSentimentIcon()}
          <span className={`text-sm font-bold ${getSentimentColor(sentiment.bullish)}`}>
            {sentiment.bullish}% Bullish
          </span>
        </div>
      </div>

      {/* Графік настроїв */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] text-[#707070] mb-1">
          <span>Sentiment trend (last 8 updates):</span>
          <span>Confidence: {sentiment.confidence}%</span>
        </div>
        <div className="h-16 flex items-end gap-1">
          {sentimentHistory.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t-lg ${
                  value >= 70 ? 'bg-green-500' : 
                  value >= 50 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ height: `${value}%` }}
              />
              <div className="text-[8px] text-[#707070] mt-1">
                {index === sentimentHistory.length - 1 ? 'Now' : `-${sentimentHistory.length - 1 - index}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Детальна статистика */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e293b] border border-[#1f1f1f]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#707070]">Average prediction</span>
            <Target className="w-3 h-3 text-[#3b82f6]" />
          </div>
          <div className="text-lg font-bold text-white">
            ${sentiment.avgPrediction.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#707070]">
            Based on {sentiment.totalPredictions.toLocaleString()} predictions
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e293b] border border-[#1f1f1f]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#707070]">Distribution</span>
            <BarChart3 className="w-3 h-3 text-[#22c1c3]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-green-400">Bullish</span>
              <span className="text-white">{sentiment.bullish}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                style={{ width: `${sentiment.bullish}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-red-400">Bearish</span>
              <span className="text-white">{sentiment.bearish}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                style={{ width: `${sentiment.bearish}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* "Wisdom of Crowds" bonus */}
      <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-[#facc15]/10 to-transparent border border-[#facc15]/20">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#facc15]">Wisdom of Crowds Bonus Active</span>
          <span className="text-white font-semibold">+15% AP</span>
        </div>
        <div className="text-[9px] text-[#a0a0a0] mt-1">
          If majority is correct, all players receive bonus
        </div>
      </div>
    </div>
  );
}