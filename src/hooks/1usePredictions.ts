import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export type Dir = 'up' | 'down';
export type Curr = 'USDT' | 'SOL';

export type Pair = {
  id: number;
  symbol: string;
  pair: string;
  price: number;
  change: number;
  high: number;
  low: number;
  open: number;
  vol: string;
  logo: string;
  mult: number;
};

export type Bet = {
  id: number; // pairId
  dir: Dir;
  amount: string;
  currency: Curr;
  placedAt: number;
  endAt: number;
  entryPrice: number;
};

export type SettledBet = Bet & {
  result: 'win' | 'lose';
  payout: string;
};

export type StreakData = {
  lastBetDay: string | null;
  streakDays: number;
  todayBets: number;
  claimable: boolean;
  totalRewards: number;
};

type MiniStats = {
  funding: number;
  volatility: number;
  deviation: number;
};

type AiSignal = {
  direction: Dir;
  probability: number; // 50..95
  confidence: 'Low' | 'Medium' | 'High';
  reason: string;
};

type AlphaRisk = 'Low' | 'Medium' | 'High' | 'Unknown';

type AlphaBreakdown = {
  base: number;
  resultMult: number;
  riskMult: number;
  streakMult: number;
  sizeMult: number;
  premiumMult: number;
  aiMult: number;
};

export type AlphaHistoryItem = {
  id: string;
  ts: number;

  pairId: number;
  pairName: string;

  result: 'win' | 'lose';
  dir: Dir;
  amount: string;
  currency: Curr;

  ap: number;
  expected: number; // 0..1
  risk: AlphaRisk;

  breakdown: AlphaBreakdown;
};

// ---------- storage helpers ----------
function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ---------- constants ----------
const STORAGE_ACTIVE = 'sv_predictions_active';
const STORAGE_HISTORY = 'sv_predictions_history';
const STORAGE_STREAK = 'sv_predictions_streak';

const STORAGE_ALPHA = 'sv_predictions_alpha';
const STORAGE_ALPHA_HISTORY = 'sv_predictions_alpha_history';
const STORAGE_WEEKLY_ALPHA = 'sv_predictions_weekly_alpha';
const STORAGE_WEEKLY_START = 'sv_predictions_weekly_start';
const STORAGE_HIDDEN_MMR = 'sv_predictions_hidden_mmr';

const FIVE_MIN = 5 * 60 * 1000;
const CANCEL_WINDOW = 20 * 1000;

const LIMITS: Record<Curr, { min: number; max: number }> = {
  USDT: { min: 5, max: 5000 },
  SOL: { min: 0.05, max: 50 },
};

const symbolsDefault = ['BTCUSDT', 'SOLUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'];

