// components/HallOfFame.tsx
'use client';

import React, { useState } from 'react';
import { Crown, Trophy, Award, Star, TrendingUp, Target, Users } from 'lucide-react';

const HALL_OF_FAME = [
  {
    category: 'All-Time Top',
    players: [
      { name: '@CryptoGod', score: 125430, streak: 42, accuracy: 84.5, avatar: '👑', url: 'https://pics.craiyon.com/2023-08-02/eae102a637ec410e9fa38d20b66e8ff8.webp' },
      { name: '@BitcoinOracle', score: 98760, streak: 31, accuracy: 81.2, avatar: '🔮', url: 'https://nftevening.com/wp-content/uploads/2022/05/Lil-Baby-DeadFellaz-3439.png' },
      { name: '@PredictionKing', score: 84520, streak: 28, accuracy: 79.8, avatar: '👑', url: 'https://airnfts.s3.amazonaws.com/profile-images/20211123/0x0184461978d64EdDc068e83e0bA67Ce1c84E0410_1637629464443.gif' },
    ],
    icon: <Crown className="w-4 h-4" />,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    category: 'Best Accuracy',
    players: [
      { name: '@PrecisionPro', score: 65430, streak: 19, accuracy: 92.3, avatar: '🎯' },
      { name: '@SharpShooter', score: 54320, streak: 15, accuracy: 89.7, avatar: '🏹' },
      { name: '@PerfectEye', score: 43210, streak: 12, accuracy: 87.4, avatar: '👁️' },
    ],
    icon: <Target className="w-4 h-4" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    category: 'Longest Streak',
    players: [
      { name: '@Unstoppable', score: 76540, streak: 56, accuracy: 76.8, avatar: '🔥' },
      { name: '@Consistent', score: 65430, streak: 42, accuracy: 74.5, avatar: '📈' },
      { name: '@DailyGrind', score: 54320, streak: 38, accuracy: 72.1, avatar: '⚡' },
    ],
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'from-red-500 to-pink-500',
  },
];

export function HallOfFame() {
  const [selectedCategory, setSelectedCategory] = useState(HALL_OF_FAME[0]);

  return (
    <div className="relative rounded-2xl w-[720px] p-4 w-full overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#facc15] to-[#f97316] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Hall of Fame</h3>
              <p className="text-[11px] text-[#707070]">Legendary players archive</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {HALL_OF_FAME.map(category => (
            <button
              key={category.category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                selectedCategory.category === category.category
                  ? `bg-gradient-to-r ${category.color} text-white`
                  : 'ui-inner text-[#a0a0a0] hover:text-white'
              }`}
            >
              {React.cloneElement(category.icon, { className: 'w-3 h-3' })}
              <span className="text-[10px]">{category.category}</span>
            </button>
          ))}
        </div>

        {/* Grid: Users left, Stats right */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr,1fr] gap-4">
          {/* Users */}
          <div className="space-y-2">
            {selectedCategory.players.map((player, index) => (
              <div 
                key={player.name}
                className={`p-2 rounded-xl border ${
                  index === 0 
                    ? 'border-yellow-500/60 bg-gradient-to-r from-yellow-500/10 to-transparent' 
                    : index === 1 ? 'border-[#eee]/60 bg-gradient-to-br from-[#eee]/10 to-transparent'
                    : 'border-[#1f1f1f] bg-gradient-to-br from-[#111827] to-[#1e293b]'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left side */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl`}>
                        {player.url ? <img src={player.url} alt={player.name} className="w-8 h-8 rounded-full" /> : player.avatar}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[11px] flex items-center font-semibold text-white">
                        {player.name}
                        {index === 0 && <Crown className="ml-1 w-3 h-3 text-yellow-400" />}
                        {index === 1 && <Award className="ml-1 w-3 h-3 text-gray-400" />}
                        {index === 2 && <Star className="ml-1 w-3 h-3 text-amber-700" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#707070]">
                        <span>Streak: <span className="text-white">{player.streak} days</span></span>
                        <span>Accuracy: <span className="text-[#22c1c3]">{player.accuracy}%</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="text-right">
                    <div className="text-md font-bold text-white">
                      {player.score.toLocaleString()} AP
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      #{index + 1} in {selectedCategory.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
                <div className="text-[10px] text-[#707070]">Total Champions</div>
                <div className="text-sm font-bold text-white">42</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
                <div className="text-[10px] text-[#707070]">Avg Score</div>
                <div className="text-sm font-bold text-white">64,820 AP</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
                <div className="text-[10px] text-[#707070]">Your Rank</div>
                <div className="text-sm font-bold text-[#3b82f6]">#87</div>
              </div>
            </div>

            {/* Qualify for Hall of Fame */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#3b82f6]/10 to-transparent border border-[#3b82f6]/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#3b82f6]" />
                  <span className="text-[11px] text-white">Qualify for Hall of Fame</span>
                </div>
                <span className="text-[10px] text-[#3b82f6] font-semibold">50,000 AP needed</span>
              </div>
              <div className="text-[10px] text-[#a0a0a0] mb-2">
                Reach top 100 all-time to get immortalized
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#111827] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7]" style={{ width: '30%' }} />
                </div>
                <span className="text-[10px] text-white">15,240/50,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}