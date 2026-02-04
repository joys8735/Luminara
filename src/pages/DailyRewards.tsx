import React, { useEffect, useMemo, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { toast } from 'sonner';
import {
  Gift,
  Sparkles,
  Clock,
  ChevronRight,
  PackageOpen,
  Star,
  Trophy,
  BadgeCheck,
  X,
  Zap,
  Shield,
  Target,
  Flame,
  Image as ImageIcon,
  Download,
  Share2,
  ZapOff,
  Gem,
  Crown,
  Award,
} from 'lucide-react';
import { emitRewardsUpdate, REWARDS_STORAGE_KEY } from '../rewards/rewardsStore';
import confetti from 'canvas-confetti';

type BoxId = 'common' | 'rare' | 'epic' | 'legendary';

type RewardType =
  | 'ALPHA_BOOST_24H'
  | 'STREAK_FREEZE'
  | 'PRIORITY_REVIEW'
  | 'MINT_TICKET_FRAGMENT'
  | 'MINING_BOOST_24H'
  | 'FEE_DISCOUNT'
  | 'COMMON_NFT'
  | 'RARE_NFT'
  | 'EPIC_NFT'
  | 'LEGENDARY_NFT';

type RewardQuality = 'Common' | 'Rare' | 'Epic' | 'Legendary';

type RewardItem = {
  id: string;
  time: number;
  source: 'Daily' | 'Box';
  label: string;
  quality: RewardQuality;
  meta?: Record<string, any>;
  imageUrl?: string;
};

type NFTItem = {
  id: string;
  name: string;
  description: string;
  quality: RewardQuality;
  imageUrl: string;
  acquiredAt: number;
  boxSource: BoxId;
};

type DailyState = {
  alphaPoints: number;
  streakDays: number;
  lastClaimAt: number | null;
  streakAnchorDay: string | null;
  
  boxesOpened: Record<BoxId, number>;
  history: RewardItem[];
  nftCollection: NFTItem[];
  
  ticketFragments: number;
  activeBoostUntil: number | null;
  streakFreeze: number;
  
  pityLegendary: number;
  seasonId: string;
  seasonAlphaEarned: number;
  
  reputation: number;
};

// NFT image URLs - додамо більше варіантів для кожного типу
const NFT_IMAGES = {
  common: [
    {
      id: 'celestial-beings',
      name: 'Celestial Beings Descend',
      description: 'Mystical beings from another dimension',
      quality: 'Common' as RewardQuality,
      url: 'https://images.stockcake.com/public/6/9/a/69a33ae4-e361-4c6f-ba40-35d9a3400f37_large/celestial-beings-descend-stockcake.jpg',
    },
    {
      id: 'mystic-forest',
      name: 'Mystic Forest Guardian',
      description: 'Ancient guardian of enchanted woods',
      quality: 'Common' as RewardQuality,
      url: 'https://img.freepik.com/premium-photo/magic-forest-with-glowing-flowers-fantasy-illustration_900706-14224.jpg',
    },
    {
      id: 'ocean-spirit',
      name: 'Ocean Spirit',
      description: 'Spirit of the deep blue sea',
      quality: 'Common' as RewardQuality,
      url: 'https://img.freepik.com/premium-photo/fantasy-ocean-with-glowing-creatures_950633-3515.jpg',
    },
  ],
  rare: [
    {
      id: 'light-princess',
      name: 'Light Princess',
      description: 'Radiant princess of celestial light',
      quality: 'Rare' as RewardQuality,
      url: 'https://images.stockcake.com/public/d/b/2/db275e0d-76c8-4542-8913-abda43975768_large/celestial-light-princess-stockcake.jpg',
    },
    {
      id: 'phoenix-reborn',
      name: 'Phoenix Reborn',
      description: 'Mythical bird rising from ashes',
      quality: 'Rare' as RewardQuality,
      url: 'https://img.freepik.com/premium-photo/phoenix-bird-rising-from-fire_900706-14163.jpg',
    },
    {
      id: 'dragon-rider',
      name: 'Dragon Rider',
      description: 'Warrior riding through stormy skies',
      quality: 'Rare' as RewardQuality,
      url: 'https://img.freepik.com/premium-photo/fantasy-warrior-riding-dragon_900706-14216.jpg',
    },
  ],
  epic: [
    {
      id: 'cosmic-goddess',
      name: 'Cosmic Goddess',
      description: 'Awakening goddess of the cosmos',
      quality: 'Epic' as RewardQuality,
      url: 'https://images.stockcake.com/public/8/9/9/8993696b-13d0-457e-a375-3f168f23e45a_large/cosmic-goddess-awakens-stockcake.jpg',
    },
    {
      id: 'glowing-angel',
      name: 'Glowing Angel Wings',
      description: 'Ethereal wings of spiritual beauty',
      quality: 'Epic' as RewardQuality,
      url: 'https://thumbs.dreamstime.com/b/angel-wings-glowing-ethereal-fantasy-art-stock-photo-generative-ai-embodying-beauty-celestial-spiritual-imagery-369325763.jpg',
    },
    {
      id: 'time-wizard',
      name: 'Time Wizard',
      description: 'Master of temporal magic',
      quality: 'Epic' as RewardQuality,
      url: 'https://img.freepik.com/premium-photo/wizard-casting-spell-with-glowing-orbs_900706-14230.jpg',
    },
  ],
  legendary: [
    {
      id: 'golden-warrior',
      name: 'Golden Warrior Angel',
      description: 'Celestial warrior with golden armor',
      quality: 'Legendary' as RewardQuality,
      url: 'https://img.freepik.com/premium-photo/angel-warrior-with-glowing-wings_161362-107003.jpg',
    },
    {
      id: 'golden-winged',
      name: 'Golden Winged Being',
      description: 'Majestic being with divine golden wings',
      quality: 'Legendary' as RewardQuality,
      url: 'https://b2-backblaze-stackpath.b-cdn.net/3053764/htnsjo_c9d3098e4b082d7f14759a4685e22b8bff82e9fb.jpg',
    },
    {
      id: 'divine-empress',
      name: 'Divine Empress',
      description: 'Ruler of celestial realms',
      quality: 'Legendary' as RewardQuality,
      url: 'https://img.freepik.com/premium-photo/fantasy-queen-with-glowing-crown_900706-14245.jpg',
    },
  ],
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKeyUTC(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10);
}

function seasonKeyUTC(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatSeconds(total: number) {
  const s = Math.max(0, total);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function fireConfetti(type: 'common' | 'rare' | 'epic' | 'legendary') {
  const base = {
    spread: 100,
    gravity: 0.8,
    ticks: 250,
    origin: { y: 0.6 },
  };

  switch (type) {
    case 'legendary':
      confetti({
        ...base,
        particleCount: 300,
        colors: ['#facc15', '#a855f7', '#ffffff', '#fbbf24'],
        scalar: 1.3,
        shapes: ['star', 'circle'],
      });
      break;
    case 'epic':
      confetti({
        ...base,
        particleCount: 200,
        colors: ['#8b5cf6', '#3b82f6', '#00d1ff'],
        scalar: 1.1,
      });
      break;
    case 'rare':
      confetti({
        ...base,
        particleCount: 150,
        colors: ['#22c55e', '#3b82f6', '#10b981'],
        scalar: 1.0,
      });
      break;
    case 'common':
      confetti({
        ...base,
        particleCount: 100,
        colors: ['#3b82f6', '#00d1ff', '#60a5fa'],
        scalar: 0.9,
      });
      break;
  }
}

// ---------- deterministic RNG ----------
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seedStr: string) {
  const seed = xmur3(seedStr)();
  return mulberry32(seed);
}

// ---------- economy config ----------
const BOXES: {
  id: BoxId;
  name: string;
  apRequired: number;
  subtitle: string;
  badge: RewardQuality;
  gradient: string;
  previewNfts: string[];
  mainColor: string;
}[] = [
  { 
    id: 'common', 
    name: 'Common Box', 
    apRequired: 1, 
    subtitle: '80% chance for Common NFT + small boosts', 
    badge: 'Common',
    gradient: 'from-[#3b82f6] to-[#00d1ff]',
    previewNfts: NFT_IMAGES.common.map(nft => nft.url).slice(0, 2),
    mainColor: '#3b82f6'
  },
  { 
    id: 'rare', 
    name: 'Rare Box', 
    apRequired: 1, 
    subtitle: '70% chance for Rare NFT + medium boosts', 
    badge: 'Rare',
    gradient: 'from-[#22c55e] to-[#3b82f6]',
    previewNfts: NFT_IMAGES.rare.map(nft => nft.url).slice(0, 2),
    mainColor: '#22c55e'
  },
  { 
    id: 'epic', 
    name: 'Epic Box', 
    apRequired: 1, 
    subtitle: '60% chance for Epic NFT + big boosts', 
    badge: 'Epic',
    gradient: 'from-[#8b5cf6] to-[#3b82f6]',
    previewNfts: NFT_IMAGES.epic.map(nft => nft.url).slice(0, 2),
    mainColor: '#8b5cf6'
  },
  { 
    id: 'legendary', 
    name: 'Legendary Box', 
    apRequired: 1, 
    subtitle: '50% chance for Legendary NFT + top perks', 
    badge: 'Legendary',
    gradient: 'from-[#facc15] to-[#a855f7]',
    previewNfts: NFT_IMAGES.legendary.map(nft => nft.url).slice(0, 2),
    mainColor: '#facc15'
  },
];

function dailyApByStreak(day: number) {
  const map = [50, 75, 100, 150, 200, 250, 500];
  return map[clamp(day, 1, 7) - 1];
}

function getReputation(connected: boolean, streakDays: number, alphaPoints: number): number {
  let stars = 1;
  
  if (connected) stars += 1;
  if (streakDays >= 3) stars += 1;
  if (streakDays >= 7) stars += 1;
  if (alphaPoints >= 1000) stars += 1;
  
  return clamp(stars, 1, 5);
}

function qualityBadgeClass(q: RewardQuality) {
  if (q === 'Legendary') return 'text-[#facc15] border-[#facc15]/30 bg-[#facc15]/10';
  if (q === 'Epic') return 'text-[#8b5cf6] border-[#8b5cf6]/30 bg-[#8b5cf6]/10';
  if (q === 'Rare') return 'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10';
  return 'text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/10';
}

function qualityColor(q: RewardQuality) {
  if (q === 'Legendary') return '#facc15';
  if (q === 'Epic') return '#8b5cf6';
  if (q === 'Rare') return '#22c55e';
  return '#3b82f6';
}

function pickWeighted<T>(rng: () => number, arr: { v: T; w: number }[]) {
  const sum = arr.reduce((s, x) => s + x.w, 0);
  const r = rng() * sum;
  let acc = 0;
  for (const x of arr) {
    acc += x.w;
    if (r <= acc) return x.v;
  }
  return arr[arr.length - 1].v;
}

function getRandomNFT(quality: RewardQuality): { name: string; description: string; url: string } {
  const pool = NFT_IMAGES[quality.toLowerCase() as keyof typeof NFT_IMAGES];
  if (!pool || pool.length === 0) {
    return {
      name: `${quality} NFT`,
      description: 'A unique digital collectible',
      url: NFT_IMAGES.common[0].url
    };
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

function rollReward(
  rng: () => number,
  sourceBox: BoxId | 'daily',
  pityLegendary: number
): { type: RewardType; quality: RewardQuality; label: string; meta?: any; imageUrl?: string } {
  
  type LootRoll = {
    type: RewardType;
    quality: RewardQuality;
    label: string;
    meta?: Record<string, any>;
    imageUrl?: string;
  };

  type WeightedLoot = {
    v: LootRoll;
    w: number;
  };

  // КОЖЕН БОКС МАЄ СВОЇ УНІКАЛЬНІ НАГОРОДИ ТА ШАНСИ

  // 1. COMMON BOX: 80% Common NFT, 20% бусти
  const commonPool: WeightedLoot[] = [
    // Common NFT - 80% шанс
    ...NFT_IMAGES.common.map(nft => ({
      v: {
        type: 'COMMON_NFT' as RewardType,
        quality: 'Common' as RewardQuality,
        label: `Common NFT: ${nft.name}`,
        imageUrl: nft.url
      },
      w: 80 / NFT_IMAGES.common.length
    })),
    // Бусти - 20% шанс
    {
      v: {
        type: 'ALPHA_BOOST_24H',
        quality: 'Common' as RewardQuality,
        label: 'Alpha Boost (24h) +10%'
      },
      w: 10
    },
    {
      v: {
        type: 'FEE_DISCOUNT',
        quality: 'Common' as RewardQuality,
        label: 'Fee Discount (1 trade) -10%'
      },
      w: 10
    }
  ];

  // 2. RARE BOX: 70% Rare NFT, 30% бусти
  const rarePool: WeightedLoot[] = [
    // Rare NFT - 70% шанс
    ...NFT_IMAGES.rare.map(nft => ({
      v: {
        type: 'RARE_NFT' as RewardType,
        quality: 'Rare' as RewardQuality,
        label: `Rare NFT: ${nft.name}`,
        imageUrl: nft.url
      },
      w: 70 / NFT_IMAGES.rare.length
    })),
    // Бусти - 30% шанс
    {
      v: {
        type: 'MINING_BOOST_24H',
        quality: 'Rare' as RewardQuality,
        label: 'Mining Boost (24h) +15%'
      },
      w: 15
    },
    {
      v: {
        type: 'STREAK_FREEZE',
        quality: 'Rare' as RewardQuality,
        label: 'Streak Freeze (1x)'
      },
      w: 15
    }
  ];

  // 3. EPIC BOX: 60% Epic NFT, 40% топ бусти
  const epicPool: WeightedLoot[] = [
    // Epic NFT - 60% шанс
    ...NFT_IMAGES.epic.map(nft => ({
      v: {
        type: 'EPIC_NFT' as RewardType,
        quality: 'Epic' as RewardQuality,
        label: `Epic NFT: ${nft.name}`,
        imageUrl: nft.url
      },
      w: 60 / NFT_IMAGES.epic.length
    })),
    // Топ бусти - 40% шанс
    {
      v: {
        type: 'MINT_TICKET_FRAGMENT',
        quality: 'Epic' as RewardQuality,
        label: 'NFT Ticket Fragment x2',
        meta: { fragments: 2 }
      },
      w: 20
    },
    {
      v: {
        type: 'PRIORITY_REVIEW',
        quality: 'Epic' as RewardQuality,
        label: 'Priority Review (Whitelist)'
      },
      w: 20
    }
  ];

  // 4. LEGENDARY BOX: 50% Legendary NFT + pity, 50% топ нагороди
  const legendaryPool: WeightedLoot[] = [
    // Legendary NFT - 50% шанс + pity бонус
    ...NFT_IMAGES.legendary.map(nft => ({
      v: {
        type: 'LEGENDARY_NFT' as RewardType,
        quality: 'Legendary' as RewardQuality,
        label: `${nft.name}`,
        imageUrl: nft.url
      },
      w: (50 + pityLegendary * 5) / NFT_IMAGES.legendary.length
    })),
    // Топ нагороди - 50% шанс
    {
      v: {
        type: 'PRIORITY_REVIEW',
        quality: 'Legendary' as RewardQuality,
        label: 'Golden Priority Review (Top WL)'
      },
      w: 25
    },
    {
      v: {
        type: 'MINT_TICKET_FRAGMENT',
        quality: 'Legendary' as RewardQuality,
        label: 'Ticket Fragments x5',
        meta: { fragments: 5 }
      },
      w: 25
    }
  ];

  // DAILY REWARDS: різні нагороди
  const dailyPool: WeightedLoot[] = [
    {
      v: {
        type: 'ALPHA_BOOST_24H',
        quality: 'Common' as RewardQuality,
        label: 'Alpha Boost (24h)'
      },
      w: 40
    },
    {
      v: {
        type: 'STREAK_FREEZE',
        quality: 'Rare' as RewardQuality,
        label: 'Streak Freeze'
      },
      w: 30
    },
    {
      v: {
        type: 'MINT_TICKET_FRAGMENT',
        quality: 'Epic' as RewardQuality,
        label: 'Ticket Fragment',
        meta: { fragments: 1 }
      },
      w: 20
    },
    {
      v: {
        type: 'COMMON_NFT',
        quality: 'Common' as RewardQuality,
        label: 'Common NFT',
        ...getRandomNFT('Common')
      },
      w: 10
    }
  ];

  let pool: WeightedLoot[];
  
  switch (sourceBox) {
    case 'common':
      pool = commonPool;
      break;
    case 'rare':
      pool = rarePool;
      break;
    case 'epic':
      pool = epicPool;
      break;
    case 'legendary':
      pool = legendaryPool;
      break;
    default: // 'daily'
      pool = dailyPool;
      break;
  }

  const selected = pickWeighted(rng, pool);
  
  // Якщо це NFT, отримуємо випадкову картинку відповідної якості
  if (selected.type.includes('_NFT') && !selected.imageUrl) {
    const nft = getRandomNFT(selected.quality);
    selected.imageUrl = nft.url;
    selected.label = `${selected.quality} NFT: ${nft.name}`;
  }
  
  return selected;
}

// --------- default state ----------
function defaultState(now: number): DailyState {
  return {
    alphaPoints: 100,
    streakDays: 0,
    lastClaimAt: null,
    streakAnchorDay: null,
    boxesOpened: { common: 0, rare: 0, epic: 0, legendary: 0 },
    history: [],
    nftCollection: [],
    ticketFragments: 0,
    activeBoostUntil: null,
    streakFreeze: 0,
    pityLegendary: 0,
    seasonId: seasonKeyUTC(now),
    seasonAlphaEarned: 0,
    reputation: 1,
  };
}

function migrateState(raw: any, now: number): Partial<DailyState> {
  if (!raw || typeof raw !== 'object') return {};
  const next: any = { ...raw };

  if (typeof next.xp === 'number' && typeof next.alphaPoints !== 'number') {
    next.alphaPoints = next.xp;
    delete next.xp;
  }

  if (typeof next.pityLegendary !== 'number') next.pityLegendary = 0;
  if (typeof next.seasonId !== 'string') next.seasonId = seasonKeyUTC(now);
  if (typeof next.seasonAlphaEarned !== 'number') next.seasonAlphaEarned = 0;
  if (!next.boxesOpened || typeof next.boxesOpened !== 'object') {
    next.boxesOpened = { common: 0, rare: 0, epic: 0, legendary: 0 };
  }
  if (!Array.isArray(next.nftCollection)) next.nftCollection = [];
  if (typeof next.reputation !== 'number') next.reputation = 1;

  return next as Partial<DailyState>;
}

function applyRewardEffects(prev: DailyState, item: RewardItem, type: RewardType, now: number): DailyState {
  const next: DailyState = { ...prev };

  if (type === 'ALPHA_BOOST_24H') next.activeBoostUntil = now + DAY_MS;
  if (type === 'STREAK_FREEZE') next.streakFreeze = (next.streakFreeze || 0) + 1;
  if (type === 'MINT_TICKET_FRAGMENT') {
    const add = item.meta?.fragments ?? 1;
    next.ticketFragments = (next.ticketFragments || 0) + add;
  }

  // Add NFT to collection if it's an NFT reward
  if (type.includes('_NFT') && item.imageUrl) {
    const nftName = item.label.replace(`${item.quality} NFT: `, '');
    const nftDescription = `${item.quality} NFT from ${item.source === 'Daily' ? 'Daily Reward' : item.quality + ' Box'}`;
    
    const newNFT: NFTItem = {
      id: uid(),
      name: nftName,
      description: nftDescription,
      quality: item.quality,
      imageUrl: item.imageUrl,
      acquiredAt: now,
      boxSource: (item.source === 'Box' && prev.boxesOpened) ? 
        Object.entries(prev.boxesOpened).find(([boxId, count]) => boxId === item.quality.toLowerCase() && count > 0)?.[0] as BoxId || 'common' : 'common'
    };
    next.nftCollection = [newNFT, ...next.nftCollection];
  }

  // Convert fragments to ticket
  if (next.ticketFragments >= 10) {
    const fullTickets = Math.floor(next.ticketFragments / 10);
    next.ticketFragments = next.ticketFragments % 10;

    const unlock: RewardItem = {
      id: uid(),
      time: now,
      source: 'Box',
      label: `NFT Ticket Unlocked x${fullTickets}`,
      quality: 'Legendary',
      meta: { tickets: fullTickets },
    };
    next.history = [unlock, ...next.history].slice(0, 30);
    toast.success(`NFT Ticket unlocked x${fullTickets} 🎟️`);
  }

  return next;
}

function enforceStreakIntegrity(state: DailyState, todayKey: string) {
  if (!state.streakAnchorDay) return state;

  const anchor = new Date(`${state.streakAnchorDay}T00:00:00Z`).getTime();
  const todayMid = new Date(`${todayKey}T00:00:00Z`).getTime();
  const diffDays = Math.floor((todayMid - anchor) / DAY_MS);

  if (diffDays < 2) return state;

  if (state.streakFreeze > 0) {
    toast.message('Streak Freeze used to protect your streak.');
    return { ...state, streakFreeze: Math.max(0, state.streakFreeze - 1), streakAnchorDay: todayKey };
  }

  const softened = Math.floor(state.streakDays * 0.5);
  return { ...state, streakDays: softened, streakAnchorDay: null };
}

export function DailyRewards() {
  const walletAny = useWallet() as any;
  const connected: boolean = !!walletAny?.connected;
  const publicKeyStr: string = walletAny?.publicKey?.toString?.() || 'guest';

  const [state, setState] = useState<DailyState>(() => defaultState(Date.now()));
  const [now, setNow] = useState(Date.now());
  const [openBoxId, setOpenBoxId] = useState<BoxId | null>(null);
  const [revealPhase, setRevealPhase] = useState<'idle' | 'opening' | 'revealed'>('idle');
  const [revealedReward, setRevealedReward] = useState<RewardItem | null>(null);
  const [activeTab, setActiveTab] = useState<'boxes' | 'collection'>('boxes');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const migrated = migrateState(parsed, Date.now());
        setState((prev) => ({ ...prev, ...migrated }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(state));
    emitRewardsUpdate();
  }, [state]);

  const today = useMemo(() => dayKeyUTC(now), [now]);
  const seasonIdNow = useMemo(() => seasonKeyUTC(now), [now]);

  useEffect(() => {
    if (state.seasonId !== seasonIdNow) {
      setState((prev) => ({
        ...prev,
        seasonId: seasonIdNow,
        seasonAlphaEarned: 0,
      }));
      toast.message(`New season started: ${seasonIdNow}`);
    }
  }, [seasonIdNow]);

  useEffect(() => {
    setState((prev) => enforceStreakIntegrity(prev, today));
  }, [today]);

  useEffect(() => {
    const newReputation = getReputation(connected, state.streakDays, state.alphaPoints);
    setState(prev => ({ ...prev, reputation: newReputation }));
  }, [connected, state.streakDays, state.alphaPoints]);

  const boostActive = !!(state.activeBoostUntil && now <= state.activeBoostUntil);
  const boostMultiplier = boostActive ? 1.1 : 1;

  const nextClaimAt = state.lastClaimAt ? state.lastClaimAt + DAY_MS : null;
  const cooldownLeftSec = nextClaimAt ? Math.max(0, Math.floor((nextClaimAt - now) / 1000)) : 0;
  const canClaim = connected && (state.lastClaimAt === null || cooldownLeftSec === 0);

  const readyBoxes = useMemo(() => {
    return BOXES.map((b) => ({
      ...b,
      ready: state.alphaPoints >= b.apRequired,
      progress: clamp((state.alphaPoints / b.apRequired) * 100, 0, 100),
    }));
  }, [state.alphaPoints]);

  const streakDayForNextClaim = clamp(state.streakDays + 1, 1, 7);
  const baseDailyAp = dailyApByStreak(streakDayForNextClaim);
  const dailyAp = Math.round(baseDailyAp * boostMultiplier);

  function pushHistory(item: RewardItem) {
    setState((prev) => ({ ...prev, history: [item, ...prev.history].slice(0, 30) }));
  }

  const onClaimDaily = () => {
    if (!connected) return toast.error('Connect wallet to claim Daily Alpha');
    if (!canClaim) return toast.error('Daily reward is on cooldown');

    const rng = makeRng(`daily:${today}:${publicKeyStr}`);
    const nextStreak = clamp(state.streakDays + 1, 1, 7);

    setState((prev) => ({
      ...prev,
      alphaPoints: prev.alphaPoints + dailyAp,
      seasonAlphaEarned: (prev.seasonAlphaEarned || 0) + dailyAp,
      streakDays: nextStreak,
      lastClaimAt: now,
      streakAnchorDay: today,
    }));

    const roll = rollReward(rng, 'daily', state.pityLegendary);
    
    if (!roll) {
      toast.error('Failed to generate reward');
      return;
    }

    const rewardItem: RewardItem = {
      id: uid(),
      time: now,
      source: 'Daily',
      label: roll.label || 'Daily Reward',
      quality: roll.quality || 'Common',
      meta: roll.meta,
      imageUrl: roll.imageUrl,
    };

    setState((prev) => applyRewardEffects(prev, rewardItem, roll.type, now));
    pushHistory(rewardItem);

    toast.success(`Daily claimed: +${dailyAp} AP • Streak Day ${nextStreak}`);
  };

  const openBox = (boxId: BoxId) => {
    if (!connected) return toast.error('Connect wallet to open boxes');
    const box = BOXES.find((b) => b.id === boxId)!;
    if (state.alphaPoints < box.apRequired) return toast.error('Not enough Alpha Points yet');

    setOpenBoxId(boxId);
    setRevealPhase('opening');
    setRevealedReward(null);

    setTimeout(() => {
      const openCount = (state.boxesOpened?.[boxId] || 0) + 1;
      const rng = makeRng(`box:${today}:${publicKeyStr}:${boxId}:${openCount}`);

      const roll = rollReward(rng, boxId, state.pityLegendary);
      
      if (!roll) {
        toast.error('Failed to generate box reward');
        setRevealPhase('idle');
        setOpenBoxId(null);
        return;
      }

      const rewardItem: RewardItem = {
        id: uid(),
        time: Date.now(),
        source: 'Box',
        label: roll.label || 'Box Reward',
        quality: roll.quality || 'Common',
        meta: roll.meta,
        imageUrl: roll.imageUrl,
      };

      setState((prev) => ({
        ...prev,
        alphaPoints: Math.max(0, prev.alphaPoints - box.apRequired),
        boxesOpened: { ...prev.boxesOpened, [boxId]: (prev.boxesOpened[boxId] || 0) + 1 },
        pityLegendary: roll.quality === 'Legendary' ? 0 : (prev.pityLegendary || 0) + 1,
      }));

      setState((prev) => applyRewardEffects(prev, rewardItem, roll.type, Date.now()));
      pushHistory(rewardItem);

      setRevealedReward(rewardItem);
      setRevealPhase('revealed');

      // КОНФЕТТІ ДЛЯ ВСІХ NFT ТА РІДКІСНИХ НАГОРОД
      if (roll.type.includes('_NFT')) {
        // Для всіх NFT - конфетті з кольором якості
        fireConfetti(roll.quality.toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary');
        
        // Різні повідомлення для різних якостей
        if (roll.quality === 'Legendary') {
          toast.success(`🎉 Legendary NFT Unlocked: ${roll.label.split(': ')[1]} ✨`);
        } else if (roll.quality === 'Epic') {
          toast.success(`🔥 Epic NFT Acquired: ${roll.label.split(': ')[1]}`);
        } else if (roll.quality === 'Rare') {
          toast.success(`⭐ Rare NFT Found: ${roll.label.split(': ')[1]}`);
        } else {
          toast.success(`🎁 Common NFT Added to Collection: ${roll.label.split(': ')[1]}`);
        }
      } else {
        // Для бустів тільки повідомлення
        toast.success(`Boost activated: ${roll.label}`);
      }
    }, 1500);
  };

  const closeModal = () => {
    setOpenBoxId(null);
    setRevealPhase('idle');
    setRevealedReward(null);
  };

  const streakProgressPct = (clamp(state.streakDays, 0, 7) / 7) * 100;

  const shareNFT = (nft: NFTItem) => {
    const text = `Check out my ${nft.quality} NFT "${nft.name}" from Alpha Rewards!`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: nft.name,
        text: text,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast.success('NFT link copied to clipboard!');
    }
  };

  const downloadNFT = (imageUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `alpha-nft-${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('NFT image downloaded!');
  };

  // Оновлений UI для боксів з кращими ефектами
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#e0e0e0]">Daily Rewards</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Claim <span className="text-[#e0e0e0] font-medium">Alpha Points</span> daily, collect NFTs, and unlock powerful boosts.
        </p>
      </div>

      {/* Top grid - Simplified */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* DAILY CLAIM */}
        <div className="ui-card rounded-2xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-gradient-to-br from-[#3b82f6]/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">Daily Claim</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#707070]">
                    Core
                  </span>
                </div>
                <div className="text-[11px] text-[#707070] mt-1">
                  Claim once per 24h to keep your streak
                </div>
              </div>
              <Gift className="w-5 h-5 text-[#3b82f6]" />
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] text-[#a0a0a0]">Today's Reward</div>
                  <div className="text-2xl font-semibold text-[#e0e0e0]">
                    +{dailyAp} <span className="text-sm text-[#707070]">AP</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#707070]">
                    Day {streakDayForNextClaim}/7 • {boostActive && '🎯 Boost Active'}
                  </div>
                </div>

                <button
                  onClick={onClaimDaily}
                  disabled={!canClaim}
                  className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    canClaim
                      ? 'bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] hover:opacity-90 text-white'
                      : 'ui-inner border border-[#1f1f1f] text-[#707070] cursor-not-allowed'
                  }`}
                >
                  {canClaim ? 'Claim Now' : 'On Cooldown'}
                </button>
              </div>

              {!canClaim && (
                <div className="ui-inner rounded-xl p-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#a0a0a0]">Next claim available in</span>
                    <span className="text-[#facc15] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatSeconds(cooldownLeftSec)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#a0a0a0]">Streak Progress</span>
                  <span className="text-[#e0e0e0]">{state.streakDays}/7 days</span>
                </div>
                <div className="h-2 bg-[#121212] border border-[#1f1f1f] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] transition-all duration-500"
                    style={{ width: `${streakProgressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#707070]">
                  <span>Freezes available: {state.streakFreeze}</span>
                  <span>Max bonus at 7 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT PROGRESS */}
        <div className="ui-card rounded-2xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-gradient-to-br from-[#facc15]/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#e0e0e0]">Account Progress</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a0a0a] border border-[#1f1f1f] text-[#707070]">
                    Season {state.seasonId}
                  </span>
                </div>
                <div className="text-[11px] text-[#707070] mt-1">
                  Track your Alpha Points and NFT collection
                </div>
              </div>
              <Trophy className="w-5 h-5 text-[#facc15]" />
            </div>

            <div className="space-y-4">
              <div className="ui-inner rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#e0e0e0] font-medium">Alpha Points</span>
                  <span className="text-[11px] text-[#707070]">Total</span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
  {/* Головне число ЛІВОРУЧ */}
  <div className="text-3xl lg:text-2xl font-bold bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent">
    {state.alphaPoints.toLocaleString()}
  </div>
  
  {/* СЕЗОН СПРАВА */}
  <div className="text-right">
    <div className="text-[10px] font-normal text-[#707070]">Season Alpha Points {state.seasonAlphaEarned.toLocaleString()}</div>
    
  </div>
</div>

                {/* <div className="mt-2 text-[11px] text-[#707070]">
                  Season earned: {state.seasonAlphaEarned.toLocaleString()} AP
                </div> */}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="ui-inner rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#707070]">NFT Ticket</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6]">
                      {state.ticketFragments}/10
                    </span>
                  </div>
                  <div className="h-2 bg-[#121212] border border-[#1f1f1f] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6]"
                      style={{ width: `${(state.ticketFragments / 10) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-[#707070]">
                    10 fragments = 1 NFT ticket
                  </div>
                </div>

                <div className="ui-inner rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#707070]">Reputation</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < state.reputation
                              ? 'text-[#facc15] fill-[#facc15]'
                              : 'text-[#333]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#707070] mt-2">
                    Based on activity & streak
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#3b82f6]/10 to-[#00d1ff]/10 rounded-xl p-3">
                <div className="text-[11px] font-medium text-[#e0e0e0] mb-1 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Quick Tip
                </div>
                <div className="text-[10px] text-[#a0a0a0]">
                  {!connected
                    ? 'Connect wallet to start earning Alpha Points!'
                    : canClaim
                    ? 'Claim daily AP now to maintain your streak!'
                    : `Next box target: ${readyBoxes.find(b => !b.ready)?.apRequired || 0} AP`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOOST STATUS */}
        <div className="ui-card rounded-2xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-gradient-to-br from-[#22c55e]/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-[#e0e0e0]">Active Boosts</div>
                <div className="text-[11px] text-[#707070] mt-1">
                  Currently active perk effects
                </div>
              </div>
              <Zap className="w-5 h-5 text-[#22c55e]" />
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-xl ${boostActive ? 'bg-[#22c55e]/10' : 'bg-[#0a0a0a]'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${boostActive ? 'bg-[#22c55e] animate-pulse' : 'bg-[#707070]'}`} />
                    <span className="text-[12px] text-[#e0e0e0]">Alpha Boost</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${boostActive ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#333] text-[#707070]'}`}>
                    {boostActive ? '+10% AP' : 'Inactive'}
                  </span>
                </div>
                {boostActive && state.activeBoostUntil && (
                  <div className="mt-2 text-[10px] text-[#a0a0a0]">
                    Expires in {formatSeconds(Math.max(0, Math.floor((state.activeBoostUntil - now) / 1000)))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl ui-inner">
                  <div className="text-[11px] text-[#707070] mb-1">Freezes</div>
                  <div className="text-lg font-semibold text-[#e0e0e0] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#3b82f6]" />
                    {state.streakFreeze}
                  </div>
                </div>

                <div className="p-3 rounded-xl ui-inner">
                  <div className="text-[11px] text-[#707070] mb-1">Boxes Opened</div>
                  <div className="text-lg font-semibold text-[#e0e0e0] flex items-center gap-2">
                    <PackageOpen className="w-4 h-4 text-[#8b5cf6]" />
                    {Object.values(state.boxesOpened).reduce((a, b) => a + b, 0)}
                  </div>
                </div>
              </div>

              <div className="ui-inner rounded-xl p-3">
                <div className="text-[11px] font-medium text-[#e0e0e0] mb-2">NFT Collection</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {state.nftCollection.length} NFTs
                  </div>
                  <button
                    onClick={() => setActiveTab('collection')}
                    className="text-[10px] px-3 py-1 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 transition-colors"
                  >
                    View All
                  </button>
                </div>
                {state.nftCollection.length > 0 && (
                  <div className="mt-2 flex -space-x-2">
                    {state.nftCollection.slice(0, 4).map((nft, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-[#121212] overflow-hidden relative group"
                        style={{
                          backgroundImage: `url(${nft.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    {state.nftCollection.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-[#1f1f1f] border-2 border-[#121212] flex items-center justify-center text-[10px] text-[#707070]">
                        +{state.nftCollection.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boxes & Collection Tabs */}
      <div className="ui-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('boxes')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'boxes'
                  ? 'bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] text-white'
                  : 'bg-[#0a0a0a] border border-[#1f1f1f] text-[#a0a0a0] hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-2">
                <PackageOpen className="w-4 h-4" />
                Boxes
              </div>
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'collection'
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white'
                  : 'bg-[#0a0a0a] border border-[#1f1f1f] text-[#a0a0a0] hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                My NFTs ({state.nftCollection.length})
              </div>
            </button>
          </div>

          <div className="text-[11px] text-[#a0a0a0] space-y-0.5 text-right">
            <div>AP Balance: <span className="text-[#e0e0e0]">{state.alphaPoints.toLocaleString()}</span></div>
            <div>Ready boxes: <span className="text-[#e0e0e0]">{readyBoxes.filter(b => b.ready).length}/4</span></div>
          </div>
        </div>

        {activeTab === 'boxes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            {readyBoxes.map((b) => {
              const openedCount = state.boxesOpened[b.id] || 0;
              const isReady = connected && b.ready;

              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-4 border-2 transition-all duration-300 hover:scale-[1.01] relative overflow-hidden ${
                    isReady
                      ? `border-[${b.mainColor}]/40 ui-inner hover:border-[${b.mainColor}]/60 hover:shadow-[0_0_30px_${b.mainColor}20]`
                      : 'border-[#1f1f1f]/10 ui-inner opacity-70'
                  }`}
                  style={{ borderColor: isReady ? `${b.mainColor}5` : '#1f1f1f' }}
                >
                  {/* Glow effect */}
                  {isReady && (
                    <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-gradient-to-br from-transparent via-transparent to-transparent" 
                         style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${b.mainColor}20, transparent 70%)` }} />
                  )}
                  
                  <div className="relative z-10">
                    <div className="mb-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold text-[#e0e0e0]">{b.name}</div>
                          <div className="text-[10px] w-36 text-[#707070] mt-0.5">{b.subtitle}</div>
                        </div>
                        <span
                          className="text-[10px] flex py-1 mr-2 rounded-full"
                        >
                          {b.previewNfts.map((url, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-full p-1 -mr-4 overflow-hidden ui-inner relative group"
                            >
                              <img
                                src={url}
                                alt={`NFT preview ${idx + 1}`}
                                className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </span>
                      </div>

                      {/* NFT Preview with better styling */}
                      <div className="mb-4">
                        <div className="text-[11px] text-[#707070] mb-2">Possible NFTs:</div>
                        <div className="flex gap-2">
                          
                        </div>
                      </div>

                      {/* AP Requirement */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#707070]">AP Required</span>
                          <span className={`font-medium ${isReady ? 'text-[#e0e0e0]' : 'text-[#707070]'}`}>
                            {b.apRequired.toLocaleString()} AP
                          </span>
                        </div>
                        <div className="h-2 bg-[#121212] border border-[#1f1f1f] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${b.progress}%`,
                              background: b.gradient
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#707070]">
                          <span>Progress: {Math.round(b.progress)}%</span>
                          <span>
                            Status:{' '}
                            <span className={isReady ? 'text-[#22c55e]' : 'text-[#707070]'}>
                              {isReady ? 'Ready to Open' : 'Need more AP'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => openBox(b.id)}
                        disabled={!isReady}
                        className={`w-full py-3 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
                          isReady
                            ? `bg-[#eee]/5 hover:shadow-[0_0_20px_${b.mainColor}50] text-white`
                            : 'bg-[#121212] border border-[#1f1f1f] text-[#707070] cursor-not-allowed'
                        }`}
                      >
                        {isReady && (
                          <div className="absolute inset-0 opacity-3  0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                        )}
                        <PackageOpen className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">
                          {isReady ? 'Open Box' : connected ? 'Earn More AP' : 'Connect Wallet'}
                        </span>
                        <ChevronRight className="w-4 h-4 relative z-10" />
                      </button>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-[#707070]">
                        <span>Opened: {openedCount}</span>
                        <span className="text-[#a0a0a0] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {b.id === 'legendary' ? 'Guaranteed Legendary Chance' : 
                           b.id === 'epic' ? 'High Epic Chance' :
                           b.id === 'rare' ? 'Good Rare Chance' : 'Common Focus'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {state.nftCollection.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-[#3b82f6]/20 to-[#00d1ff]/20 border border-[#3b82f6]/30 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-[#3b82f6]" />
                </div>
                <div className="text-sm font-semibold text-[#e0e0e0] mb-2">No NFTs Yet</div>
                <div className="text-[11px] text-[#707070] max-w-md mx-auto">
                  Open boxes to collect unique NFTs. Each NFT has different rarity and can be shared with friends!
                </div>
                <button
                  onClick={() => setActiveTab('boxes')}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Open Your First Box
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.nftCollection.map((nft) => (
                  <div
                    key={nft.id}
                    className="rounded-2xl overflow-hidden border border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#2f2f2f] transition-all duration-300 hover:scale-[1.02] group relative"
                  >
                    {/* Quality glow effect */}
                    <div className="absolute -inset-0.5 opacity-20 bg-gradient-to-br from-transparent via-transparent to-transparent blur-sm"
                         style={{ 
                           backgroundImage: `radial-gradient(circle at 50% 0%, ${qualityColor(nft.quality)}30, transparent 70%)` 
                         }} />
                    
                    <div className="relative">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={nft.imageUrl}
                          alt={nft.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full border backdrop-blur-sm ${qualityBadgeClass(nft.quality)}`}>
                            {nft.quality}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-sm font-semibold text-white drop-shadow-lg truncate">{nft.name}</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <div className="text-[11px] text-[#707070] mb-1">{nft.description}</div>
                          <div className="flex items-center justify-between text-[10px] text-[#707070]">
                            <span>Acquired: {new Date(nft.acquiredAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <PackageOpen className="w-3 h-3" />
                              {nft.boxSource.charAt(0).toUpperCase() + nft.boxSource.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadNFT(nft.imageUrl, nft.name)}
                            className="flex-1 py-2 rounded-lg bg-[#1a1a1a] border border-[#2f2f2f] text-[#e0e0e0] text-[11px] font-medium hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                          <button
                            onClick={() => shareNFT(nft)}
                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] text-white text-[11px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Share2 className="w-3 h-3" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent History */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-[#e0e0e0]">Recent Rewards</div>
          <div className="text-[11px] text-[#707070]">Last {Math.min(8, state.history.length)} events</div>
        </div>

        {state.history.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[11px] text-[#707070]">No rewards yet. Claim daily AP or open boxes!</div>
          </div>
        ) : (
          <div className="space-y-2">
            {state.history.slice(0, 8).map((h) => (
              <div
                key={h.id}
                className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3 flex items-start justify-between gap-3 hover:border-[#2f2f2f] transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#707070]">
                      {h.source}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${qualityBadgeClass(h.quality)}`}>
                      {h.quality}
                    </span>
                  </div>
                  <div className="text-xs text-[#e0e0e0] truncate">{h.label}</div>
                  {h.imageUrl && (
                    <div className="mt-2">
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-[#1f1f1f] group-hover:border-[#2f2f2f] transition-colors">
                        <img
                          src={h.imageUrl}
                          alt="Reward"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-2 text-[10px] text-[#707070]">
                    {new Date(h.time).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center">
                  {h.quality === 'Legendary' ? (
                    <Crown className="w-5 h-5 text-[#facc15]" />
                  ) : h.quality === 'Epic' ? (
                    <Gem className="w-5 h-5 text-[#8b5cf6]" />
                  ) : h.quality === 'Rare' ? (
                    <Award className="w-5 h-5 text-[#22c55e]" />
                  ) : (
                    <Gift className="w-5 h-5 text-[#3b82f6]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Box Modal - ОНОВЛЕНИЙ З КРАСИВИМИ ЕФЕКТАМИ */}
      {openBoxId && (
        <div className="fixed  inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={closeModal} />
          <div className="relative  w-full max-w-lg bg-[#121212] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden">
            {/* Animated background based on box quality */}
            <div className="pointer-events-none  absolute -inset-0.5 opacity-80">
              {openBoxId === 'legendary' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#eee]/10 via-[#1f1f1f]/10 to-[#facc15]/20 animate-pulse" />
              )}
              {openBoxId === 'epic' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 via-[#3b82f6]/10 to-[#8b5cf6]/20" />
              )}
              {openBoxId === 'rare' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/20 via-[#3b82f6]/10 to-[#22c55e]/20" />
              )}
              {openBoxId === 'common' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/20 via-[#00d1ff]/10 to-[#3b82f6]/20" />
              )}
            </div>

            <div className="relative z-10 p-5 border-b border-[#1f1f1f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${qualityBadgeClass(BOXES.find(b => b.id === openBoxId)?.badge || 'Common')}`}>
                  <PackageOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {BOXES.find((b) => b.id === openBoxId)?.name}
                  </div>
                  <div className="text-[11px] text-[#707070]">
                    {BOXES.find((b) => b.id === openBoxId)?.subtitle}
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-[#a0a0a0]" />
              </button>
            </div>

            <div className="relative z-10 p-5 space-y-2">
              <div className=" rounded-2xl p-2 text-center backdrop-blur-sm">
                {revealPhase === 'opening' && (
                  <>
                    <div className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#3b82f6]/30 to-[#00d1ff]/30 animate-ping" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-r from-[#3b82f6]/20 to-[#00d1ff]/20 border-2 border-[#3b82f6]/40 flex items-center justify-center">
                          <PackageOpen className="w-12 h-12 text-[#3b82f6] animate-bounce" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-[#e0e0e0] animate-pulse">
                        Opening Magic Box...
                      </div>
                      <div className="text-[11px] text-[#707070]">
                        {openBoxId === 'legendary' ? 'Legendary energy detected!' :
                         openBoxId === 'epic' ? 'Epic magic swirling...' :
                         openBoxId === 'rare' ? 'Rare vibrations felt...' : 'Common treasures await...'}
                      </div>
                      <div className="h-1 w-48 mx-auto bg-[#1f1f1f] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] animate-[loading_1.5s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  </>
                )}

                {revealPhase === 'revealed' && revealedReward && (
                  <>
                    <div className="mb-2">
                      
                      
                      <div className="flex items-start gap-6 p-6 max-h-[80vh] overflow-y-auto ">
  {/* NFT Card */}
  <div className="relative w-[220px]  aspect-[9/16] rounded-2xl card p-0.5 "
       >
    {/* Glow / Background */}
    <div className={`absolute -inset-3 rounded-2xl blur-xl opacity-50 ${
      revealedReward.quality === 'Legendary'
        ? 'bg-gradient-to-r from-[#facc15]/40 to-[#a855f7]/40 '
        : revealedReward.quality === 'Epic'
        ? 'bg-gradient-to-r from-[#8b5cf6]/40 to-[#3b82f6]/40'
        : revealedReward.quality === 'Rare'
        ? 'bg-gradient-to-r from-[#22c55e]/20 to-[#3b82f6]/20'
        : 'bg-gradient-to-r from-[#3b82f6]/40 to-[#00d1ff]/40'
    }`} />

    {/* NFT Image */}
    {revealedReward.imageUrl ? (
      <img
        src={revealedReward.imageUrl}
        alt="Reward NFT"
        className="w-full h-full object-cover relative z-10 rounded-2xl"
      />
    ) : (
      <div className={`w-full h-full flex items-center justify-center rounded-2xl ${
        revealedReward.quality === 'Legendary'
          ? 'bg-gradient-to-r from-[#facc15]/30 to-[#a855f7]/30 border-4 border-[#facc15]/40'
          : revealedReward.quality === 'Epic'
          ? 'bg-gradient-to-r from-[#8b5cf6]/30 to-[#3b82f6]/30 border-4 border-[#8b5cf6]/40'
          : revealedReward.quality === 'Rare'
          ? 'bg-gradient-to-r from-[#22c55e]/30 to-[#3b82f6]/30 border-4 border-[#22c55e]/40'
          : 'bg-gradient-to-r from-[#3b82f6]/20 to-[#00d1ff]/20 border-4 border-[#3b82f6]/30'
      }`}>
        {revealedReward.quality === 'Legendary' ? <Crown className="w-16 h-16 text-[#facc15]" /> :
         revealedReward.quality === 'Epic' ? <Gem className="w-14 h-14 text-[#8b5cf6]" /> :
         revealedReward.quality === 'Rare' ? <Award className="w-14 h-14 text-[#22c55e]" /> :
         <Gift className="w-12 h-12 text-[#3b82f6]" />}
      </div>
    )}

    {/* Overlay Gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl" />
  </div>

  {/* Info Panel */}
  <div className="flex flex-col justify-center gap-2 ">
    <div className="text-lg font-bold text-[#e0e0e0] truncate">
      {revealedReward.label}
    </div>

    <span className={`text-xs px-3 py-2 rounded-full border font-medium ${qualityBadgeClass(revealedReward.quality)}`}>
      {revealedReward.quality} Reward
    </span>

    {revealedReward.quality === 'Legendary' && (
      <span className="text-[11px] px-2 py-2 rounded-full bg-gradient-to-r from-[#facc15]/20 to-[#a855f7]/20 border border-[#facc15]/30 text-[#facc15] animate-pulse">
        ✨ LEGENDARY UNLOCK! ✨
      </span>
    )}
    {revealedReward.quality === 'Epic' && (
      <span className="text-[11px] px-2 py-2 rounded-full bg-gradient-to-r from-[#8b5cf6]/20 to-[#3b82f6]/20 border border-[#8b5cf6]/30 text-[#8b5cf6]">
        🔥 EPIC ACQUISITION
      </span>
    )}
    {revealedReward.quality === 'Rare' && (
      <span className="text-[11px] px-2 py-2 rounded-full bg-gradient-to-r from-[#22c55e]/20 to-[#3b82f6]/20 border border-[#22c55e]/30 text-[#22c55e]">
        ⭐ RARE FIND
      </span>
    )}

    <div className="text-[11px] text-[#707070]">
      {revealedReward.imageUrl ? 'NFT added to your collection!' : 'Boost activated immediately'}
    </div>
  </div>
</div>

      </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:bg-[#1a1a1a] text-[#e0e0e0] text-sm font-medium transition-colors"
                >
                  Close
                </button>
                {revealPhase === 'revealed' && revealedReward?.imageUrl && (
                  <button
                    onClick={() => {
                      toast.success('NFT saved to your collection!');
                      closeModal();
                      setActiveTab('collection');
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] hover:opacity-90 text-white text-sm font-medium transition-opacity"
                  >
                    View in Collection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add CSS animation for shimmer effect */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default DailyRewards;