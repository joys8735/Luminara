import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History as HistoryIcon, TrendingUp, TrendingDown, Trophy, Newspaper } from 'lucide-react';

interface SettledBet {
  id: number;
  dir: 'up' | 'down';
  amount: string;
  currency: 'USDT' | 'SOL';
  placedAt: number;
  endAt: number;
  entryPrice: number;
  pair: string;
  result: 'win' | 'lose';
  payout: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyBets: SettledBet[];
  formatDateTime: (ms: number) => string;
  pairs: any[];
  sportsAsPairs: any[];
  newsAsPairs: any[];
}

type CategoryTab = 'all' | 'crypto' | 'sports' | 'news';

export function HistoryModal({
  isOpen,
  onClose,
  historyBets,
  formatDateTime,
  pairs,
  sportsAsPairs,
  newsAsPairs,
}: HistoryModalProps) {
  const [activeTab, setActiveTab] = React.useState<CategoryTab>('all');

  // Фільтрація по категоріях
  const filteredBets = useMemo(() => {
    if (activeTab === 'all') return historyBets;
    
    if (activeTab === 'crypto') {
      return historyBets.filter(bet => bet.id >= 1 && bet.id <= 9);
    }
    
    if (activeTab === 'sports') {
      return historyBets.filter(bet => bet.id >= 101 && bet.id <= 108);
    }
    
    if (activeTab === 'news') {
      return historyBets.filter(bet => bet.id >= 201 && bet.id <= 208);
    }
    
    return historyBets;
  }, [historyBets, activeTab]);

  // Статистика по категорії
  const categoryStats = useMemo(() => {
    const wins = filteredBets.filter(b => b.result === 'win').length;
    const losses = filteredBets.filter(b => b.result === 'lose').length;
    const total = filteredBets.length;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';

    const net = filteredBets.reduce((acc, b) => {
      const v = Number(b.payout) - Number(b.amount);
      return acc + (isNaN(v) ? 0 : v);
    }, 0);

    return { wins, losses, total, winRate, net };
  }, [filteredBets]);

  const tabs: { value: CategoryTab; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <HistoryIcon className="w-4 h-4" /> },
    { value: 'crypto', label: 'Crypto', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'sports', label: 'Sports', icon: <Trophy className="w-4 h-4" /> },
    { value: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 ml-56 bg-black/90 flex items-center justify-center z-30 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative inset-5 bg-[#050816] border border-[#1f1f1f] rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden"
          initial={{ y: 30, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.96 }}
        >
          <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-15 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />

          <div className="relative z-10 space-y-4 text-xs h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
                <HistoryIcon className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-[11px] text-[#a0a0a0]">Prediction history</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[#1f1f1f] pb-3">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all ${
                    activeTab === tab.value
                      ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30'
                      : 'text-[#a0a0a0] hover:text-[#eee]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.value ? 'bg-[#3b82f6]/20' : 'bg-[#eee]/5'
                  }`}>
                    {tab.value === 'all' ? historyBets.length :
                     tab.value === 'crypto' ? historyBets.filter(b => b.id >= 1 && b.id <= 9).length :
                     tab.value === 'sports' ? historyBets.filter(b => b.id >= 101 && b.id <= 108).length :
                     historyBets.filter(b => b.id >= 201 && b.id <= 208).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Stats Summary */}
            {filteredBets.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f1f1f] bg-[#070b14] px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#707070]">Rounds:</span>
                  <span className="text-sm font-semibold ui-bg-text">{categoryStats.total}</span>
                  <span className="w-px h-4 bg-[#1f1f1f]" />
                  <span className="text-[11px] text-[#707070]">Win rate:</span>
                  <span className="text-sm font-semibold text-[#3b82f6]">{categoryStats.winRate}%</span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-green-400">W: {categoryStats.wins}</span>
                  <span className="text-red-400">L: {categoryStats.losses}</span>
                  <span className="w-px h-4 bg-[#1f1f1f]" />
                  <span className="text-[#707070]">Net P&L:</span>
                  <span
                    className={`text-sm font-semibold ${
                      categoryStats.net > 0 ? 'text-green-400' : categoryStats.net < 0 ? 'text-red-400' : 'ui-bg-text'
                    }`}
                  >
                    {categoryStats.net > 0 ? '+' : ''}
                    {categoryStats.net.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredBets.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-[#707070] text-sm py-8 bg-[#070b14] border border-dashed border-[#1f1f1f] rounded-xl w-full">
                  No {activeTab !== 'all' ? activeTab : ''} predictions yet.
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#070b14]">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-2 px-3 py-2 border-b border-[#1f1f1f] text-[11px] text-[#707070]">
                  <div className="col-span-2">Pair / Time</div>
                  <div>Direction</div>
                  <div>Result</div>
                  <div>Bet / Payout</div>
                  <div className="text-right">Currency</div>
                </div>

                {/* Rows */}
                <div className="max-h-[45vh] overflow-y-auto">
                  {filteredBets.map((bet, idx) => {
                    let pair: any;
                    let icon: React.ReactNode;

                    if (bet.id >= 1 && bet.id <= 9) {
                      pair = pairs.find(p => p.id === bet.id);
                      icon = pair ? <img src={`/icons/${pair.logo}.png`} alt="" className="w-4 h-4 object-contain" /> : null;
                    } else if (bet.id >= 101 && bet.id <= 108) {
                      pair = sportsAsPairs.find(p => p.id === bet.id);
                      icon = <Trophy className="w-4 h-4 text-orange-400" />;
                    } else {
                      pair = newsAsPairs.find(p => p.id === bet.id);
                      icon = <Newspaper className="w-4 h-4 text-blue-400" />;
                    }

                    const dateStr = formatDateTime(bet.endAt || bet.placedAt);
                    const isWin = bet.result === 'win';

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-6 gap-2 px-3 py-2 text-[11px] items-center border-b border-[#111827] last:border-b-0 hover:bg-[#050816]/70 transition-colors"
                      >
                        {/* Pair + time */}
                        <div className="col-span-2 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#050816] flex items-center justify-center border border-[#1f1f1f]">
                            {icon}
                          </div>
                          <div>
                            <div className="ui-bg-text font-semibold text-[12px]">{pair?.pair || 'Pair'}</div>
                            <div className="text-[10px] text-[#707070]">{dateStr}</div>
                          </div>
                        </div>

                        {/* Direction */}
                        <div>
                          <span
                            className={
                              bet.dir === 'up' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
                            }
                          >
                            {bet.dir.toUpperCase()}
                          </span>
                        </div>

                        {/* Result badge */}
                        <div>
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isWin
                                ? 'bg-green-500/10 text-green-400 border border-green-500/40'
                                : 'bg-red-500/10 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {bet.result.toUpperCase()}
                          </span>
                        </div>

                        {/* Bet / payout */}
                        <div className="flex flex-col">
                          <span className="ui-bg-text">
                            {bet.amount} <span className="text-[#707070]">→ {bet.payout}</span>
                          </span>
                        </div>

                        {/* Currency */}
                        <div className="text-right text-[#a0a0a0]">{bet.currency}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
