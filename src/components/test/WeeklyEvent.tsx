// components/WeeklyEvent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Gift, Target, Users, Zap, Star, Trophy, Sparkles } from 'lucide-react';

const WEEKLY_EVENTS = [
  {
    id: 'volatility',
    name: 'Volatility Storm',
    description: 'Higher volatility = bigger rewards!',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    bonus: '+50% AP on volatile pairs',
    duration: 'Mon-Fri',
    active: true,
  },
  {
    id: 'accuracy',
    name: 'Precision Week',
    description: 'Rewards for closest predictions',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
    bonus: 'Extra 100 AP for <0.5% difference',
    duration: 'All week',
    active: false,
  },
  {
    id: 'streak',
    name: 'Streak Challenge',
    description: 'Maintain your winning streak',
    icon: '🔥',
    color: 'from-red-500 to-pink-500',
    bonus: 'Double rewards for 5+ day streaks',
    duration: 'Weekend',
    active: false,
  },
  {
    id: 'community',
    name: 'Community Party',
    description: 'Everyone wins together!',
    icon: '🎉',
    color: 'from-purple-500 to-indigo-500',
    bonus: 'Shared bonus pool',
    duration: 'Friday',
    active: false,
  },
];

export function WeeklyEvent() {
  const [currentEvent, setCurrentEvent] = useState(WEEKLY_EVENTS[0]);
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 30 });
  const [participants, setParticipants] = useState(1247);
  const [prizePool, setPrizePool] = useState(12500);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        return prev;
      });

      // Оновлюємо статистику
      setParticipants(p => p + Math.floor(Math.random() * 5));
      setPrizePool(p => p + Math.floor(Math.random() * 50));
    }, 60000); // Кожну хвилину

    return () => clearInterval(interval);
  }, []);

  const upcomingEvents = WEEKLY_EVENTS.filter(e => !e.active);

  return (
    <div className="ui-card rounded-2xl p-4">
      {/* Актуальна подія */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentEvent.color} flex items-center justify-center`}>
              <span className="text-xl">{currentEvent.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{currentEvent.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#707070]">{currentEvent.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#707070]" />
            <span className="text-[10px] text-[#707070]">{currentEvent.duration}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-r from-[#111827] to-[#1e293b] border border-[#1f1f1f]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#facc15]" />
              <span className="text-[11px] text-white">Event Bonus:</span>
            </div>
            <span className="text-[11px] text-[#facc15] font-semibold">{currentEvent.bonus}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-[#707070]">Time Left</div>
              <div className="text-sm font-bold text-white">
                {timeLeft.days}d {timeLeft.hours}h
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#707070]">Participants</div>
              <div className="text-sm font-bold text-white">{participants.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#707070]">Prize Pool</div>
              <div className="text-sm font-bold text-[#facc15]">{prizePool.toLocaleString()} AP</div>
            </div>
          </div>
        </div>

        {/* Прогрес події */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-[#707070] mb-1">
            <span>Event Progress:</span>
            <span>{Math.floor((1 - timeLeft.days / 7) * 100)}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${currentEvent.color}`}
              style={{ width: `${(1 - timeLeft.days / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Майбутні події */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#707070]" />
            <span className="text-[11px] text-[#707070]">Upcoming Events</span>
          </div>
          <span className="text-[10px] text-[#707070]">{upcomingEvents.length} scheduled</span>
        </div>

        <div className="space-y-2">
          {upcomingEvents.map(event => (
            <div 
              key={event.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[#111827] to-transparent border border-[#1f1f1f]"
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center`}>
                  <span className="text-lg">{event.icon}</span>
                </div>
                <div>
                  <div className="text-[11px] text-white">{event.name}</div>
                  <div className="text-[10px] text-[#707070]">{event.duration}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#a0a0a0]">Starts in</div>
                <div className="text-[11px] text-white font-semibold">
                  {event.id === 'accuracy' ? 'Tomorrow' : 
                   event.id === 'streak' ? 'In 3 days' : 
                   'Next week'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Спеціальне завдання */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#facc15]/10 to-transparent border border-[#facc15]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#facc15]" />
            <span className="text-[11px] text-white">Special Quest</span>
          </div>
          <span className="text-[10px] text-[#facc15] font-semibold">+300 AP</span>
        </div>
        <div className="text-[10px] text-[#a0a0a0] mb-2">
          Make 3 predictions during {currentEvent.name} event
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[#111827] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#facc15] to-[#f97316]" style={{ width: '66%' }} />
          </div>
          <span className="text-[10px] text-white">2/3</span>
        </div>
      </div>
    </div>
  );
}