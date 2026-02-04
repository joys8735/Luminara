// src/rewards/rewardsStore.ts
export const REWARDS_STORAGE_KEY = 'svtDailyRewardsState_v1';
export const REWARDS_EVENT = 'svt:rewards:update';

export function emitRewardsUpdate() {
  window.dispatchEvent(new Event(REWARDS_EVENT));
}

export function subscribeRewards(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === REWARDS_STORAGE_KEY) cb();
  };
  const onCustom = () => cb();

  window.addEventListener('storage', onStorage);
  window.addEventListener(REWARDS_EVENT, onCustom);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(REWARDS_EVENT, onCustom);
  };
}
