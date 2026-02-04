import React from 'react';
import { TrendingUp } from 'lucide-react';
export function MarketOverview() {
  // Mock chart data
  const chartData = [{
    x: 0,
    btc: 20,
    eth: 30,
    ltc: 15
  }, {
    x: 10,
    btc: 25,
    eth: 35,
    ltc: 20
  }, {
    x: 20,
    btc: 22,
    eth: 32,
    ltc: 18
  }, {
    x: 30,
    btc: 28,
    eth: 38,
    ltc: 25
  }, {
    x: 40,
    btc: 35,
    eth: 45,
    ltc: 30
  }, {
    x: 50,
    btc: 32,
    eth: 42,
    ltc: 28
  }, {
    x: 60,
    btc: 38,
    eth: 48,
    ltc: 35
  }, {
    x: 70,
    btc: 45,
    eth: 40,
    ltc: 32
  }, {
    x: 80,
    btc: 42,
    eth: 35,
    ltc: 28
  }, {
    x: 90,
    btc: 48,
    eth: 42,
    ltc: 35
  }, {
    x: 100,
    btc: 50,
    eth: 45,
    ltc: 38
  }];
  const generatePath = (data: typeof chartData, key: 'btc' | 'eth' | 'ltc') => {
    return data.map((point, index) => {
      const x = point.x / 100 * 100;
      const y = 50 - point[key];
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  return <div className="bg-[#2a2a4e] rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold">Market Overview</h3>
        <select className="bg-[#1a1625] text-white text-sm px-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500">
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Daily</option>
        </select>
      </div>

      <div className="relative h-64">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}

          {/* Chart lines */}
          <path d={generatePath(chartData, 'btc')} fill="none" stroke="#f59e0b" strokeWidth="2" className="drop-shadow-lg" />
          <path d={generatePath(chartData, 'eth')} fill="none" stroke="#3b82f6" strokeWidth="2" className="drop-shadow-lg" />
          <path d={generatePath(chartData, 'ltc')} fill="none" stroke="#8b5cf6" strokeWidth="2" className="drop-shadow-lg" />

          {/* Animated dot on last point */}
          <circle cx="100%" cy="12%" r="4" fill="#8b5cf6" className="animate-pulse" />
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>50k</span>
          <span>40k</span>
          <span>30k</span>
          <span>20k</span>
          <span>10k</span>
          <span>0k</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-400 text-sm">BTC</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400 text-sm">ETH</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-400 text-sm">LTC</span>
        </div>
      </div>
    </div>;
}