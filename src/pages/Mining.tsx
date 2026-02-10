import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Zap,
  Cpu,
  Shield,
  TrendingUp,
  Clock,
  ArrowRight,
  Check,
  X,
  Wrench,
  Coins,
  Layers,
  Activity as ActivityIcon,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Gift,
  Copy,
  BadgeCheck,
  Info,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

type PayMethod = "USDT" | "BNB";
type RigStatus = "active" | "paused";
type UpgradeKind = "multiplier" | "flat";
type UpgradeSlot = 1 | 2;
type RigTier = "Starter" | "Pro" | "Elite";

interface RigDefinition {
  id: string;
  name: string;
  tier: RigTier;
  description: string;
  icon: "cpu" | "zap" | "shield";
  price: { USDT: number; BNB: number };
  baseRatePerHour: number;
  badge?: string;
}

interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  kind: UpgradeKind;
  value: number; // multiplier (0.15) OR flat add
  price: { USDT: number; BNB: number };
  badge?: string;
  highlight?: boolean;
}

interface EquippedUpgrade {
  defId: string;
  slot: UpgradeSlot;
  equippedAt: number;
}

interface OwnedRig {
  uid: string;
  defId: string;
  purchasedAt: number;
  status: RigStatus;
  equipped: EquippedUpgrade[]; // max 2
  lastAccrualAt: number;
  minedTotal: number;
}

interface MiningLedger {
  platformBalanceSVT: number;
  lastEngineTickAt: number;
}

interface ActivityItem {
  id: string;
  ts: number;
  type:
    | "BUY_RIG"
    | "BUY_EQUIP_UPGRADE"
    | "PAUSE_RIG"
    | "RESUME_RIG"
    | "ENGINE_ACCRUAL"
    | "REF_COPY";
  title: string;
  details?: string;
  amount?: number;
}

const STORAGE_KEY = "svt_auto_mining_rigs_v5";
const LEDGER_KEY = "svt_auto_mining_ledger_v5";
const ACTIVITY_KEY = "svt_auto_mining_activity_v5";
const REF_KEY = "svt_auto_mining_ref_v1";

const fmt = (n: number, d = 2) => Number(n || 0).toFixed(d);
const uid = () =>
  Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
const hoursBetween = (a: number, b: number) => Math.max(0, (b - a) / 3600000);

const LOGOS: Record<PayMethod, string> = {
  USDT: "https://www.svgrepo.com/show/367256/usdt.svg",
  BNB: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/vectors/bnb-2c9adc7qw85po528q8y3b.png/bnb-tss7lyzvhxyjfc9ivae0l.png?_a=DATAg1AAZAA0",
};

const rigDefs: RigDefinition[] = [
  {
    id: "rig_starter",
    name: "Nano Miner",
    tier: "Starter",
    description: "Entry rig for stable daily SVT. Best for new users.",
    icon: "cpu",
    price: { USDT: 35, BNB: 0.08 },
    baseRatePerHour: 2.2,
    badge: "Beginner",
  },
  {
    id: "rig_pro",
    name: "Quantum Miner",
    tier: "Pro",
    description: "Balanced rig with strong hourly yield and great ROI.",
    icon: "zap",
    price: { USDT: 120, BNB: 0.28 },
    baseRatePerHour: 8.5,
    badge: "Best ROI",
  },
  {
    id: "rig_elite",
    name: "Aegis Miner",
    tier: "Elite",
    description: "High-end miner with premium yield and top performance.",
    icon: "shield",
    price: { USDT: 320, BNB: 0.72 },
    baseRatePerHour: 24.0,
    badge: "Top Yield",
  },
];

const upgradeDefs: UpgradeDefinition[] = [
  {
    id: "up_mult_15",
    name: "Turbo Coil +15%",
    description: "Boosts rig yield by +15%. Consumed after equip.",
    kind: "multiplier",
    value: 0.15,
    price: { USDT: 25, BNB: 0.06 },
    badge: "Popular",
    highlight: true,
  },
  {
    id: "up_mult_35",
    name: "Overclock Chip +35%",
    description: "Boosts rig yield by +35%. Consumed after equip.",
    kind: "multiplier",
    value: 0.35,
    price: { USDT: 55, BNB: 0.13 },
    badge: "High impact",
  },
  {
    id: "up_flat_3",
    name: "Aux Module +3 SVT/h",
    description: "Adds +3 SVT/h to the rig. Consumed after equip.",
    kind: "flat",
    value: 3,
    price: { USDT: 40, BNB: 0.09 },
    badge: "Stable",
  },
];

function iconNode(name: RigDefinition["icon"]) {
  const cls = "w-4 h-4";
  if (name === "cpu") return <Cpu className={cls} />;
  if (name === "zap") return <Zap className={cls} />;
  return <Shield className={cls} />;
}

function getRigDef(defId: string) {
  const d = rigDefs.find((r) => r.id === defId);
  if (!d) throw new Error(`Rig def not found: ${defId}`);
  return d;
}
function getUpgradeDef(defId: string) {
  const d = upgradeDefs.find((u) => u.id === defId);
  if (!d) throw new Error(`Upgrade def not found: ${defId}`);
  return d;
}

function calcRigRatePerHour(rig: OwnedRig) {
  const def = getRigDef(rig.defId);
  let mult = 0;
  let flat = 0;

  rig.equipped.forEach((eq) => {
    const udef = getUpgradeDef(eq.defId);
    if (udef.kind === "multiplier") mult += udef.value;
    if (udef.kind === "flat") flat += udef.value;
  });

  return def.baseRatePerHour * (1 + mult) + flat;
}

function calcPaybackDays(priceUsd: number, svtPerDay: number, svtUsd = 0.05) {
  const dailyUsd = svtPerDay * svtUsd;
  if (dailyUsd <= 0) return Infinity;
  return priceUsd / dailyUsd;
}

function prettyTs(ts: number) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
}

const Badge: React.FC<{ text: string }> = ({ text }) => (
  <span className="px-2 py-1 rounded-md text-[10px] font-semibold border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]">
    {text}
  </span>
);

