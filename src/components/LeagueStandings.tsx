import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Trophy, Medal } from 'lucide-react';
import { wsService, LeaderboardEntry } from '../services/WebSocketService';

interface LeagueStandingsProps {
  title?: string;
  category?: 'crypto' | 'sports' | 'news';
}

export function LeagueStandings({ title = 'Live Standings', category = 'crypto' }: LeagueStandingsProps) {
  const [standings, setStandings] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'SatoshiKid', points: 5420, wins: 48, winRate: 68, trend: 'up' },
    { rank: 2, name: 'Luna', points: 5120, wins: 45, winRate: 64, trend: 'up' },
    { rank: 3, name: 'BlockMaster', points: 4890, wins: 42, winRate: 61, trend: 'stable' },
    { rank: 4, name: 'CryptoNinja', points: 4650, wins: 40, winRate: 58, trend: 'down' },
    { rank: 5, name: 'AlphaTrader', points: 4420, wins: 38, winRate: 55, trend: 'up' },
    { rank: 6, name: 'MoonWalk', points: 4100, wins: 35, winRate: 52, trend: 'stable' },
    { rank: 7, name: 'Diamond', points: 3890, wins: 33, winRate: 49, trend: 'down' },
    { rank: 8, name: 'Raven', points: 3650, wins: 31, winRate: 46, trend: 'stable' },
    { rank: 9, name: 'ZenAlgo', points: 3420, wins: 29, winRate: 43, trend: 'up' },
    { rank: 10, name: 'You', points: 2850, wins: 24, winRate: 38, trend: 'up' },
  ]);

  useEffect(() => {
    const unsubscribe = wsService.onLeaderboardUpdate((data) => {
      setStandings(data);
    });

    wsService.startLeaderboardSimulation();

    return () => {
      unsubscribe();
      wsService.disconnect();
    };
  }, []);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4 text-[#a0a0a0]">—</div>;
  };

  const maxPoints = Math.max(...standings.map(s => s.points));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-[#e0e0e0] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#facc15]" />
            {title}
          </h2>
          <p className="text-[11px] text-[#707070] mt-0.5">
            {category === 'crypto' && 'Top players in crypto predictions'}
            {category === 'sports' && 'Top players in sports predictions'}
            {category === 'news' && 'Top players in market sentiment'}
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#3b82f6]/10 to-[#a855f7]/10 border-b border-[#1f1f1f] px-4 py-2">
          <div className="grid grid-cols-12 gap-3 text-[11px] font-semibold text-[#a0a0a0]">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-right">Points</div>
            <div className="col-span-2 text-right">Wins</div>
            <div className="col-span-2 text-right">W/L %</div>
            <div className="col-span-1 text-center">Trend</div>
          </div>
        </div>

        <div className="divide-y divide-[#1f1f1f]">
          {standings.map((player, idx) => {
            const isYou = player.name === 'You';
            const progress = (player.points / maxPoints) * 100;
            
            return (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative px-6 py-4 transition-all hover:bg-[#1a1a1a] ${
                  isYou ? 'bg-[#3b82f6]/10 border-l-4 border-[#3b82f6]' : ''
                }`}
              >
                {/* Background progress bar */}
                <div
                  className="absolute inset-y-0 left-0 opacity-5 bg-gradient-to-r from-[#3b82f6] to-[#a855f7]"
                  style={{ width: `${progress}%` }}
                />

                <div className="relative grid grid-cols-12 gap-4 items-center text-xs">
                  {/* Rank */}
                  <div className="col-span-1 font-bold">
                    <span className="text-lg">{getRankMedal(player.rank)}</span>
                  </div>

                  {/* Player Name */}
                  <div className="col-span-4">
                    <div className={`font-semibold ${isYou ? 'text-[#3b82f6]' : 'text-[#e0e0e0]'}`}>
                      {player.name}
                      {isYou && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#3b82f6]/30 text-[#3b82f6] text-[10px]">You</span>}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="col-span-2 text-right">
                    <div className="font-bold text-[#22c1c3]">{player.points.toLocaleString()}</div>
                    <div className="text-[10px] text-[#707070]">pts</div>
                  </div>

                  {/* Wins */}
                  <div className="col-span-2 text-right">
                    <div className="font-bold text-[#e0e0e0]">{player.wins}</div>
                    <div className="text-[10px] text-[#707070]">wins</div>
                  </div>

                  {/* Win Rate */}
                  <div className="col-span-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-[#050816] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7]"
                          initial={{ width: 0 }}
                          animate={{ width: `${player.winRate}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className="font-bold text-[#e0e0e0] ml-1">{player.winRate}%</span>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="col-span-1 text-center">
                    {getTrendIcon(player.trend)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Player */}
        <div className="bg-gradient-to-br from-[#facc15]/10 to-[#f59e0b]/10 border border-[#facc15]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Medal className="w-5 h-5 text-[#facc15]" />
            <h3 className="text-sm font-semibold text-[#e0e0e0]">Leader</h3>
          </div>
          <div className="text-2xl font-bold text-[#facc15]">{standings[0].name}</div>
          <div className="text-xs text-[#a0a0a0] mt-1">{standings[0].points.toLocaleString()} pts</div>
          <div className="mt-2 pt-2 border-t border-[#facc15]/20">
            <div className="text-[10px] text-[#a0a0a0]">Win Rate: <span className="text-[#facc15] font-bold">{standings[0].winRate}%</span></div>
          </div>
        </div>

        {/* Your Position */}
        <div className="bg-gradient-to-br from-[#3b82f6]/10 to-[#22c1c3]/10 border border-[#3b82f6]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-[#e0e0e0]">Your Rank</h3>
          </div>
          <div className="text-2xl font-bold text-[#3b82f6]">#10</div>
          <div className="text-xs text-[#a0a0a0] mt-1">2,850 pts</div>
          <div className="mt-2 pt-2 border-t border-[#3b82f6]/20">
            <div className="text-[10px] text-[#a0a0a0]">Next: <span className="text-[#3b82f6] font-bold">+570 pts</span></div>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="bg-gradient-to-br from-[#a855f7]/10 to-[#ec4899]/10 border border-[#a855f7]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-[#a855f7]" />
            <h3 className="text-sm font-semibold text-[#e0e0e0]">Weekly Reward</h3>
          </div>
          <div className="text-2xl font-bold text-[#a855f7]">500 SVT</div>
          <div className="text-xs text-[#a0a0a0] mt-1">For Top 10 Players</div>
          <div className="mt-2 pt-2 border-t border-[#a855f7]/20">
            <div className="text-[10px] text-[#a0a0a0]">Resets: <span className="text-[#a855f7] font-bold">3d 4h</span></div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#e0e0e0] mb-4">Points Distribution</h3>
        <div className="space-y-3">
          {standings.slice(0, 5).map((player) => {
            const progress = (player.points / maxPoints) * 100;
            return (
              <div key={player.rank} className="flex items-center gap-3">
                <div className="w-20 text-xs font-semibold text-[#a0a0a0]">#{player.rank}</div>
                <div className="flex-1">
                  <div className="h-2 bg-[#050816] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
                <div className="text-xs text-[#707070]">{player.points}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeagueStandings;
