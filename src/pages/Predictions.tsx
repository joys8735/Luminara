"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";
import { usePremium } from "../context/PremiumContext";
import { DailyPriceChallenge } from "../components/DailyPriceChallenge";
import { LiveLeaderboard } from "@/components/test/Leaderboard";
import { MarketSentiment } from "@/components/test/MarketSentiment";
import { TimeBonus } from "@/components/test/TimeBonus";
import { SocialProofWidget } from "@/components/test/SocialProofWidget";
import clsx from "clsx";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Award,
  Target,
  Clock,
  Lock,
  DollarSign,
  X,
  Shield,
  Activity,
  History as HistoryIcon,
  Bot,
  BarChart3,
  Gift,
  User as UserIcon,
  Info,
  Sparkles,
  Star,
  ArrowBigDown,
  ArrowRight,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TradingViewMiniChart } from "../components/TradingViewMiniChart";
import { BattleRoyale } from "@/components/test/BattleRoyale";
import { WeeklyEvent } from "@/components/test/WeeklyEvent";
import { ThemedDays } from "@/components/test/ThemedDays";
import { AvatarCustomizer } from "@/components/test/AvatarCustomizer";
import { HallOfFame } from "@/components/test/HallOfFame";

// Додай цю функцію в Predictions.tsx перед компонентом
// Функція для розумного форматування цін
function formatPriceSmart(price: number): string {
  if (!price || price === 0) return "—";

  // Визначаємо кількість знаків після коми
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  if (price >= 0.000001) return price.toFixed(8);
  return price.toFixed(10);
}

// Функція для форматування з урахуванням символу
function formatPriceForToken(price: number, symbol: string): string {
  const sym = symbol.toUpperCase();

  // Спеціальні правила для кожного токена
  if (sym.includes("SHIB") || sym.includes("PEPE")) {
    if (price < 0.000001) return price.toFixed(10);
    if (price < 0.0001) return price.toFixed(8);
    return price.toFixed(6);
  }

  if (sym.includes("DOGE") || sym.includes("FLOKI")) {
    return price.toFixed(6);
  }

  if (sym.includes("XRP") || sym.includes("ADA") || sym.includes("TRX")) {
    return price.toFixed(4);
  }

  // Для всіх інших
  return formatPriceSmart(price);
}

type Dir = "up" | "down";
type Curr = "USDT" | "SOL";

interface Pair {
  id: number;
  symbol: string; // BTCUSDT
  pair: string; // BTC/USDT
  price: number;
  change: number;
  high: number;
  low: number;
  open: number;
  vol: string;
  logo: string;
  mult: number;
}

interface Bet {
  pair: string;
  id: number; // pair id
  dir: Dir;
  amount: string;
  currency: Curr;
  placedAt: number; // ms
  endAt: number; // ms
  entryPrice: number; // price at placement
}

interface SettledBet extends Bet {
  result: "win" | "lose";
  payout: string;
}

// =====================
// Alpha Points helpers
// =====================

type AlphaRisk = "Unknown" | "Low" | "Medium" | "High";

function alphaRiskFromPair(pair: Pair | null): AlphaRisk {
  if (!pair) return "Unknown";
  const vol = Math.abs(pair.change);
  if (vol < 2) return "Low";
  if (vol < 5) return "Medium";
  return "High";
}

function alphaRiskMult(level: AlphaRisk) {
  if (level === "Low") return 1.0;
  if (level === "Medium") return 1.3;
  if (level === "High") return 1.6;
  return 1.0;
}

function getAlphaRank(ap: number) {
  if (ap >= 15000) return "Diamond";
  if (ap >= 5000) return "Platinum";
  if (ap >= 1500) return "Gold";
  if (ap >= 500) return "Silver";
  return "Bronze";
}

// Hidden MMR update (ELO-like)
function updateHiddenMMR(
  prev: number,
  win: boolean,
  expected: number,
  risk: "Low" | "Medium" | "High" | "Unknown",
) {
  const Kbase = 24;
  const riskK =
    risk === "High"
      ? 1.15
      : risk === "Medium"
        ? 1.0
        : risk === "Low"
          ? 0.9
          : 1.0;
  const K = Kbase * riskK;

  const score = win ? 1 : 0;
  const next = prev + K * (score - expected);

  // clamp to keep it sane
  return Math.round(Math.max(600, Math.min(1800, next)));
}

function calcAlphaPoints(
  bet: SettledBet,
  expected: number, // 0..1
  riskLevel: "Low" | "Medium" | "High" | "Unknown",
  opts: { streakDays: number; hasPremium: boolean },
): { ap: number; breakdown: AlphaHistoryItem["breakdown"] } {
  const base = 10;

  const resultMult = bet.result === "win" ? 1 : 0.25;

  const riskMult =
    riskLevel === "Low"
      ? 1.0
      : riskLevel === "Medium"
        ? 1.3
        : riskLevel === "High"
          ? 1.6
          : 1.0;

  const sd = opts.streakDays;
  const streakMult = sd >= 7 ? 2.0 : sd >= 5 ? 1.5 : sd >= 3 ? 1.2 : 1.0;

  const size = parseFloat(bet.amount || "0");
  const sizeMult = size < 20 ? 0.8 : size < 100 ? 1.0 : size < 500 ? 1.3 : 1.6;

  const premiumMult = opts.hasPremium ? 1.25 : 1.0;

  // ✅ beat-the-odds factor: якщо expected низький і ти виграв → більше AP
  const aiMult =
    bet.result === "win" ? 1 + Math.min(0.5, Math.max(0, 1 - expected)) : 1.0;

  const ap = Math.max(
    0,
    Math.round(
      base *
        resultMult *
        riskMult *
        streakMult *
        sizeMult *
        premiumMult *
        aiMult,
    ),
  );

  return {
    ap,
    breakdown: {
      base,
      resultMult,
      riskMult,
      streakMult,
      sizeMult,
      premiumMult,
      aiMult,
    },
  };
}

type AlphaHistoryItem = {
  id: string;
  ts: number;
  pairId: number;
  pairName: string;
  result: "win" | "lose";
  ap: number;
  expected: number; // 0..1
  risk: "Low" | "Medium" | "High" | "Unknown";
  breakdown: {
    base: number;
    resultMult: number;
    riskMult: number;
    streakMult: number;
    sizeMult: number;
    premiumMult: number;
    aiMult: number;
  };
};

interface MiniStats {
  funding: number;
  volatility: number;
  deviation: number;
}

interface StreakData {
  lastBetDay: string | null; // 'YYYY-MM-DD'
  streakDays: number;
  todayBets: number;
  claimable: boolean;
  totalRewards: number;
}

interface ExtraStats {
  spread: number;
  buyVolume: number; // %
  sellVolume: number; // %
  volatility1m: number;
  volatility5m: number;
  fundingRate: number;
  pressure: "Bullish" | "Bearish" | "Neutral";
}

interface AiSignal {
  direction: Dir;
  probability: number;
  confidence: "Low" | "Medium" | "High";
  reason: string;
}

function formatVolume(raw: number): string {
  if (!raw || Number.isNaN(raw)) return "—";

  if (raw >= 1_000_000_000) {
    return (raw / 1_000_000_000).toFixed(1) + "B";
  }
  if (raw >= 1_000_000) {
    return (raw / 1_000_000).toFixed(1) + "M";
  }
  if (raw >= 1_000) {
    return (raw / 1_000).toFixed(1) + "K";
  }
  return raw.toFixed(0);
}

const STORAGE_ACTIVE = "sv_predictions_active";
const STORAGE_HISTORY = "sv_predictions_history";
const STORAGE_STREAK = "sv_predictions_streak";
const STORAGE_ALPHA = "sv_predictions_alpha";
const STORAGE_ALPHA_HISTORY = "sv_predictions_alpha_history";

const STORAGE_WEEKLY_ALPHA = "sv_predictions_weekly_alpha";
const STORAGE_WEEKLY_START = "sv_predictions_weekly_start";

const STORAGE_HIDDEN_MMR = "sv_predictions_hidden_mmr";

const FIVE_MIN = 50 * 60 * 1000;
const CANCEL_WINDOW = 20 * 1000;

const symbolsDefault = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "SHIBUSDT",
  "TRXUSDT",
  "PEPEUSDT",
];

// Sports predictions
const sportsPredictions = [
  { id: 101, name: "UEFA Champions League", symbol: "UCL_FINAL", change: 2.3, price: 1.5, logo: "sport" },
  { id: 102, name: "Premier League Winner", symbol: "PL_WINNER", change: -1.8, price: 2.1, logo: "sport" },
  { id: 103, name: "NBA Finals", symbol: "NBA_FINALS", change: 3.5, price: 1.8, logo: "sport" },
  { id: 104, name: "Wimbledon Singles", symbol: "WIM_SINGLES", change: 1.2, price: 1.6, logo: "sport" },
  { id: 105, name: "Horse Racing - Royal Ascot", symbol: "ASCOT_RACE", change: -2.1, price: 2.5, logo: "sport" },
  { id: 106, name: "World Cup 2026", symbol: "WC_2026", change: 4.2, price: 1.9, logo: "sport" },
  { id: 107, name: "Super Bowl", symbol: "SUPER_BOWL", change: 2.8, price: 1.7, logo: "sport" },
  { id: 108, name: "Tour de France", symbol: "TDF_WINNER", change: 0.5, price: 2.2, logo: "sport" },
];

// News & Market Sentiment predictions
const newsPredictions = [
  { id: 201, name: "Fed Rate Decision", symbol: "FED_RATE", change: -1.5, price: 2.0, logo: "news", sentiment: "bearish" },
  { id: 202, name: "Crypto Regulation News", symbol: "CRYPTO_REG", change: 3.2, price: 1.4, logo: "news", sentiment: "bullish" },
  { id: 203, name: "Tech Stock Sentiment", symbol: "TECH_SENT", change: 2.1, price: 1.6, logo: "news", sentiment: "bullish" },
  { id: 204, name: "Inflation Announcement", symbol: "INFLATION", change: -2.8, price: 2.3, logo: "news", sentiment: "bearish" },
  { id: 205, name: "Market Crash Prediction", symbol: "MARKET_CRASH", change: -3.5, price: 3.0, logo: "news", sentiment: "bearish" },
  { id: 206, name: "GDP Growth News", symbol: "GDP_GROWTH", change: 1.9, price: 1.5, logo: "news", sentiment: "bullish" },
  { id: 207, name: "Tech IPO Success", symbol: "TECH_IPO", change: 2.4, price: 1.7, logo: "news", sentiment: "bullish" },
  { id: 208, name: "Banking Sector Sentiment", symbol: "BANK_SENT", change: -1.2, price: 1.9, logo: "news", sentiment: "neutral" },
];

const LIMITS: Record<Curr, { min: number; max: number }> = {
  USDT: { min: 5, max: 5000 },
  SOL: { min: 0.1, max: 50 },
};

