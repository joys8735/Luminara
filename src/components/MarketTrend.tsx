import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
interface CryptoTrend {
  name: string;
  symbol: string;
  price: string;
  change: number;
}
export function MarketTrend() {
  const trends: CryptoTrend[] = [{
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '$8594',
    change: 2.54
  }, {
    name: 'BNB',
    symbol: 'BNB',
    price: '$57207',
    change: -2.304
  }, {
    name: 'Ethereum',
    symbol: 'ETH',
    price: '$71129',
    change: -1.32
  }, {
    name: 'Litecoin',
    symbol: 'LTC',
    price: '$18661',
    change: 2.14
  }, {
    name: 'Cardano',
    symbol: 'ADA',
    price: '$37166',
    change: 1.076
  }, {
    name: 'Pancake',
    symbol: 'CAKE',
    price: '$72650',
    change: -1.903
  }];
  return <div className="bg-[#2a2a4e] rounded-2xl p-6 border border-white/10">
      <h3 className="text-white text-lg font-semibold mb-4">Market Trend</h3>

      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-3 text-gray-500 text-xs font-medium pb-2 border-b border-white/10">
          <span>Name</span>
          <span className="text-right">Last Price</span>
          <span className="text-right">24h Change</span>
        </div>

        {/* Rows */}
        {trends.map(trend => <div key={trend.symbol} className="grid grid-cols-3 items-center py-2 hover:bg-white/5 rounded-lg px-2 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{trend.symbol}</span>
              <span className="text-gray-500 text-sm">{trend.name}</span>
            </div>
            <div className="text-white text-right">{trend.price}</div>
            <div className={`flex items-center justify-end gap-1 ${trend.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{Math.abs(trend.change)}</span>
            </div>
          </div>)}
      </div>
    </div>;
}