// ---------- formatting ----------
function formatVolume(v: number) {
  if (!isFinite(v)) return '0';
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(2)}K`;
  return v.toFixed(0);
}
function getDayKey(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------- “AI” + stats helpers ----------
function getRiskInfo(pair: Pair | null) {
  if (!pair) return { level: 'Unknown' as const };
  const vol = Math.abs(pair.change);
  if (vol < 2) return { level: 'Low' as const };
  if (vol < 5) return { level: 'Medium' as const };
  return { level: 'High' as const };
}

function getExtraStats(pair: Pair | null, miniStats: Record<number, MiniStats>) {
  if (!pair) return miniStats[1] ?? { funding: 0.02, volatility: 2, deviation: 1 };
  return miniStats[pair.id] ?? { funding: 0.02, volatility: 2, deviation: 1 };
}

// simple deterministic AI (demo)
function getAiSignal(pair: Pair | null, extra: MiniStats): AiSignal {
  if (!pair) {
    return {
      direction: 'up',
      probability: 50,
      confidence: 'Low',
      reason: 'Not enough data',
    };
  }

  const trendUp = pair.change >= 0;
  const base = 55 + Math.min(25, Math.abs(pair.change) * 3); // 55..80
  const volAdj = Math.min(10, extra.volatility); // 0..10
  const p = Math.max(50, Math.min(92, base + (trendUp ? 2 : -2) + volAdj * 0.2));

  const confidence: AiSignal['confidence'] = p >= 78 ? 'High' : p >= 64 ? 'Medium' : 'Low';
  return {
    direction: trendUp ? 'up' : 'down',
    probability: Math.round(p),
    confidence,
    reason: `Trend ${trendUp ? 'positive' : 'negative'} • Vol ${extra.volatility.toFixed(2)}`,
  };
}

// ---------- Alpha + Hidden MMR helpers ----------
export function getAlphaRank(ap: number) {
  if (ap >= 15000) return 'Diamond';
  if (ap >= 5000) return 'Platinum';
  if (ap >= 1500) return 'Gold';
  if (ap >= 500) return 'Silver';
  return 'Bronze';
}

function updateHiddenMMR(prev: number, win: boolean, expected: number, risk: AlphaRisk) {
  const Kbase = 24;
  const riskK = risk === 'High' ? 1.15 : risk === 'Medium' ? 1.0 : risk === 'Low' ? 0.9 : 1.0;
  const K = Kbase * riskK;

  const score = win ? 1 : 0;
  const next = prev + K * (score - expected);

  return Math.round(Math.max(600, Math.min(1800, next)));
}

function calcAlphaPoints(
  bet: SettledBet,
  expected: number,
  riskLevel: AlphaRisk,
  opts: { streakDays: number; hasPremium: boolean }
): { ap: number; breakdown: AlphaBreakdown } {
  const base = 10;

  const resultMult = bet.result === 'win' ? 1 : 0.25;

  const riskMult = riskLevel === 'Low' ? 1.0 : riskLevel === 'Medium' ? 1.3 : riskLevel === 'High' ? 1.6 : 1.0;

  const sd = opts.streakDays;
  const streakMult = sd >= 7 ? 2.0 : sd >= 5 ? 1.5 : sd >= 3 ? 1.2 : 1.0;

  const size = parseFloat(bet.amount || '0');
  const sizeMult = size < 20 ? 0.8 : size < 100 ? 1.0 : size < 500 ? 1.3 : 1.6;

  const premiumMult = opts.hasPremium ? 1.25 : 1.0;

  // win vs low expected => extra AP (beat-the-odds)
  const aiMult = bet.result === 'win' ? 1 + Math.min(0.5, Math.max(0, 1 - expected)) : 1.0;

  const ap = Math.max(0, Math.round(base * resultMult * riskMult * streakMult * sizeMult * premiumMult * aiMult));
  return { ap, breakdown: { base, resultMult, riskMult, streakMult, sizeMult, premiumMult, aiMult } };
}

// ---------- Hook ----------
export function usePredictions(opts: { connected: boolean; hasPremium: boolean }) {
  const { connected, hasPremium } = opts;

  const [symbols] = useState<string[]>(symbolsDefault);

  const [pairs, setPairs] = useState<Pair[]>(
    symbols.map((s, i) => {
      const base = s.replace('USDT', '');
      let logo = 'btc';
      if (base === 'SOL') logo = 'sol';
      else if (base === 'ETH') logo = 'eth';
      else if (base === 'BNB') logo = 'bnb';
      else if (base === 'XRP') logo = 'xrp';
      else if (base === 'DOGE') logo = 'doge';

      return {
        id: i + 1,
        symbol: s,
        pair: `${base}/USDT`,
        price: 0,
        change: 0,
        high: 0,
        low: 0,
        open: 0,
        vol: '0',
        logo,
        mult:
          base === 'SOL'
            ? 1.92
            : base === 'BTC'
              ? 1.85
              : base === 'ETH'
                ? 1.88
                : base === 'BNB'
                  ? 1.9
                  : base === 'XRP'
                    ? 1.95
                    : 2.0,
      };
    })
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

  const [activeBets, setActiveBets] = useState<Bet[]>(() => loadLS<Bet[]>(STORAGE_ACTIVE, []));
  const [historyBets, setHistoryBets] = useState<SettledBet[]>(() => loadLS<SettledBet[]>(STORAGE_HISTORY, []));

  const [streak, setStreak] = useState<StreakData>(() =>
    loadLS<StreakData>(STORAGE_STREAK, {
      lastBetDay: null,
      streakDays: 0,
      todayBets: 0,
      claimable: false,
      totalRewards: 0,
    })
  );

  // alpha + weekly + mmr
  const [alphaPoints, setAlphaPoints] = useState<number>(() => loadLS<number>(STORAGE_ALPHA, 0));
  const [alphaHistory, setAlphaHistory] = useState<AlphaHistoryItem[]>(() => loadLS<AlphaHistoryItem[]>(STORAGE_ALPHA_HISTORY, []));
  const [weeklyAlpha, setWeeklyAlpha] = useState<number>(() => loadLS<number>(STORAGE_WEEKLY_ALPHA, 0));
  const [weeklyStart, setWeeklyStart] = useState<number>(() => loadLS<number>(STORAGE_WEEKLY_START, Date.now()));
  const [hiddenMMR, setHiddenMMR] = useState<number>(() => loadLS<number>(STORAGE_HIDDEN_MMR, 1000));

  const [resultPopup, setResultPopup] = useState<(SettledBet & { pairName: string }) | undefined>();

  // UI state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [alphaOpen, setAlphaOpen] = useState(false);
  const [lbTab, setLbTab] = useState<'weekly' | 'all'>('weekly');

  const [modalOpen, setModalOpen] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Curr>('USDT');

  // refs
  const wsRef = useRef<WebSocket | null>(null);
  const pairsRef = useRef<Pair[]>(pairs);
  const streakRef = useRef<StreakData>(streak);
  useEffect(() => { pairsRef.current = pairs; }, [pairs]);
  useEffect(() => { streakRef.current = streak; }, [streak]);

  // persist
  useEffect(() => saveLS(STORAGE_ACTIVE, activeBets), [activeBets]);
  useEffect(() => saveLS(STORAGE_HISTORY, historyBets), [historyBets]);
  useEffect(() => saveLS(STORAGE_STREAK, streak), [streak]);

  useEffect(() => saveLS(STORAGE_ALPHA, alphaPoints), [alphaPoints]);
  useEffect(() => saveLS(STORAGE_ALPHA_HISTORY, alphaHistory), [alphaHistory]);
  useEffect(() => saveLS(STORAGE_WEEKLY_ALPHA, weeklyAlpha), [weeklyAlpha]);
  useEffect(() => saveLS(STORAGE_WEEKLY_START, weeklyStart), [weeklyStart]);
  useEffect(() => saveLS(STORAGE_HIDDEN_MMR, hiddenMMR), [hiddenMMR]);

  // weekly reset (rolling 7 days)
  useEffect(() => {
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - weeklyStart > WEEK) {
      setWeeklyStart(Date.now());
      setWeeklyAlpha(0);
    }
  }, [weeklyStart]);

  // websocket prices (binance)
  useEffect(() => {
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

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
            const ch = parseFloat(d.P || '0');
            const high = parseFloat(d.h || '0');
            const low = parseFloat(d.l || '0');
            const open = parseFloat(d.o || '0');

            const rawVol =
              d.q != null ? parseFloat(d.q)
                : d.v != null ? parseFloat(d.v)
                  : 0;

            return { ...p, price: last, change: ch, high, low, open, vol: formatVolume(rawVol) };
          })
        );
      } catch {
        // ignore
      }
    };

    ws.onclose = () => { wsRef.current = null; };
    return () => ws.close();
  }, [symbols]);

  // auto settle
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

            const won = bet.dir === 'up' ? lastPrice > bet.entryPrice : lastPrice < bet.entryPrice;
            const mult = pair?.mult ?? 1;
            const payout = won ? (parseFloat(bet.amount) * mult).toFixed(2) : '0';

            const sb: SettledBet = { ...bet, result: won ? 'win' : 'lose', payout };
            settled.push(sb);

            // ---- Alpha + MMR ----
            const extra = getExtraStats(pair ?? null, miniStats);
            const ai = getAiSignal(pair ?? null, extra);

            const aiP = Math.max(0.01, Math.min(0.99, ai.probability / 100));
            const expected = bet.dir === ai.direction ? aiP : 1 - aiP;

            const riskLevel = (pair ? getRiskInfo(pair).level : 'Unknown') as AlphaRisk;
            const streakDaysNow = streakRef.current.streakDays;

            const { ap, breakdown } = calcAlphaPoints(sb, expected, riskLevel, { streakDays: streakDaysNow, hasPremium });

            if (ap > 0) {
              setAlphaPoints((x) => x + ap);
              setWeeklyAlpha((x) => x + ap);

              setAlphaHistory((prevH) => {
                const item: AlphaHistoryItem = {
                  id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
                  ts: Date.now(),

                  pairId: sb.id,
                  pairName: pair?.pair || 'Pair',

                  result: sb.result,
                  dir: sb.dir,
                  amount: sb.amount,
                  currency: sb.currency,

                  ap,
                  expected,
                  risk: riskLevel,
                  breakdown,
                };
                return [item, ...prevH].slice(0, 40);
              });

              toast.success(`+${ap} Alpha Points`);
            }

            setHiddenMMR((prevM) => updateHiddenMMR(prevM, sb.result === 'win', expected, riskLevel));
          } else {
            stillActive.push(bet);
          }
        });

        if (settled.length > 0) {
          setHistoryBets((prevHist) => [...settled, ...prevHist].slice(0, 200));
          const first = settled[0];
          const pair = pairsRef.current.find((p) => p.id === first.id);
          if (pair) setResultPopup({ ...first, pairName: pair.pair });
        }

        return stillActive;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasPremium, miniStats]);

  // selected pair
  const selectedPair = useMemo(
    () => (modalOpen ? pairs.find((p) => p.id === modalOpen) || null : null),
    [modalOpen, pairs]
  );

  // hot pair
  const hotPair = useMemo<Pair | null>(() => {
    if (!pairs.length) return null;
    return pairs.reduce<Pair | null>((best, p) => {
      if (!best) return p;
      return Math.abs(p.change) > Math.abs(best.change) ? p : best;
    }, null);
  }, [pairs]);

  const selectedExtra = useMemo(() => getExtraStats(selectedPair, miniStats), [selectedPair, miniStats]);
  const selectedAi = useMemo(() => getAiSignal(selectedPair, selectedExtra), [selectedPair, selectedExtra]);

  const hotExtra = useMemo(() => getExtraStats(hotPair, miniStats), [hotPair, miniStats]);
  const hotAi = useMemo(() => getAiSignal(hotPair, hotExtra), [hotPair, hotExtra]);

  // actions
  const openModal = (id: number) => {
    setModalOpen(id);
    setAmount('');
    setCurrency('USDT');
  };
  const closeModal = () => setModalOpen(null);

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
        if (prev.lastBetDay === yesterday) streakDays += 1;
        else streakDays = 1;
        todayBets = 1;
      }

      if (streakDays >= 3) claimable = true;

      return { ...prev, lastBetDay: today, streakDays, todayBets, claimable };
    });
  };

  const claimAirdrop = () => {
    if (!streak.claimable) return;
    setStreak((prev) => ({ ...prev, claimable: false, totalRewards: prev.totalRewards + 1 }));
    toast.success('Airdrop claimed! (demo)');
  };

  const placeBet = (pairId: number, dir: Dir) => {
    if (!connected) return toast.error('Connect wallet first');

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter amount > 0');

    const { min, max } = LIMITS[currency];
    if (amt < min) return toast.error(`Minimum bet is ${min} ${currency}`);
    if (amt > max) return toast.error(`Maximum bet is ${max} ${currency}`);

    const pair = pairs.find((p) => p.id === pairId);
    if (!pair || !pair.price) return toast.error('No live price');

    const now = Date.now();
    const bet: Bet = {
      id: pairId,
      dir,
      amount,
      currency,
      placedAt: now,
      endAt: now + FIVE_MIN,
      entryPrice: pair.price,
    };

    setActiveBets((prev) => [bet, ...prev]);
    updateStreakOnBet();

    toast.success(`Bet placed: ${dir.toUpperCase()} on ${pair.pair}`);
    closeModal();
  };

  const cancelBet = (bet: Bet) => {
    const elapsed = Date.now() - bet.placedAt;
    if (elapsed > CANCEL_WINDOW) return toast.error('Cannot cancel after 20 seconds');

    setActiveBets((prev) => prev.filter((b) => !(b.id === bet.id && b.placedAt === bet.placedAt)));
    toast.success('Bet cancelled');
  };

  const timeLeft = (b: Bet) => Math.max(0, Math.ceil((b.endAt - Date.now()) / 1000));

  const possibleWin = (pairId: number, amtStr: string, curr: Curr) => {
    const p = pairs.find((x) => x.id === pairId);
    let mult = p?.mult ?? 1;
    if (hasPremium) mult += 0.15;
    const amt = parseFloat(amtStr || '0');
    if (!amt) return `0 ${curr}`;
    return `${(amt * mult).toFixed(2)} ${curr}`;
  };

  return {
    // data
    pairs,
    activeBets,
    historyBets,
    streak,

    // alpha/mmr
    alphaPoints,
    weeklyAlpha,
    alphaHistory,
    alphaRank: getAlphaRank(alphaPoints),
    hiddenMMR,

    // ai
    selectedPair,
    selectedAi,
    hotPair,
    hotAi,

    // ui state
    resultPopup,
    setResultPopup,

    historyOpen,
    setHistoryOpen,

    alphaOpen,
    setAlphaOpen,

    lbTab,
    setLbTab,

    modalOpen,
    amount,
    setAmount,
    currency,
    setCurrency,

    // helpers/actions
    openModal,
    closeModal,
    placeBet,
    cancelBet,
    timeLeft,
    possibleWin,
    claimAirdrop,
    getRiskInfo,
  };
}