// localStorage helpers
function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ---- Alpha history normalization (handles old localStorage formats) ----
function normalizeAlphaHistory(raw: any[]): any[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(Boolean).map((h: any) => {
    const amountNum = Number(h.amount) || 0;
    const resultMult = h.result === "win" ? 1 : 0.25;
    const riskMult =
      h.risk === "Low"
        ? 1.0
        : h.risk === "Medium"
          ? 1.3
          : h.risk === "High"
            ? 1.6
            : 1.0;
    const sd = Number(h.streakDays) || 0;
    const streakMult = sd >= 7 ? 2.0 : sd >= 5 ? 1.5 : sd >= 3 ? 1.2 : 1.0;
    const sizeMult =
      amountNum < 20
        ? 0.8
        : amountNum < 100
          ? 1.0
          : amountNum < 500
            ? 1.3
            : 1.6;
    const premiumMult = h.premium ? 1.25 : 1.0;
    return {
      ...h,
      breakdown: h.breakdown ?? {
        base: 10,
        resultMult,
        riskMult,
        streakMult,
        sizeMult,
        premiumMult,
        aiMult: 1.0,
      },
    };
  });
}

function getDayKey(ms = Date.now()): string {
  return new Date(ms).toISOString().slice(0, 10);
}

// extra stats from pair
function getExtraStats(pair: Pair | null): ExtraStats {
  if (!pair || !pair.price) {
    return {
      spread: 0.5,
      buyVolume: 50,
      sellVolume: 50,
      volatility1m: 0.3,
      volatility5m: 1.2,
      fundingRate: 0.01,
      pressure: "Neutral",
    };
  }

  const baseVol = Math.max(0.2, Math.min(8, Math.abs(pair.change)));
  const vol1m = +(baseVol / 5).toFixed(2);
  const vol5m = +(baseVol / 2.5).toFixed(2);

  const drift = Math.max(-10, Math.min(10, pair.change));
  const buy = 50 + drift * 2;
  const buyClamped = Math.max(20, Math.min(80, buy));
  const sellClamped = 100 - buyClamped;

  const spread = +Math.max(0.1, Math.min(3, baseVol / 2)).toFixed(2);
  const funding = +(0.005 + baseVol / 100).toFixed(3);

  let pressure: ExtraStats["pressure"] = "Neutral";
  if (buyClamped > 55) pressure = "Bullish";
  else if (sellClamped > 55) pressure = "Bearish";

  return {
    spread,
    buyVolume: +buyClamped.toFixed(1),
    sellVolume: +sellClamped.toFixed(1),
    volatility1m: vol1m,
    volatility5m: vol5m,
    fundingRate: funding,
    pressure,
  };
}

// AI assist for pair
function getAiSignal(pair: Pair | null, stats: ExtraStats): AiSignal {
  if (!pair || !pair.price) {
    return {
      direction: "up",
      probability: 55,
      confidence: "Low",
      reason: "Not enough live data, using neutral bias.",
    };
  }

  let score = 50;
  const reasonParts: string[] = [];

  if (pair.change > 1) {
    score += 8;
    reasonParts.push("strong positive 24h change");
  } else if (pair.change < -1) {
    score -= 8;
    reasonParts.push("strong negative 24h change");
  }

  if (stats.pressure === "Bullish") {
    score += 7;
    reasonParts.push("bullish order flow");
  } else if (stats.pressure === "Bearish") {
    score -= 7;
    reasonParts.push("bearish order flow");
  }

  if (stats.volatility1m > 1.5) {
    reasonParts.push("high short-term volatility");
  }

  if (stats.fundingRate > 0.01) {
    score += 2;
    reasonParts.push("positive funding");
  }

  const direction: Dir = score >= 50 ? "up" : "down";
  const probability = Math.max(
    55,
    Math.min(80, Math.round(Math.abs(score - 50) * 1.3 + 55)),
  );

  let confidence: AiSignal["confidence"] = "Medium";
  if (Math.abs(score - 50) < 5) confidence = "Low";
  else if (Math.abs(score - 50) > 12) confidence = "High";

  if (reasonParts.length === 0) {
    reasonParts.push("balanced conditions, no dominant side.");
  }

  return {
    direction,
    probability,
    confidence,
    reason: reasonParts.join(", "),
  };
}

// trader personality
function getPersonality(history: SettledBet[]): {
  label: string;
  color: string;
  risk: string;
  bias: string;
  accuracy: number;
  totalBets: number;
  avgBet: number;
  description: string;
} {
  const total = history.length;
  if (total < 5) {
    return {
      label: "New Explorer",
      color: "#3b82f6",
      risk: "Unknown",
      bias: "Neutral",
      accuracy: 0,
      totalBets: total,
      avgBet: 0,
      description:
        "Too early to analyze your style. Place a few more predictions.",
    };
  }

  let wins = 0;
  let upCount = 0;
  let downCount = 0;
  let sumAmt = 0;

  history.forEach((b) => {
    if (b.result === "win") wins++;
    if (b.dir === "up") upCount++;
    else downCount++;
    sumAmt += parseFloat(b.amount);
  });

  const accuracy = +((wins / total) * 100).toFixed(1);
  const avgBet = +(sumAmt / total).toFixed(2);
  const upShare = upCount / total;
  const bias =
    upShare > 0.6 ? "Bullish" : upShare < 0.4 ? "Bearish" : "Balanced";

  let label = "Cold Analyst";
  let risk = "Medium";
  let color = "#22c1c3";
  let description = "";

  if (avgBet >= 500 || accuracy >= 70) {
    label = "Aggressive Bull";
    risk = "High";
    color = "#f97316";
    description =
      "You like big moves and are not afraid of risk. Strong conviction trading.";
  } else if (accuracy >= 60 && avgBet < 500) {
    label = "Momentum Rider";
    risk = "Medium";
    color = "#22c1c3";
    description =
      "You ride the current trend and often follow the dominant direction.";
  } else if (accuracy < 45 && avgBet > 50) {
    label = "Reversal Hunter";
    risk = "High";
    color = "#a855f7";
    description =
      "You like to fade the trend and hunt for reversals, which is risky but can be rewarding.";
  } else if (accuracy < 40 && avgBet <= 50) {
    label = "Lucky Gambler";
    risk = "High";
    color = "#ef4444";
    description =
      "Your bets look more like experiments. Consider reducing risk and using AI Assist.";
  } else {
    label = "Cold Analyst";
    risk = "Low–Medium";
    color = "#3b82f6";
    description =
      "You keep a balanced approach and tend to be disciplined with your stakes.";
  }

  return {
    label,
    color,
    risk,
    bias,
    accuracy,
    totalBets: total,
    avgBet,
    description,
  };
}

