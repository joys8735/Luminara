import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import {
  Gift,
  Check,
  AlertCircle,
  Twitter,
  Send,
  Users,
  Clock,
  Award,
  TrendingUp,
  Copy,
  Shield,
  Sparkles,
  Bot,
  Ticket,
  ExternalLink,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";

type SocialTask = {
  id: number;
  name: string;
  icon: any;
  points: number;
  link?: string;
};

type TaskStatus = "idle" | "opened" | "checking" | "verified";

type AirdropCampaign = {
  id: number;
  name: string;
  description: string;
  amount: number;
  token: string;
  participants: number;
  totalPool: number;
  endDate: Date;
  requirements: string[];
  status: "active" | "ended";
  claimCooldownHours: number;
};

type ClaimRecord = {
  id: string;
  campaignId: number;
  campaignName: string;
  amount: number;
  token: string;
  when: number;
  walletShort: string;
  trustScoreAtClaim: number;
  nftTicketId: string;
};

const LS_TASKS = "svt_airdrop_tasks_v1";
const LS_CLAIMS = "svt_airdrop_claims_v1";
const LS_CLAIM_STATE = "svt_airdrop_claim_state_v1";
const LS_MINING_TOTAL = "svtBrowserMiningState_v1";
const LS_PLATFORM_BAL = "svtPlatformBalance_v1";
const LS_STAKING = "svtStakingState_v1";

function shorten(addr?: string | null) {
  if (!addr) return "—";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${hh.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function Airdrop() {
  const { connected, publicKey } = useWallet();

  // ===== Campaigns =====
  const airdrops: AirdropCampaign[] = useMemo(
    () => [
      {
        id: 1,
        name: "Community Airdrop",
        description:
          "Reward for early community members and active participants",
        amount: 1000,
        token: "SVT",
        participants: 2453,
        totalPool: 1000000,
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        requirements: [
          "Hold minimum 0.1 SOL",
          "Complete social tasks",
          "Join Telegram group",
        ],
        status: "active",
        claimCooldownHours: 24,
      },
      {
        id: 2,
        name: "Staking Rewards Boost",
        description:
          "Extra bonus for staking participants (multiplier applies)",
        amount: 500,
        token: "SVT",
        participants: 1876,
        totalPool: 500000,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        requirements: ["Stake minimum 100 SVT", "Lock for 30 days"],
        status: "active",
        claimCooldownHours: 24,
      },
      {
        id: 3,
        name: "Referral Bonus",
        description: "Earn tokens by inviting friends to the platform",
        amount: 250,
        token: "SVT",
        participants: 3421,
        totalPool: 750000,
        endDate: new Date(Date.now() + 60 * 24 * 60 * 1000),
        requirements: ["Refer 3+ friends", "Friends must complete KYC"],
        status: "active",
        claimCooldownHours: 24,
      },
    ],
    []
  );

  const socialTasks: SocialTask[] = useMemo(
    () => [
      {
        id: 1,
        name: "Follow on X (Twitter)",
        icon: Twitter,
        points: 50,
        link: "https://twitter.com",
      },
      {
        id: 2,
        name: "Join Telegram",
        icon: Send,
        points: 50,
        link: "https://t.me",
      },
      {
        id: 3,
        name: "Retweet Announcement",
        icon: Twitter,
        points: 100,
        link: "https://twitter.com",
      },
      {
        id: 4,
        name: "Invite 3 Friends",
        icon: Users,
        points: 200,
        link: "https://solanaverse.io/ref",
      },
    ],
    []
  );

  // ===== UI states =====
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(1);
  const [taskStatus, setTaskStatus] = useState<Record<number, TaskStatus>>({});
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [verifierOpen, setVerifierOpen] = useState(false);
  const [verifierTaskId, setVerifierTaskId] = useState<number | null>(null);

  const [claimState, setClaimState] = useState<
    Record<number, { claimed: boolean; lastClaimAt: number | null }>
  >({});

  const [claimHistory, setClaimHistory] = useState<ClaimRecord[]>([]);

  const [referrals] = useState(
    [
      { id: "u1", name: "0x8a2…91c", joined: "2025-11-15", status: "verified" },
      { id: "u2", name: "0x17d…a02", joined: "2025-11-16", status: "pending" },
      { id: "u3", name: "0x4bf…0aa", joined: "2025-11-18", status: "verified" },
      { id: "u4", name: "0x9de…1f7", joined: "2025-11-20", status: "verified" },
    ] as const
  );

  // ===== Bonuses (Mining + Staking) =====
  const [minedTotal, setMinedTotal] = useState(0);
  const [platformBalance, setPlatformBalance] = useState(0);

  const [stakedAmount, setStakedAmount] = useState(0);
  const [stakingLockDays, setStakingLockDays] = useState(0);

  useEffect(() => {
    // tasks
    try {
      const raw = localStorage.getItem(LS_TASKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.selectedTasks) setSelectedTasks(parsed.selectedTasks);
        if (parsed?.taskStatus) setTaskStatus(parsed.taskStatus);
      }
    } catch {}

    // claim state
    try {
      const raw = localStorage.getItem(LS_CLAIM_STATE);
      if (raw) setClaimState(JSON.parse(raw));
    } catch {}

    // claim history
    try {
      const raw = localStorage.getItem(LS_CLAIMS);
      if (raw) setClaimHistory(JSON.parse(raw));
    } catch {}

    // mining state
    try {
      const raw = localStorage.getItem(LS_MINING_TOTAL);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMinedTotal(Number(parsed?.totalMined || 0));
      }
    } catch {}

    // platform balance
    try {
      const raw = localStorage.getItem(LS_PLATFORM_BAL);
      if (raw) setPlatformBalance(Number(raw) || 0);
    } catch {}

    // staking state
    try {
      const raw = localStorage.getItem(LS_STAKING);
      if (raw) {
        const parsed = JSON.parse(raw);
        setStakedAmount(Number(parsed?.stakedAmount || 0));
        setStakingLockDays(Number(parsed?.lockDays || 0));
      } else {
        setStakedAmount(250);
        setStakingLockDays(90);
      }
    } catch {
      setStakedAmount(250);
      setStakingLockDays(90);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LS_TASKS,
      JSON.stringify({ selectedTasks, taskStatus })
    );
  }, [selectedTasks, taskStatus]);

  useEffect(() => {
    localStorage.setItem(LS_CLAIM_STATE, JSON.stringify(claimState));
  }, [claimState]);

  useEffect(() => {
    localStorage.setItem(LS_CLAIMS, JSON.stringify(claimHistory));
  }, [claimHistory]);

  // ===== Points =====
  const totalPoints = useMemo(() => {
    return socialTasks
      .filter(
        (t) => selectedTasks.includes(t.id) && taskStatus[t.id] === "verified"
      )
      .reduce((sum, t) => sum + t.points, 0);
  }, [selectedTasks, socialTasks, taskStatus]);

  // ===== Trust Score (used only for multipliers & breakdown) =====
  const trustScore = useMemo(() => {
    const walletScore = connected ? 25 : 0;
    const taskScore = clamp(Math.floor(totalPoints / 10), 0, 40);
    const miningScore = clamp(Math.floor(minedTotal / 50) * 5, 0, 20);
    const stakingScore = clamp(Math.floor(stakedAmount / 100) * 5, 0, 15);
    const total = clamp(
      walletScore + taskScore + miningScore + stakingScore,
      0,
      100
    );
    return total;
  }, [connected, totalPoints, minedTotal, stakedAmount]);

  const trustLabel =
    trustScore >= 80 ? "High" : trustScore >= 55 ? "Medium" : "Low";

  // ===== Multipliers =====
  const miningMultiplier = useMemo(() => {
    if (minedTotal >= 1000) return 1.25;
    if (minedTotal >= 300) return 1.15;
    if (minedTotal >= 100) return 1.08;
    return 1.0;
  }, [minedTotal]);

  const stakingMultiplier = useMemo(() => {
    if (stakedAmount >= 1000 && stakingLockDays >= 180) return 1.3;
    if (stakedAmount >= 500 && stakingLockDays >= 90) return 1.18;
    if (stakedAmount >= 100) return 1.08;
    return 1.0;
  }, [stakedAmount, stakingLockDays]);

  const pointsBonusMultiplier = useMemo(() => {
    if (totalPoints >= 300) return 1.2;
    if (totalPoints >= 200) return 1.12;
    if (totalPoints >= 100) return 1.06;
    return 1.0;
  }, [totalPoints]);

  // ===== AI Best tasks hint =====
  const aiRecommendations = useMemo(() => {
    const candidates = socialTasks
      .map((t) => {
        const status = taskStatus[t.id] || "idle";
        const done = status === "verified";
        return {
          ...t,
          done,
          score: done ? -999 : t.points,
          reason:
            t.points >= 200
              ? "Highest reward impact"
              : t.points >= 100
              ? "Fast points boost"
              : "Easy to complete",
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    return candidates;
  }, [socialTasks, taskStatus]);

  // ===== Referral Link =====
  const referralLink = useMemo(() => {
    const short = publicKey ? publicKey.slice(0, 8) : "guest";
    return `https://solanaverse.io/ref/${short}`;
  }, [publicKey]);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  // ===== Proof-of-task flow =====
  const openVerifier = (taskId: number) => {
    if (!connected) return toast.error("Connect wallet first");
    setVerifierTaskId(taskId);
    setVerifierOpen(true);
  };

  const markOpened = (taskId: number) => {
    setTaskStatus((prev) => ({ ...prev, [taskId]: "opened" }));
    const task = socialTasks.find((t) => t.id === taskId);
    if (task?.link)
      window.open(task.link, "_blank", "noopener,noreferrer");
  };

  const runCheck = async (taskId: number) => {
    setTaskStatus((prev) => ({ ...prev, [taskId]: "checking" }));
    await new Promise((r) => setTimeout(r, 1200));
    setTaskStatus((prev) => ({ ...prev, [taskId]: "verified" }));
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev : [...prev, taskId]
    );
    toast.success("Task verified ✅");
    setVerifierOpen(false);
  };

  // ===== Claim logic + Cooldown + NFT Ticket + History =====
  const canClaim = (campaign: AirdropCampaign) => {
    const st = claimState[campaign.id];
    if (st?.claimed) return { ok: false, reason: "Claimed" };

    const last = st?.lastClaimAt || null;
    if (!last) return { ok: true, reason: "" };

    const cooldownMs = campaign.claimCooldownHours * 3600 * 1000;
    const remaining = last + cooldownMs - Date.now();
    if (remaining > 0)
      return {
        ok: false,
        reason: `Cooldown ${formatCountdown(remaining)}`,
      };

    return { ok: true, reason: "" };
  };

  const estimateReward = (campaign: AirdropCampaign) => {
    const base = campaign.amount;

    const trustMul =
      trustScore >= 80 ? 1.12 : trustScore >= 55 ? 1.06 : 1.0;

    const totalMul =
      miningMultiplier *
      stakingMultiplier *
      pointsBonusMultiplier *
      trustMul;

    const final = base * totalMul;

    return {
      base,
      miningMultiplier,
      stakingMultiplier,
      pointsBonusMultiplier,
      trustMul,
      totalMul,
      final,
    };
  };

  const handleClaim = (campaign: AirdropCampaign) => {
    if (!connected) return toast.error("Please connect your wallet first");

    if (campaign.id === 1 && totalPoints < 50) {
      toast.error("Complete at least 1 verified task to claim this airdrop");
      return;
    }

    const verdict = canClaim(campaign);
    if (!verdict.ok) {
      toast.error(verdict.reason);
      return;
    }

    const breakdown = estimateReward(campaign);
    const amount = Number(breakdown.final.toFixed(2));

    const nftTicketId = `SVT-TICKET-${Math.random()
      .toString(16)
      .slice(2, 8)
      .toUpperCase()}`;

    setClaimState((prev) => ({
      ...prev,
      [campaign.id]: {
        claimed: true,
        lastClaimAt: Date.now(),
      },
    }));

    const record: ClaimRecord = {
      id: uid("claim"),
      campaignId: campaign.id,
      campaignName: campaign.name,
      amount,
      token: campaign.token,
      when: Date.now(),
      walletShort: shorten(publicKey),
      trustScoreAtClaim: trustScore,
      nftTicketId,
    };

    setClaimHistory((prev) => [record, ...prev].slice(0, 20));

    toast.success(`Claimed ${amount} ${campaign.token} + NFT Ticket 🎟`);
  };

  // ===== Stats =====
  const totalParticipants = useMemo(
    () => airdrops.reduce((sum, a) => sum + a.participants, 0),
    [airdrops]
  );

  const totalPool = useMemo(
    () => airdrops.reduce((sum, a) => sum + a.totalPool, 0),
    [airdrops]
  );

  const totalClaimedSVT = useMemo(
    () =>
      claimHistory.reduce(
        (sum, c) => (c.token === "SVT" ? sum + c.amount : sum),
        0
      ),
    [claimHistory]
  );

  const totalPotentialSVT = useMemo(
    () =>
      airdrops.reduce((sum, c) => {
        const br = estimateReward(c);
        return sum + br.final;
      }, 0),
    [
      airdrops,
      miningMultiplier,
      stakingMultiplier,
      pointsBonusMultiplier,
      trustScore,
    ]
  );

  const formatTimeLeft = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const days = Math.max(
      0,
      Math.floor(diff / (1000 * 60 * 60 * 24))
    );
    return `${days} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
      
        <h1 className="text-3xl font-semibold text-white leading-tight">
          Airdrops<br />
          <span className="text-[#3b82f6]">
            Earn bonuses + referrals.
          </span>
        </h1>

        <p className="text-sm text-[#a0a0a0] max-w-md">
          Complete verified tasks, unlock multipliers (staking/mining),
          and claim rewards + NFT tickets.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="ui-card backdrop-blur-sm rounded-2xl p-4 text-center">
          <Gift className=" w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
          <div className="text-lg font-bold text-[#e0e0e0]">
            {airdrops.length}
          </div>
          <div className="text-xs text-[#707070]">
            Active Campaigns
          </div>
        </div>

        <div className="ui-card backdrop-blur-sm rounded-2xl p-4 text-center">
          <Award className="w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
          <div className="text-lg font-bold text-[#3b82f6]">
            {totalPoints}
          </div>
          <div className="text-xs text-[#707070]">
            Verified Points
          </div>
        </div>

        <div className="ui-card backdrop-blur-sm rounded-2xl p-4 text-center">
          <Users className="w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
          <div className="text-lg font-bold text-[#e0e0e0]">
            {totalParticipants.toLocaleString()}
          </div>
          <div className="text-xs text-[#707070]">Participants</div>
        </div>

        <div className="ui-card backdrop-blur-sm rounded-2xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
          <div className="text-lg font-bold text-[#e0e0e0]">
            {(totalPool / 1_000_000).toFixed(2)}M
          </div>
          <div className="text-xs text-[#707070]">
            Total Pool (SVT)
          </div>
        </div>

        {/* New: Your Airdrop SVT instead of Trust Score card */}
        <div className="ui-card backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#facc15]" />
              <div className="text-xs text-[#707070]">
                Your Airdrop SVT
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-[#e0e0e0]">
            {totalClaimedSVT.toFixed(0)} SVT
          </div>
          <div className="mt-1 text-[10px] text-[#707070]">
            Potential this round ≈{" "}
            <span className="text-[#e0e0e0] font-medium">
              {totalPotentialSVT.toFixed(0)} SVT
            </span>
          </div>
        </div>
        
      </div>

      {/* Not connected */}
      {!connected && (
        <div className="ui-inner rounded-2xl p-4">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-[#a0a0a0] flex-shrink-0 mt-0.5 mr-3" />
            <div>
              <h3 className="text-xs font-medium text-[#e0e0e0]">
                Wallet not connected
              </h3>
              <p className="mt-1 text-xs text-[#707070]">
                Connect to verify tasks and claim rewards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          <div className="ui-card backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden">
            <img src="https://png.pngtree.com/png-clipart/20250417/original/pngtree-ai-logo-icon-vector-png-image_20731888.png" className="absolute opacity-10" alt="" />
            {/* <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" /> */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                  <h2 className="text-sm font-semibold text-[#e0e0e0]">
                    AI Hint: Best tasks to complete
                  </h2>
                </div>
                <span className="text-[10px] text-[#707070]">
                  optimized for points
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiRecommendations.map((t) => {
                  const Icon = t.icon;
                  const status = taskStatus[t.id] || "idle";
                  const done = status === "verified";
                  return (
                    <div
                      key={t.id}
                      className="ui-inner rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                            <Icon className="w-4 h-4 text-[#a0a0a0]" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[var(--text)] leading-tight">
                              {t.name}
                            </div>
                            <div className="text-[10px] text-[#707070]">
                              +{t.points} Alpha point
                            </div>
                          </div>
                        </div>

                        {done ? (
                          <div className="text-[10px] px-2 py-0.5 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]">
                            Done
                          </div>
                        ) : (
                          <div className="text-[10px] px-2 py-0.5 rounded-full border border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]">
                            Recommended
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-[#707070] flex items-center gap-1">
                        <Info className="w-3 h-3" /> {t.reason}
                      </div>

                      <button
                        disabled={!connected || done}
                        onClick={() => openVerifier(t.id)}
                        className={`mt-3 w-full py-2 rounded-lg text-xs font-medium transition-all ${
                          !connected || done
                            ? "ui-card text-[#707070] cursor-not-allowed"
                            : "border border-[#3b82f6]/20 bg-[#3b82f6]/10 hover:bg-[#2563eb] text-[var(--text)]"
                        }`}
                      >
                        {done ? "Verified" : "Verify task"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 ui-inner rounded-xl p-3">
                <div className="text-[11px] text-[#a0a0a0]">
                  Multipliers active:
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-full border border-[#1f1f1f] bg-[#121212] text-[#e0e0e0]">
                    Mining x{miningMultiplier.toFixed(2)}{" "}
                    <Flame className="inline w-3 h-3 ml-1 text-[#f97316]" />
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-full border border-[#1f1f1f] bg-[#121212] text-[#e0e0e0]">
                    Staking x{stakingMultiplier.toFixed(2)}{" "}
                    <Award className="inline w-3 h-3 ml-1 text-[#3b82f6]" />
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-full border border-[#1f1f1f] bg-[#121212] text-[#e0e0e0]">
                    Points x{pointsBonusMultiplier.toFixed(2)}{" "}
                    <Sparkles className="inline w-3 h-3 ml-1 text-[#3b82f6]" />
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-full border border-[#1f1f1f] bg-[#121212] text-[#e0e0e0]">
                    Trust x
                    {(
                      trustScore >= 80
                        ? 1.12
                        : trustScore >= 55
                        ? 1.06
                        : 1.0
                    ).toFixed(2)}{" "}
                    <Shield className="inline w-3 h-3 ml-1 text-[#3b82f6]" />
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-[#707070]">
                  Later you can link real staking / mining stats here.
                </div>
              </div>
            </div>
          </div>

          {/* Social Tasks (Proof-of-task) – restyled block */}
          <div className="ui-card rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#e0e0e0]">
                  Tasks for this airdrop
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-[#707070]">
                  <Sparkles className="w-3 h-3 text-[#3b82f6]" />
                  Verified only counts
                </div>
              </div>

              <div className="space-y-2">
                {socialTasks.map((task) => {
                  const Icon = task.icon;
                  const status = taskStatus[task.id] || "idle";
                  const isVerified = status === "verified";

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isVerified
                          ? "border-[#22c55e]/40 bg-[#22c55e]/5"
                          : "border-[#1f1f1f] bg-[#1a1a1a] hover:border-[#3b82f6]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                          <Icon
                            className={`w-4 h-4 ${
                              isVerified
                                ? "text-[#22c55e]"
                                : "text-[#a0a0a0]"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#e0e0e0]">
                            {task.name}
                          </div>
                          <div className="text-[10px] text-[#707070]">
                            +{task.points} Alpha point
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isVerified ? (
                          <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]">
                            <Check className="w-3 h-3" />
                            Verified
                          </div>
                        ) : (
                          <button
                            disabled={!connected}
                            onClick={() => openVerifier(task.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                              !connected
                                ? "bg-[#0a0a0a] text-[#707070] border-[#1f1f1f] cursor-not-allowed"
                                : "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6]/20"
                            }`}
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#e0e0e0]">
                    Verified Points
                  </span>
                  <span className="text-lg font-bold text-[#3b82f6]">
                    {totalPoints}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-[#707070]">
                  Only verified tasks count toward points & multipliers.
                </div>
              </div>
            </div>
          </div>

          {/* Referral */}
          <div className="ui-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#e0e0e0]">
                Referral Program
              </h2>
              <span className="text-[10px] text-[#707070]">
                demo
              </span>
            </div>

            <div className="flex gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 px-3 py-2 ui-inner rounded-lg text-[#e0e0e0] text-xs"
              />
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg flex items-center gap-2 text-xs font-medium transition-all"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>

            <div className="mt-2 text-[10px] text-[#707070]">
              Earn rewards when your referrals complete verification.
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="ui-inner rounded-lg p-3">
                <div className="text-[11px] text-[#707070]">
                  Referral Ladder
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-[#a0a0a0]">
                  <li className="flex justify-between">
                    <span>1 referral</span>
                    <span className="text-[#e0e0e0]">+100 SVT</span>
                  </li>
                  <li className="flex justify-between">
                    <span>3 referrals</span>
                    <span className="text-[#e0e0e0]">+250 SVT</span>
                  </li>
                  <li className="flex justify-between">
                    <span>5 referrals</span>
                    <span className="text-[#e0e0e0]">
                      +500 SVT + Badge
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>10 referrals</span>
                    <span className="text-[#e0e0e0]">
                      +1000 SVT + VIP
                    </span>
                  </li>
                </ul>
              </div>

              <div className="ui-inner rounded-lg p-3">
                <div className="text-[11px] text-[#707070] mb-2">
                  Your Referrals
                </div>
                <div className="space-y-2">
                  {referrals.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[11px] text-[#e0e0e0]">
                          {r.name}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          Joined {r.joined}
                        </div>
                      </div>
                      <div
                        className={`text-[10px] px-2 py-1 rounded border ${
                          r.status === "verified"
                            ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]"
                            : "border-[#facc15]/40 bg-[#facc15]/10 text-[#facc15]"
                        }`}
                      >
                        {r.status === "verified"
                          ? "Verified"
                          : "Pending"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-[10px] text-[#707070]">
                  Later we can fetch real referral users from backend.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="ui-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[#e0e0e0] mb-3">
              Your Activity (Bonuses)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="ui-inner rounded-xl p-3">
                <div className="text-[10px] text-[#707070]">
                  Mining Total
                </div>
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  {minedTotal.toFixed(2)} SVT
                </div>
                <div className="text-[10px] text-[#707070] mt-1">
                  Multiplier: x{miningMultiplier.toFixed(2)}
                </div>
              </div>
              <div className="ui-inner rounded-xl p-3">
                <div className="text-[10px] text-[#707070]">
                  Platform Balance
                </div>
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  {platformBalance.toFixed(2)} SVT
                </div>
                <div className="text-[10px] text-[#707070] mt-1">
                  Used later for staking/investments
                </div>
              </div>
              <div className="ui-inner rounded-xl p-3">
                <div className="text-[10px] text-[#707070]">
                  Staking
                </div>
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  {stakedAmount.toFixed(0)} SVT
                </div>
                <div className="text-[10px] text-[#707070] mt-1">
                  Lock: {stakingLockDays}d • Multiplier: x
                  {stakingMultiplier.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-[#707070] flex items-center gap-2">
              <ExternalLink className="w-3 h-3" />
              Later you can plug real on-chain data instead of demo values.
            </div>
          </div>
          {/* NFT Ticket + Claim history */}
          <div className="ui-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#3b82f6]" />
                <h2 className="text-sm font-semibold text-[#e0e0e0]">
                  NFT Airdrop Ticket
                </h2>
              </div>
              <span className="text-[10px] text-[#707070]">
                minted on claim
              </span>
            </div>

            {claimHistory.length === 0 ? (
              <div className="ui-inner rounded-xl p-4 text-[11px] text-[#707070]">
                No tickets yet. Claim an airdrop to receive a ticket.
              </div>
            ) : (
              <div className="space-y-2">
                {claimHistory.slice(0, 2).map((c) => (
                  <div
                    key={c.id}
                    className="ui-inner rounded-xl p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-[#e0e0e0]">
                          {c.nftTicketId}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          {c.campaignName} •{" "}
                          {new Date(c.when).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[10px] px-2 py-1 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]">
                        {c.amount} {c.token}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#707070] flex items-center justify-between">
                      <span>Owner: {c.walletShort}</span>
                      <span>Trust: {c.trustScoreAtClaim}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <div className="text-[11px] text-[#707070] mb-2">
                Claim History
              </div>
              {claimHistory.length === 0 ? (
                <div className="text-[11px] text-[#707070]">—</div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-auto pr-1">
                  {claimHistory.slice(0, 8).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span className="text-[#a0a0a0]">
                        {c.campaignName}
                      </span>
                      <span className="text-[#e0e0e0]">
                        +{c.amount} {c.token}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Campaign list */}
          <div className="space-y-4">
            {airdrops.map((campaign) => {
              const isExpanded = expandedCampaign === campaign.id;
              const verdict = canClaim(campaign);

              const maxClaims = campaign.totalPool / campaign.amount;
              const progress = clamp(
                (campaign.participants / maxClaims) * 100,
                0,
                100
              );

              const breakdown = estimateReward(campaign);

              return (
                <div
                  key={campaign.id}
                  className="ui-card rounded-2xl p-5 hover:border-[#3b82f6]/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-[#e0e0e0]">
                          {campaign.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]">
                          {campaign.status === "active"
                            ? "Active"
                            : "Ended"}
                        </span>
                      </div>
                      <p className="text-xs text-[#a0a0a0] mt-1">
                        {campaign.description}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedCampaign((prev) =>
                          prev === campaign.id ? null : campaign.id
                        )
                      }
                      className="w-9 h-9 rounded-lg ui-inner hover:bg-[#222] flex items-center justify-center transition-colors"
                      aria-label="Expand"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#a0a0a0]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#a0a0a0]" />
                      )}
                    </button>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div>
                      <div className="text-[10px] text-[#707070]">
                        Base Reward
                      </div>
                      <div className="text-sm font-bold text-[#3b82f6]">
                        {campaign.amount} {campaign.token}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#707070]">
                        Participants
                      </div>
                      <div className="text-sm font-bold text-[var(--text)]">
                        {campaign.participants.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#707070]">
                        Ends In
                      </div>
                      <div className="text-xs font-bold text-[var(--text)] flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-[#a0a0a0]" />
                        {formatTimeLeft(campaign.endDate)}
                      </div>
                    </div>
                  </div>

                  {/* progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#707070]">
                        Pool Progress
                      </span>
                      <span className="text-[#e0e0e0]">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded info */}
                  {isExpanded && (
                    <div className="space-y-3 mb-4">
                      <div className="ui-inner rounded-xl p-3">
                        <div className="text-xs font-medium text-[#e0e0e0] mb-2">
                          Requirements
                        </div>
                        <ul className="space-y-1">
                          {campaign.requirements.map((req, i) => (
                            <li
                              key={i}
                              className="flex items-start text-xs text-[#a0a0a0]"
                            >
                              <Check className="w-3 h-3 text-[#3b82f6] mt-0.5 mr-2 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-[#e0e0e0]">
                            Estimated Reward (with multipliers)
                          </div>
                          <div className="text-xs font-bold text-[#3b82f6]">
                            {breakdown.final.toFixed(2)}{" "}
                            {campaign.token}
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex justify-between text-[#a0a0a0]">
                            <span>Base</span>
                            <span className="text-[#e0e0e0]">
                              {breakdown.base}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#a0a0a0]">
                            <span>Total Multiplier</span>
                            <span className="text-[#e0e0e0]">
                              x{breakdown.totalMul.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#a0a0a0]">
                            <span>Mining</span>
                            <span className="text-[#e0e0e0]">
                              x{breakdown.miningMultiplier.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#a0a0a0]">
                            <span>Staking</span>
                            <span className="text-[#e0e0e0]">
                              x{breakdown.stakingMultiplier.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#a0a0a0]">
                            <span>Points</span>
                            <span className="text-[#e0e0e0]">
                              x
                              {breakdown.pointsBonusMultiplier.toFixed(
                                2
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#a0a0a0]">
                            <span>Trust</span>
                            <span className="text-[#e0e0e0]">
                              x{breakdown.trustMul.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] text-[#707070]">
                          Tip: stake SVT, mine more & verify tasks to
                          increase reward.
                        </div>
                      </div>

                      <div className="ui-inner rounded-xl p-3">
                        <div className="text-[11px] text-[#a0a0a0] flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#3b82f6]" />
                          Anti-bot: higher trust gives better payout &
                          faster verification ({trustLabel}).
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Claim area */}
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex-1 ui-inner rounded-xl p-3">
                      {/* <div className="text-[11px] text-[#707070] mb-1">
                        Claim Cooldown
                      </div> */}
                      <div className="text-xs text-[#e0e0e0]">
                        {verdict.ok
                          ? "Available now"
                          : verdict.reason}
                      </div>
                      <div className="mt-1 text-[10px] text-[#707070]">
                        Cooldown rule: {campaign.claimCooldownHours}h
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-full md:w-56">
                      <button
                        onClick={() => handleClaim(campaign)}
                        disabled={
                          !connected ||
                          campaign.status !== "active" ||
                          !verdict.ok
                        }
                        className={`w-48 py-3 rounded-lg font-medium text-xs transition-all ${
                          !connected ||
                          campaign.status !== "active" ||
                          !verdict.ok
                            ? "bg-[#0a0a0a] text-[#707070] border border-[#1f1f1f] cursor-not-allowed"
                            : "border border-[#3b82f6]/50 bg-[#3b82f6]/10 hover:bg-[#2563eb]/50 text-white"
                        }`}
                      >
                        Claim + NFT Ticket
                      </button>

                      <div className="mt-2 flex items-center gap-1 text-[11px] text-[#3b82f6]">
                        <Ticket className="w-3 h-3" />
                        Ticket minted on claim
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* More info (mining/staking stats) */}
          
        </div>
      </div>

      {/* Proof-of-task modal */}
      {verifierOpen && verifierTaskId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#1f1f1f] bg-[#050816] p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-[#e0e0e0]">
                  Proof-of-Task Verification
                </div>
                <div className="text-xs text-[#707070] mt-1">
                  Open the task link, then run verification.
                </div>
              </div>
              <button
                onClick={() => setVerifierOpen(false)}
                className="w-9 h-9 rounded-lg bg-[#111827] hover:bg-[#1a1a1a] flex items-center justify-center"
              >
                <span className="text-[#a0a0a0] text-lg leading-none">
                  ×
                </span>
              </button>
            </div>

            {(() => {
              const t = socialTasks.find(
                (x) => x.id === verifierTaskId
              );
              if (!t) return null;
              const status = taskStatus[t.id] || "idle";
              const Icon = t.icon;

              return (
                <div className="mt-5 space-y-4">
                  <div className="ui-card rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#e0e0e0]">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-[#707070]">
                        Reward: +{t.points} Alpha point
                      </div>
                    </div>
                    <div className="text-[10px] px-2 py-1 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]">
                      {status === "verified"
                        ? "Verified"
                        : status === "checking"
                        ? "Checking…"
                        : status === "opened"
                        ? "Opened"
                        : "Not started"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => markOpened(t.id)}
                      disabled={
                        !t.link ||
                        status === "verified" ||
                        status === "checking"
                      }
                      className={`w-full py-2.5 rounded-lg text-[12px] font-medium transition-all  ${
                        !t.link ||
                        status === "verified" ||
                        status === "checking"
                          ? "bg-[#0a0a0a] text-[#707070] cursor-not-allowed"
                          : "bg-[#eee]/20 text-[#e0e0e0] "
                      }`}
                    >
                      Open link
                    </button>

                    <button
                      onClick={() => runCheck(t.id)}
                      disabled={
                        status !== "opened" && status !== "idle"
                      }
                      className={`w-full py-2.5 rounded-lg text-[12px] font-medium transition-all ${
                        status === "checking"
                          ? "bg-[#3b82f6]/60"
                          : "bg-[#3b82f6]"
                      } text-white hover:bg-[#2563eb] disabled:bg-[#0a0a0a] disabled:text-[#707070] disabled:border disabled:border-[#1f1f1f] disabled:cursor-not-allowed`}
                    >
                      {status === "checking" ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Checking
                        </span>
                      ) : (
                        "Run verification"
                      )}
                    </button>
                  </div>

                  <div className="ui-inner border border-[#1f1f1f] rounded-xl p-3 text-[11px] text-[#707070]">
                    This is demo verification for now. Later you can
                    plug real checks (OAuth / backend / proofs).
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Airdrop;
