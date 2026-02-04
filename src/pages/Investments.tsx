import React, { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";
import YieldFeed from "../components/YieldFeed";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Award,
  ArrowRight,
  Shield,
  Users,
  Clock,
  Target,
  Info,
  Zap,
  Flame,
  BarChart3,
} from "lucide-react";
import InvestmentConfirmationModal from "../components/InvestmentConfirmationModal";
import { usePremium } from "../context/PremiumContext";
import ActiveInvestmentsModal, {
  ActiveInvestment,
  InvestmentMode,
} from "../components/ActiveInvestmentsModal";

type RiskLevel = "Low" | "Medium" | "High";

interface InvestmentProject {
  id: number;
  name: string;
  description: string;
  fullDescription: string;
  minInvestment: number;
  expectedReturn: string;
  duration: string;
  riskLevel: RiskLevel;
  totalInvested: number;
  capacity: number;
  investors: number;
  features: string[];
  apy: string;
  lockPeriod: string;
  lockPeriodDays: number;
  mode: InvestmentMode;
  isLaunchpad?: boolean;
  volatility?: number;
  inflow?: number;
  liquidity?: number;
  devScore?: number;
}


export function Investments() {
  const { connected, wallet } = useWallet() as any;

  const [selectedProject, setSelectedProject] =
    useState<InvestmentProject | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");

  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>(
    []
  );
  const [showActiveModal, setShowActiveModal] = useState(false);

  

  const investmentProjects: InvestmentProject[] = [
    {
      id: 1,
      name: "MetaVerse NFT Fund",
      description:
        "Diversified portfolio of premium metaverse NFTs across top virtual worlds.",
      fullDescription:
        "This fund focuses on virtual land, metaverse blue-chip assets and emerging ecosystem NFTs. Balanced exposure to growth and stability with active rebalancing and insurance-backed strategies.",
      minInvestment: 1,
      expectedReturn: "25–40%",
      duration: "6 months",
      riskLevel: "Medium",
      totalInvested: 45000,
      capacity: 100000,
      investors: 127,
      features: [
        "Curated metaverse assets",
        "Active portfolio management",
        "Monthly rebalancing",
        "DeFi insurance vault cover",
      ],
      apy: "32%",
      lockPeriod: "180 days",
      lockPeriodDays: 180,
      mode: "locked",
      volatility: 18,
      inflow: 72,
      liquidity: 88,
      devScore: 90,
    },
    {
      id: 2,
      name: "Blue Chip Collection",
      description:
        "Stable portfolio of established NFT collections with strong communities.",
      fullDescription:
        "Our Blue Chip fund allocates capital to proven, high-liquidity NFT collections with strong long-term fundamentals. This is the most conservative option with lower volatility and steady performance.",
      minInvestment: 5,
      expectedReturn: "15–25%",
      duration: "12 months",
      riskLevel: "Low",
      totalInvested: 180000,
      capacity: 250000,
      investors: 342,
      features: [
        "Established collections only",
        "Lower volatility profile",
        "Quarterly yield payouts",
        "20% insurance protection",
      ],
      apy: "2210%",
      lockPeriod: "365 days",
      lockPeriodDays: 365,
      mode: "liquid",
      volatility: 10,
      inflow: 68,
      liquidity: 92,
      devScore: 95,
    },
    {
      id: 3,
      name: "High-Risk Launchpad Pool",
      description:
        "Short-term, high-risk pool with access to NFT launchpads, mints and new drops.",
      fullDescription:
        "This pool behaves like a launchpad-style strategy: capital goes into early-stage, high-risk NFT and token launches with aggressive upside. Extremely volatile and best suited for experienced investors.",
      minInvestment: 0.5,
      expectedReturn: "50–120%",
      duration: "30–60 days",
      riskLevel: "High",
      totalInvested: 12000,
      capacity: 50000,
      investors: 89,
      features: [
        "Early access allocations",
        "High upside potential",
        "Aggressive strategy",
        "Launchpad-style events",
      ],
      apy: "75%",
      lockPeriod: "60 days",
      lockPeriodDays: 60,
      mode: "high-risk",
      isLaunchpad: true,
      volatility: 35,
      inflow: 80,
      liquidity: 70,
      devScore: 82,
    },
  ];

  const handleInvestClick = (project: InvestmentProject) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    setSelectedProject(project);
    setShowConfirmModal(true);
  };

  const handleConfirmInvestment = (amount: number, currency: string) => {
    if (!selectedProject) return;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Invalid investment amount");
      return;
    }

    const now = new Date();
    const apyValue = Number(selectedProject.apy.replace("%", "")) || 0;

    const normalizedCurrency =
      currency === "BNB" ? "BNB" : "USDT";

    const newActive: ActiveInvestment = {
      id: Date.now(),
      projectId: selectedProject.id,
      fundName: selectedProject.name,
      amount: parsedAmount,
      currency: normalizedCurrency,
      apy: apyValue,
      mode: selectedProject.mode,
      since: now.toISOString(),
      lockDaysLeft: selectedProject.lockPeriodDays,
      autoReinvest: true,
      insuranceEnabled: true,
      volatility: selectedProject.volatility,
      inflow: selectedProject.inflow,
      liquidity: selectedProject.liquidity,
      devScore: selectedProject.devScore,
    };

    setActiveInvestments((prev) => [...prev, newActive]);
    toast.success(
      `Successfully invested ${parsedAmount} ${currency} in ${selectedProject.name}`
    );
    setShowConfirmModal(false);
  };

  const handleFilter = () => {
    const min = parseFloat(minAmount) || 0;
    const max = parseFloat(maxAmount) || Infinity;
    if (min > max) {
      toast.error("Minimum amount cannot be greater than maximum amount");
      return;
    }
    toast.success(`Filtering between ${min} and ${max}`);
  };

  const filteredProjects = useMemo(() => {
    let list = [...investmentProjects];

    if (riskFilter !== "all") {
      list = list.filter((p) => p.riskLevel === riskFilter);
    }

    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);

    if (!Number.isNaN(min)) {
      list = list.filter((p) => p.minInvestment >= min);
    }
    if (!Number.isNaN(max)) {
      list = list.filter((p) => p.minInvestment <= max);
    }

    return list;
  }, [investmentProjects, riskFilter, minAmount, maxAmount]);

  const totalInvestedOverall = investmentProjects.reduce(
    (acc, p) => acc + p.totalInvested,
    0
  );
  const totalInvestorsOverall = investmentProjects.reduce(
    (acc, p) => acc + p.investors,
    0
  );

  const avgApyOverall = useMemo(() => {
    if (investmentProjects.length === 0) return 0;
    const sum = investmentProjects.reduce(
      (acc, p) => acc + Number(p.apy.replace("%", "")),
      0
    );
    return Number((sum / investmentProjects.length).toFixed(1));
  }, [investmentProjects]);

  const linkedWallet =
    (wallet && wallet.publicKey && wallet.publicKey.toBase58?.()) || null;

  const handleExitInvestment = (id: number) => {
    setActiveInvestments((prev) => prev.filter((inv) => inv.id !== id));
    toast.success("Investment exited");
  };

  const { hasPremium } = usePremium();
