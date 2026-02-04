import { useEffect, useState } from 'react';

const STORAGE_ALPHA = 'sv_staking_alpha';

type Achievement = {
  id: string;
  label: string;
  points: number;
  unlocked: boolean;
  desc: string;
};

interface AlphaPoints {
  total: number;
  level: 'Bronze' | 'Silver' | 'Gold';
  achievements: Achievement[];
  lastActivityDay: string | null; // for streak
  streakDays: number;
}

const defaultAlpha: AlphaPoints = {
  total: 0,
  level: 'Bronze',
  achievements: [
    { id: 'first_stake', label: 'First Stake', points: 100, unlocked: false, desc: 'Stake any amount' },
    { id: 'long_lock', label: 'Long-Term Holder', points: 200, unlocked: false, desc: 'Stake with 180d lock' },
    { id: 'high_volume', label: 'High Volume Staker', points: 300, unlocked: false, desc: 'Stake over 1000 USD' },
  ],
  lastActivityDay: null,
  streakDays: 0,
};

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useAlphaPoints() {
  const [alpha, setAlpha] = useState<AlphaPoints>(loadLS(STORAGE_ALPHA, defaultAlpha));

  useEffect(() => saveLS(STORAGE_ALPHA, alpha), [alpha]);

  const addPoints = (points: number, achievementId?: string, isActivity = false) => {
    setAlpha((prev) => {
      let newTotal = prev.total + points;
      let newAchievements = [...prev.achievements];
      let newStreak = prev.streakDays;
      let newLastDay = prev.lastActivityDay;

      if (achievementId) {
        const ach = newAchievements.find((a) => a.id === achievementId);
        if (ach && !ach.unlocked) {
          ach.unlocked = true;
          newTotal += ach.points;
        }
      }

      // Streak logic
      const today = new Date().toISOString().slice(0, 10);
      if (isActivity && today !== prev.lastActivityDay) {
        newStreak = today === new Date(new Date(prev.lastActivityDay || 0).getTime() + 86400000).toISOString().slice(0, 10)
          ? prev.streakDays + 1
          : 1;
        newLastDay = today;
        newTotal += 20 * newStreak; // +20 per streak day
      }

      const newLevel = newTotal < 500 ? 'Bronze' : newTotal < 2000 ? 'Silver' : 'Gold';

      return { ...prev, total: newTotal, level: newLevel, achievements: newAchievements, streakDays: newStreak, lastActivityDay: newLastDay };
    });
  };

  return { alpha, addPoints };
}