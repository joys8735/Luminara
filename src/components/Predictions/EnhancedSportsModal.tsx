import React from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, TrendingUp, TrendingDown, Trophy, Users, Target, Shield, Clock, Flame } from 'lucide-react';

interface TeamStats {
  wins: number;
  losses: number;
  draws: number;
  form: string[]; // ['W', 'L', 'W', 'D', 'W']
  goalsScored: number;
  goalsConceded: number;
}

interface H2HMatch {
  date: string;
  homeScore: number;
  awayScore: number;
  winner: 'home' | 'away' | 'draw';
}

interface EnhancedSportsModalProps {
  pair: any;
  amount: string;
  setAmount: (val: string) => void;
  currency: 'USDT' | 'SOL';
  setCurrency: (val: 'USDT' | 'SOL') => void;
  onClose: () => void;
  onPlaceBet: (pairId: number, dir: 'up' | 'down') => void;
  connected: boolean;
  possibleWin: (pairId: number, amount: string, currency: 'USDT' | 'SOL') => string;
}

const LIMITS = {
  USDT: { min: 5, max: 5000 },
  SOL: { min: 0.1, max: 50 },
};

export function EnhancedSportsModal({
  pair,
  amount,
  setAmount,
  currency,
  setCurrency,
  onClose,
  onPlaceBet,
  connected,
  possibleWin,
}: EnhancedSportsModalProps) {
  // Mock дані - в реальності з API
  const homeTeam = pair.homeTeam || pair.pair.split(' vs ')[0] || 'Team A';
  const awayTeam = pair.awayTeam || pair.pair.split(' vs ')[1] || 'Team B';

  const homeStats: TeamStats = {
    wins: 15,
    losses: 3,
    draws: 2,
    form: ['W', 'W', 'L', 'W', 'D'],
    goalsScored: 42,
    goalsConceded: 18,
  };

  const awayStats: TeamStats = {
    wins: 12,
    losses: 5,
    draws: 3,
    form: ['W', 'D', 'W', 'L', 'W'],
    goalsScored: 35,
    goalsConceded: 22,
  };

  const h2hMatches: H2HMatch[] = [
    { date: '2024-01-15', homeScore: 2, awayScore: 1, winner: 'home' },
    { date: '2023-09-20', homeScore: 1, awayScore: 1, winner: 'draw' },
    { date: '2023-05-10', homeScore: 0, awayScore: 2, winner: 'away' },
  ];

  const h2hStats = {
    homeWins: h2hMatches.filter(m => m.winner === 'home').length,
    awayWins: h2hMatches.filter(m => m.winner === 'away').length,
    draws: h2hMatches.filter(m => m.winner === 'draw').length,
  };

  const getFormColor = (result: string) => {
    if (result === 'W') return 'bg-green-500';
    if (result === 'L') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#333]/70 backdrop-blur-sm overflow-y-auto flex items-center justify-center z-10 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative inset-2 lg:ml-36 ml-0 ui-inner rounded-2xl p-6 max-w-6xl w-full overflow-y-auto lg:overflow-hidden max-h-[90vh]"
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.96 }}
      >
        <div className="relative space-y-5">
          {/* 🔥 ENHANCED VERSION BADGE */}
          <div className="absolute top-0 right-0 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold animate-pulse">
            ✨ ENHANCED VERSION
          </div>
          
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h3 className="text-sm ui-bg-text font-semibold">{pair.pair}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    {pair.sportTitle || 'Football'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#707070]">
                  <Clock className="w-3 h-3" />
                  <span>Starts: {new Date(pair.commenceTime || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="rounded-full bg-[#111827] p-2 text-[#707070] hover:ui-bg-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Team Stats */}
            <div className="lg:col-span-2 space-y-4">
              {/* Teams Comparison */}
              <div className="ui-card rounded-2xl p-5 space-y-4">
                <div className="text-sm font-semibold ui-bg-text flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  Teams Comparison
                </div>

                {/* Teams Header */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Home Team */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center mb-2">
                      <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-sm font-bold ui-bg-text">{homeTeam}</div>
                    <div className="text-[10px] text-[#707070]">Home</div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#707070]">VS</div>
                  </div>

                  {/* Away Team */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/30 flex items-center justify-center mb-2">
                      <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="text-sm font-bold ui-bg-text">{awayTeam}</div>
                    <div className="text-[10px] text-[#707070]">Away</div>
                  </div>
                </div>

                {/* Stats Comparison */}
                <div className="space-y-3">
                  {/* Wins */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-400 font-semibold">{homeStats.wins}</span>
                      <span className="text-[#707070]">Wins</span>
                      <span className="text-red-400 font-semibold">{awayStats.wins}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#111827] overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600" 
                        style={{ width: `${(homeStats.wins / (homeStats.wins + awayStats.wins)) * 100}%` }}
                      />
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600" 
                        style={{ width: `${(awayStats.wins / (homeStats.wins + awayStats.wins)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Goals Scored */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-400 font-semibold">{homeStats.goalsScored}</span>
                      <span className="text-[#707070]">Goals Scored</span>
                      <span className="text-red-400 font-semibold">{awayStats.goalsScored}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#111827] overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600" 
                        style={{ width: `${(homeStats.goalsScored / (homeStats.goalsScored + awayStats.goalsScored)) * 100}%` }}
                      />
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600" 
                        style={{ width: `${(awayStats.goalsScored / (homeStats.goalsScored + awayStats.goalsScored)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Goals Conceded */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-400 font-semibold">{homeStats.goalsConceded}</span>
                      <span className="text-[#707070]">Goals Conceded</span>
                      <span className="text-red-400 font-semibold">{awayStats.goalsConceded}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#111827] overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600" 
                        style={{ width: `${(homeStats.goalsConceded / (homeStats.goalsConceded + awayStats.goalsConceded)) * 100}%` }}
                      />
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600" 
                        style={{ width: `${(awayStats.goalsConceded / (homeStats.goalsConceded + awayStats.goalsConceded)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1f1f1f]">
                  <div>
                    <div className="text-[11px] text-[#707070] mb-2">Recent Form (Last 5)</div>
                    <div className="flex gap-1">
                      {homeStats.form.map((result, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${getFormColor(result)}`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#707070] mb-2">Recent Form (Last 5)</div>
                    <div className="flex gap-1">
                      {awayStats.form.map((result, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${getFormColor(result)}`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Head to Head */}
              <div className="ui-card rounded-2xl p-5 space-y-3">
                <div className="text-sm font-semibold ui-bg-text flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  Head to Head
                </div>

                {/* H2H Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="ui-inner rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">{h2hStats.homeWins}</div>
                    <div className="text-[10px] text-[#707070]">{homeTeam} Wins</div>
                  </div>
                  <div className="ui-inner rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">{h2hStats.draws}</div>
                    <div className="text-[10px] text-[#707070]">Draws</div>
                  </div>
                  <div className="ui-inner rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-400">{h2hStats.awayWins}</div>
                    <div className="text-[10px] text-[#707070]">{awayTeam} Wins</div>
                  </div>
                </div>

                {/* Last Matches */}
                <div className="space-y-2">
                  <div className="text-[11px] text-[#707070]">Last 3 Matches</div>
                  {h2hMatches.map((match, i) => (
                    <div key={i} className="flex items-center justify-between ui-inner rounded-lg p-2 text-[11px]">
                      <span className="text-[#707070]">{new Date(match.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className={match.winner === 'home' ? 'text-blue-400 font-semibold' : 'ui-bg-text'}>
                          {match.homeScore}
                        </span>
                        <span className="text-[#707070]">-</span>
                        <span className={match.winner === 'away' ? 'text-red-400 font-semibold' : 'ui-bg-text'}>
                          {match.awayScore}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        match.winner === 'home' ? 'bg-blue-500/10 text-blue-400' :
                        match.winner === 'away' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {match.winner === 'home' ? homeTeam : match.winner === 'away' ? awayTeam : 'Draw'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Betting Form */}
            <div className="space-y-3">
              {/* Current Odds */}
              <div className="ui-card rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold ui-bg-text flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Current Odds
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="ui-inner rounded-lg p-3 text-center">
                    <div className="text-[10px] text-[#707070] mb-1">{homeTeam}</div>
                    <div className="text-lg font-bold text-blue-400">{pair.homeOdds?.toFixed(2) || '2.10'}</div>
                  </div>
                  <div className="ui-inner rounded-lg p-3 text-center">
                    <div className="text-[10px] text-[#707070] mb-1">{awayTeam}</div>
                    <div className="text-lg font-bold text-red-400">{pair.awayOdds?.toFixed(2) || '1.85'}</div>
                  </div>
                </div>

                <div className="ui-inner rounded-lg p-2 text-[10px] text-[#a0a0a0]">
                  <div className="font-semibold text-[#eee] mb-1">Payout Multiplier</div>
                  Your potential return is ×{pair.mult.toFixed(2)} of your bet amount
                </div>
              </div>

              {/* Currency selector */}
              <div className="grid grid-cols-2 gap-3">
                {(['USDT', 'SOL'] as const).map((cur) => {
                  const active = currency === cur;
                  const lim = LIMITS[cur];
                  const icon = cur === 'USDT' ? 'usdt' : 'sol';

                  return (
                    <button
                      key={cur}
                      onClick={() => setCurrency(cur)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                        active ? 'border-orange-500/50 ui-card' : 'border-[#1f1f1f] bg-[#eee]/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={`/icons/${icon}.png`} className="w-6 h-6 object-contain" alt={cur} />
                      </div>
                      <div>
                        <div className="ui-bg-text font-semibold text-xs">{cur}</div>
                        <div className="text-[10px] text-[#707070]">
                          Min {lim.min} • Max {lim.max}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Amount input */}
              <div className="space-y-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`0.00 ${currency}`}
                    className="w-full pl-8 pr-3 font-semibold py-4 bg-[#eee]/5 rounded-xl ui-bg-text text-sm outline-none focus:border-orange-500/30"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[10, 25, 50, 100, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className="px-3 py-1.5 rounded-full bg-[#eee]/5 text-[#a0a0a0] hover:border-orange-500/50"
                    >
                      {v} {currency}
                    </button>
                  ))}
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div className="text-left text-[11px] text-[#707070]">
                    Potential win:{' '}
                    <span className="text-orange-400 font-semibold">~ {possibleWin(pair.id, amount, currency)}</span>
                  </div>
                )}
              </div>

              {/* Outcome buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onPlaceBet(pair.id, 'up')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>{homeTeam}</span>
                  <span className="text-[10px] opacity-70">WIN</span>
                </button>

                <button
                  onClick={() => onPlaceBet(pair.id, 'down')}
                  disabled={!connected || !amount || parseFloat(amount) <= 0}
                  className={`py-3 rounded-lg font-medium flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                    !connected || !amount || parseFloat(amount) <= 0
                      ? 'bg-[#1a1a1a] text-[#707070] border border-[#1f1f1f]'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:opacity-90'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>{awayTeam}</span>
                  <span className="text-[10px] opacity-70">WIN</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