const insurancePercentage = hasPremium ? 20 : 0;


  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case "Low":
        return "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30";
      case "Medium":
        return "bg-[#eab308]/10 text-[#eab308] border-[#eab308]/30";
      case "High":
        return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30";
      default:
        return "bg-[#6b7280]/10 text-[#e5e7eb] border-[#4b5563]/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      {/* HERO: NFT Investment Funds */}
<div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 md:p-6 relative overflow-hidden">
  {/* така ж тінь як в інших блоках */}
  <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_45%)]" />

  <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    {/* Left: text + CTA */}
    <div className="space-y-4">
      {/* pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#020617] px-3 py-1 text-[11px] text-[#9ca3af]">
        <Shield className="h-3.5 w-3.5 text-[#3b82f6]" />
        <span>Curated yield vaults with built-in risk controls</span>
      </div>

      {/* title + desc */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#e5e7eb]">
          NFT Investment Funds
        </h1>
        <p className="mt-1 text-xs md:text-sm text-[#9ca3af] max-w-xl">
          Structured strategies around NFTs, launchpads and blue-chip collections.
          Deposit once, let the vault rotate positions, and farm yield while your
          risk is capped by on-chain rules.
        </p>
      </div>

      {/* feature chips */}
      <div className="flex flex-wrap gap-2 text-[10px] text-[#9ca3af]">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1120] border border-[#1f2937] px-2 py-1">
          <TrendingUp className="h-3 w-3 text-[#3b82f6]" />
          Auto-rebalanced strategies
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1120] border border-[#1f2937] px-2 py-1">
          <Shield className="h-3 w-3 text-[#22c55e]" />
          20% capital shield
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1120] border border-[#1f2937] px-2 py-1">
          <Zap className="h-3 w-3 text-[#facc15]" />
          Launchpad exposure
        </span>
      </div>

      {/* CTA + hint */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setShowActiveModal(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#3b82f6]/50 bg-[#0b1120] px-4 py-2 text-xs md:text-sm font-medium text-[#e5e7eb] hover:bg-[#1d2740] transition-all w-max"
        >
          <PieChart className="h-4 w-4 text-[#3b82f6]" />
          View active investments
        </button>
        <span className="text-[10px] text-[#6b7280]">
          See your allocations, performance and current strategy mixes.
        </span>
      </div>
    </div>

    {/* Right: hero stats */}
    <div className="grid w-full max-w-xs grid-cols-2 gap-3 text-xs">
      <div className="bg-[#020617] border border-[#1f1f1f] rounded-xl p-3 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
            <DollarSign className="h-3 w-3 text-[#3b82f6]" />
            Total managed
          </div>
          <div className="mt-1 text-sm font-semibold text-[#e5e7eb]">
            ${totalInvestedOverall.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-[#6b7280]">
            Across all strategies
          </div>
        </div>
      </div>

      <div className="bg-[#020617] border border-[#1f1f1f] rounded-xl p-3 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_70%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
            <TrendingUp className="h-3 w-3 text-[#22c55e]" />
            Average APY
          </div>
          <div className="mt-1 text-sm font-semibold text-[#22c55e]">
            {avgApyOverall}%
          </div>
          <div className="mt-1 text-[10px] text-[#6b7280]">
            Weighted across funds
          </div>
        </div>
      </div>

      <div className="bg-[#020617] border border-[#1f1f1f] rounded-xl p-3 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
            <Users className="h-3 w-3 text-[#3b82f6]" />
            Active investors
          </div>
          <div className="mt-1 text-sm font-semibold text-[#e5e7eb]">
            {totalInvestorsOverall}
          </div>
          <div className="mt-1 text-[10px] text-[#6b7280]">
            Across {investmentProjects.length} funds
          </div>
        </div>
      </div>

      <div className="bg-[#020617] border border-[#1f1f1f] rounded-xl p-3 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
            <BarChart3 className="h-3 w-3 text-[#3b82f6]" />
            Your positions
          </div>
          <div className="mt-1 text-sm font-semibold text-[#e5e7eb]">
            {activeInvestments.length}
          </div>
          <div className="mt-1 text-[10px] text-[#6b7280]">
            Tracked in portfolio view
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* SAFETY + LAUNCHPAD ROW */}
<div className="grid grid-cols-1 gap-2 md:grid-cols-3 mt-3">
  {/* Insurance */}
  <div className="flex items-start gap-3 rounded-2xl border border-[#1f1f1f] bg-[#121212] p-4 relative overflow-hidden">
    <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />
    <div className="relative z-10 flex gap-3">
      <div className="-mt-1 flex h-9 w-9 items-center justify-center rounded-xl">
        <Shield className="h-5 w-5 text-[#3b82f6]" />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#e5e7eb]">
          Insurance Vault — 20% Protection
        </div>
        <p className="mt-1 text-xs text-[#9ca3af]">
          Insured funds include a{' '}
          <span className="font-semibold text-[#e5e7eb]">20% capital shield</span>{' '}
          against critical protocol failures and extreme events.
        </p>
        <p className="mt-1 text-[10px] text-[#6b7280]">
          Protection applies to principal only, not unrealized yield.
        </p>
      </div>
    </div>
  </div>

  {/* High-risk launchpad */}
  <div className="flex items-start gap-3 rounded-2xl border border-[#1f1f1f] bg-[#121212] p-4 relative overflow-hidden">
    <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#f97316_0,_transparent_65%)]" />
    <div className="relative z-10 flex gap-3">
      <div className="-mt-1 flex h-9 w-9 items-center justify-center rounded-xl ">
        <Flame className="h-5 w-5 text-red-400" />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#e5e7eb]">
          High-Risk Launchpad Exposure
        </div>
        <p className="mt-1 text-xs text-[#9ca3af]">
          Access short-term launchpad pools with{' '}
          <span className="font-semibold text-red-400">elevated upside</span>{' '}
          and clear risk labels. Best suited for a smaller, aggressive slice of
          your portfolio.
        </p>
        <p className="mt-1 text-[10px] text-[#6b7280]">
          Designed for degen allocations, not long-term core capital.
        </p>
      </div>
    </div>
  </div>

  {/* Live yield feed */}
  <div className="rounded-2xl border border-[#1f1f1f] bg-[#121212] p-0 overflow-hidden relative">
    <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />
    <div className="relative z-10">
      <div className="flex items-center justify-between px-4 pt-3">
        <div>
          <div className="text-xs font-semibold text-[#e5e7eb]">
            Live yield feed
          </div>
          <div className="text-[10px] text-[#6b7280]">
            Recent APY shifts across active strategies.
          </div>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-[#3b82f6]" />
      </div>
      <div className="mt-1 max-h-40 overflow-auto px-1 pb-2">
        <YieldFeed />
      </div>
    </div>
  </div>
</div>


      {/* Funds list */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-stretch">
              {/* Left info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-[#e5e7eb]">
                        {project.name}
                      </h3>
                      {project.isLaunchpad && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#7f1d1d] px-2 py-0.5 text-[10px] font-semibold text-[#fecaca] border border-[#b91c1c]">
                          <Flame className="h-3 w-3" />
                          Launchpad pool
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#9ca3af]">
                      {project.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-7 items-center justify-center rounded-full border px-3 text-[11px] font-medium ${getRiskColor(
                      project.riskLevel
                    )}`}
                  >
                    {project.riskLevel} risk
                  </span>
                </div>

                <div className="rounded-xl border border-[#1f1f1f] bg-[#1a1a1a] p-3">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3b82f6]" />
                    <p className="text-xs leading-relaxed text-[#9ca3af]">
                      {project.fullDescription}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-xs">
                  <div className="rounded-lg border border-[#1f1f1f] bg-[#050816] p-3">
                    <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                      <DollarSign className="h-3 w-3" />
                      Min allocation
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#e5e7eb]">
                      {project.minInvestment} BNB
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#1f1f1f] bg-[#050816] p-3">
                    <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                      <Target className="h-3 w-3" />
                      Expected return
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#3b82f6]">
                      {project.expectedReturn}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#1f1f1f] bg-[#050816] p-3">
                    <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                      <Clock className="h-3 w-3" />
                      Strategy horizon
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#e5e7eb]">
                      {project.duration}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#1f1f1f] bg-[#050816] p-3">
                    <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                      <Users className="h-3 w-3" />
                      Participants
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#e5e7eb]">
                      {project.investors}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between text-[11px] text-[#9ca3af]">
                    <span>Fund capacity</span>
                    <span className="text-[#e5e7eb]">
                      ${project.totalInvested.toLocaleString()} / $
                      {project.capacity.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#050816] border border-[#1f1f1f]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] via-[#22c55e] to-[#a855f7]"
                      style={{
                        width: `${
                          (project.totalInvested / project.capacity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#9ca3af]">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-[#22c55e]" />
                    {insurancePercentage === 0 ? (
                     <p className="text-[11px]">
                              Insurance coverage: <span className="text-[#f97373] font-semibold">0%</span>.  
                              Activate <span className="text-[#3b82f6] font-semibold">Premium</span> to get{" "}
                              <span className="text-[#22c55e] font-semibold">20% downside protection</span> on this strategy.
                            </p>
                    ) : (
                      <p className="text-[11px]">
                Insurance coverage:{" "}
                <span className="text-[#22c55e] font-semibold">
                  {insurancePercentage}% of principal
                </span>{" "}
                in case of strategy failure
              </p>
              )}
                  </div>
                  {project.isLaunchpad ? (
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-[#facc15]" />
                      <span>High-risk, short horizon launchpad allocations</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-[#3b82f6]" />
                      <span>Optimized for long-term compounding</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right compact block */}
              <div className="flex w-full shrink-0 flex-col justify-between gap-3 lg:max-w-[230px]">
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-[#9ca3af]">
                      <span>APY snapshot</span>
                      <TrendingUp className="h-3 w-3 text-[#22c55e]" />
                    </div>
                    <div className="text-xl font-semibold text-[#3b82f6]">
                      {project.apy}
                    </div>
                    
                    <div className="mt-1 text-[10px] text-[#6b7280]">
                      Updated regularly per strategy
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3">
                    <div className="mb-1 text-[11px] text-[#9ca3af]">
                      Lock period
                    </div>
                    <div className="text-sm font-semibold text-[#e5e7eb]">
                      {project.lockPeriod}
                    </div>
                    <div className="mt-1 text-[10px] text-[#6b7280]">
                      Mode:{" "}
                      <span className="text-[#e5e7eb] font-medium">
                        {project.mode === "liquid"
                          ? "Liquid"
                          : project.mode === "locked"
                          ? "Locked"
                          : "High-risk"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] p-3 flex items-center justify-between text-[11px] text-[#9ca3af]">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-[#facc15]" />
                      <span>Strategy score</span>
                    </div>
                    <span className="text-[#e5e7eb] font-semibold">
                      {project.devScore ?? 80}/100
                    </span>
                  </div>
                </div>


                <button
                  onClick={() => handleInvestClick(project)}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#2563eb]"
                >
                  Invest now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <InvestmentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmInvestment}
        project={selectedProject}
      />

      <ActiveInvestmentsModal
        isOpen={showActiveModal}
        onClose={() => setShowActiveModal(false)}
        walletAddress={linkedWallet}
        investments={activeInvestments}
        onExitInvestment={handleExitInvestment}
      />
    </div>
  );
}

function FilterIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="M3 5a1 1 0 0 1 1-1h12a1 1 0 0 1 .8 1.6l-4 5.333V15a1 1 0 0 1-.553.894l-3 1.5A1 1 0 0 1 8 16.5v-5.567l-4-5.333A1 1 0 0 1 3 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Investments;
