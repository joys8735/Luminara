// components/Leaderboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Crown, Flame, Target } from 'lucide-react';

interface LeaderboardPlayer {
  id: string;
  username: string;
  avatar: string;
  score: number;
  change: number; // +1 позиція вгору, -1 вниз, 0 без змін
  streak: number;
  accuracy: number;
  isCurrentUser?: boolean;
}

export function LiveLeaderboard() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([
    { id: '1', username: '@CryptoOracle', avatar: '🐲', score: 2450, change: 1, streak: 7, accuracy: 78.5 },
    { id: '2', username: '@BitcoinWhale', avatar: '🐋', score: 1980, change: -1, streak: 3, accuracy: 72.3 },
    { id: '3', username: '@MoonHunter', avatar: '🚀', score: 1850, change: 2, streak: 5, accuracy: 69.8 },
    { id: '4', username: '@TA_Master', avatar: '📊', score: 1670, change: 0, streak: 2, accuracy: 65.4 },
    { id: '5', username: 'You', avatar: '👤', score: 1520, change: 1, streak: 4, accuracy: 71.2, isCurrentUser: true },
    { id: '6', username: '@AltcoinQueen', avatar: '👑', score: 1340, change: -2, streak: 1, accuracy: 68.9 },
    { id: '7', username: '@DeFiGuru', avatar: '🦉', avatar: '🎓', score: 1210, change: 1, streak: 6, accuracy: 74.1 },
    { id: '8', username: '@NightTrader', avatar: '🌙', score: 980, change: 0, streak: 2, accuracy: 63.5 },
  ]);

  const [highlightedPlayer, setHighlightedPlayer] = useState<string | null>(null);

  // Імітація реального оновлення лідерборду
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => {
        const newPlayers = [...prev];
        
        // Рандомно змінюємо позиції
        newPlayers.forEach((player, index) => {
          if (Math.random() > 0.7 && !player.isCurrentUser) {
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
            if (change !== 0) {
              const newIndex = Math.max(0, Math.min(newPlayers.length - 1, index + change));
              
              // Анімація зміни позиції
              if (change > 0) {
                setHighlightedPlayer(player.id);
                setTimeout(() => setHighlightedPlayer(null), 1000);
              }
              
              // Міняємо позиції
              [newPlayers[index], newPlayers[newIndex]] = [newPlayers[newIndex], newPlayers[index]];
              newPlayers[newIndex].change = change;
              newPlayers[index].change = -change;
            }
          }
        });

        return newPlayers.sort((a, b) => b.score - a.score);
      });
    }, 5000); // Оновлення кожні 5 секунд

    return () => clearInterval(interval);
  }, []);

  const getPositionColor = (position: number) => {
    switch(position) {
      case 1: return 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]';
      case 2: return 'bg-gradient-to-r from-[#C0C0C0] to-[#A0A0A0]';
      case 3: return 'bg-gradient-to-r from-[#CD7F32] to-[#A0522D]';
      default: return 'bg-gradient-to-r from-[#1e293b] to-[#111827]';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <div className="w-3 h-3" />;
  };

  return (
    <div className="ui-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#facc15] to-[#f97316] flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live Leaderboard</h3>
            <p className="text-[11px] text-[#707070]">Updates every 5 seconds</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {players.slice(0, 3).map((p) => (
              <div key={p.id} className="w-6 h-6 rounded-full border-2 border-[#111827] bg-gradient-to-br from-[#3b82f6] to-[#a855f7] flex items-center justify-center text-xs">
                {p.avatar}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-[#707070]">{players.length} players</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: highlightedPlayer === player.id ? 1.02 : 1,
                backgroundColor: highlightedPlayer === player.id ? '#1e40af20' : 'transparent'
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
              className={`relative flex items-center justify-between p-3 rounded-xl border ${
                player.isCurrentUser 
                  ? 'border-[#3b82f6] bg-gradient-to-r from-[#3b82f6]/10 to-transparent' 
                  : 'border-[#1f1f1f]'
              } ${getPositionColor(index + 1)}`}
            >
              {/* Хайлайт анімація */}
              {highlightedPlayer === player.id && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3b82f6]/20 to-transparent animate-pulse" />
              )}

              {/* Ліва частина: позиція + аватар + ім'я */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 ? 'text-black' : 'text-white'
                  }`}>
                    {index + 1}
                  </div>
                  {index === 0 && (
                    <Crown className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#a855f7] flex items-center justify-center text-lg">
                    {player.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${player.isCurrentUser ? 'text-[#3b82f6]' : 'text-white'}`}>
                        {player.username}
                      </span>
                      {player.streak >= 3 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#ef4444] to-[#f97316]">
                          <Flame className="w-3 h-3 text-white" />
                          <span className="text-[10px] text-white font-bold">{player.streak}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      Accuracy: <span className="text-[#22c1c3] font-semibold">{player.accuracy}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Права частина: бал + зміна */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {player.score.toLocaleString()} AP
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {getChangeIcon(player.change)}
                    <span className={`text-[10px] ${player.change > 0 ? 'text-green-400' : player.change < 0 ? 'text-red-400' : 'text-[#707070]'}`}>
                      {player.change > 0 ? `+${player.change}` : player.change}
                    </span>
                  </div>
                </div>
                
                {/* Індикатор зміни позиції */}
                {player.change !== 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      player.change > 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {player.change > 0 ? '↑' : '↓'}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Живі сповіщення */}
      <LiveNotifications />
    </div>
  );
}

// Живі сповіщення про події
function LiveNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, message: '@CryptoOracle just won 450 AP!', time: '2 min ago' },
    { id: 2, message: 'New player @BitcoinPioneer joined!', time: '5 min ago' },
    { id: 3, message: 'Daily prize pool increased to 2,500 AP!', time: '10 min ago' },
  ]);

  useEffect(() => {
    const messages = [
      'just made a perfect prediction!',
      'is on a 5-day winning streak!',
      'just moved to top 3!',
      'won the daily jackpot!',
      'accuracy reached 85%!',
    ];
    
    const users = ['@MoonHunter', '@TA_Master', '@DeFiGuru', '@AltcoinQueen', '@NightTrader'];
    
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const newNotification = {
          id: Date.now(),
          message: `${users[Math.floor(Math.random() * users.length)]} ${messages[Math.floor(Math.random() * messages.length)]}`,
          time: 'just now',
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
        
        // Автоматично видаляємо старі сповіщення
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 10000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 space-y-1">
      <div className="text-[10px] text-[#707070] mb-1">Live activity:</div>
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[#111827] to-[#1e293b] border border-[#1f1f1f]"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-white">{notif.message}</span>
            </div>
            <span className="text-[10px] text-[#707070]">{notif.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}