const MiniStat: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
}> = ({ label, value, accent }) => (
  <div className="ui-inner rounded-lg p-3">
    <div className="text-[10px] text-[#707070]">{label}</div>
    <div
      className={`text-xs font-semibold mt-1 ${accent ? "text-[#3b82f6]" : "text-[#e0e0e0]"}`}
    >
      {value}
    </div>
  </div>
);

function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PayMethod;
  onChange: (v: PayMethod) => void;
}) {
  const options: {
    value: PayMethod;
    label: string;
    logo: string;
    sub: string;
  }[] = [
    { value: "USDT", label: "USDT", logo: LOGOS.USDT, sub: "Stable payment" },
    { value: "BNB", label: "BNB", logo: LOGOS.BNB, sub: "Fast payment" },
  ];

  return (
    <div>
  <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1.5">
        Payment method
      </div>
  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          value === opt.value
            ? "border-[#3b82f6]/50 bg-[#3b82f6]/10"
            : "ui-inner border-[#3b82f6]/5 hover:border-[#3b82f6]/50"
        }`}
      >
        {/* radio dot */}
        {/* <div className="relative w-3 h-3 rounded-full border-2 border-[#3b82f6] flex items-center justify-center">
          {value === opt.value && <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />}
        </div> */}

        {/* icon */}
        <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center">
          <img src={opt.logo} alt={opt.label} className="w-6 h-6 object-contain" />
        </div>

        {/* text */}
        <div className="flex flex-col items-start">
          <div className="text-xs font-semibold text-[#e0e0e0]">{opt.label}</div>
          <div className="text-[10px] text-[#707070]">{opt.sub}</div>
        </div>

        {/* checkmark */}
        {/* {value === opt.value && <Check className="w-3 h-3 text-[#3b82f6]" />} */}
      </button>
    ))}
  </div>
</div>
  );
}

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed -inset-5 z-50 flex items-center backdrop-blur justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl ui-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-[#e0e0e0]">{title}</div>
            {subtitle && (
              <div className="text-xs text-[#707070] mt-1">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg ui-inner flex items-center justify-center text-[#707070] hover:text-[#e0e0e0]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function VirtualCardShop() {
  const svtUsd = 0.05;

  const [ledger, setLedger] = useState<MiningLedger>({
    platformBalanceSVT: 0,
    lastEngineTickAt: Date.now(),
  });

  const [ownedRigs, setOwnedRigs] = useState<OwnedRig[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const [showMoreActivity, setShowMoreActivity] = useState(false);

  // Purchase Rig modal
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedRigId, setSelectedRigId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("USDT");

  // Rings modal (upgrades inside)
  const [ringsOpen, setRingsOpen] = useState(false);
  const [ringsRigUid, setRingsRigUid] = useState<string | null>(null);
  const [activeRing, setActiveRing] = useState<UpgradeSlot>(1);
  const [upgradePayMethod, setUpgradePayMethod] = useState<PayMethod>("USDT");

  // Referral
  const [refCode, setRefCode] = useState<string>("SVT-");
  const [refClicks, setRefClicks] = useState<number>(0);
  const [refSignups, setRefSignups] = useState<number>(0);
  const [refEarnings, setRefEarnings] = useState<number>(0);

  // ===== Load storage =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOwnedRigs(JSON.parse(raw));

      const lraw = localStorage.getItem(LEDGER_KEY);
      if (lraw) setLedger(JSON.parse(lraw));

      const araw = localStorage.getItem(ACTIVITY_KEY);
      if (araw) setActivity(JSON.parse(araw));

      const rraw = localStorage.getItem(REF_KEY);
      if (rraw) {
        const parsed = JSON.parse(rraw);
        setRefCode(parsed.refCode || "SVT-");
        setRefClicks(parsed.refClicks || 0);
        setRefSignups(parsed.refSignups || 0);
        setRefEarnings(parsed.refEarnings || 0);
      } else {
        const auto = `SVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        setRefCode(auto);
      }
    } catch {
      // ignore
    }
  }, []);

  // ===== Save storage =====
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ownedRigs));
    } catch {}
  }, [ownedRigs]);

  useEffect(() => {
    try {
      localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
    } catch {}
  }, [ledger]);

  useEffect(() => {
    try {
      localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(activity.slice(0, 200)),
      );
    } catch {}
  }, [activity]);

  useEffect(() => {
    try {
      localStorage.setItem(
        REF_KEY,
        JSON.stringify({ refCode, refClicks, refSignups, refEarnings }),
      );
    } catch {}
  }, [refCode, refClicks, refSignups, refEarnings]);

  // ===== Auto Mining Engine (timestamp accrual) =====
  useEffect(() => {
    const tick = () => {
      const now = Date.now();

      setOwnedRigs((prev) => {
        let minted = 0;

        const next = prev.map((rig) => {
          if (rig.status !== "active") return rig;

          const elapsedHours = hoursBetween(rig.lastAccrualAt || now, now);
          if (elapsedHours <= 0) return { ...rig, lastAccrualAt: now };

          const rateH = calcRigRatePerHour(rig);
          const delta = rateH * elapsedHours;

          minted += delta;

          return {
            ...rig,
            lastAccrualAt: now,
            minedTotal: (rig.minedTotal || 0) + delta,
          };
        });

        if (minted > 0.0001) {
          setLedger((prevL) => ({
            platformBalanceSVT: (prevL.platformBalanceSVT || 0) + minted,
            lastEngineTickAt: now,
          }));

          setActivity((prevA) => [
            {
              id: uid(),
              ts: now,
              type: "ENGINE_ACCRUAL",
              title: "Auto Mining Engine",
              details: `+${fmt(minted, 2)} SVT added to Platform Balance`,
              amount: minted,
            },
            ...prevA,
          ]);
        } else {
          setLedger((prevL) => ({ ...prevL, lastEngineTickAt: now }));
        }

        return next;
      });
    };

    const t0 = setTimeout(tick, 350);
    const interval = setInterval(tick, 10000);
    return () => {
      clearTimeout(t0);
      clearInterval(interval);
    };
  }, []);

  // ===== Derived =====
  const totalHourly = useMemo(() => {
    return ownedRigs.reduce(
      (sum, r) => (r.status === "active" ? sum + calcRigRatePerHour(r) : sum),
      0,
    );
  }, [ownedRigs]);

  const totalDaily = totalHourly * 24;
  const activeRigsCount = ownedRigs.filter((r) => r.status === "active").length;

  const activityVisible = showMoreActivity ? activity : activity.slice(0, 4);

  // ===== AI Recommendation =====
  const aiRec = useMemo(() => {
    const hasAny = ownedRigs.length > 0;
    const best = ownedRigs
      .slice()
      .sort((a, b) => calcRigRatePerHour(b) - calcRigRatePerHour(a))[0];

    if (!hasAny) {
      const pro = rigDefs.find((r) => r.id === "rig_pro")!;
      const perDay = pro.baseRatePerHour * 24;
      const payback = calcPaybackDays(pro.price.USDT, perDay, svtUsd);

      return {
        badge: "Start path",
        headline: "Buy Quantum Miner first",
        reasons: [
          "Best ROI in the shop (balanced cost vs yield)",
          "Scales extremely well with multiplier rings",
          "Great starting point before Elite tier",
        ],
        quick: {
          daily: `${fmt(perDay, 2)} SVT/day`,
          payback: payback === Infinity ? "—" : `${fmt(payback, 0)} days`,
        },
        steps: [
          { title: "Step 1", text: "Purchase Quantum Miner" },
          {
            title: "Step 2",
            text: "Open rings and equip +15% to accelerate ROI",
          },
        ],
        action: { kind: "BUY_RIG" as const, rigId: "rig_pro" },
      };
    }

    const bestDef = best ? getRigDef(best.defId) : null;
    const currentDaily = best ? calcRigRatePerHour(best) * 24 : 0;

    return {
      badge: "Optimize yield",
      headline: `Upgrade your ${bestDef?.name ?? "best rig"}`,
      reasons: [
        "Multipliers give the biggest impact on higher-tier rigs",
        "Ring upgrades are consumed (clean setup, no inventory clutter)",
        "You can run rigs 24/7 with timestamp accrual",
      ],
      quick: {
        daily: `${fmt(currentDaily, 2)} SVT/day`,
        payback: "Varies by upgrade",
      },
      steps: [
        { title: "Step 1", text: "Open Manage Rings for your best rig" },
        { title: "Step 2", text: "Equip +35% for max daily performance" },
      ],
      action: { kind: "OPEN_RINGS" as const },
      bestRigUid: best?.uid,
    };
  }, [ownedRigs]);

  // ===== Actions =====
  const openPurchaseRig = (rigId: string) => {
    setSelectedRigId(rigId);
    setPayMethod("USDT");
    setPurchaseOpen(true);
  };

  const confirmBuyRig = () => {
    if (!selectedRigId) return;
    const def = getRigDef(selectedRigId);
    const now = Date.now();

    const newRig: OwnedRig = {
      uid: uid(),
      defId: def.id,
      purchasedAt: now,
      status: "active",
      equipped: [],
      lastAccrualAt: now,
      minedTotal: 0,
    };

    setOwnedRigs((prev) => [newRig, ...prev]);
    setActivity((prev) => [
      {
        id: uid(),
        ts: now,
        type: "BUY_RIG",
        title: `Purchased rig: ${def.name}`,
        details: `Paid ${def.price[payMethod]} ${payMethod}`,
      },
      ...prev,
    ]);

    toast.success(`Rig purchased: ${def.name}`);
    setPurchaseOpen(false);
  };

  const toggleRigStatus = (rigUid: string) => {
    const now = Date.now();
    setOwnedRigs((prev) =>
      prev.map((r) => {
        if (r.uid !== rigUid) return r;
        const nextStatus: RigStatus =
          r.status === "active" ? "paused" : "active";
        return {
          ...r,
          status: nextStatus,
          lastAccrualAt: nextStatus === "active" ? now : r.lastAccrualAt,
        };
      }),
    );

    const rig = ownedRigs.find((r) => r.uid === rigUid);
    if (rig) {
      const def = getRigDef(rig.defId);
      setActivity((prev) => [
        {
          id: uid(),
          ts: now,
          type: rig.status === "active" ? "PAUSE_RIG" : "RESUME_RIG",
          title: `${rig.status === "active" ? "Paused" : "Resumed"} rig: ${def.name}`,
        },
        ...prev,
      ]);
    }
  };

  const openRingsModal = (rigUid: string) => {
    setRingsRigUid(rigUid);
    setActiveRing(1);
    setUpgradePayMethod("USDT");
    setRingsOpen(true);
  };

  const equipUpgradeToActiveRing = (upgradeId: string) => {
    if (!ringsRigUid) return;

    const now = Date.now();
    const udef = getUpgradeDef(upgradeId);

    setOwnedRigs((prev) =>
      prev.map((r) => {
        if (r.uid !== ringsRigUid) return r;

        if (r.equipped.some((e) => e.slot === activeRing)) {
          toast.error(`Ring ${activeRing} is already occupied`);
          return r;
        }
        if (r.equipped.length >= 2) {
          toast.error("This rig already has 2 rings equipped");
          return r;
        }

        return {
          ...r,
          equipped: [
            ...r.equipped,
            { defId: upgradeId, slot: activeRing, equippedAt: now },
          ],
        };
      }),
    );

    const rig = ownedRigs.find((r) => r.uid === ringsRigUid);
    if (rig) {
      const rdef = getRigDef(rig.defId);
      setActivity((prev) => [
        {
          id: uid(),
          ts: now,
          type: "BUY_EQUIP_UPGRADE",
          title: `Upgrade equipped: ${udef.name}`,
          details: `${rdef.name} • Ring ${activeRing} • Paid ${udef.price[upgradePayMethod]} ${upgradePayMethod}`,
        },
        ...prev,
      ]);
    }

    toast.success(`Equipped: ${udef.name} (consumed)`);
  };

  const slotLabel = (rig: OwnedRig, slot: UpgradeSlot) => {
    const eq = rig.equipped.find((e) => e.slot === slot);
    if (!eq) return "Empty ring";
    return getUpgradeDef(eq.defId).name;
  };

  // Referral link
  const referralLink = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://solanaverse.app";
    return `${origin}/?ref=${encodeURIComponent(refCode)}`;
  }, [refCode]);

  const totalRigs = ownedRigs.length;
  const activeRigs = ownedRigs.filter((r) => r.status === "active").length;
  const totalDailyYield = ownedRigs.reduce((sum, rig) => {
    return sum + calcRigRatePerHour(rig) * 24;
  }, 0);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied");
      setActivity((prev) => [
        {
          id: uid(),
          ts: Date.now(),
          type: "REF_COPY",
          title: "Copied referral link",
        },
        ...prev,
      ]);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Кожному майнеру (def.id) свій фон
  const rigBG: Record<string, string> = {
    // 🔥 ПІДСТАВ СЮДИ СВОЇ id З rigDefs
    // приклад:
    rig_starter: "./premium/predictions.png",
    rig_pro: "/premium/rewards.png",
    rig_elite: "/premium/staking.png",
    // якщо якогось id не буде в цьому списку — підставиться дефолтна картинка:
    default: "/rigs/default.png",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between gap-4">
          <div className="ui-card grid grid-cols-1 md:grid-cols-[3.5fr_1fr] rounded-2xl p-5 relative overflow-hidden ">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 card-gradient-soft" />
            <img
              src="/77.png"
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

                  <span className="inline-flex items-center gap-1 text-[12px] rounded-full border border-[#1f1f1f] bg-[#050816]/90 px-3  text-[#eee]">
                    Free preview – full analytics with Premium
                  </span>
                </div>

                <h1 className="text-4xl font-bold ui-bg-text">
                  Auto <br />
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
                    Mining
                  </motion.span>
                </h1>

                <div className="mt-1 text-[11px]"></div>

                <p className="mt-1 text-sm text-[#a0a0a0] w-96 ">
                  Buy a rig → it mines automatically. Upgrade only inside the
                  rig rings modal.
                </p>

                {/* 🔥 NEW STATS ROW UNDER TITLE */}
                <div className="mt-3 rounded-2xl flex flex-wrap gap-2 w-96 ">
                  <div className="hidden md:flex items-center gap-2">
                    <div className="px-3 py-2 rounded-lg ui-card">
                      <div className="text-[10px] text-[#707070]">
                        Auto Mining Engine
                      </div>
                      <div className="text-xs font-semibold text-[#3b82f6] flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Running
                      </div>
                    </div>
                  </div>
                </div>
                <div className=" mt-6 border-t border-[#eee]/10 w-96" />
                <div className="mt-4 flex items-center gap-2 "></div>
              </div>
            </div>
            
          </div>
          {/* Top Stats */}
          <div className="ui-card flex flex-col rounded-xl p-4">
            <span className="text-left text-md font-bold mt-0 mb-4 ">Active Stats</span>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr]  z-10 gap-4">
        <div className="ui-inner rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[#707070]">Platform Balance</div>
            <Coins className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-lg font-semibold text-[#e0e0e0]">
            {fmt(ledger.platformBalanceSVT, 2)}{" "}
            <span className="text-[#707070] text-xs">SVT</span>
          </div>
          <div className="text-[10px] text-[#707070] mt-1">
            Last tick: {prettyTs(ledger.lastEngineTickAt)}
          </div>
        </div>

        <div className="ui-inner rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[#707070]">Active Rigs</div>
            <Layers className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-lg font-semibold text-[#e0e0e0]">
            {activeRigsCount}
          </div>
          <div className="text-[10px] text-[#707070] mt-1">
            Total owned: {ownedRigs.length}
          </div>
        </div>

        <div className="ui-inner rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[#707070]">Hourly Yield</div>
            <TrendingUp className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-lg font-semibold text-[#e0e0e0]">
            {fmt(totalHourly, 2)}{" "}
            <span className="text-[#707070] text-xs">SVT/h</span>
          </div>
          <div className="text-[10px] text-[#707070] mt-1">
            ≈ {fmt(totalDaily, 2)} SVT/day
          </div>
        </div>

        <div className="ui-inner rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[#707070]">Est. $/day</div>
            <Sparkles className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-lg font-semibold text-[#e0e0e0]">
            ${fmt(totalDaily * svtUsd, 2)}
          </div>
          <div className="text-[10px] text-[#707070] mt-1">
            SVT price (UI): ${fmt(svtUsd, 2)}
          </div>
        </div>
      </div>
      </div>
        </div>
      </div>

      
      

      {/* Referral + AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral */}
        {/* Referral */}
        <div className="ui-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl ui-inner flex items-center justify-center text-[#3b82f6]">
                <Gift className="w-9 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  Referral Program
                </div>
                <div className="text-[11px] text-[#707070] mt-0.5">
                  Invite friends → they buy rigs → you earn a share (UI demo
                  only).
                </div>
              </div>
            </div>
            <Badge text="New" />
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat label="Clicks" value={`${refClicks}`} />
            <MiniStat label="Signups" value={`${refSignups}`} accent />
            <MiniStat label="Earnings" value={`${fmt(refEarnings, 2)} SVT`} />
          </div>

          {/* Joined users preview */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-[#a0a0a0]">
                Users joined
              </div>
              <span className="text-[10px] text-[#707070]">
                Demo avatars · not on-chain
              </span>
            </div>

            <div className="mt-2 flex -space-x-2">
              <div className="w-7 h-7 rounded-full ui-inner border border-[#1f1f1f] flex items-center justify-center text-[10px] text-[#e0e0e0]">
                0xA
              </div>
              <div className="w-7 h-7 rounded-full ui-inner border border-[#1f1f1f] flex items-center justify-center text-[10px] text-[#e0e0e0]">
                0xF
              </div>
              <div className="w-7 h-7 rounded-full ui-inner border border-[#1f1f1f] flex items-center justify-center text-[10px] text-[#e0e0e0]">
                0x9
              </div>
              <div className="w-7 h-7 rounded-full bg-[#0b0b0b] border border-[#1f1f1f] flex items-center justify-center text-[10px] text-[#a0a0a0]">
                +{Math.max(refSignups, 3)}
              </div>
            </div>

            <div className="mt-2 text-[11px] text-[#a0a0a0]">
              At least{" "}
              <span className="font-semibold text-[#e0e0e0]">
                {Math.max(refSignups, 3)} users
              </span>{" "}
              are shown as joined.
            </div>
          </div>

          {/* Link */}
          <div className="mt-4">
            <div className="text-xs font-medium text-[#a0a0a0] mb-2">
              Your link
            </div>
            <div className="flex gap-2">
              <input
                value={referralLink}
                readOnly
                className="w-full px-3 py-2 rounded-lg ui-input border border-[#1f1f1f] text-[#e0e0e0] text-xs"
              />
              <button
                onClick={copyRef}
                className="px-3 py-2 rounded-lg btn-primary hover:bg-[#6366f1]/80 text-white text-xs font-normal flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                
              </button>
            </div>
          </div>

          <div className="mt-4 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3 text-[11px] text-[#a0a0a0] flex gap-2">
            <Info className="w-4 h-4 text-[#3b82f6] mt-0.5" />
            Referral payouts will later be connected to platform balance, XP and
            real on-chain rewards.
          </div>
        </div>

        {/* AI Recommendation (more content) */}
        <div className="lg:col-span-2 ui-card rounded-2xl p-5 relative overflow-hidden">
          {/* <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_left_top,_#6366f1_0,_transparent_35%)]" /> */}
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl ui-inner flex items-center justify-center text-[#a855f7]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    AI Recommendation
                  </div>
                  <div className="text-[11px] text-[#707070] mt-0.5">
                    A smart suggestion based on your current state.
                  </div>
                </div>
              </div>
              <Badge text={aiRec.badge} />
            </div>

            <div className="mt-4 text-base font-semibold text-[#e0e0e0]">
              {aiRec.headline}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <MiniStat
                label="Suggested daily"
                value={aiRec.quick.daily}
                accent
              />
              <MiniStat label="Est. payback" value={aiRec.quick.payback} />
              <MiniStat label="Strategy" value="ROI → Upgrade → Scale" />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="ui-inner rounded-xl p-4">
                <div className="text-xs font-semibold text-[#e0e0e0] mb-2 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-[#22c55e]" />
                  Why this is recommended
                </div>
                <ul className="space-y-2 text-[11px] text-[#a0a0a0]">
                  {aiRec.reasons.map((r, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ui-inner rounded-xl p-4">
                <div className="text-xs font-semibold text-[#e0e0e0] mb-2">
                  Suggested path
                </div>
                <div className="space-y-2">
                  {aiRec.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className=""
                    >
                      <div className="text-[10px] text-[#707070]">
                        {s.title}
                      </div>
                      <div className="text-xs font-semibold text-[#e0e0e0] mt-1">
                        {s.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-2">
              {aiRec.action.kind === "BUY_RIG" ? (
                <button
                  onClick={() => openPurchaseRig(aiRec.action.rigId)}
                  className="px-4 py-2 rounded-lg btn-primary hover:bg-[#6366f1] text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  Buy recommended rig <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    const best = (aiRec as any).bestRigUid as
                      | string
                      | undefined;
                    if (!best) return toast.error("Buy a rig first");
                    openRingsModal(best);
                  }}
                  className="px-4 py-2 rounded-lg btn-primary hover:bg-[#6366f1] text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  Open rings <Wrench className="w-4 h-4" />
                </button>
              )}

              <div className="flex-1 ui-input rounded-lg px-3 py-2 text-[11px] text-[#a0a0a0] flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-[#22c55e]" />
                Tip: Use multipliers on Pro/Elite rigs for maximum impact.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Rigs (GRID) */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl ui-card border border-[#1f1f1f] flex items-center justify-center text-[#3b82f6]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e0e0e0]">
                Purchase Rigs
              </div>
              <div className="text-[11px] text-[#707070] mt-0.5">
                Pick a rig from the grid. Upgrades are only applied inside
                rings.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rigDefs.map((def) => {
            const perDay = def.baseRatePerHour * 24;
            const payback = calcPaybackDays(def.price.USDT, perDay, svtUsd);

            return (
              <div
                key={def.id}
                className="relative rounded-2xl border  border-[#1f1f1f] hover:border-[#2a2a2a] transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* ФОН КАРТКИ ДЛЯ КОНКРЕТНОГО МАЙНЕРА */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${rigBG[def.id] || rigBG.default}')`,
                  }}
                >
                  {/* ТІЛЬКИ ЗАТЕМНЕННЯ КАРТИНКИ */}
                  <div className="absolute inset-0 bg-black/80" />
                </div>

                {/* КОНТЕНТ КАРТКИ */}
                <div className="relative p-5 bg-[#121212]/70 backdrop-blur-[2px] flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center text-[#3b82f6]">
                          {iconNode(def.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-[#e0e0e0]">
                              {def.name}
                            </div>
                            {def.badge && <Badge text={def.badge} />}
                          </div>
                          <div className="text-[11px] text-[#707070] mt-0.5">
                            {def.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-[11px] text-[#a0a0a0]">
                      <div>
                        <span className="text-[#e0e0e0] font-semibold">
                          {fmt(def.baseRatePerHour, 2)} SVT/h
                        </span>
                        <span className="text-[#707070] mx-1">•</span>
                        {fmt(perDay, 2)} SVT/day
                      </div>
                      <div>
                        Payback (UI):{" "}
                        {payback === Infinity ? "—" : `${fmt(payback, 0)} days`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-[#707070]">Price</div>
                      <div className="text-xs font-semibold text-[#e0e0e0]">
                        {def.price.USDT} USDT{" "}
                        <span className="text-[#707070]">/</span>{" "}
                        {def.price.BNB} BNB
                      </div>
                    </div>
                    <button
                      onClick={() => openPurchaseRig(def.id)}
                      className="w-full px-3 py-2 rounded-lg btn-primary hover:bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      Buy rig
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your Rigs (compact grid + summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: grid with rigs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header + quick stats */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl ui-card flex items-center justify-center text-[#3b82f6]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  Your rigs
                </div>
                <div className="text-[11px] text-[#707070] mt-0.5">
                  Overview of all your mining power.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <div className="px-2 py-1 rounded-full ui-card text-[#a0a0a0]">
                Total:{" "}
                <span className="text-[#e0e0e0] font-semibold">
                  {totalRigs}
                </span>{" "}
                rigs
              </div>
              <div className="px-2 py-1 rounded-full ui-card text-[#a0a0a0]">
                Active:{" "}
                <span className="text-emerald-400 font-semibold">
                  {activeRigs}
                </span>
              </div>
              <div className="px-2 py-1 rounded-full ui-card text-[#a0a0a0]">
                ~{" "}
                <span className="text-[#22c1c3] font-semibold">
                  {fmt(totalDailyYield, 1)} SVT/day
                </span>
              </div>
            </div>
          </div>

          {/* EMPTY STATE / GRID */}
          {ownedRigs.length === 0 ? (
            <div className="ui-card border border-dashed border-[#eee]/10 rounded-2xl p-6 text-center space-y-2">
              <div className="text-sm text-[#e0e0e0] font-semibold">
                No rigs yet
              </div>
              <div className="text-xs text-[#707070]">
                Start with one rig above to begin mining SVT on autopilot.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownedRigs.map((rig) => {
                const def = getRigDef(rig.defId);
                const rateH = calcRigRatePerHour(rig);
                const rateD = rateH * 24;

                return (
                  <div
                    key={rig.uid}
                    className="ui-card rounded-2xl p-4  transition-all"
                  >
                    {/* Top row: icon + name + status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl ui-inner flex items-center justify-center text-[#3b82f6]">
                          {iconNode(def.icon)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#e0e0e0]">
                            {def.name}
                          </div>
                          <div className="text-[10px] text-[#707070] mt-0.5">
                            Purchased: {prettyTs(rig.purchasedAt)}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          rig.status === "active"
                            ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
                            : "bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20"
                        }`}
                      >
                        {rig.status === "active" ? "Active" : "Paused"}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <MiniStat
                        label="Yield"
                        value={`${fmt(rateH, 2)} SVT/h`}
                        accent
                      />
                      <MiniStat
                        label="Daily"
                        value={`${fmt(rateD, 2)} SVT/day`}
                      />
                      <MiniStat
                        label="Mined"
                        value={`${fmt(rig.minedTotal || 0, 1)} SVT`}
                      />
                    </div>

                    {/* Rings inline */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full ui-inner border border-[#1f1f1f] text-[#e0e0e0]">
                        Rings {rig.equipped.length}/2
                      </span>
                      <span className="text-[#a0a0a0] truncate">
                        {slotLabel(rig, 1)}
                        {rig.equipped.length > 1 && <> • {slotLabel(rig, 2)}</>}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => openRingsModal(rig.uid)}
                        className="flex-1 px-3 py-2 rounded-lg ui-input hover:bg-[#eee]/10 text-[#e0e0e0] text-[11px] font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5 text-[#a855f7]" />
                        Manage rings
                      </button>

                      <button
                        onClick={() => toggleRigStatus(rig.uid)}
                        className={`px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                          rig.status === "active"
                            ? "ui-inner text-[#f97316]"
                            : "bg-[#3b82f6] hover:bg-[#2563eb] border-[#3b82f6]/80 text-white"
                        }`}
                      >
                        {rig.status === "active" ? "Pause" : "Resume"}
                      </button>
                    </div>

                    <div className="mt-3 text-[10px] text-[#707070] flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Yield accrues by timestamp, even while you&apos;re
                      offline.
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl ui-card flex items-center justify-center text-[#3b82f6]">
                <ActivityIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  Activity
                </div>
                <div className="text-[11px] text-[#707070] mt-0.5">
                  Recent actions + engine ticks.
                </div>
              </div>
            </div>
          </div>

          <div className="ui-input rounded-2xl p-4">
            {activity.length === 0 ? (
              <div className="text-xs text-[#707070]">No activity yet.</div>
            ) : (
              <div className="space-y-2">
                {activityVisible.map((a) => (
                  <div
                    key={a.id}
                    className="ui-inner rounded-lg px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-[#e0e0e0]">
                          {a.title}
                        </div>
                        {a.details && (
                          <div className="text-[10px] text-[#707070] mt-0.5">
                            {a.details}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-[#707070] whitespace-nowrap">
                        {prettyTs(a.ts)}
                      </div>
                    </div>
                  </div>
                ))}

                {activity.length > 4 && (
                  <button
                    onClick={() => setShowMoreActivity((v) => !v)}
                    className="w-full mt-2 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] text-[#e0e0e0] text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    {showMoreActivity ? (
                      <>
                        Show less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Rig Modal */}
      <Modal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        title="Purchase Rig"
        subtitle={
          selectedRigId ? "Confirm rig + payment method (UI demo)" : undefined
        }
      >
        {selectedRigId &&
          (() => {
            const def = getRigDef(selectedRigId);
            const perDay = def.baseRatePerHour * 24;
            const payback = calcPaybackDays(def.price.USDT, perDay, svtUsd);

            return (
              <div className="space-y-5">
             
    <div className="group relative overflow-hidden rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/60 hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10">
      {/* Gradient orb background */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-cyan-600/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
      
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-shadow duration-500">
                {iconNode(def.icon)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">{def.name}</h3>
                {def.badge && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    {def.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-cyan-300/90 bg-cyan-950/50 border border-cyan-500/20">
                  {def.tier} RIG
                </span>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2">
                {def.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex flex-wrap gap-3">
            {[
              { 
                icon: "trending", 
                value: fmt(def.baseRatePerHour, 2), 
                unit: "SVT/h", 
                color: "emerald",
                label: "Hash Rate"
              },
              { 
                icon: "clock", 
                value: fmt(perDay, 2), 
                unit: "SVT/day", 
                color: "cyan",
                label: "Daily"
              },
              { 
                icon: "shield", 
                value: payback === Infinity ? "—" : fmt(payback, 0), 
                unit: payback === Infinity ? "" : "days", 
                color: "purple",
                label: "ROI"
              }
            ].map((stat, i) => (
              <div key={i} className="flex-1 min-w-[100px] px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors group/stat">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color}-500 shadow-[0_0_8px_rgba(var(--tw-shadow-color),0.6)]`} />
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{stat.label}</span>
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {stat.value} <span className={`text-${stat.color}-400 font-medium`}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path strokeWidth="2" d="M12 16v-4M12 8h.01"/>
              </svg>
              Demo mode — no real transactions
            </span>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Price</div>
              <div className="text-base font-bold text-slate-100">
                {def.price[payMethod]} <span className="text-slate-500 font-normal text-sm">{payMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="relative border-t lg:border-t-0 lg:border-l border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-200">Features</span>
          </div>

          <ul className="space-y-3">
            {[
              { bold: "Auto-mining", text: "starts instantly. Accrual works offline." },
              { bold: "Pause/Resume", text: "anytime from dashboard." },
              { bold: "Power-up", text: "with rings for +% SVT/h boosts." }
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-[12px] text-slate-400 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                <span><span className="text-slate-200 font-medium">{item.bold}</span> {item.text}</span>
              </li>
            ))}
          </ul>
          
                          <div className="text-[10px] text-[#707070]">
                            Step 1
                          </div>
                          <div className="text-xs font-semibold text-[#e5e7eb] mt-1">
                            Confirm purchase of this rig
                          </div>
                          <div className="text-[10px] text-[#9ca3af] mt-1">
                            It appears instantly in “Your Rigs” and starts
                            mining.
                          </div>
                        
                          <div className="text-[10px] text-[#707070]">
                            Step 2
                          </div>
                          <div className="text-xs font-semibold text-[#e5e7eb] mt-1">
                            Open “Manage Rings” and add an upgrade
                          </div>
                          <div className="text-[10px] text-[#9ca3af] mt-1">
                            Multipliers are strongest on Pro / Elite rigs.
                          </div>
                        
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
 

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left — what you are buying */}
                  <div className="space-y-3">
                    

                    <div className="ui-inner shadow-lg rounded-2xl p-4">
                      
                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                        <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1.5">
        Order Summary
      </div>
                        <span className="text-[10px] text-[#707070]">
                          UI-only · off-chain
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-[#9ca3af]">
                        <div className="flex items-center justify-between">
                          <span>Rig</span>
                          <span className="text-[#e5e7eb]">{def.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Base yield</span>
                          <span className="text-[#e5e7eb]">
                            {fmt(def.baseRatePerHour, 2)} SVT/h
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Est. SVT/day</span>
                          <span className="text-[#e5e7eb]">
                            {fmt(perDay, 2)} SVT
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Est. $/day (UI)</span>
                          <span className="text-[#e5e7eb]">
                            ${fmt(perDay * svtUsd, 2)}
                          </span>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Right — payment + summary */}
                  <div className="space-y-4">
                    {/* <PaymentMethodPicker
                      value={payMethod}
                      onChange={setPayMethod}
                    /> */}

                    <div className="ui-inner shadow-lg rounded-2xl p-4 space-y-3">
                     

                       <div className=" flex flex-col justify-between">
    <div className="grid gap-4">
  <div className="flex items-end justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1.5">
        Total to pay
      </div>
      <div className="text-lg font-semibold text-[#e5e7eb] mt-1">
        {def.price[payMethod]} {payMethod}
      </div>
      <div className="text-[10px] text-[#6b7280] mt-1">
        UI-only demo · real tx later
      </div>
    </div>
    
    <div className="text-right">
      
      <PaymentMethodPicker value={payMethod} onChange={setPayMethod} />
    </div>
  </div>
</div>
    <button
                      onClick={confirmBuyRig}
                      className="w-full mt-3 py-3 rounded-lg bg-[#3b82f6]/30 hover:bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      Confirm purchase
                      <ArrowRight className="w-4 h-4" />
                    </button>
  </div>
                    </div>

                    
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* Rings + Upgrade Shop Modal (LIST) */}
      <Modal
        open={ringsOpen}
        onClose={() => setRingsOpen(false)}
        title="Manage Rings"
        subtitle={null}
      >
        {ringsRigUid &&
          (() => {
            const rig = ownedRigs.find((r) => r.uid === ringsRigUid);
            if (!rig) return null;

            const rdef = getRigDef(rig.defId);
            const ring1Used = !!rig.equipped.find((e) => e.slot === 1);
            const ring2Used = !!rig.equipped.find((e) => e.slot === 2);
            const ringOccupied = rig.equipped.some(
              (e) => e.slot === activeRing,
            );
            const totalRateH = calcRigRatePerHour(rig);

            return (
              <div className="bg-[#050816] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
                {/* фон як у predictions */}
                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />
                <div className="relative space-y-4 text-xs">
                  {/* HEADER як у predictions: іконка + назва + короткі цифри */}

                  {/* 2 колонки, як у predictions: зліва ріг + слоти, справа – апгрейди */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* LEFT: rig summary + active ring + equipped */}
                    <div className="space-y-3">
                      {/* Rig + equipped chips */}
                      <div className="bg-[#070b14] border border-[#1f1f1f] rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#070b14] border border-[#1f1f1f] flex items-center justify-center text-[#3b82f6]">
                              {iconNode(rdef.icon)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm md:text-base text-[#e0e0e0] font-semibold">
                                  {rdef.name}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#121212] border border-[#1f1f1f] text-[10px] text-[#a0a0a0]">
                                  Rig #{rig.uid.slice(0, 4)}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#707070]">
                                <span>Equipped: {rig.equipped.length}/2</span>
                                <span className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                                <span>
                                  Yield:{" "}
                                  <span className="text-[#e0e0e0] font-semibold">
                                    {fmt(totalRateH, 2)} SVT/h
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <div className="text-[10px] text-[#707070]">
                              Status
                            </div>
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                rig.status === "active"
                                  ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
                                  : "bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20"
                              }`}
                            >
                              {rig.status === "active" ? "Active" : "Paused"}
                            </span>
                          </div>
                        </div>

                        {/* Equipped chips */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          <div className="inline-flex items-center gap-1 rounded-full bg-[#121212] border border-[#1f1f1f] px-2 py-1">
                            <Wrench className="w-3 h-3 text-[#3b82f6]" />
                            <span className="text-[10px] text-[#707070]">
                              Ring 1
                            </span>
                            <span className="text-[11px] font-semibold text-[#e0e0e0] max-w-[130px] truncate">
                              {slotLabel(rig, 1)}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-full bg-[#121212] border border-[#1f1f1f] px-2 py-1">
                            <Wrench className="w-3 h-3 text-[#a855f7]" />
                            <span className="text-[10px] text-[#707070]">
                              Ring 2
                            </span>
                            <span className="text-[11px] font-semibold text-[#e0e0e0] max-w-[130px] truncate">
                              {slotLabel(rig, 2)}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-[#707070] mt-1">
                          Upgrades are consumed on equip • max 2 per rig.
                        </div>
                      </div>
                      <PaymentMethodPicker
                        value={upgradePayMethod}
                        onChange={setUpgradePayMethod}
                      />
                      {/* Active ring toggle – під predictions стиль */}
                      <div className="bg-[#070b14] border border-[#1f1f1f] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#707070]">
                            Active ring to upgrade
                          </span>

                          <span className="text-[10px] text-[#a0a0a0]">
                            Selected:{" "}
                            <span className="text-[#e0e0e0] font-semibold">
                              Ring {activeRing}
                            </span>
                          </span>
                        </div>

                        {ringOccupied && (
                          <div className="text-[10px] text-[#f97316]">
                            Selected ring already has an upgrade – new one will
                            replace it.
                          </div>
                        )}

                        <div className="inline-flex rounded-lg bg-[#050814] p-1 gap-1 w-full">
                          <button
                            onClick={() => setActiveRing(1)}
                            className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold border ${
                              activeRing === 1
                                ? "bg-[#3b82f6]/15 border-[#3b82f6] text-[#e0e0e0]"
                                : "bg-transparent border-transparent text-[#a0a0a0] hover:bg-[#10121c]"
                            }`}
                          >
                            Ring 1{" "}
                            <span className="text-[10px]">
                              {ring1Used ? "• occupied" : "• empty"}
                            </span>
                          </button>
                          <button
                            onClick={() => setActiveRing(2)}
                            className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold border ${
                              activeRing === 2
                                ? "bg-[#3b82f6]/15 border-[#3b82f6] text-[#e0e0e0]"
                                : "bg-transparent border-transparent text-[#a0a0a0] hover:bg-[#10121c]"
                            }`}
                          >
                            Ring 2{" "}
                            <span className="text-[10px]">
                              {ring2Used ? "• occupied" : "• empty"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Невеликий summary по слотах */}
                      <div className="bg-[#070b14] border border-[#1f1f1f] rounded-lg px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px]">
                          <Layers className="w-3 h-3 text-[#3b82f6]" />
                          <span className="text-[#e0e0e0] font-semibold">
                            Upgrades for ring {activeRing}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#121212] border border-[#1f1f1f] text-[10px] text-[#a0a0a0]">
                          {rig.equipped.length}/2 slots used
                        </span>
                      </div>
                    </div>

                    {/* RIGHT: upgrades list */}
                    <div className="space-y-3 ">
                      {/* TOP BAR: Pay with */}

                      {/* LIST */}
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {upgradeDefs.map((u) => {
                          const baseH = getRigDef(rig.defId).baseRatePerHour;
                          const deltaH =
                            u.kind === "flat" ? u.value : baseH * u.value;
                          const deltaDay = deltaH * 24;
                          const payback = calcPaybackDays(
                            u.price.USDT,
                            deltaDay,
                            svtUsd,
                          );

                          const disabled =
                            ringOccupied || rig.equipped.length >= 2;

                          return (
                            <div
                              key={u.id}
                              className={`bg-[#121212] border rounded-lg px-3 py-2.5 hover:border-[#2a2a2a] transition-all ${
                                u.highlight
                                  ? "border-[#3b82f6]/60"
                                  : "border-[#1f1f1f]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center text-[#a855f7]">
                                    <Wrench className="w-4 h-4" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <div className="text-[13px] font-semibold text-[#e0e0e0]">
                                        {u.name}
                                      </div>
                                      {u.badge && <Badge text={u.badge} />}
                                    </div>
                                    <div className="text-[11px] text-[#a0a0a0] line-clamp-1">
                                      {u.description}
                                    </div>
                                    <div className="text-[10px] text-[#707070]">
                                      <span className="text-[#e0e0e0] font-semibold">
                                        +{fmt(deltaH, 2)} SVT/h
                                      </span>
                                      <span className="mx-1">•</span>
                                      {fmt(deltaDay, 2)} SVT/day
                                      <span className="mx-1">•</span>
                                      Payback:{" "}
                                      {payback === Infinity
                                        ? "—"
                                        : `${fmt(payback, 0)}d`}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-1">
                                  <div className="text-[10px] text-[#707070]">
                                    Price
                                  </div>
                                  <div className="text-xs font-semibold text-[#e0e0e0]">
                                    {u.price[upgradePayMethod]}{" "}
                                    {upgradePayMethod}
                                  </div>
                                  <button
                                    onClick={() =>
                                      equipUpgradeToActiveRing(u.id)
                                    }
                                    disabled={disabled}
                                    className={`mt-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border whitespace-nowrap ${
                                      disabled
                                        ? "bg-[#1a1a1a] text-[#707070] border-[#1f1f1f] cursor-not-allowed"
                                        : "bg-[#3b82f6] hover:bg-[#2563eb] text-white border-[#3b82f6]/80"
                                    }`}
                                  >
                                    {disabled
                                      ? "Ring not available"
                                      : "Buy & equip"}
                                  </button>
                                </div>
                              </div>

                              <div className="mt-1 text-[10px] text-[#707070] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Instant equip, upgrade is burned on use.
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}

export default VirtualCardShop;
