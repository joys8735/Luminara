// src/pages/Home.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import {
  Clock,
  Flame,
  Check,
  X,
  Star,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  Users,
  Award,
  Shield,
  Sparkles,
  LineChart,
} from 'lucide-react';

import ProjectCard from '../components/Home/ProjectCard';
import TierSystem from '../components/Home/TierSystem';
import InvestmentModal from '../components/Home/InvestmentModal';
import FeaturedProject from '../components/Home/FeaturedProject';

export function Home() {
  const { connected } = useWallet();

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
  const [showTiers, setShowTiers] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  // 🔹 Tier / XP / Investor state (поки що фронт-логіка, без бекенду)
  const [tierLevel, setTierLevel] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>('Silver');
  const [tierXP, setTierXP] = useState(420);       // поточний XP
  const [tierGoal, setTierGoal] = useState(800);   // XP до наступного тиру

  const [investorStats, setInvestorStats] = useState({
    totalInvestedUSD: 1250,
    avgAPY: 26.4,
    unlockedUSD: 430,
    lockedUSD: 820,
    pendingClaimsUSD: 120,
    nftTickets: 3,
  });

  const [userInvestments, setUserInvestments] = useState<
    { projectId: number; amountUSD: number; date: string }[]
  >([
    {
      projectId: 1,
      amountUSD: 250,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      projectId: 3,
      amountUSD: 1000,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
  ]);

  // 🔹 Projects with AI score + verification flags
  const projects = [
    {
      id: 1,
      name: 'MetaVerse Pioneers',
      symbol: 'MVP',
      logo: 'https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=400&auto=format&fit=crop',
      description: 'Next generation virtual reality platform built on Solana',
      status: 'active',
      raised: 850000,
      goal: 1000000,
      price: 0.05,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      minTier: 'Silver',
      categories: ['Metaverse', 'Gaming'],
      socials: {
        website: 'https://example.com',
        twitter: 'https://twitter.com',
        telegram: 'https://telegram.org',
      },
      aiScore: 86,
      aiVerdict: 'Strong fundamentals, active community, solid tokenomics.',
      teamVerified: true,
      verificationNote: 'KYC + smart contract audit passed',
    },
    {
      id: 2,
      name: 'DeFi Aggregator Protocol',
      symbol: 'DAP',
      logo: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=400&auto=format&fit=crop',
      description: 'Cross-chain DeFi aggregator with automated yield optimization',
      status: 'upcoming',
      raised: 0,
      goal: 750000,
      price: 0.03,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      minTier: 'Bronze',
      categories: ['DeFi', 'Yield'],
      socials: {
        website: 'https://example.com',
        twitter: 'https://twitter.com',
        telegram: 'https://telegram.org',
      },
      aiScore: 74,
      aiVerdict: 'Good DeFi narrative, mid risk, needs traction.',
      teamVerified: true,
      verificationNote: 'Core team KYC, audit in progress',
    },
    {
      id: 3,
      name: 'NFT Marketplace Revolution',
      symbol: 'NMR',
      logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop',
      description: 'Revolutionary NFT marketplace with creator royalties and DAO governance',
      status: 'ended',
      raised: 1200000,
      goal: 1000000,
      price: 0.08,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      minTier: 'Gold',
      categories: ['NFT', 'Marketplace'],
      socials: {
        website: 'https://example.com',
        twitter: 'https://twitter.com',
        telegram: 'https://telegram.org',
      },
      aiScore: 91,
      aiVerdict: 'Top-tier NFT infra, strong demand, over-subscribed.',
      teamVerified: true,
      verificationNote: 'Audited, docs + public core team',
    },
    {
      id: 4,
      name: 'Solana AI Oracle',
      symbol: 'SAIO',
      logo: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop',
      description: 'AI-powered oracle system for real-world data verification on Solana',
      status: 'active',
      raised: 450000,
      goal: 2000000,
      price: 0.12,
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      minTier: 'Bronze',
      categories: ['AI', 'Oracle'],
      socials: {
        website: 'https://example.com',
        twitter: 'https://twitter.com',
        telegram: 'https://telegram.org',
      },
      aiScore: 79,
      aiVerdict: 'AI + oracle narrative, mid-term upside.',
      teamVerified: false,
      verificationNote: 'Docs OK, audit pending',
    },
    {
      id: 5,
      name: 'GameFi Ecosystem',
      symbol: 'GFE',
      logo: 'https://images.unsplash.com/photo-1642516303080-431f6681f864?q=80&w=400&auto=format&fit=crop',
      description: 'Comprehensive GameFi ecosystem with play-to-earn mechanics',
      status: 'upcoming',
      raised: 0,
      goal: 1500000,
      price: 0.07,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      minTier: 'Silver',
      categories: ['Gaming', 'GameFi'],
      socials: {
        website: 'https://example.com',
        twitter: 'https://twitter.com',
        telegram: 'https://telegram.org',
      },
      aiScore: 68,
      aiVerdict: 'Fun concept, needs more data on token utility.',
      teamVerified: false,
      verificationNote: 'Team semi-anon, no audit yet',
    },
    {
      id: 6,
      name: 'Decentralized Storage Network',
      symbol: 'DSN',
      logo: 'https://images.unsplash.com/photo-1639803931666-e66f5bf6d526?q=80&w=400&auto=format&fit=crop',
      description: 'Distributed storage solution built on Solana blockchain',
      status: 'ended',
      raised: 3000000,
      goal: 3000000,
      price: 0.15,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      minTier: 'Platinum',
      categories: ['Infrastructure', 'Storage'],
      socials: {
        website: 'https://example.com',
        twitter: 'https://twitter.com',
        telegram: 'https://telegram.org',
      },
      aiScore: 88,
      aiVerdict: 'Infra blue-chip style, strong backing.',
      teamVerified: true,
      verificationNote: 'Top-tier VCs, full audit',
    },
  ];

  const featuredProject = projects.find(p => p.status === 'active') || projects[0];

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter(project => project.status === activeFilter);
  }, [activeFilter, projects]);

  // 🧠 AI score helper
  const getAiScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-[#facc15]';
    return 'text-red-400';
  };

  const getAiScoreLabel = (score: number) => {
    if (score >= 85) return 'High Confidence';
    if (score >= 70) return 'Moderate';
    return 'Speculative';
  };

  // Hero live stats
  const heroStats = useMemo(() => {
    const totalRaised = projects.reduce((sum, p) => sum + p.raised, 0);
    const totalGoal = projects.reduce((sum, p) => sum + p.goal, 0);
    const activeCount = projects.filter(p => p.status === 'active').length;
    const upcomingCount = projects.filter(p => p.status === 'upcoming').length;
    const endingSoon = projects
      .filter(p => p.status === 'active')
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())[0];

    return {
      totalRaised,
      totalGoal,
      activeCount,
      upcomingCount,
      endingSoon,
      participation: 12473, // фейкові цифри для краси
    };
  }, [projects]);

  // Mini XP %
  const xpPercent = Math.min(100, (tierXP / tierGoal) * 100);

  // 🧬 авто-XP + інвест-стата + NFT Ticket UI
  const handleInvest = (project: any) => {
    if (!connected) return;
    setSelectedProject(project);
    setShowInvestmentModal(true);
  };

  // 👉 ЦЮ функцію можна викликати з InvestmentModal,
  //    коли юзер підтверджує інвестицію.
  const handleInvestmentCompleted = (payload: { projectId: number; amountUSD: number }) => {
    const { projectId, amountUSD } = payload;

    // XP
    const xpGain = Math.round(amountUSD * 0.6); // 1$ = 0.6 XP, просто приклад
    setTierXP(prev => {
      const next = prev + xpGain;
      if (next >= tierGoal) {
        // Примітивний "левел ап"
        setTierLevel(prevLevel => {
          if (prevLevel === 'Bronze') return 'Silver';
          if (prevLevel === 'Silver') return 'Gold';
          if (prevLevel === 'Gold') return 'Platinum';
          return prevLevel;
        });
        setTierGoal(prevGoal => prevGoal + 600); // наступний поріг
      }
      return next;
    });

    // Investor stats
    setInvestorStats(prev => {
      const totalInvestedUSD = prev.totalInvestedUSD + amountUSD;
      const lockedAdd = amountUSD * 0.7;
      const unlockedAdd = amountUSD * 0.3;
      const pendingAdd = amountUSD * 0.1;

      // проста корекція середнього APY
      const newAvgApy = (prev.avgAPY * 0.9) + 3;

      return {
        totalInvestedUSD,
        avgAPY: Number(newAvgApy.toFixed(1)),
        unlockedUSD: prev.unlockedUSD + unlockedAdd,
        lockedUSD: prev.lockedUSD + lockedAdd,
        pendingClaimsUSD: prev.pendingClaimsUSD + pendingAdd,
        nftTickets: prev.nftTickets + 1,
      };
    });

    setUserInvestments(prev => [
      ...prev,
      {
        projectId,
        amountUSD,
        date: new Date().toISOString(),
      },
    ]);
  };

  const lastTicket = useMemo(() => {
    if (userInvestments.length === 0) return null;
    const last = userInvestments[userInvestments.length - 1];
    const proj = projects.find(p => p.id === last.projectId);
    return {
      ...last,
      projectName: proj?.name ?? 'Unknown project',
      symbol: proj?.symbol ?? '',
    };
  }, [userInvestments, projects]);

  return (
    <div className="space-y-6">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#050816] px-6 py-6 md:px-8 md:py-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#3b82f6]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-[-80px] h-64 w-64 rounded-full bg-[#22c1c3]/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left side */}
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816]/80 px-2.5 py-1">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff88]" />
              <span className="text-[10px] font-medium text-[#e0e0e0]">
                Live IDO Launchpad • SolanaVerse
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#f5f5f5] md:text-3xl">
              Discover, invest & farm the next{' '}
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#22c1c3] bg-clip-text text-transparent">
                generation of Web3 projects
              </span>
            </h1>
            <p className="mt-2 text-xs text-[#a0a0a0] md:text-sm">
              Early access to curated IDOs on Solana. Tiered allocations, AI-powered project
              scoring, and NFT Proof-of-Invest tickets — all in one place.
            </p>

            {/* Hero stats row */}
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg bg-[#0b1020] border border-[#1f1f1f] px-3 py-2">
                <div className="flex items-center gap-2 text-[10px] text-[#707070]">
                  <TrendingUp className="h-3 w-3 text-[#3b82f6]" />
                  Total Raised
                </div>
                <div className="mt-1 text-sm font-semibold text-[#e0e0e0]">
                  ${(heroStats.totalRaised / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="rounded-lg bg-[#0b1020] border border-[#1f1f1f] px-3 py-2">
                <div className="flex items-center gap-2 text-[10px] text-[#707070]">
                  <Users className="h-3 w-3 text-[#3b82f6]" />
                  Investors
                </div>
                <div className="mt-1 text-sm font-semibold text-[#e0e0e0]">
                  {heroStats.participation.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg bg-[#0b1020] border border-[#1f1f1f] px-3 py-2">
                <div className="flex items-center gap-2 text-[10px] text-[#707070]">
                  <Flame className="h-3 w-3 text-[#f97316]" />
                  Active IDOs
                </div>
                <div className="mt-1 text-sm font-semibold text-[#e0e0e0]">
                  {heroStats.activeCount}
                </div>
              </div>
              <div className="rounded-lg bg-[#0b1020] border border-[#1f1f1f] px-3 py-2">
                <div className="flex items-center gap-2 text-[10px] text-[#707070]">
                  <Clock className="h-3 w-3 text-[#22c1c3]" />
                  Upcoming
                </div>
                <div className="mt-1 text-sm font-semibold text-[#e0e0e0]">
                  {heroStats.upcomingCount}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: tier + investor summary */}
          <div className="flex w-full max-w-sm flex-col gap-3">
            {/* Tier mini bar */}
            <div className="rounded-xl border border-[#1f1f1f] bg-[#080b16] px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-[#facc15]" />
                  <span className="text-[11px] font-semibold text-[#e0e0e0]">
                    Your Tier: {tierLevel}
                  </span>
                </div>
                <span className="text-[10px] text-[#707070]">
                  {tierXP}/{tierGoal} XP
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#111827]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] via-[#22c1c3] to-[#a855f7]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#707070]">
                <span>Invest more to reach next tier</span>
                <span>+ higher allocations</span>
              </div>
            </div>

            {/* Investor panel */}
            <div className="rounded-xl border border-[#1f1f1f] bg-[#080b16] px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="h-3.5 w-3.5 text-[#3b82f6]" />
                  <span className="text-[11px] font-semibold text-[#e0e0e0]">
                    Your Launchpad Stats
                  </span>
                </div>
                <span className="text-[10px] text-[#22c1c3]">Live</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <div className="text-[#707070]">Total Invested</div>
                  <div className="font-semibold text-[#e0e0e0]">
                    ${investorStats.totalInvestedUSD.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[#707070]">Avg APY (applied)</div>
                  <div className="font-semibold text-[#3b82f6]">
                    {investorStats.avgAPY.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-[#707070]">Unlocked</div>
                  <div className="font-semibold text-[#22c1c3]">
                    ${investorStats.unlockedUSD.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[#707070]">Locked</div>
                  <div className="font-semibold text-[#e0e0e0]">
                    ${investorStats.lockedUSD.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-[#707070]">
                  Pending claims:{' '}
                  <span className="text-[#e0e0e0]">
                    ${investorStats.pendingClaimsUSD.toFixed(2)}
                  </span>
                </span>
                <span className="text-[#707070]">
                  NFT tickets:{' '}
                  <span className="text-[#e0e0e0]">{investorStats.nftTickets}</span>
                </span>
              </div>
            </div>

            {/* NFT Proof-of-Invest ticket */}
            {lastTicket && (
              <div className="rounded-xl border border-[#1f1f1f] bg-[#050816] px-4 py-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#22c1c3]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold text-[#e0e0e0]">
                    Proof-of-Invest Ticket
                  </div>
                  <div className="text-[10px] text-[#a0a0a0]">
                    {lastTicket.projectName} • ${lastTicket.amountUSD.toFixed(2)} invested
                  </div>
                </div>
                <div className="rounded-full border border-[#1f1f1f] px-2 py-0.5 text-[9px] text-[#22c1c3]">
                  NFT • Demo
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured project (як було) */}
      <div className="relative">
        <FeaturedProject project={featuredProject} onInvest={handleInvest} />
      </div>

      {/* Filters + Tier button */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-lg font-semibold text-[#e0e0e0]">IDO Launchpool</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] border border-[#1f1f1f]'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
              activeFilter === 'active'
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] border border-[#1f1f1f]'
            }`}
          >
            <Flame className="h-3 w-3" />
            Active
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
              activeFilter === 'upcoming'
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] border border-[#1f1f1f]'
            }`}
          >
            <Clock className="h-3 w-3" />
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('ended')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
              activeFilter === 'ended'
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] border border-[#1f1f1f]'
            }`}
          >
            <Check className="h-3 w-3" />
            Ended
          </button>
          <button
            onClick={() => setShowTiers(!showTiers)}
            className="flex items-center gap-1 rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[#2563eb]"
          >
            <Star className="h-3 w-3" />
            Tier System
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showTiers ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {showTiers && (
        <div className="animate-fadeIn rounded-lg border border-[#1f1f1f] bg-[#121212] p-6">
          <TierSystem />
        </div>
      )}

      {!connected && (
        <div className="rounded-lg border border-[#1f1f1f] bg-[#1a1a1a] p-4">
          <div className="flex items-start">
            <AlertTriangle className="mr-3 h-4 w-4 flex-shrink-0 text-[#a0a0a0] mt-0.5" />
            <div>
              <h3 className="text-xs font-medium text-[#e0e0e0]">
                Wallet not connected
              </h3>
              <p className="mt-1 text-xs text-[#707070]">
                Connect your wallet to participate in IDO projects and track your
                investments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Projects grid + AI score + verification badge */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map(project => (
          <div key={project.id} className="space-y-2">
            <ProjectCard
              project={project}
              onInvest={() => handleInvest(project)}
            />

            {/* AI Project Score + Team badge */}
            <div className="flex flex-col gap-2 rounded-lg border border-[#1f1f1f] bg-[#121212] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#a855f7]" />
                  <span className="text-[11px] font-semibold text-[#e0e0e0]">
                    AI Project Score
                  </span>
                </div>
                <div className={`text-xs font-bold ${getAiScoreColor(project.aiScore)}`}>
                  {project.aiScore}/100
                </div>
              </div>
              <div className="text-[10px] text-[#a0a0a0]">
                {project.aiVerdict}{' '}
                <span className="font-medium text-[#e0e0e0]">
                  ({getAiScoreLabel(project.aiScore)})
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <Shield
                    className={`h-3 w-3 ${
                      project.teamVerified ? 'text-[#22c55e]' : 'text-[#f97316]'
                    }`}
                  />
                  <span
                    className={
                      project.teamVerified
                        ? 'text-[#22c55e] font-semibold'
                        : 'text-[#fbbf24] font-semibold'
                    }
                  >
                    {project.teamVerified ? 'Verified Team' : 'Team not fully verified'}
                  </span>
                </div>
                <span className="text-[#707070]">{project.verificationNote}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="rounded-lg border border-[#1f1f1f] bg-[#121212] p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a]">
            <X className="h-6 w-6 text-[#707070]" />
          </div>
          <h3 className="mb-1 text-sm font-medium text-[#e0e0e0]">
            No {activeFilter} projects found
          </h3>
          <p className="mb-3 text-xs text-[#707070]">
            {activeFilter === 'active' && 'There are no active IDO projects at the moment.'}
            {activeFilter === 'upcoming' &&
              'There are no upcoming IDO projects at the moment.'}
            {activeFilter === 'ended' && 'There are no ended IDO projects at the moment.'}
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="text-xs text-[#3b82f6] hover:underline"
          >
            View all projects
          </button>
        </div>
      )}

      {/* CTA для проєктів */}
      <div className="rounded-lg border border-[#1f1f1f] bg-[#121212] p-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="mb-1 text-base font-semibold text-[#e0e0e0]">
              Launch Your Project on SolanaVerse
            </h2>
            <p className="text-xs text-[#a0a0a0]">
              Get access to our community of investors and raise funds for your project.
            </p>
          </div>
          <Link
            to="/apply-for-ido"
            className="rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-medium text-white hover:bg-[#2563eb]"
          >
            Apply for IDO
          </Link>
        </div>
      </div>

      {/* Investment Modal (з callback для XP/статів) */}
      {showInvestmentModal && selectedProject && (
        // @ts-ignore – додатковий проп для майбутньої логіки
        <InvestmentModal
          project={selectedProject}
          onClose={() => setShowInvestmentModal(false)}
          onInvestComplete={(payload: { projectId: number; amountUSD: number }) =>
            handleInvestmentCompleted(payload)
          }
        />
      )}
    </div>
  );
}

export default Home;
