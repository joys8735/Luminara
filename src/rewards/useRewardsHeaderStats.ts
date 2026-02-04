// src/rewards/useRewardsHeaderStats.ts
import { useEffect, useMemo, useState } from 'react';
import { REWARDS_STORAGE_KEY, subscribeRewards } from './rewardsStore';

type BoxId = 'common' | 'rare' | 'epic' | 'legendary';

type DailyState = {
  alphaPoints: number;
  streakDays: number;
  lastClaimAt: number | null;
  ticketFragments: number;
  activeBoostUntil: number | null;
  streakFreeze: number;
  boxesOpened: Record<BoxId, number>;
  seasonId?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function safeRead(): DailyState | null {
  try {
    const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // migration: xp -> alphaPoints
    if (typeof parsed?.xp === 'number' && typeof parsed?.alphaPoints !== 'number') {
      parsed.alphaPoints = parsed.xp;
      delete parsed.xp;
    }
    return parsed as DailyState;
  } catch {
    return null;
  }
}

export function useRewardsHeaderStats() {
  const [now, setNow] = useState(Date.now());
  const [snap, setSnap] = useState<DailyState | null>(() => safeRead());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const update = () => setSnap(safeRead());
    update();
    return subscribeRewards(update);
  }, []);

  return useMemo(() => {
    const alphaPoints = snap?.alphaPoints ?? 0;
    const streak = snap?.streakDays ?? 0;
    const freeze = snap?.streakFreeze ?? 0;
    const fragments = snap?.ticketFragments ?? 0;

    const boostActive = !!(snap?.activeBoostUntil && now <= snap.activeBoostUntil);

    const nextClaimAt = snap?.lastClaimAt ? snap.lastClaimAt + DAY_MS : null;
    const cooldownSec = nextClaimAt ? Math.max(0, Math.floor((nextClaimAt - now) / 1000)) : 0;
    const canClaim = cooldownSec === 0;

    const openedTotal = snap?.boxesOpened
      ? Object.values(snap.boxesOpened).reduce((a, b) => a + b, 0)
      : 0;

    return { alphaPoints, streak, freeze, fragments, boostActive, cooldownSec, canClaim, openedTotal };
  }, [snap, now]);
}
