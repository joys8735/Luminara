// components/TimeBonus.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Zap, Flame, Star } from 'lucide-react';

export function TimeBonus() {
  const [earlyBirds, setEarlyBirds] = useState(87);
  const [multiplier, setMultiplier] = useState(1.2);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });
  const [userStatus, setUserStatus] = useState<'early' | 'normal' | 'late'>('normal');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Скидаємо на новий день
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });

      // Оновлюємо ранніх птахів
      setEarlyBirds(prev => prev + Math.floor(Math.random() * 3));

      // Визначаємо статус користувача
      const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
      if (totalMinutes > 1440) { // Більше 24 годин? (невірно, але для прикладу)
        setUserStatus('early');
        setMultiplier(1.5);
      } else if (totalMinutes > 720) {
        setUserStatus('normal');
        setMultiplier(1.2);
      } else {
        setUserStatus('late');
        setMultiplier(1.0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch(userStatus) {
      case 'early': return 'text-green-400';
      case 'normal': return 'text-yellow-400';
      case 'late': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getStatusIcon = () => {
    switch(userStatus) {
      case 'early': return <Zap className="w-4 h-4 text-green-400" />;
      case 'normal': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'late': return <Clock className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="ui-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316] to-[#ef4444] flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Early Bird Bonus</h3>
            <p className="text-[11px] text-[#707070]">Predict early, earn more</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-bold ${getStatusColor()}`}>
            {multiplier.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Таймер до кінця бонусу */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#111827] to-[#1e293b] border border-[#1f1f1f]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#707070]">Bonus ends in:</span>
          <span className="text-[10px] text-[#22c1c3]">
            {earlyBirds.toLocaleString()} early birds
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-mono">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] text-[#707070]">Hours</div>
          </div>
          <div className="text-2xl text-white">:</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-mono">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] text-[#707070]">Minutes</div>
          </div>
          <div className="text-2xl text-white">:</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-mono">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] text-[#707070]">Seconds</div>
          </div>
        </div>
      </div>

      {/* Прогрес бонусу */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#707070]">Your bonus tier:</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            {userStatus.toUpperCase()}
          </span>
        </div>
        
        <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
            {/* Маркер поточного положення */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white bg-current"
              style={{ 
                left: `${userStatus === 'early' ? '25%' : userStatus === 'normal' ? '60%' : '90%'}` 
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-[10px]">
          <div className="text-center">
            <div className="text-green-400 font-semibold">Early Bird</div>
            <div className="text-white">1.5x</div>
            <div className="text-[#707070]">First 100</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-semibold">Normal</div>
            <div className="text-white">1.2x</div>
            <div className="text-[#707070]">Next 500</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-semibold">Late Comer</div>
            <div className="text-white">1.0x</div>
            <div className="text-[#707070]">After 600</div>
          </div>
        </div>
      </div>

      {/* Спеціальна пропозиція */}
      {userStatus !== 'early' && (
        <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-[#3b82f6]/10 to-transparent border border-[#3b82f6]/20">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#3b82f6]">Quick prediction bonus!</span>
            <span className="text-white font-semibold">+0.3x</span>
          </div>
          <div className="text-[9px] text-[#a0a0a0] mt-1">
            Submit within next 5 minutes for extra multiplier
          </div>
        </div>
      )}
    </div>
  );
}