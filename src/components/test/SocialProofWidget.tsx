// components/SocialProofWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Users, Award, Target, Zap, TrendingUp } from 'lucide-react';

export function SocialProofWidget() {
  const [stats, setStats] = useState({
    online: 234,
    predictionsToday: 1234,
    biggestWin: 1250,
    averageWin: 320,
    winnersToday: 87,
  });

  const [recentWins, setRecentWins] = useState([
    { user: '@CryptoQueen', amount: 450, time: '2 min ago' },
    { user: '@BitcoinWizard', amount: 380, time: '5 min ago' },
    { user: '@AltcoinAlchemist', amount: 520, time: '8 min ago' },
    { user: '@TA_Pro', amount: 290, time: '12 min ago' },
  ]);

  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Оновлення статистики
    const updateStats = () => {
      setStats(prev => ({
        ...prev,
        online: prev.online + Math.floor(Math.random() * 5) - 2,
        predictionsToday: prev.predictionsToday + Math.floor(Math.random() * 20),
        winnersToday: prev.winnersToday + Math.floor(Math.random() * 3),
      }));
    };

    // Додавання нових перемог
    const addWin = () => {
      const users = ['@MoonHunter', '@DeFiMaster', '@CryptoNova', '@BitcoinPro', '@AltcoinExpert'];
      const amounts = [150, 280, 360, 420, 510, 680];
      const times = ['just now', '1 min ago', '2 min ago', '3 min ago'];
      
      const newWin = {
        user: users[Math.floor(Math.random() * users.length)],
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        time: times[Math.floor(Math.random() * times.length)],
      };

      setRecentWins(prev => [newWin, ...prev.slice(0, 3)]);
      
      // Додаємо сповіщення
      const notification = `${newWin.user} just won ${newWin.amount} AP!`;
      setNotifications(prev => [notification, ...prev.slice(0, 2)]);
      
      // Авто-видалення сповіщень
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n !== notification));
      }, 8000);
    };

    updateStats();
    const statsInterval = setInterval(updateStats, 15000);
    
    // Додаємо перемогу кожні 10-30 секунд
    const winInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        addWin();
      }
    }, 10000 + Math.random() * 20000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(winInterval);
    };
  }, []);

  return (
    <div className="ui-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Community Live</h3>
            <p className="text-[11px] text-[#707070]">Real-time activity</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#111827] to-[#1e293b]">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-white">{stats.online} online</span>
        </div>
      </div>

      {/* Живі сповіщення */}
      <div className="mb-4 space-y-1">
        <div className="text-[10px] text-[#707070] mb-1">Recent wins:</div>
        <div className="space-y-1 max-h-[100px] overflow-y-auto">
          {notifications.map((notification, index) => (
            <div 
              key={index} 
              className="p-2 rounded-lg bg-gradient-to-r from-[#111827] to-[#1e293b] border border-[#1f1f1f] animate-fadeIn"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-white">{notification}</span>
                </div>
                <span className="text-[10px] text-[#707070]">just now</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-[#3b82f6]" />
            <span className="text-[10px] text-[#707070]">Predictions today</span>
          </div>
          <div className="text-sm font-bold text-white">
            {stats.predictionsToday.toLocaleString()}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-3 h-3 text-[#facc15]" />
            <span className="text-[10px] text-[#707070]">Winners today</span>
          </div>
          <div className="text-sm font-bold text-white">
            {stats.winnersToday}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-[#707070]">Average win</span>
          </div>
          <div className="text-sm font-bold text-white">
            {stats.averageWin} AP
          </div>
        </div>

        <div className="p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-[#707070]">Biggest win</span>
          </div>
          <div className="text-sm font-bold text-white">
            {stats.biggestWin} AP
          </div>
        </div>
      </div>

      {/* Список останніх переможців */}
      <div>
        <div className="text-[10px] text-[#707070] mb-2">Latest winners:</div>
        <div className="space-y-1">
          {recentWins.map((win, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[#111827] to-transparent hover:bg-[#1e293b] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#a855f7] flex items-center justify-center text-xs">
                  {win.user.charAt(1)}
                </div>
                <div>
                  <div className="text-[11px] text-white">{win.user}</div>
                  <div className="text-[10px] text-[#707070]">{win.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[#facc15] font-semibold">+{win.amount} AP</div>
                <div className="text-[10px] text-[#707070]">won</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Призив до дії */}
      <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-[#22c1c3]/10 to-transparent border border-[#22c1c3]/20">
        <div className="text-center text-[10px]">
          <span className="text-[#22c1c3]">Join the winners! </span>
          <span className="text-white">Submit your prediction now</span>
        </div>
      </div>
    </div>
  );
}