import React, { useMemo, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Gem,
  Coins,
  PieChart,
  Copy,
  ExternalLink,
  Wallet,
  ShieldCheck,
  Sparkles,
  Clock,
} from 'lucide-react';

type TabKey = 'overview' | 'investments' | 'transactions';

export function Portfolio() {
  const { connected, publicKey, balance, cashbackBalance, withdrawCashback } = useWallet();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // ===== MOCK DATA (потім підв’яжемо до бекенду/ончейн) =====
  const portfolioData = {
    totalInvested: 7.85,
    totalValue: 10.32,
    profitLoss: 2.47,
    profitLossPercentage: 31.5,
    investments: [
      {
        id: 1,
        projectName: 'MetaVerse Pioneers',
        symbol: 'MVP',
        logo: 'https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=400&auto=format&fit=crop',
        investedAmount: 2.5,
        tokenAmount: 50000,
        currentValue: 3.75,
        profitLoss: 1.25,
        profitLossPercentage: 50,
        purchaseDate: '2023-11-15',
        status: 'active',
        expectedReturn: '25-40%',
        duration: '6 months',
        daysRemaining: 142,
        risk: 'Medium',
      },
      {
        id: 2,
        projectName: 'DeFi Aggregator Protocol',
        symbol: 'DAP',
        logo: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=400&auto=format&fit=crop',
        investedAmount: 1.35,
        tokenAmount: 45000,
        currentValue: 2.2,
        profitLoss: 0.85,
        profitLossPercentage: 63,
        purchaseDate: '2023-10-22',
        status: 'active',
        expectedReturn: '15-25%',
        duration: '12 months',
        daysRemaining: 289,
        risk: 'Low',
      },
      {
        id: 3,
        projectName: 'NFT Marketplace Revolution',
        symbol: 'NMR',
        logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop',
        investedAmount: 4,
        tokenAmount: 50000,
        currentValue: 4.37,
        profitLoss: 0.37,
        profitLossPercentage: 9.25,
        purchaseDate: '2023-09-05',
        status: 'active',
        expectedReturn: '50-100%',
        duration: '3 months',
        daysRemaining: 18,
        risk: 'High',
      },
    ],
    transactions: [
      {
        id: 1,
        type: 'invest',
        description: 'Invested in MetaVerse Pioneers',
        amount: '2.5',
        token: 'SOL',
        date: '2023-11-15 10:32',
        status: 'completed',
      },
      {
        id: 2,
        type: 'claim',
        description: 'Claimed MVP Tokens',
        amount: '25000',
        token: 'MVP',
        date: '2023-11-25 14:15',
        status: 'completed',
      },
      {
        id: 3,
        type: 'invest',
        description: 'Invested in DeFi Aggregator Protocol',
        amount: '1.35',
        token: 'SOL',
        date: '2023-10-22 09:45',
        status: 'completed',
      },
    ],
  };

  const usdRate = 25; // тимчасово (потім реальний SOL/USD)

  const pnlPositive = portfolioData.profitLoss >= 0;

  const shortAddress = (addr?: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  };

  const copyWallet = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      toast.success('Wallet address copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const openExplorer = () => {
    if (!publicKey) return;
    window.open(`https://solscan.io/account/${publicKey}`, '_blank', 'noopener,noreferrer');
  };

  const allocation = useMemo(() => {
    const total = portfolioData.investments.reduce((s, i) => s + i.currentValue, 0) || 1;
    return portfolioData.investments
      .map(i => ({
        id: i.id,
        symbol: i.symbol,
        name: i.projectName,
        pct: Math.max(0, Math.min(100, (i.currentValue / total) * 100)),
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [portfolioData.investments]);

  const topMover = useMemo(() => {
    return [...portfolioData.investments].sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)[0];
  }, [portfolioData.investments]);

  // ====== Small UI components ======
  const Pill = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]'
          : 'bg-[#1a1a1a] border-[#1f1f1f] text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#222]'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({
    title,
    icon,
    value,
    sub,
    accent = 'blue',
  }: {
    title: string;
    icon: React.ReactNode;
    value: React.ReactNode;
    sub?: React.ReactNode;
    accent?: 'blue' | 'green' | 'gray';
  }) => {
    const accentClass =
      accent === 'green'
        ? 'from-[#22c55e]/15 to-[#00d1ff]/10 border-[#22c55e]/25'
        : accent === 'gray'
        ? 'from-[#ffffff]/5 to-[#ffffff]/0 border-[#1f1f1f]'
        : 'from-[#3b82f6]/15 to-[#00d1ff]/10 border-[#3b82f6]/25';

    return (
      <div className={`bg-gradient-to-br ${accentClass} border rounded-2xl p-4 relative overflow-hidden`}>
        <div className="pointer-events-none absolute -inset-0.5 opacity-30 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[#707070]">{title}</div>
            <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="text-lg font-semibold text-[#e0e0e0]">{value}</div>
          {sub && <div className="text-[11px] text-[#707070] mt-1">{sub}</div>}
        </div>
      </div>
    );
  };

  const TransactionItem = ({ transaction }: { transaction: any }) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'invest':
          return <ArrowUpRight className="h-3.5 w-3.5 text-[#3b82f6]" />;
        case 'claim':
          return <ArrowDownLeft className="h-3.5 w-3.5 text-[#3b82f6]" />;
        case 'sell':
          return <Coins className="h-3.5 w-3.5 text-[#3b82f6]" />;
        default:
          return <Gem className="h-3.5 w-3.5 text-[#a0a0a0]" />;
      }
    };

    return (
      <div className="flex items-center py-3 border-b border-[#1f1f1f] last:border-0">
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-2 rounded-lg mr-3">
          {getTypeIcon(transaction.type)}
        </div>

        <div className="flex-grow">
          <div className="flex justify-between gap-3">
            <span className="text-xs font-medium text-[#e0e0e0] truncate">{transaction.description}</span>
            <span className="text-xs font-medium text-[#e0e0e0] whitespace-nowrap">
              {transaction.amount} {transaction.token}
            </span>
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#707070] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {transaction.date}
            </span>
            <span className="text-[10px] text-[#3b82f6]">{transaction.status}</span>
          </div>
        </div>
      </div>
    );
  };

  const InvestmentCard = ({ investment }: { investment: any }) => {
    const isProfitable = investment.profitLoss >= 0;

    const riskBadge =
      investment.risk === 'High'
        ? 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10'
        : investment.risk === 'Medium'
        ? 'text-[#facc15] border-[#facc15]/40 bg-[#facc15]/10'
        : 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10';

    return (
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all">
        <div className="flex items-center p-4 border-b border-[#1f1f1f]">
          <div className="h-10 w-10 rounded-xl overflow-hidden mr-3 border border-[#1f1f1f]">
            <img src={investment.logo} alt={investment.projectName} className="h-full w-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#e0e0e0] truncate">{investment.projectName}</h3>
            <p className="text-xs text-[#707070]">{investment.symbol}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-1 rounded-full border ${riskBadge}`}>{investment.risk}</span>
            <div
              className={`px-2 py-1 rounded-full text-[10px] font-medium border flex items-center ${
                isProfitable
                  ? 'border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]'
                  : 'border-[#a0a0a0]/30 bg-[#a0a0a0]/10 text-[#a0a0a0]'
              }`}
            >
              {isProfitable ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isProfitable ? '+' : ''}
              {investment.profitLossPercentage}%
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
              <div className="text-[10px] text-[#707070] mb-0.5">Invested</div>
              <div className="text-xs font-semibold text-[#e0e0e0]">{investment.investedAmount} SOL</div>
              <div className="text-[10px] text-[#707070] mt-0.5">${(investment.investedAmount * usdRate).toFixed(2)}</div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
              <div className="text-[10px] text-[#707070] mb-0.5">Current Value</div>
              <div className="text-xs font-semibold text-[#e0e0e0]">{investment.currentValue} SOL</div>
              <div className="text-[10px] text-[#707070] mt-0.5">${(investment.currentValue * usdRate).toFixed(2)}</div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
              <div className="text-[10px] text-[#707070] mb-0.5">Tokens</div>
              <div className="text-xs font-semibold text-[#e0e0e0]">{investment.tokenAmount.toLocaleString()}</div>
              <div className="text-[10px] text-[#707070] mt-0.5">Est. ROI: {investment.expectedReturn}</div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
              <div className="text-[10px] text-[#707070] mb-0.5">Time Left</div>
              <div className="text-xs font-semibold text-[#e0e0e0]">{investment.daysRemaining}d</div>
              <div className="text-[10px] text-[#707070] mt-0.5">Lock: {investment.duration}</div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-[#707070]">Profit / Loss</span>
              <span className={`text-xs font-medium ${isProfitable ? 'text-[#3b82f6]' : 'text-[#a0a0a0]'}`}>
                {isProfitable ? '+' : ''}
                {investment.profitLoss} SOL
              </span>
            </div>

            <div className="h-2 w-full bg-[#121212] rounded-full overflow-hidden border border-[#1f1f1f]">
              <div
                className="h-full bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] rounded-full transition-all duration-700"
                style={{ width: `${Math.min(Math.abs(investment.profitLossPercentage), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ======== Disconnected screen ========
  if (!connected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-25 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]" />
          <div className="relative z-10">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <PieChart className="h-6 w-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-lg font-semibold text-[#e0e0e0] mb-2">Wallet Not Connected</h2>
            <p className="text-xs text-[#a0a0a0]">Connect your wallet to view your portfolio and track investments.</p>
          </div>
        </div>
      </div>
    );
  }

  // ======== Main ========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#e0e0e0]">My Portfolio</h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">Track your investments and performance</p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyWallet}
            className="h-9 px-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] text-[#e0e0e0] transition-colors text-xs flex items-center gap-2"
          >
            <Copy className="w-4 h-4 text-[#a0a0a0]" />
            Copy
          </button>

          <button
            onClick={openExplorer}
            className="h-9 px-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] text-[#e0e0e0] transition-colors text-xs flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-[#a0a0a0]" />
            Explorer
          </button>
        </div>
      </div>

      {/* Portfolio Hero */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-25 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-5">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[#707070] mb-1">Connected wallet</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-[#3b82f6] rounded-full" />
                  <div className="font-mono text-sm text-[#e0e0e0]">{shortAddress(publicKey)}</div>
                </div>
              </div>

              <div
                className={`text-[10px] px-2 py-1 rounded-full border ${
                  pnlPositive
                    ? 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10'
                    : 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10'
                }`}
              >
                {pnlPositive ? 'Net Profit' : 'Net Loss'} • {portfolioData.profitLossPercentage}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
                <div className="text-[10px] text-[#707070] mb-1 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-[#a0a0a0]" /> SOL Balance
                </div>
                <div className="text-sm font-semibold text-[#e0e0e0]">{balance} SOL</div>
                <div className="text-[10px] text-[#707070] mt-0.5">${(balance * usdRate).toFixed(2)} USD</div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
                <div className="text-[10px] text-[#707070] mb-1 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#a0a0a0]" /> Cashback
                </div>
                <div className="text-sm font-semibold text-[#e0e0e0]">{cashbackBalance.toFixed(4)} SOL</div>
                <button
                  onClick={withdrawCashback}
                  disabled={cashbackBalance === 0}
                  className={`mt-2 w-full py-1.5 px-3 rounded-lg font-medium text-xs ${
                    cashbackBalance === 0
                      ? 'bg-[#121212] text-[#707070] cursor-not-allowed border border-[#1f1f1f]'
                      : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3">
                <div className="text-[10px] text-[#707070] mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#a0a0a0]" /> Top mover
                </div>
                <div className="text-sm font-semibold text-[#e0e0e0]">{topMover?.symbol}</div>
                <div className="text-[10px] text-[#3b82f6] mt-0.5">+{topMover?.profitLossPercentage}%</div>
              </div>
            </div>
          </div>

          {/* Allocation mini */}
          <div className="w-full lg:w-[360px] bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-[#e0e0e0] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#3b82f6]" />
                Allocation
              </div>
              <div className="text-[10px] text-[#707070]">{portfolioData.investments.length} positions</div>
            </div>

            <div className="space-y-2">
              {allocation.slice(0, 4).map((a) => (
                <div key={a.id}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#a0a0a0]">{a.symbol}</span>
                    <span className="text-[#e0e0e0]">{a.pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-[#121212] border border-[#1f1f1f] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, a.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-[#707070] mt-3">
              UI-only. Later: real-time price feeds + rebalance hints.
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invested"
          icon={<DollarSign className="h-4 w-4 text-[#3b82f6]" />}
          value={`${portfolioData.totalInvested} SOL`}
          sub={`$${(portfolioData.totalInvested * usdRate).toFixed(2)} USD`}
          accent="blue"
        />
        <StatCard
          title="Current Value"
          icon={<TrendingUp className="h-4 w-4 text-[#3b82f6]" />}
          value={`${portfolioData.totalValue} SOL`}
          sub={`$${(portfolioData.totalValue * usdRate).toFixed(2)} USD`}
          accent="blue"
        />
        <StatCard
          title="Profit / Loss"
          icon={pnlPositive ? <TrendingUp className="h-4 w-4 text-[#22c55e]" /> : <TrendingDown className="h-4 w-4 text-[#ef4444]" />}
          value={
            <span className={pnlPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {pnlPositive ? '+' : ''}
              {portfolioData.profitLoss} SOL
            </span>
          }
          sub={
            <span className={pnlPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {pnlPositive ? '+' : ''}
              {portfolioData.profitLossPercentage}% overall
            </span>
          }
          accent={pnlPositive ? 'green' : 'gray'}
        />
        <StatCard
          title="Positions"
          icon={<Coins className="h-4 w-4 text-[#3b82f6]" />}
          value={`${portfolioData.investments.length}`}
          sub="Active allocations"
          accent="gray"
        />
      </div>

      {/* Tabs */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1f1f1f] flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill active={activeTab === 'overview'} label="Overview" onClick={() => setActiveTab('overview')} />
            <Pill active={activeTab === 'investments'} label="Investments" onClick={() => setActiveTab('investments')} />
            <Pill active={activeTab === 'transactions'} label="Transactions" onClick={() => setActiveTab('transactions')} />
          </div>

          <div className="text-[10px] text-[#707070]">
            Wallet: <span className="text-[#e0e0e0] font-mono">{shortAddress(publicKey)}</span>
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'investments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#e0e0e0]">Your Investments</h2>
                <span className="text-[10px] text-[#707070]">Sorted by performance</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...portfolioData.investments]
                  .sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)
                  .map((investment) => (
                    <InvestmentCard key={investment.id} investment={investment} />
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-[#e0e0e0] mb-2">Highlights</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-3">
                      <div className="text-[10px] text-[#707070] mb-1">Best performer</div>
                      <div className="text-sm font-semibold text-[#e0e0e0]">{topMover?.symbol}</div>
                      <div className="text-[10px] text-[#3b82f6] mt-0.5">+{topMover?.profitLossPercentage}%</div>
                    </div>
                    <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-3">
                      <div className="text-[10px] text-[#707070] mb-1">Net PnL</div>
                      <div className={`text-sm font-semibold ${pnlPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {pnlPositive ? '+' : ''}
                        {portfolioData.profitLoss} SOL
                      </div>
                      <div className="text-[10px] text-[#707070] mt-0.5">Across all positions</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-[#e0e0e0]">Recent Investments</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {portfolioData.investments.slice(0, 2).map((investment) => (
                      <InvestmentCard key={investment.id} investment={investment} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#e0e0e0]">Recent Transactions</h3>
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl">
                  <div className="px-4">
                    {portfolioData.transactions.slice(0, 6).map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-[#e0e0e0] mb-2">AI Hint</div>
                  <div className="text-[11px] text-[#a0a0a0]">
                    Consider increasing allocation into{' '}
                    <span className="text-[#e0e0e0] font-medium">{topMover?.symbol}</span> if volatility matches your risk profile.
                  </div>
                  <div className="text-[10px] text-[#707070] mt-2">UI-only. Later: real signals + risk model.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#e0e0e0]">Transaction History</h2>
                <span className="text-[10px] text-[#707070]">Latest first</span>
              </div>

              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl">
                <div className="px-4">
                  {[...portfolioData.transactions].reverse().map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
