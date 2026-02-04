import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
interface CryptoCardProps {
  symbol: string;
  name: string;
  price: string;
  change: number;
  icon: string;
  chartData?: number[];
}
export function CryptoCard({
  symbol,
  name,
  price,
  change,
  icon,
  chartData = []
}: CryptoCardProps) {
  const isPositive = change >= 0;
  // Simple line chart path generator
  const generatePath = (data: number[]) => {
    if (data.length === 0) return '';
    const width = 100;
    const height = 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data.map((value, index) => {
      const x = index / (data.length - 1) * width;
      const y = height - (value - min) / range * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  return <div className="bg-[#2a2a4e] rounded-2xl p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${icon} flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">
              {symbol.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{symbol}</div>
            <div className="text-gray-400 text-xs">{name}</div>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>

      <div className="text-white text-xl font-bold mb-3">{price}</div>

      {/* Mini chart */}
      <div className="h-10 relative">
        <svg width="100%" height="40" className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={generatePath(chartData)} fill="none" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth="2" className="drop-shadow-lg" />
          <path d={`${generatePath(chartData)} L 100 40 L 0 40 Z`} fill={`url(#gradient-${symbol})`} />
        </svg>
      </div>
    </div>;
}