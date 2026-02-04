// components/ThemedDays.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Pizza, Bitcoin, Gift, Trophy, Zap, Star } from 'lucide-react';

const THEMED_DAYS = [
  {
    id: 'pizza',
    name: 'Bitcoin Pizza Day',
    date: 'May 22',
    description: 'Celebrate the first Bitcoin transaction!',
    icon: <Pizza className="w-5 h-5" />,
    color: 'from-orange-500 to-yellow-500',
    bonus: '2x rewards on all predictions',
    special: 'Pizza-shaped prediction chart',
  },
  {
    id: 'halving',
    name: 'Halving Day',
    date: 'April 19',
    description: 'Bitcoin mining reward halves',
    icon: <Bitcoin className="w-5 h-5" />,
    color: 'from-yellow-500 to-gray-500',
    bonus: 'Predict BTC within 1% = 500 AP bonus',
    special: 'Halving countdown timer',
  },
  {
    id: 'friday',
    name: 'Fear & Greed Friday',
    date: 'Every Friday',
    description: 'Based on Crypto Fear & Greed Index',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-green-500 to-red-500',
    bonus: 'Extra multiplier based on market sentiment',
    special: 'Live Fear & Greed Index widget',
  },
  {
    id: 'satoshi',
    name: 'Satoshi Day',
    date: 'October 31',
    description: 'Bitcoin whitepaper anniversary',
    icon: <Star className="w-5 h-5" />,
    color: 'from-gray-500 to-orange-500',
    bonus: 'Mystery rewards for all participants',
    special: 'Satoshi trivia quiz',
  },
];

export function ThemedDays() {
  const [currentTheme, setCurrentTheme] = useState(THEMED_DAYS[0]);
  const [timeToTheme, setTimeToTheme] = useState({ days: 0, hours: 14, minutes: 30 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeToTheme(prev => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        
        // Зміна теми
        const nextIndex = (THEMED_DAYS.findIndex(t => t.id === currentTheme.id) + 1) % THEMED_DAYS.length;
        setCurrentTheme(THEMED_DAYS[nextIndex]);
        setIsActive(true);
        
        return { days: 6, hours: 23, minutes: 59 }; // Наступна тема через 7 днів
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTheme]);

  const upcomingThemes = THEMED_DAYS.filter(t => t.id !== currentTheme.id);

  return (
    <div className="ui-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentTheme.color} flex items-center justify-center`}>
            {currentTheme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{currentTheme.name}</h3>
              {isActive && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">
                  Active Now
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#707070]">{currentTheme.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] text-[#707070]">{currentTheme.date}</div>
          <div className="text-[11px] text-white font-semibold">Today</div>
        </div>
      </div>

      {/* Особливості дня */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#111827] to-[#1e293b] border border-[#1f1f1f]">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-3 h-3 text-[#facc15]" />
              <span className="text-[10px] text-white">Special Bonus</span>
            </div>
            <div className="text-[11px] text-[#facc15]">{currentTheme.bonus}</div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-[#3b82f6]" />
              <span className="text-[10px] text-white">Unique Feature</span>
            </div>
            <div className="text-[11px] text-[#3b82f6]">{currentTheme.special}</div>
          </div>
        </div>
      </div>

      {/* Таймер */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] text-[#707070] mb-1">
          <span>{isActive ? 'Event ends in:' : 'Next theme starts in:'}</span>
          <span>{timeToTheme.days}d {timeToTheme.hours}h {timeToTheme.minutes}m</span>
        </div>
        <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${currentTheme.color}`}
            style={{ width: `${100 - (timeToTheme.days / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Календар тем */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#707070]" />
            <span className="text-[11px] text-[#707070]">Themed Calendar</span>
          </div>
          <span className="text-[10px] text-[#707070]">{THEMED_DAYS.length} special days</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {upcomingThemes.map(theme => (
            <div 
              key={theme.id}
              className="p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b] border border-[#1f1f1f]"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.color} flex items-center justify-center`}>
                  {React.cloneElement(theme.icon, { className: 'w-3 h-3' })}
                </div>
                <div>
                  <div className="text-[11px] text-white">{theme.name}</div>
                  <div className="text-[10px] text-[#707070]">{theme.date}</div>
                </div>
              </div>
              <div className="text-[9px] text-[#a0a0a0]">{theme.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Особлива пропозиція */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#facc15]/10 to-transparent border border-[#facc15]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#facc15]" />
            <span className="text-[11px] text-white">Theme Master Achievement</span>
          </div>
          <span className="text-[10px] text-[#facc15] font-semibold">+1000 AP</span>
        </div>
        <div className="text-[10px] text-[#a0a0a0]">
          Participate in all {THEMED_DAYS.length} themed days this month
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[#111827] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#facc15] to-[#f97316]" style={{ width: '75%' }} />
          </div>
          <span className="text-[10px] text-white">3/4</span>
        </div>
      </div>
    </div>
  );
}