export function Predictions() {
  const { connected } = useWallet();

  // 🔥 беремо статус преміума з контексту
  const { hasPremium, expiresAt } = usePremium();

  const [symbols] = useState<string[]>(symbolsDefault);
  const [pairs, setPairs] = useState<Pair[]>(
    symbols.map((s, i) => {
      const base = s.replace("USDT", "");
      let logo = "btc";
      if (base === "SOL") logo = "sol";
      else if (base === "ETH") logo = "eth";
      else if (base === "BNB") logo = "bnb";
      else if (base === "XRP") logo = "xrp";
      else if (base === "DOGE") logo = "doge";
      else if (base === "SHIB") logo = "shib";
      else if (base === "TRX") logo = "trx";
      else if (base === "PEPE") logo = "pepe";

      return {
        id: i + 1,
        symbol: s,
        pair: `${base}/USDT`,
        price: 0,
        change: 0,
        high: 0,
        low: 0,
        open: 0,
        vol: "0",
        logo,
        mult:
          base === "SOL"
            ? 1.92
            : base === "BTC"
              ? 1.85
              : base === "ETH"
                ? 1.88
                : base === "BNB"
                  ? 1.9
                  : base === "XRP"
                    ? 1.95
                    : 3.0,
      };
    }),
  );

  const [miniStats] = useState<Record<number, MiniStats>>(() => {
    const res: Record<number, MiniStats> = {};
    symbolsDefault.forEach((_, i) => {
      res[i + 1] = {
        funding: +(0.01 + Math.random() * 0.09).toFixed(3),
        volatility: +(1 + Math.random() * 8).toFixed(2),
        deviation: +(0.5 + Math.random() * 3).toFixed(2),
      };
    });
    return res;
  });

  const [activeBets, setActiveBets] = useState<Bet[]>(() =>
    loadLS<Bet[]>(STORAGE_ACTIVE, []),
  );
  const [historyBets, setHistoryBets] = useState<SettledBet[]>(() =>
    loadLS<SettledBet[]>(STORAGE_HISTORY, []),
  );

  const [streak, setStreak] = useState<StreakData>(() =>
    loadLS<StreakData>(STORAGE_STREAK, {
      lastBetDay: null,
      streakDays: 0,
      todayBets: 0,
      claimable: false,
      totalRewards: 0,
    }),
  );

  // ✅ Alpha Points (total)
  const [alphaPoints, setAlphaPoints] = useState<number>(() =>
    loadLS<number>(STORAGE_ALPHA, 0),
  );

  // ✅ Alpha history (last events)
  const [alphaHistory, setAlphaHistory] = useState<AlphaHistoryItem[]>(() => {
    const raw = loadLS<any[]>(STORAGE_ALPHA_HISTORY, [] as any[]);
    return normalizeAlphaHistory(raw) as AlphaHistoryItem[];
  });

  // ✅ Weekly alpha leaderboard points
  const [weeklyAlpha, setWeeklyAlpha] = useState<number>(() =>
    loadLS<number>(STORAGE_WEEKLY_ALPHA, 0),
  );
  const [weeklyStart, setWeeklyStart] = useState<number>(() =>
    loadLS<number>(STORAGE_WEEKLY_START, Date.now()),
  );

  // ✅ Hidden MMR (skill rating)
  const [hiddenMMR, setHiddenMMR] = useState<number>(() =>
    loadLS<number>(STORAGE_HIDDEN_MMR, 1000),
  );

  // refs to avoid stale state inside setInterval/settle
  const streakRef = useRef<StreakData>(streak);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  // persist alpha/mmr
  useEffect(() => saveLS(STORAGE_ALPHA, alphaPoints), [alphaPoints]);
  useEffect(() => saveLS(STORAGE_ALPHA_HISTORY, alphaHistory), [alphaHistory]);
  useEffect(() => saveLS(STORAGE_WEEKLY_ALPHA, weeklyAlpha), [weeklyAlpha]);
  useEffect(() => saveLS(STORAGE_WEEKLY_START, weeklyStart), [weeklyStart]);
  useEffect(() => saveLS(STORAGE_HIDDEN_MMR, hiddenMMR), [hiddenMMR]);

  // ✅ Weekly reset (rolling 7 days)
  useEffect(() => {
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - weeklyStart > WEEK) {
      setWeeklyStart(Date.now());
      setWeeklyAlpha(0);
    }
  }, [weeklyStart]);

  useEffect(() => {
    saveLS(STORAGE_ALPHA, alphaPoints);
  }, [alphaPoints]);

  const personality = useMemo(() => getPersonality(historyBets), [historyBets]);

  const alphaRank = useMemo(() => getAlphaRank(alphaPoints), [alphaPoints]);

  const alphaLeaderboard = useMemo(() => {
    const userEntry = {
      name: "You",
      ap: alphaPoints,
      winRate: historyBets.length
        ? Math.round(
            (historyBets.filter((b) => b.result === "win").length /
              historyBets.length) *
              100,
          )
        : 0,
    };

    const bots = [
      "NovaTrader",
      "QuantumJack",
      "Astra",
      "CandleSniper",
      "DeltaWolf",
      "ZenAlgo",
      "Raven",
      "ByteBull",
      "Vortex",
      "Miyagi",
      "SatoshiKid",
      "IceMacro",
      "SolScout",
      "Kappa",
      "NightShift",
    ].map((name, idx) => {
      // deterministic pseudo numbers so UI doesn't jump each render
      const base = 120 + idx * 37;
      const ap = Math.max(
        50,
        Math.round(alphaPoints * 0.6 + base + (idx % 3) * 140),
      );
      const winRate = 45 + ((idx * 3) % 40);
      return { name, ap, winRate };
    });

    const all = [userEntry, ...bots].sort((a, b) => b.ap - a.ap);
    // keep top 10 visible, but ensure user is included
    const top = all.slice(0, 10);
    const userInTop = top.some((x) => x.name === "You");
    if (!userInTop) {
      const user = all.find((x) => x.name === "You");
      if (user) top[top.length - 1] = user;
    }
    return top;
  }, [alphaPoints, historyBets]);

  // session stats for bottom card
  const sessionStats = useMemo(() => {
    if (!historyBets.length) {
      return {
        totalBets: 0,
        wins: 0,
        winRate: 0,
        volume: 0,
        bias: "—",
        bestPairId: null as number | null,
        pairIds: [] as number[],
      };
    }

    const total = historyBets.length;
    const wins = historyBets.filter((b) => b.result === "win").length;
    const volume = historyBets.reduce(
      (acc, b) => acc + (parseFloat(b.amount) || 0),
      0,
    );

    let up = 0;
    let down = 0;
    const byPair: Record<number, { total: number; wins: number }> = {};

    historyBets.forEach((b) => {
      if (b.dir === "up") up++;
      else down++;
      if (!byPair[b.id]) byPair[b.id] = { total: 0, wins: 0 };
      byPair[b.id].total++;
      if (b.result === "win") byPair[b.id].wins++;
    });

    let bestPairId: number | null = null;
    let bestScore = 0;
    Object.entries(byPair).forEach(([idStr, data]) => {
      const score = data.total >= 2 ? data.wins / data.total : 0;
      if (score > bestScore) {
        bestScore = score;
        bestPairId = Number(idStr);
      }
    });

    const winRate = +((wins / total) * 100).toFixed(1);
    const bias =
      up === down ? "Balanced" : up > down ? "Mostly LONG" : "Mostly SHORT";

    const pairIds = Array.from(new Set(historyBets.map((b) => b.id)));

    return {
      totalBets: total,
      wins,
      winRate,
      volume: +volume.toFixed(2),
      bias,
      bestPairId,
      pairIds,
    };
  }, [historyBets]);

  // AI recommendation for main page (pair with strongest move)
  const hotPair = useMemo<Pair | null>(() => {
    if (!pairs.length) return null;
    return pairs.reduce<Pair | null>((best, p) => {
      if (!best) return p;
      return Math.abs(p.change) > Math.abs(best.change) ? p : best;
    }, null);
  }, [pairs]);

  const hotExtraStats = useMemo(() => getExtraStats(hotPair), [hotPair]);
  const hotAiSignal = useMemo(
    () => getAiSignal(hotPair, hotExtraStats),
    [hotPair, hotExtraStats],
  );

  const [resultPopup, setResultPopup] = useState<
    (SettledBet & { pairName: string }) | undefined
  >();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [alphaOpen, setAlphaOpen] = useState(false);
  const [lbTab, setLbTab] = useState<"weekly" | "all">("weekly");

  const [modalOpen, setModalOpen] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Curr>("USDT");

  // Додай в кожну активну ставку
  const calculateLivePnL = (bet: Bet, currentPrice: number) => {
    const change = ((currentPrice - bet.entryPrice) / bet.entryPrice) * 100;
    const effectiveChange = bet.dir === "up" ? change : -change;
    const amount = parseFloat(bet.amount);
    const multiplier = pairs.find((p) => p.id === bet.id)?.mult || 1.85;

    if (effectiveChange > 0) {
      return (amount * multiplier - amount).toFixed(2);
    } else {
      return (-amount).toFixed(2); // Якщо програєш
    }
  };

  const wsRef = useRef<WebSocket | null>(null);
  const pairsRef = useRef<Pair[]>(pairs);
  useEffect(() => {
    pairsRef.current = pairs;
  }, [pairs]);

  const [btcPrice, setBtcPrice] = useState<number>(0);

  // prices via WebSocket
  useEffect(() => {
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const wsbtc = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@ticker",
    );
    const ws = new WebSocket(url);
    wsRef.current = ws;

    wsbtc.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.c) {
        setBtcPrice(parseFloat(data.c));
      }
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const d = msg?.data;
        if (!d?.s || !d?.c) return;
        const sym: string = d.s;
        setPairs((prev) =>
          prev.map((p) => {
            if (p.symbol !== sym) return p;
            const last = parseFloat(d.c);
            const ch = parseFloat(d.P || "0");
            const high = parseFloat(d.h || "0");
            const low = parseFloat(d.l || "0");
            const open = parseFloat(d.o || "0");
            // q = quoteVolume (USDT), v = baseVolume (BTC, SOL...)
            const rawVol =
              d.q != null
                ? parseFloat(d.q) // в USDT – зручніше
                : d.v != null
                  ? parseFloat(d.v)
                  : 0;

            const vol = formatVolume(rawVol);

            return { ...p, price: last, change: ch, high, low, open, vol };
          }),
        );
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [symbols]);

  useEffect(() => {
    saveLS(STORAGE_ACTIVE, activeBets);
  }, [activeBets]);

  useEffect(() => {
    saveLS(STORAGE_HISTORY, historyBets);
  }, [historyBets]);

  useEffect(() => {
    saveLS(STORAGE_STREAK, streak);
  }, [streak]);

  // auto-settle
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setActiveBets((prev) => {
        const stillActive: Bet[] = [];
        const settled: SettledBet[] = [];

        prev.forEach((bet) => {
          if (now >= bet.endAt) {
            const pair = pairsRef.current.find((p) => p.id === bet.id);
            const lastPrice = pair?.price ?? bet.entryPrice;
            const won =
              bet.dir === "up"
                ? lastPrice > bet.entryPrice
                : lastPrice < bet.entryPrice;

            const mult = pair?.mult ?? 1;
            const payout = won
              ? (parseFloat(bet.amount) * mult).toFixed(2)
              : "0";

            const sb: SettledBet = {
              ...bet,
              result: won ? "win" : "lose",
              payout,
            };
            settled.push(sb);

            // ✅ Alpha + Hidden MMR (exactly here: we have bet/pair/sb)
            const extra = getExtraStats(pair ?? null);
            const ai = getAiSignal(pair ?? null, extra);

            // expected probability that THIS bet would win, based on AI
            const aiP = Math.max(0.01, Math.min(0.99, ai.probability / 100));
            const expected = bet.dir === ai.direction ? aiP : 1 - aiP;

            const riskInfo = pair
              ? getRiskInfo(pair)
              : { level: "Unknown" as const };
            const riskLevel = riskInfo.level as
              | "Unknown"
              | "Low"
              | "Medium"
              | "High";

            // award alpha
            const { ap, breakdown } = calcAlphaPoints(sb, expected, riskLevel, {
              streakDays: streakRef.current.streakDays,
              hasPremium,
            });

            if (ap > 0) {
              setAlphaPoints((prevAp) => prevAp + ap);
              setWeeklyAlpha((prevW) => prevW + ap);

              setAlphaHistory((prev) => {
                const item: AlphaHistoryItem = {
                  id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
                  ts: Date.now(),
                  pairId: sb.id,
                  pairName: pair?.pair || "Pair",
                  result: sb.result,
                  ap,
                  expected,
                  risk: alphaRiskFromPair(pair ?? null),
                  breakdown,
                };
                // keep last 40
                return [item, ...prev].slice(0, 40);
              });

              toast.success(`+${ap} Alpha Points`);
            }

            // hidden MMR update
            setHiddenMMR((prev) =>
              updateHiddenMMR(prev, sb.result === "win", expected, riskLevel),
            );
          } else {
            stillActive.push(bet);
          }
        });

        if (settled.length > 0) {
          setHistoryBets((prevHist) => [...settled, ...prevHist].slice(0, 200));
          const first = settled[0];
          const pair = pairsRef.current.find((p) => p.id === first.id);
          if (pair) {
            setResultPopup({ ...first, pairName: pair.pair });
          }
        }

        return stillActive;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const selectedPair = useMemo(
    () => (modalOpen ? pairs.find((p) => p.id === modalOpen) || null : null),
    [modalOpen, pairs],
  );

  const openModal = (id: number) => {
    setModalOpen(id);
    setAmount("");
    setCurrency("USDT");
  };

  const closeModal = () => setModalOpen(null);

  // streak update
  const updateStreakOnBet = () => {
    setStreak((prev) => {
      const today = getDayKey();
      const yesterday = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return getDayKey(d.getTime());
      })();

      let streakDays = prev.streakDays;
      let todayBets = prev.todayBets;
      let claimable = prev.claimable;

      if (prev.lastBetDay === today) {
        todayBets += 1;
      } else {
        if (prev.lastBetDay === yesterday) {
          streakDays += 1;
        } else {
          streakDays = 1;
        }
        todayBets = 1;
      }

      if (streakDays >= 3) {
        claimable = true;
      }

      return {
        ...prev,
        lastBetDay: today,
        streakDays,
        todayBets,
        claimable,
      };
    });
  };

  const claimAirdrop = () => {
    if (!streak.claimable) return;
    setStreak((prev) => ({
      ...prev,
      claimable: false,
      totalRewards: prev.totalRewards + 1,
    }));
    toast.success("Airdrop claimed! Rewards sent to your account (demo).");
  };

  const placeBet = (pairId: number, dir: Dir) => {
    if (!connected) return toast.error("Connect wallet first");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter amount > 0");

    const { min, max } = LIMITS[currency];
    if (amt < min) {
      return toast.error(`Minimum bet is ${min} ${currency}`);
    }
    if (amt > max) {
      return toast.error(`Maximum bet is ${max} ${currency}`);
    }

    const pair = pairs.find((p) => p.id === pairId);
    if (!pair || !pair.price) return toast.error("No live price");

    const now = Date.now();
    const entry = pair.price;
    const bet: Bet = {
      id: pairId,
      dir,
      amount,
      currency,
      placedAt: now,
      endAt: now + FIVE_MIN,
      entryPrice: entry,
      pair: "",
    };

    setActiveBets((prev) => [bet, ...prev]);
    updateStreakOnBet();

    toast.success(
      `Bet placed: ${dir.toUpperCase()} on ${pair.pair} at ${entry} `,
    );
    closeModal();
  };

  const cancelBet = (bet: Bet) => {
    const elapsed = Date.now() - bet.placedAt;
    if (elapsed > CANCEL_WINDOW)
      return toast.error("Cannot cancel after 20 seconds");

    setActiveBets((prev) =>
      prev.filter((b) => !(b.id === bet.id && b.placedAt === bet.placedAt)),
    );
    toast.success("Bet cancelled");
  };

  const timeLeft = (b: Bet) =>
    Math.max(0, Math.ceil((b.endAt - Date.now()) / 1000));

  const progress = (b: Bet) => {
    const total = FIVE_MIN / 1000;
    const left = timeLeft(b);
    const done = Math.max(0, Math.min(total, total - left));
    return (done / total) * 100;
  };

  const cancelSecondsLeft = (b: Bet) =>
    Math.max(0, 20 - Math.floor((Date.now() - b.placedAt) / 1000));

  const possibleWin = (pairId: number, amtStr: string, curr: Curr) => {
    const p = pairs.find((x) => x.id === pairId);
    let mult = p?.mult ?? 1;
    if (hasPremium) mult += 0.15;
    const amt = parseFloat(amtStr || "0");
    if (!amt) return `0 ${curr}`;
    return `${(amt * mult).toFixed(2)} ${curr}`;
  };

  const getRiskInfo = (pair: Pair | null) => {
    if (!pair)
      return {
        level: "Unknown",
        color: "#a0a0a0" as const,
        desc: "Not enough data",
      };

    const vol = Math.abs(pair.change);
    if (vol < 2)
      return {
        level: "Low",
        color: "#10b981" as const,
        desc: "Stable short-term movements",
      };
    if (vol < 5)
      return {
        level: "Medium",
        color: "#facc15" as const,
        desc: "Moderate volatility — good for trading",
      };
    return {
      level: "High",
      color: "#ef4444" as const,
      desc: "High volatility — higher risk & reward",
    };
  };

  const formatDateTime = (ms: number) => {
    const date = new Date(ms);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const extraStats = getExtraStats(selectedPair);
  const aiSignal = getAiSignal(selectedPair || null, extraStats);

  // pairs used in session (for logos)
  const sessionPairs = useMemo(
    () => pairs.filter((p) => sessionStats.pairIds.includes(p.id)),
    [pairs, sessionStats.pairIds],
  );

  const [saveUsedAt, setSaveUsedAt] = useState<number | null>(null);
  function canUseSecondLife() {
    if (!hasPremium) return false;
    if (!saveUsedAt) return true;
    return Date.now() - saveUsedAt > 10 * 60 * 1000;
  }

  function useSecondLife(bet: Bet) {
    if (!canUseSecondLife()) return;
    setActiveBets((prev) =>
      prev.map((b) => (b === bet ? { ...b, endAt: b.endAt + 60_000 } : b)),
    );
    setSaveUsedAt(Date.now());
    toast.success("Second Life activated! Round extended +1m");
  }

  const maxMult = Math.max(...pairs.map((p) => p.mult || 0));

  return (
    <div className="space-y-6">
      {/* HEADER BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_1.2fr] gap-4 items-start">
        <div className="ui-card  rounded-2xl p-5 relative overflow-hidden ">
          <div className="pointer-events-none absolute -inset-0.5 opacity-10 card-gradient-soft" />
          <img
            src="public/back2.png"
            className="absolute w-full h-full inset-0 opacity-80 object-cover"
            alt=""
          />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f]/10 ui-inner px-3 py-1 mb-2">
                <Activity className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-[11px] text-[#a0a0a0]">
                  5m rounds • multiplier-style predictions
                </span>
                {hasPremium ? (
                  <span className="inline-flex items-center gap-1 text-[10px] rounded-full  text-emerald-600">
                    <Sparkles className="w-3 h-3" />
                    Premium active
                    {expiresAt && (
                      <span className="text-[#a0a0a0] font-semibold">
                        {new Date(expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] rounded-full border border-[#1f1f1f] bg-[#050816]/90 px-3  text-[#eee]">
                    Free preview – full analytics with Premium
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold ui-bg-text">
                Crypto <br />
                <motion.span
                  className="text-4xl font-bold"
                  style={{
                    background:
                      "linear-gradient(90deg, #3b82f6, #eee, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  Predictions Arena
                </motion.span>
              </h1>

              <div className="mt-1 text-[11px]"></div>

              <p className="mt-1 text-sm text-[#a0a0a0] w-96 ">
                Predict short-term direction, farm streak rewards and let the
                assistant help with signal hints.
              </p>

              {/* 🔥 NEW STATS ROW UNDER TITLE */}
              <div className="mt-3 rounded-2xl flex flex-wrap gap-2 w-96 ">
                {[
                  {
                    label: "Active pairs",
                    value: pairs.length,
                  },
                  {
                    label: "Total bets (session)",
                    value: historyBets.length + activeBets.length,
                  },
                  {
                    label: "Your wins",
                    value: historyBets.filter((b) => b.result === "win").length,
                  },
                  { label: "Alpha", value: alphaPoints.toLocaleString() },

                  {
                    label: "Win rate",
                    value:
                      historyBets.length === 0
                        ? "—"
                        : `${Math.round(
                            (historyBets.filter((b) => b.result === "win")
                              .length /
                              historyBets.length) *
                              100,
                          )}%`,
                  },
                  {
                    label: "Alpha Points",
                    value: alphaPoints.toLocaleString(),
                  },
                  {
                    label: "Rank",
                    value: getAlphaRank(alphaPoints),
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-xl bg-gradient-to-br from-[#7129be]/5 to-[#6d4d8f]/40 text-xs"
                  >
                    <div className="text-[11px] text-[#707070]">{s.label}</div>
                    <div className="text-sm font-semibold ui-bg-text ">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className=" mt-6 border-t border-[#eee]/10 w-96" />
              <div className="mt-4 flex items-center gap-2 ">
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl ui-card px-4 py-3 text-xs md:text-xs font-medium text-[#eee] hover:bg-[#0b1120]/10 transition-all"
                >
                  <HistoryIcon className="w-4 h-4 text-[#3b82f6]" />
                  Prediction history
                </button>

                <button
                  onClick={() => setAlphaOpen(true)}
                  className="inline-flex ui-card items-center gap-2 rounded-xl px-4 py-3 text-xs md:text-xs font-medium ui-bg-text  hover:bg-[#0b1120]/10 transition-all"
                >
                  <Trophy className="w-3 h-3 text-[#facc15]" />
                  Alpha stats
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative inline-block ">
          <div className="group">
            <button className="md:absolute md:top-52 z-10 -translate-y-1/2 flex items-center ml-[-30vh] gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6d4d8f] to-[#a88fe4] rounded-xl font-bold text-white shadow-2xl hover:shadow-amber-500/50 transform transition-all duration-300">
              <Trophy className="w-6 h-6 animate-pulse" />
              Hall of Fame
            </button>

            <div className="absolute md:left-[-59vh] md:top-[0vh] -translate-x-1/2 top-full mb-4 pointer-events-none opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-out z-10">
              <div className="relative">
                <div className="w-[780px] bg-black/40 backdrop-blur-xl rounded-2xl p-2 shadow-2xl ">
                  <HallOfFame />
                </div>
              </div>
            </div>
          </div>
          <div className="ui-card rounded-2xl h-[405px] p-5 relative overflow-hidden">
            {/* Фонове зображення */}
            <img
              src="190c137499965073dc3c9156fc811536.jpg"
              className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl opacity-90"
              alt="background"
            />

            {/* Контент - flex-контейнер для центрування */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center ">
              <span className="text-white text-xl font-semibold bg-[#000000]/50 px-4 py-2 rounded-full">
                23d 23h 23m
              </span>
              {/* Додатковий текст знизу */}
              <span className="text-white/80 text-sm mt-4">
                додатковий текст знизу
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STREAK + PERSONALITY + AI HINT */}
      <h2 className="text-sm font-semibold ui-bg-text ">
        Session insights & helpers
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr] gap-4">
        {/* Airdrop streak */}
        <div className="ui-card backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
          {/* <div className="pointer-events-none absolute -inset-0.5 opacity-10 card-gradient-soft" /> */}
          <div className="relative z-10 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full  flex items-center justify-center">
                  <img
                    src="https://file.aiquickdraw.com/imgcompressed/img/compressed_70c860b87936c75e400df245166f7962.webp"
                    alt=""
                  />
                </div>
                <div>
                  <div className="text-[13px] font-semibold ui-bg-text ">
                    Airdrop streak
                  </div>
                  <div className="text-[11px] text-[#707070]">
                    Rewards earned:{" "}
                    <span className="text-[#22c1c3] font-semibold">
                      {streak.totalRewards}
                    </span>
                  </div>
                </div>
              </div>
              <span className="rounded-full ui-inner px-2 py-1.5 text-[10px] text-[#a0a0a0]">
                Day {streak.streakDays}/7
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#707070]">
              <span>
                Today bets:{" "}
                <span className="ui-bg-text  font-semibold">
                  {streak.todayBets}
                </span>
              </span>
              <span>
                Status:{" "}
                <span className="ui-bg-text  font-semibold">
                  {streak.claimable ? "Reward ready" : "Keep streak alive"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-[#050816] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#22c1c3] via-[#3b82f6] to-[#a855f7] transition-all"
                  style={{
                    width: `${Math.min(100, (streak.streakDays / 7) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-[#707070] w-10 text-right">
                {Math.min(7, streak.streakDays)}/7
              </span>
            </div>

            <button
              onClick={claimAirdrop}
              disabled={!streak.claimable}
              className={`mt-1 w-full text-[11px] px-3 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                streak.claimable
                  ? "border-[#3b82f6]/10 ui-inner ui-bg-text hover:bg-[#0b1020]"
                  : "border-[#1f1f1f]/10 ui-inner text-[#707070] cursor-not-allowed"
              }`}
            >
              {streak.claimable
                ? "Claim daily airdrop"
                : "No reward available yet"}
            </button>
          </div>
        </div>

        {/* Trader profile */}
        <div className="ui-card backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
          {/* <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" /> */}
          <div className="relative z-10 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center ">
                  <img
                    src="https://cdn3d.iconscout.com/3d/premium/thumb/robot-cryptocurrency-3d-icon-png-download-9692874.png"
                    alt=""
                  />
                </div>
                <div>
                  <div className="text-[13px] font-semibold ui-bg-text ">
                    Trader profile
                  </div>
                  <div className="text-[11px] text-[#707070]">
                    Style:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: personality.color }}
                    >
                      {personality.label}
                    </span>
                  </div>
                </div>
              </div>
              <span className="rounded-full ui-inner px-2 py-1.5 text-[10px] text-[#a0a0a0]">
                {personality.totalBets} bets
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-[#707070]">
              <div>
                <div>Accuracy</div>
                <div className="ui-bg-text  font-semibold">
                  {personality.accuracy}%
                </div>
              </div>
              <div>
                <div>Risk</div>
                <div className="ui-bg-text  font-semibold">
                  {personality.risk}
                </div>
              </div>
              <div>
                <div>Bias</div>
                <div className="ui-bg-text  font-semibold">
                  {personality.bias}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#707070]">
              <span>
                Avg size:{" "}
                <span className="ui-bg-text  font-semibold">
                  ${personality.avgBet}
                </span>
              </span>
              <span className="text-[#3b82f6]">
                Session winrate:{" "}
                <span className="font-semibold">{personality.accuracy}%</span>
              </span>
            </div>

            <div className="text-[11px] text-[#a0a0a0] line-clamp-2">
              {personality.description}
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        {hasPremium ? (
          <div className="ui-card rounded-2xl p-4 relative overflow-hidden border border-[#1f1f1f]/20">
            <div className="pointer-events-none absolute -inset-0.5 card-gradient-soft " />
            {/* <div
              className="pointer-events-none absolute inset-0 z-0 bg-cover bg-bottom opacity-100 blur-[2px] scale-105"
              style={{
                backgroundImage:
                  "url(public/168016fd2d702660fd36ee34296ea3d9.jpg)",
              }}
            /> */}
            {/* <div className="pointer-events-none relative w-full  rounded-lg h-24 bg-[#0f0f0f]">
            <img src="public/168016fd2d702660fd36ee34296ea3d9.jpg" className="rounded-lg absolute w-full h-24 object-fill" alt="" />
            </div> */}
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full  flex items-center justify-center">
                    <img
                      src="https://file.aiquickdraw.com/imgcompressed/img/compressed_70c860b87936c75e400df245166f7962.webp"
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#fff] ">
                      AI market hint
                    </div>
                    <div className="text-[11px] text-[#707070]">
                      Short-term directional helper
                    </div>
                  </div>
                </div>

                {hotPair && (
                  <span className="rounded-full ui-inner w-32 px-2 py-1.5  text-[10px] text-[#a0a0a0]">
                    {hotAiSignal.confidence} confidence
                  </span>
                )}
              </div>

              <div className="text-[11px] text-[#a0a0a0]">
                {hotPair ? (
                  <>
                    Focus pair:{" "}
                    <span className="text-[#fff] font-semibold">
                      {hotPair.pair}
                    </span>{" "}
                    • Signal:{" "}
                    <span
                      className={
                        hotAiSignal.direction === "up"
                          ? "text-emerald-500 font-semibold"
                          : "text-red-400 font-semibold"
                      }
                    >
                      {hotAiSignal.direction.toUpperCase()}
                    </span>{" "}
                    <span className="text-[#a0a0a0] ">
                      {hotAiSignal.probability}%
                    </span>
                  </>
                ) : (
                  "Waiting for price feed to generate a signal…"
                )}
              </div>

              {hotPair && (
                <>
                  <div className="h-1.5 rounded-full bg-[#050816] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#22c1c3] via-[#3b82f6] to-[#a855f7]"
                      style={{ width: `${hotAiSignal.probability}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[#707070] line-clamp-2">
                    {hotAiSignal.reason}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          // ❌ Немає Premium — показуємо Locked блок
          <div className="ui-card rounded-2xl p-4 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10 flex flex-col items-center text-center gap-2 text-xs py-4">
              <Lock className="w-6 h-6 text-[#3b82f6]" />
              <div className="ui-bg-text  font-semibold">
                Premium AI market insights
              </div>
              <div className="text-[11px] text-[#a0a0a0] max-w-xs">
                Unlock smarter probability signals, confidence metrics and
                deeper market context. Make better predictions and increase your
                win rate.
              </div>

              <Link
                to="/sub"
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-4 py-1.5 text-[11px] text-white hover:bg-[#2563eb] transition-all"
              >
                Get Premium & win smarter
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — PAIRS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="ui-card backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-15 card-gradient-soft" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold ui-bg-text ">
                    Available pairs
                    {/* {hasPremium ? (
    <div className="inline-flex  ml-4 items-center gap-1 self-start  text-[10px] text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      Premium boost active (+15%)
    </div>
  ) : (
    <div className="inline-flex items-center gap-1 self-start rounded-full  text-[10px] text-[#707070]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
      Premium can boost this pair
    </div>
  )} */}
                  </h2>

                  <p className="text-[11px] text-[#707070] mt-0.5">
                    Short-term prediction markets on top crypto pairs
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded-full border border-[#1f1f1f]/10 bg-[#050816]/90 px-6 text-[#eee]/70">
                    Payout up to ×{maxMult.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-[#1f1f1f]/10 bg-[#050816]/90 px-6 text-[#eee]/70">
                    5m rounds • 24h range
                  </span>
                </div>
              </div>

              {/* LIST */}
              <div className="space-y-3">
                {pairs.map((pair) => {
                  const hasPrice = !!pair.price;

                  // Динамічне форматування ціни
                  const formatPrice = (price: number) => {
                    if (price >= 1000)
                      return price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    if (price >= 1)
                      return price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    if (price >= 0.01) return price.toFixed(4);
                    if (price >= 0.0001) return price.toFixed(6);
                    if (price >= 0.000001) return price.toFixed(8);
                    return price.toFixed(10); // SHIB та інші мемкоїни
                  };

                  // беремо справжні 24h low/high, які ти оновлюєш з Binance
                  const low24 = pair.low || (hasPrice ? pair.price * 0.95 : 0);
                  const high24Raw =
                    pair.high || (hasPrice ? pair.price * 1.05 : 0);
                  const formattedPrice = hasPrice
                    ? formatPrice(pair.price)
                    : "—";
                  const formattedLow = low24 ? formatPrice(low24) : "—";

                  // захист від кейсу, коли high == low
                  const clampedHigh =
                    high24Raw === low24
                      ? low24 + (hasPrice ? pair.price * 0.02 : 1)
                      : high24Raw;
                  const formattedHigh = clampedHigh
                    ? formatPrice(clampedHigh)
                    : "—";
                  const position =
                    hasPrice && clampedHigh !== low24
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            ((pair.price - low24) / (clampedHigh - low24)) *
                              100,
                          ),
                        )
                      : 50;

                  const absChange = Math.abs(pair.change ?? 0);
                  const sentiment =
                    absChange >= 5
                      ? "High volatility"
                      : absChange >= 2
                        ? "Active"
                        : "Calm";

                  return (
                    <div
                      key={pair.id}
                      className={clsx(
                        "ui-inner rounded-2xl px-3 py-3 border border-[#1f1f1f]/5 hover:border-[#3b82f6]/40 transition-all",
                        pair.pair === "SOL/USDT" && "cursor-not-allowed",
                        pair.pair === "BTC/USDT" && "",
                                            // інші умови
                                          )}
                                        >
                                          {/* {pair.pair === 'SOL/USDT' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-2xl z-10">
                        awfaw 
                      </div>
                      
                    )} */}
                                          {/* <div className={pair.pair === 'SOL/USDT' ? 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between blur-[2px] opacity-70 pointer-events-none' : 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between'}> */}
                                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            {/* {pair.pair === 'SOL/USDT' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-[2px] z-10">
                          <div className="text-center">
                          
                            <p className="text-white font-medium text-lg">Locked</p>
                            <p className="text-gray-400 text-sm mt-1">Доступ відкриється після...</p>
                          </div>
                        </div>
                      )} */}

                        {/* LEFT: logo + name + sentiment */}
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-11 h-11 rounded-xl bg-[var(--icon-card)] flex items-center justify-center overflow-hidden">
                            <img
                              src={`/icons/${pair.logo}.png`}
                              alt={`${pair.pair} logo`}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-semibold ui-bg-text">
                                {pair.pair}
                              </div>
                              {pair.mult && (
                                <span className="text-[10px] px-1 py-0.5 rounded-full text-[#3b82f6]">
                                  x{pair.mult} payout
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[#707070]">
                                Vol {pair.vol}
                              </span>
                              <div className="text-[10px] text-[#707070] text-right">
                                Position in range:{" "}
                                <span className="ui-bg-text font-mono-ui font-semibold">
                                  {position.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* MIDDLE: price + change + 24h range */}
                        <div className="flex-1 flex flex-col gap-1 md:px-1 ">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <div className="flex items-baseline gap-2">
                              <span className="text-[14px] font-semibold ui-bg-text">
                                <span className="text-[14px] font-semibold ui-bg-text">
                                  <span className="text-[10px] text-[#a0a0a0]">
                                    $
                                  </span>
                                  {formattedPrice}
                                </span>
                              </span>
                            </div>
                            <div
                              className={`text-[10px] rounded-full flex-1 text-right ${
                                (pair.change ?? 0) >= 0
                                  ? "text-emerald-500 px-2"
                                  : "text-red-400"
                              }`}
                            >
                              {pair.change >= 0 ? "+" : ""}
                              {pair.change.toFixed(2)}%
                            </div>
                          </div>

                          {/* 24h RANGE STRIP */}
                          <div className="space-y-1">
                            <div className="h-1 w-full rounded-full bg-[#0b1020] relative overflow-hidden">
                              <div className="absolute inset-y-0 left-0 right-0">
                                <div className="h-full bg-gradient-to-r from-[#3b82f6] via-[#22c1c3] to-[#a855f7] opacity-70" />
                              </div>
                              <div
                                className="absolute mt-[0.2px] w-[4px] h-[4px] rounded-full border border-[#fff]/90 bg-[#fff]"
                                style={{
                                  left: `${position}%`,
                                  transform: "translateX(-50%)",
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#707070]">
                              <span>
                                Low{" "}
                                <span className="ui-bg-text">
                                  ${formattedLow}
                                </span>
                              </span>
                              <span className="text-[#a0a0a0]">24h range</span>
                              <span>
                                High{" "}
                                <span className="ui-bg-text">
                                  ${formattedHigh}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: action */}
                        <div className="w-full md:w-[170px] flex flex-col gap-2">
                          <button
                            onClick={() => openModal(pair.id)}
                            className="w-full py-2 rounded-lg ui-card text-white shadow-lg hover:shadow-xl text-[12px] transition-all"
                          >
                            Place prediction
                            <ArrowRight className="inline-flex self-start w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — ACTIVE BETS */}

        <div className="space-y-4">
          <div className="ui-card rounded-2xl max-h-[515px]  p-5 relative overflow-y-auto overflow-x-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 " />

            <div className="relative z-10 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold ui-bg-text ">
                    Active predictions
                  </h2>

                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-[#707070]">
                    <span className="inline-flex items-center gap-1 rounded-full py-1">
                      <Clock className="w-3 h-3 text-[#3b82f6]" />
                      <span>
                        Cancel first{" "}
                        <span className="ui-bg-text  font-medium">20s</span>
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full  px-2 py-1">
                      <Sparkles className="w-3 h-3 text-[#22c1c3]" />
                      <span className="ui-bg-text  font-medium">
                        {activeBets.length}{" "}
                        <span className="ui-bg-text  font-medium">
                          Open round(s)
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              {activeBets.length === 0 ? (
                <div className="ui-inner  rounded-xl p-6 text-center text-[#707070]  text-xs">
                  No active predictions yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBets.map((bet) => {
                    const pair = pairs.find((pp) => pp.id === bet.id);
                    const left = timeLeft(bet);
                    const prog = progress(bet);
                    const ms = miniStats[bet.id];
                    const cancelLeft = cancelSecondsLeft(bet);

                    const mins = Math.floor(left / 60);
                    const secs = (left % 60).toString().padStart(2, "0");

                    const dirLabel = bet.dir === "up" ? "LONG" : "SHORT";
                    const dirColor =
                      bet.dir === "up"
                        ? "bg-green-400/10 text-green-500 border-green-500/10"
                        : "bg-red-400/10 text-red-500 border-red-500/10";

                    return (
                      <div
                        key={`${bet.id}-${bet.placedAt}`}
                        className="relative overflow-hidden ui-inner rounded-xl p-4"
                      >
                        {/* Top progress bar */}
                        <div className="absolute left-0 top-0 opacity-75 h-[3px] w-full bg-transparent overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] via-[#22c1c3] to-[#a855f7] transition-all duration-700"
                            style={{ width: `${prog}%` }}
                          />
                        </div>

                        {/* Ghost logo in background */}
                        <div className="absolute inset-0 opacity-5  text-9xl font-bold select-none pointer-events-none flex items-center justify-center">
                          {pair && (
                            <img
                              src={`/icons/${pair.logo}.png`}
                              alt=""
                              className="w-32 h-32 object-contain"
                            />
                          )}
                        </div>

                        <div className="relative z-10 space-y-3  text-xs">
                          {/* Row 1: Pair + amount + direction + timer */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-[#eee]/5 flex items-center justify-center overflow-hidden">
                                {pair && (
                                  <img
                                    src={`/icons/${pair.logo}.png`}
                                    alt=""
                                    className="w-7 h-7 object-contain"
                                  />
                                )}
                                <img
                                  src={`/icons/usdt.png`}
                                  alt=""
                                  className="absolute opacity-70 mr-8 border border-[#050816ba] rounded-full w-4 h-4 mt-8 object-contain"
                                />
                              </div>
                              <div>
                                <div className="text-xs font-bold ui-bg-text ">
                                  {pair?.pair}
                                </div>
                                <div className="text-[11px] text-[#707070]">
                                  {bet.amount} {bet.currency}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`inline-flex items-center h-8 w-24 gap-1 px-2 py-1.5 rounded-lg  text-[10px] font-semibold ${dirColor}`}
                              >
                                {dirLabel}
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="w-3 h-3 text-[#646dbf]" />
                                  <span className="font-semibold ui-bg-text font-display">
                                    {mins}:{secs}
                                  </span>
                                </div>
                              </span>
                            </div>
                          </div>

                          {pair && (
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="text-[#707070]">
                                Entry:{" "}
                                <span className="ui-bg-text font-semibold">
                                  ${formatPriceSmart(bet.entryPrice)}
                                </span>
                              </div>
                              <div className=" items-center gap-1.5">
                                <span className="text-[#707070]">Now: </span>
                                <span className="font-semibold">
                                  ${formatPriceSmart(pair.price)}
                                </span>
                                {pair.price !== bet.entryPrice ? (
                                  <span
                                    className={`flex justify-end items-center gap-0.5 text-[10px] font-medium ${
                                      pair.price > bet.entryPrice
                                        ? "text-green-500"
                                        : pair.price < bet.entryPrice
                                          ? "text-red-400"
                                          : "text-[#707070]" // 0% — сірий
                                    }`}
                                  >
                                    {
                                      pair.price > bet.entryPrice ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : pair.price < bet.entryPrice ? (
                                        <TrendingDown className="h-3 w-3" />
                                      ) : null /* без іконки при 0% */
                                    }
                                    {Math.abs(
                                      ((pair.price - bet.entryPrice) /
                                        bet.entryPrice) *
                                        100,
                                    ).toFixed(4)}
                                    %
                                  </span>
                                ) : (
                                  <span className="flex justify-end items-center gap-0.5 text-[10px] text-[#707070]">
                                    0.0%
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Row 3: win + mini stats */}
                          <div className="flex flex-col gap-1">
                            <div className="text-[11px] text-[#707070]">
                              Possible win:{" "}
                              <span className="text-[#646dbf] text-[12px] font-semibold">
                                {possibleWin(bet.id, bet.amount, bet.currency)}
                              </span>
                            </div>

                            {ms && (
                              <div className="flex flex-wrap gap-3 text-[10px] text-[#707070]">
                                <span>
                                  Funding:{" "}
                                  <span className="ui-bg-text ">
                                    {ms.funding}%
                                  </span>
                                </span>
                                <span>
                                  Volatility:{" "}
                                  <span className="ui-bg-text ">
                                    {ms.volatility}%
                                  </span>
                                </span>
                                <span>
                                  Deviation:{" "}
                                  <span className="ui-bg-text ">
                                    {ms.deviation}%
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Row 4: Cancel button (if window still open) */}
                          {Date.now() - bet.placedAt <= CANCEL_WINDOW && (
                            <button
                              onClick={() => cancelBet(bet)}
                              className="w-full mt-1 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/30 text-red-400 text-[11px] font-medium transition-all "
                            >
                              Cancel prediction ({cancelLeft}s)
                            </button>
                          )}
                          {hasPremium && canUseSecondLife() && (
                            <button
                              onClick={() => useSecondLife(bet)}
                              className="w-full mt-1 py-1.5 rounded-lg bg-[#3b82f6]/10 hover:bg-[#3b82f6]/30 border border-[#3b82f6]/5 text-[#3b82f6] text-[11px]"
                            >
                              Second Life (+1m)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Session quick overview */}
          <div className="ui-card rounded-2xl p-4 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 " />
            <div className="relative z-10 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold ui-bg-text ">
                  Session overview
                </span>
                <span className="text-[11px] text-[#707070]">
                  {sessionStats.totalBets} bets
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="ui-inner rounded-lg p-3 ">
                  <div className="text-[11px] text-[#707070]">Win rate</div>
                  <div className="text-lg font-bold  text-[#3b82f6]">
                    {sessionStats.winRate}%
                    <div className="h-1 ui-card rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-[#3b82f6]"
                        style={{
                          height: "5px",
                          width: `${sessionStats.winRate}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[11px] mt-1 text-[#707070]">
                    Direction:{" "}
                    <span className="ui-bg-text ">{sessionStats.bias}</span>
                  </div>
                </div>
                <div className="ui-inner rounded-lg p-3 ">
                  <div className="text-[11px] text-[#707070]">Total size</div>
                  <div className="text-lg font-bold ui-bg-text ">
                    {sessionStats.volume}
                  </div>
                  <div className="text-[11px] text-[#707070]">
                    Mixed currencies
                  </div>
                </div>
              </div>
              <div className="ui-inner rounded-lg p-3 ">
                <div className="text-[11px] text-[#707070] mb-1">Best pair</div>
                <div className="text-sm font-semibold ui-bg-text ">
                  {sessionStats.bestPairId
                    ? pairs.find((p) => p.id === sessionStats.bestPairId)
                        ?.pair || "—"
                    : "—"}
                </div>
                {sessionPairs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sessionPairs.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full ui-card"
                      >
                        <img
                          src={`/icons/${p.logo}.png`}
                          alt={p.pair}
                          className="w-4 h-4"
                        />
                        <span className="text-[11px] ui-bg-text ">
                          {p.pair}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSIGHTS (BOTTOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pair Insights */}
        <div className="ui-card backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-10 card-gradient-soft" />
          <div className="relative z-10">
            <h2 className="text-base font-semibold ui-bg-text  mb-3">
              Pair insights
            </h2>
            <div className="space-y-3">
              {pairs.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-[#eee]/5 rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full  flex items-center justify-center overflow-hidden">
                      <img
                        src={`/icons/${p.logo}.png`}
                        alt={p.pair}
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <div className="ui-bg-text  font-semibold">{p.pair}</div>
                      <div className="text-[11px] text-[#707070]">
                        Vol {p.vol} • Est. spread ~
                        {Math.max(0.1, Math.abs(p.change) / 2).toFixed(2)}$
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#a0a0a0]">
                      {p.price ? `$${p.price.toFixed(2)}` : "—"}
                    </div>
                    <div
                      className={`text-[11px] font-semibold ${
                        p.change >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {p.change >= 0 ? "+" : ""}
                      {p.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extra stats + explanation */}
        <div className="ui-card rounded-2xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-10 card-gradient-soft" />
          <div className="relative z-10 space-y-4 text-xs">
            <h2 className="text-base font-semibold ui-bg-text ">
              How rounds & risk work
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="ui-inner rounded-lg p-3 ">
                <div className="flex items-center gap-1 text-[11px] text-[#707070] mb-1">
                  <Clock className="w-3 h-3" />
                  Round duration
                </div>
                <div className="text-lg font-bold ui-bg-text ">5 min</div>
                <div className="text-[11px] text-[#707070]">
                  Entry locked at click, result settled automatically at expiry.
                </div>
              </div>

              <div className="ui-inner rounded-lg p-3 ">
                <div className="flex items-center gap-1 text-[11px] text-[#707070] mb-1">
                  <Shield className="w-3 h-3" />
                  Cancel window
                </div>
                <div className="text-lg font-bold ui-bg-text ">20s</div>
                <div className="text-[11px] text-[#707070]">
                  You can cancel right after placing a prediction if you change
                  your mind.
                </div>
              </div>

              <div className="ui-inner rounded-lg p-3 ">
                <div className="flex items-center gap-1 text-[11px] text-[#707070] mb-1">
                  <BarChart3 className="w-3 h-3" />
                  Multipliers
                </div>
                <div className="text-lg font-bold ui-bg-text ">×1.8–2.0</div>
                <div className="text-[11px] text-[#707070]">
                  Each pair has its own payout multiplier based on risk and
                  volatility.
                </div>
              </div>

              <div className="ui-inner rounded-lg p-3 ">
                <div className="flex items-center gap-1 text-[11px] text-[#707070] mb-1">
                  <Activity className="w-3 h-3" />
                  Streak rewards
                </div>
                <div className="text-lg font-bold ui-bg-text ">+Airdrop</div>
                <div className="text-[11px] text-[#707070]">
                  Consecutive active days unlock additional rewards in the
                  streak card.
                </div>
              </div>
            </div>

            <div className="bg-[#eee]/5 rounded-lg p-3 ">
              <div className="flex items-center gap-1 text-[11px] text-[#707070] mb-1">
                <Info className="w-3 h-3" />
                Quick tips
              </div>
              <ul className="space-y-1 text-[11px] text-[#a0a0a0]">
                <li>
                  • Use AI hint for direction, but always manage your own risk.
                </li>
                <li>
                  • Higher volatility pairs give stronger moves but also more
                  risk.
                </li>
                <li>
                  • Start with smaller sizes until you learn your own style.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Place Bet */}
      <AnimatePresence>
        {modalOpen && selectedPair && (
          <motion.div
            className="fixed inset-0 bg-[#333]/70 backdrop-blur-sm overflow-y-auto  flex items-center justify-center z-10 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative inset-2 lg:ml-36 ml-0 ui-inner rounded-2xl p-6 max-w-4xl w-full overflow-y-auto lg:overflow-hidden"
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.96 }}
            >
              <div className="relative space-y-5">
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                      <img
                        src={`/icons/${selectedPair.logo}.png`}
                        alt={selectedPair.pair}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <h3 className="text-sm ui-bg-text  font-semibold">
                          {selectedPair.pair}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full ui-card text-[#a0a0a0]">
                          Payout ×{selectedPair.mult}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#707070]">
                        <span>5m round</span>
                        <span className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                        <span>Fixed entry at click</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text "
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT: market snapshot */}
                  <div className="space-y-2">
                    {/* Price + 24h stats */}
                    <div className="ui-card relative rounded-2xl p-4 space-y-1 text-xs">
                      {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full blur-sm"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-300 rounded-full blur-sm"></div> */}
                      <img
                        src="../icons/shape-4-1.png"
                        className="opacity-35  absolute -top-3 left-0"
                        alt=""
                      />
                      <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-[#707070]">
                            Current price
                          </div>
                          <div className="text-[20px] font-bold ui-bg-text  leading-tight">
                            {formatPriceSmart(selectedPair.price)}
                          </div>
                          <div className="text-[11px] text-[#707070]">
                            Entry locked when you confirm
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-[#707070]">
                            24h change
                          </div>
                          <div
                            className={`text-[12px] font-semibold ${
                              selectedPair.change >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {selectedPair.change >= 0 ? "+" : ""}
                            {selectedPair.change.toFixed(2)}%
                          </div>
                          <div className="mt-1 text-[11px] text-[#707070]">
                            Vol {selectedPair.vol}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-2 rounded-full mb-1 bg-[#020617] relative overflow-hidden">
                          {(() => {
                            const low = selectedPair.low;
                            const high =
                              selectedPair.high === selectedPair.low
                                ? selectedPair.low + 1
                                : selectedPair.high;
                            const p = selectedPair.price;
                            const pos =
                              high === low
                                ? 50
                                : Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      ((p - low) / (high - low)) * 100,
                                    ),
                                  );
                            return (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] shadow-[0_0_5px_#3b82f6] opacity-80" />
                                <div
                                  className="absolute w-[8px] h-[8px] rounded-full border border-white/100 bg-[#eee]"
                                  style={{
                                    left: `${pos}%`,
                                    transform: "translateX(-50%)",
                                  }}
                                />
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#707070]">
                          <span>
                            Low{" "}
                            <span className="ui-bg-text ">
                              ${formatPriceSmart(selectedPair.low)}
                            </span>
                          </span>
                          <span className="text-[#a0a0a0]">24h range</span>
                          <span>
                            High{" "}
                            <span className="ui-bg-text ">
                              ${formatPriceSmart(selectedPair.high)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <TradingViewMiniChart
                        symbol={selectedPair.symbol} // BTCUSDT, ETHUSDT тощо
                        height={80}
                        interval="5"
                      />
                      <div className="flex items-center justify-between">
                        {/* <div className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-[#3b82f6]" />
              <span className="text-xs font-semibold text-white">Live Chart</span>
            </div> */}
                        <span className="text-[10px] text-[#707070]">
                          5m • BINANCE
                        </span>
                      </div>
                    </div>

                    {/* Risk card */}

                    {/* Extra stats */}
                    <div className="ui-card rounded-2xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
                        <span className="ui-bg-text  font-semibold">
                          Short-term stats
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* <div>
                          <div className="text-[11px] text-[#707070]">
                            Spread
                          </div>
                          <div className="ui-bg-text  font-semibold">
                            ${extraStats.spread.toFixed(2)}
                          </div>
                        </div> */}

                        <div>
                          <div className="text-[11px] text-[#707070]">
                            Volatility (1m)
                          </div>
                          <div className="ui-bg-text  font-semibold">
                            {extraStats.volatility1m.toFixed(2)}%
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#707070]">
                            Buy / Sell volume
                          </div>
                          <div className="ui-bg-text  font-semibold">
                            {extraStats.buyVolume.toFixed(1)}% /{" "}
                            {extraStats.sellVolume.toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#707070]">
                            Funding rate
                          </div>
                          <div className="ui-bg-text  font-semibold">
                            {extraStats.fundingRate.toFixed(3)}%
                          </div>
                        </div>

                        <div className="col-span-1">
                          <div className="text-[11px] text-[#707070]">
                            Order flow pressure
                          </div>
                          <div className="text-[11px]">
                            <span
                              className={
                                extraStats.pressure === "Bullish"
                                  ? "text-green-400 font-semibold"
                                  : extraStats.pressure === "Bearish"
                                    ? "text-red-400 font-semibold"
                                    : "ui-bg-text  font-semibold"
                              }
                            >
                              {extraStats.pressure}
                            </span>{" "}
                            • 5m volatility {extraStats.volatility5m.toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: prediction form */}
                  <div className="space-y-3">
                    <div className="ui-card rounded-2xl p-4 text-xs flex items-start gap-3">
                      {(() => {
                        const risk = getRiskInfo(selectedPair);
                        const ms = miniStats[selectedPair.id];

                        return (
                          <>
                            <div className="w-10 h-10 rounded-full bg-[#050816] flex items-center justify-center border border-[#1f1f1f]">
                              <Shield className="w-5 h-5 text-[#22c1c3]" />
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-[#eee]/80">
                                  Risk profile
                                </span>
                                <span
                                  className="text-[11px] font-semibold"
                                  style={{ color: risk.color }}
                                >
                                  {risk.level}
                                </span>
                              </div>

                              <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#22c1c3] via-[#3b82f6] to-[#a855f7]"
                                  style={{
                                    width:
                                      risk.level === "Low"
                                        ? "35%"
                                        : risk.level === "Medium"
                                          ? "70%"
                                          : "100%",
                                  }}
                                />
                              </div>

                              <div className="text-[10px] text-[#707070]">
                                {risk.desc}{" "}
                                {ms && (
                                  <>
                                    • Vol {ms.volatility}% • Dev {ms.deviation}%
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Currency selector */}
                    <div className="grid grid-cols-2 gap-3">
                      {(["USDT", "SOL"] as Curr[]).map((cur) => {
                        const active = currency === cur;
                        const lim = LIMITS[cur];
                        const icon = cur === "USDT" ? "usdt" : "sol";

                        return (
                          <button
                            key={cur}
                            onClick={() => setCurrency(cur)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl  text-left text-xs transition-all ${
                              active
                                ? "border-[#3b82f6] ui-card"
                                : "border-[#1f1f1f] bg-[#eee]/5"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                              <img
                                src={`/icons/${icon}.png`}
                                className="w-6 h-6 object-contain"
                                alt={cur}
                              />
                            </div>
                            <div>
                              <div className="ui-bg-text  font-semibold text-xs">
                                {cur}
                              </div>
                              <div className="text-[10px] text-[#707070]">
                                Min {lim.min} • Max {lim.max} {cur}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Amount + quick buttons */}
                    <div className="space-y-3">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder={`0.00 ${currency}`}
                          className="w-full pl-8 pr-3 font-semibold py-4 bg-[#eee]/5 rounded-xl ui-bg-text  text-sm outline-none focus:border-[#3b82f6]/10"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {[10, 25, 50, 100, 200].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setAmount(String(v))}
                            className="px-3 py-1.5 rounded-full bg-[#eee]/5 text-[#a0a0a0] hover:border-[#3b82f6]/70"
                          >
                            {v} {currency}
                          </button>
                        ))}
                      </div>
                      {amount && parseFloat(amount) > 0 && (
                        <div className="text-left text-[11px] text-[#707070]">
                          Possible payout:{" "}
                          <span className="text-[#646dbf] font-semibold">
                            ~ {possibleWin(selectedPair.id, amount, currency)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Direction buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => placeBet(selectedPair.id, "up")}
                        disabled={
                          !connected || !amount || parseFloat(amount) <= 0
                        }
                        className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-xs transition-all ${
                          !connected || !amount || parseFloat(amount) <= 0
                            ? "bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]"
                            : "bg-emerald-700 text-white hover:opacity-90"
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" /> UP
                      </button>

                      <button
                        onClick={() => placeBet(selectedPair.id, "down")}
                        disabled={
                          !connected || !amount || parseFloat(amount) <= 0
                        }
                        className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-xs transition-all ${
                          !connected || !amount || parseFloat(amount) <= 0
                            ? "bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]"
                            : "bg-[#631e1e] text-white hover:opacity-90"
                        }`}
                      >
                        <TrendingDown className="w-4 h-4" /> DOWN
                      </button>
                    </div>

                    <div className="text-[11px] text-[#707070] text-center">
                      You can cancel within{" "}
                      <span className="text-[#3b82f6] font-semibold">
                        20 seconds
                      </span>{" "}
                      after placing the prediction
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* RESULT POPUP */}
      <AnimatePresence>
        {resultPopup && (
          <motion.div
            className="fixed inset-0 ml-64 flex items-center justify-center z-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute top-8 ui-card backdrop-blur-md rounded-full p-4 w-[70vw] "
              initial={{
                scale: 0.8,
                opacity: 0,
                y: -50,
                rotateX: 10,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                rotateX: 0,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: -50,
                rotateX: 10,
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 200,
                duration: 0.3,
              }}
            >
              <div className="pointer-events-none absolute -inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)] opacity-10" />

              {/* Змінив text-center на text-left і видалив justify-center */}
              <div className="grid grid-cols-[1fr_1fr_1fr_0.5fr] items-center text-left space-y-4 text-sm">
                {/* Хедер - зліва */}
                <div className="flex items-center mt-2 gap-3 ">
                  <div className="w-[200px]  justify-center mx-auto flex items-center  ">
                    <Activity
                      className={`w-4 h-4 ${
                        resultPopup.result === "win"
                          ? "text-[#22c1c3]"
                          : "text-[#ef4444]"
                      }`}
                    />
                    <h3 className="text-lg font-bold pl-3 ui-bg-text">
                      {resultPopup.result === "win"
                        ? "You won the round!"
                        : "Prediction lost"}
                    </h3>
                  </div>
                </div>

                {/* Вся інформація вирівняна зліва */}
                <div className="space-y-1">
                  <div className="text-xs text-[#a0a0a0]">
                    Pair:{" "}
                    <span className="ui-bg-text font-semibold">
                      {resultPopup.pairName}
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-[#707070]">
                      Bet:{" "}
                      <span className="ui-bg-text font-semibold">
                        {resultPopup.amount} {resultPopup.currency}
                      </span>{" "}
                      • Direction:{" "}
                      <span
                        className={
                          resultPopup.dir === "up"
                            ? "text-green-400 font-semibold"
                            : "text-red-400 font-semibold"
                        }
                      >
                        {resultPopup.dir.toUpperCase()}
                      </span>
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm">
                    <span className="text-[#707070] text-xs">
                      Payout:{" "}
                      <span
                        className={
                          resultPopup.result === "win"
                            ? "text-[#22c1c3] font-bold"
                            : "text-[#ef4444] font-bold"
                        }
                      >
                        {resultPopup.payout} {resultPopup.currency}
                      </span>
                    </span>
                  </div>

                  <div className="text-[11px] text-[#707070]">
                    Round duration: 5 minutes • settled automatically
                  </div>
                </div>
                {/* Кнопка - теж зліва (або можна по центру, якщо хочеш) */}
                <div className="pt-2">
                  <button
                    onClick={() => setResultPopup(undefined)}
                    className="py-2  px-8 rounded-lg btn-primary text-white text-xs font-medium hover:opacity-90 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALPHA STATS MODAL */}
      <AnimatePresence>
        {alphaOpen && (
          <motion.div
            className="fixed inset-0 ml-56 bg-black/90 flex items-center justify-center z-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative inset-5 bg-[#050816] border border-[#1f1f1f] rounded-2xl p-6 max-w-4xl w-full max-h-[80vh]"
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.96 }}
            >
              <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-15 bg-[radial-gradient(circle_at_top,_#facc15_0,_transparent_65%)]" />

              <div className="relative z-10 space-y-4 text-xs">
                {/* header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
                    <Trophy className="w-3.5 h-3.5 text-[#facc15]" />
                    <span className="text-[11px] text-[#a0a0a0]">
                      Alpha stats
                    </span>
                  </div>

                  <button
                    onClick={() => setAlphaOpen(false)}
                    className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text "
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* top cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#1f1f1f] bg-[#070b14] p-3">
                    <div className="text-[11px] text-[#707070]">
                      Total Alpha
                    </div>
                    <div className="text-lg font-semibold ui-bg-text ">
                      {alphaPoints.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#a0a0a0]">
                      Rank:{" "}
                      <span className="ui-bg-text font-semibold">
                        {getAlphaRank(alphaPoints)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1f1f1f] bg-[#070b14] p-3">
                    <div className="text-[11px] text-[#707070]">
                      Weekly Alpha
                    </div>
                    <div className="text-lg font-semibold ui-bg-text ">
                      {weeklyAlpha.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#a0a0a0]">
                      Resets every 7 days
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1f1f1f] bg-[#070b14] p-3">
                    <div className="text-[11px] text-[#707070]">
                      Hidden skill (MMR)
                    </div>
                    <div className="text-lg font-semibold ui-bg-text ">
                      ••••
                    </div>
                    <div className="text-[11px] text-[#a0a0a0]">
                      Kept private (anti-abuse)
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLbTab("weekly")}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] ${
                      lbTab === "weekly"
                        ? "border-[#facc15]/50 bg-[#facc15]/10 text-[#facc15]"
                        : "border-[#1f1f1f] bg-[#070b14] text-[#a0a0a0]"
                    }`}
                  >
                    Weekly leaderboard
                  </button>
                  <button
                    onClick={() => setLbTab("all")}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] ${
                      lbTab === "all"
                        ? "border-[#facc15]/50 bg-[#facc15]/10 text-[#facc15]"
                        : "border-[#1f1f1f] bg-[#070b14] text-[#a0a0a0]"
                    }`}
                  >
                    All-time leaderboard
                  </button>
                </div>

                {/* Leaderboard + History */}
                {(() => {
                  const bots = [
                    { name: "NeoQuant", weekly: 820, all: 12400 },
                    { name: "SigmaPulse", weekly: 640, all: 9100 },
                    { name: "ApexTrader", weekly: 510, all: 7600 },
                    { name: "DriftAlpha", weekly: 430, all: 5200 },
                    { name: "OrbitEdge", weekly: 350, all: 4100 },
                  ];

                  const you = {
                    name: "You",
                    weekly: weeklyAlpha,
                    all: alphaPoints,
                  };
                  const list = [...bots, you].sort((a, b) =>
                    lbTab === "weekly" ? b.weekly - a.weekly : b.all - a.all,
                  );

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* leaderboard */}
                      <div className="rounded-2xl border border-[#1f1f1f] bg-[#070b14] overflow-hidden">
                        <div className="px-3 py-2 border-b border-[#1f1f1f] text-[11px] text-[#707070] flex items-center justify-between">
                          <span>Top</span>
                          <span>
                            {lbTab === "weekly" ? "Weekly" : "All-time"}
                          </span>
                        </div>
                        <div className="max-h-[34vh] overflow-y-auto">
                          {list.map((p, i) => {
                            const value = lbTab === "weekly" ? p.weekly : p.all;
                            const isYou = p.name === "You";
                            return (
                              <div
                                key={p.name}
                                className={`flex items-center justify-between px-3 py-2 text-[11px] border-b border-[#111827] last:border-b-0 ${
                                  isYou ? "bg-[#facc15]/5" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[#707070] w-5">
                                    {i + 1}.
                                  </span>
                                  <span
                                    className={`font-semibold ${isYou ? "text-[#facc15]" : "ui-bg-text "}`}
                                  >
                                    {p.name}
                                  </span>
                                </div>
                                <span className="ui-bg-text font-semibold">
                                  {value.toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* alpha history */}
                      <div className="rounded-2xl border border-[#1f1f1f] bg-[#070b14] overflow-hidden">
                        <div className="px-3 py-2 border-b border-[#1f1f1f] text-[11px] text-[#707070]">
                          Recent alpha events
                        </div>

                        {alphaHistory.length === 0 ? (
                          <div className="p-4 text-[#707070] text-sm">
                            No alpha events yet. Finish a few rounds to start
                            earning.
                          </div>
                        ) : (
                          <div className="max-h-[34vh] overflow-y-auto">
                            {alphaHistory.map((h) => (
                              <div
                                key={h.id}
                                className="px-3 py-2 border-b border-[#111827] last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="ui-bg-text font-semibold text-[12px]">
                                    {h.pairName}
                                    <span className="ml-2 text-[10px] text-[#707070]">
                                      {new Date(h.ts).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div
                                    className={`font-bold ${h.result === "win" ? "text-[#22c1c3]" : "text-[#ef4444]"}`}
                                  >
                                    {h.result.toUpperCase()}
                                  </div>
                                </div>

                                <div className="mt-1 flex items-center justify-between text-[11px]">
                                  <span className="text-[#a0a0a0]">
                                    Risk:{" "}
                                    <span className="ui-bg-text font-semibold">
                                      {h.risk}
                                    </span>{" "}
                                    • Expected:{" "}
                                    <span className="ui-bg-text font-semibold">
                                      {Math.round(h.expected * 100)}%
                                    </span>
                                  </span>
                                  <span className="text-[#facc15] font-semibold">
                                    +{h.ap} AP
                                  </span>
                                </div>

                                <div className="mt-1 text-[10px] text-[#707070]">
                                  {h.breakdown ? (
                                    <>
                                      Base {h.breakdown.base} × res{" "}
                                      {h.breakdown.resultMult.toFixed(2)} × risk{" "}
                                      {h.breakdown.riskMult.toFixed(2)} × streak{" "}
                                      {h.breakdown.streakMult.toFixed(2)} × size{" "}
                                      {h.breakdown.sizeMult.toFixed(2)} ×
                                      premium{" "}
                                      {h.breakdown.premiumMult.toFixed(2)} × AI{" "}
                                      {h.breakdown.aiMult.toFixed(2)}
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HISTORY MODAL */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            className="fixed inset-0 ml-56 bg-black/90 flex items-center justify-center z-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative inset-5 bg-[#050816] border border-[#1f1f1f] rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] "
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.96 }}
            >
              {/* soft glow */}
              <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-15 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />

              <div className="relative z-10 space-y-4 text-xs">
                {/* header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
                      <HistoryIcon className="w-3.5 h-3.5 text-[#3b82f6]" />
                      <span className="text-[11px] text-[#a0a0a0]">
                        Prediction history
                      </span>
                    </div>
                    {/* <h3 className="text-sm font-semibold ui-bg-text ">
                Prediction history
              </h3> */}
                  </div>
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text "
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* summary row */}
                {historyBets.length > 0 &&
                  (() => {
                    const wins = historyBets.filter(
                      (b) => b.result === "win",
                    ).length;
                    const losses = historyBets.filter(
                      (b) => b.result === "lose",
                    ).length;
                    const total = historyBets.length;
                    const winRate =
                      total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

                    const net = historyBets.reduce((acc, b) => {
                      const v = Number(b.payout) - Number(b.amount);
                      return acc + (isNaN(v) ? 0 : v);
                    }, 0);

                    return (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f1f1f] bg-[#070b14] px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#707070]">
                            Rounds:
                          </span>
                          <span className="text-sm font-semibold ui-bg-text ">
                            {total}
                          </span>
                          <span className="w-px h-4 bg-[#1f1f1f]" />
                          <span className="text-[11px] text-[#707070]">
                            Win rate:
                          </span>
                          <span className="text-sm font-semibold text-[#3b82f6]">
                            {winRate}%
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-green-400">W: {wins}</span>
                          <span className="text-red-400">L: {losses}</span>
                          <span className="w-px h-4 bg-[#1f1f1f]" />
                          <span className="text-[#707070]">Net PnL:</span>
                          <span
                            className={`text-sm font-semibold ${
                              net > 0
                                ? "text-green-400"
                                : net < 0
                                  ? "text-red-400"
                                  : "ui-bg-text "
                            }`}
                          >
                            {net > 0 ? "+" : ""}
                            {net.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                {/* empty state */}
                {historyBets.length === 0 ? (
                  <div className="mt-2 text-center text-[#707070] text-sm py-8 bg-[#070b14] border border-dashed border-[#1f1f1f] rounded-xl">
                    No finished predictions yet.
                  </div>
                ) : (
                  <div className="mt-2 rounded-2xl border border-[#1f1f1f] overflow-hidden bg-[#070b14]">
                    {/* table header */}
                    <div className="grid grid-cols-6 gap-2 px-3 py-2 border-b border-[#1f1f1f] text-[11px] text-[#707070]">
                      <div className="col-span-2">Pair / Time</div>
                      <div>Direction</div>
                      <div>Result</div>
                      <div>Bet / Payout</div>
                      <div className="text-right">Currency</div>
                    </div>

                    {/* rows */}
                    <div className="max-h-[52vh] overflow-y-auto">
                      {historyBets.map((bet, idx) => {
                        const pair = pairsRef.current.find(
                          (p) => p.id === bet.id,
                        );
                        const dateStr = formatDateTime(
                          bet.endAt || bet.placedAt,
                        );
                        const isWin = bet.result === "win";

                        return (
                          <div
                            key={idx}
                            className="grid grid-cols-6 gap-2 px-3 py-2 text-[11px] items-center border-b border-[#111827] last:border-b-0 hover:bg-[#050816]/70 transition-colors"
                          >
                            {/* pair + time */}
                            <div className="col-span-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#050816] flex items-center justify-center border border-[#1f1f1f] overflow-hidden">
                                {pair && (
                                  <img
                                    src={`/icons/${pair.logo}.png`}
                                    alt={pair.pair}
                                    className="w-4 h-4 object-contain"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="ui-bg-text  font-semibold text-[12px]">
                                  {pair?.pair || "Pair"}
                                </div>
                                <div className="text-[10px] text-[#707070]">
                                  {dateStr}
                                </div>
                              </div>
                            </div>

                            {/* direction */}
                            <div>
                              <span
                                className={
                                  bet.dir === "up"
                                    ? "text-green-400 font-semibold"
                                    : "text-red-400 font-semibold"
                                }
                              >
                                {bet.dir.toUpperCase()}
                              </span>
                            </div>

                            {/* result badge */}
                            <div>
                              <span
                                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  isWin
                                    ? "bg-green-500/10 text-green-400 border border-green-500/40"
                                    : "bg-red-500/10 text-red-400 border border-red-500/40"
                                }`}
                              >
                                {bet.result.toUpperCase()}
                              </span>
                            </div>

                            {/* bet / payout */}
                            <div className="flex flex-col">
                              <span className="ui-bg-text ">
                                {bet.amount}{" "}
                                <span className="text-[#707070]">
                                  → {bet.payout}
                                </span>
                              </span>
                            </div>

                            {/* currency */}
                            <div className="text-right text-[#a0a0a0]">
                              {bet.currency}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Predictions;
