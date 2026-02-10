// pages/PredictionsPage.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Clock, Users, Award, 
  Plus, Filter, Search, BarChart3, Trophy, Sparkles 
} from 'lucide-react';
import { usePredictions, PredictionOutcome } from '../hooks/usePredictions';
import { useWallet } from '../context/WalletContext';
import { toast } from 'sonner';

export default function PredictionsPage() {
  const { connected, publicKey } = useWallet();
  const { 
    predictions, 
    userBets, 
    userStats, 
    loading, 
    placeBetBNB, 
    calculateOdds,
    calculatePotentialWin,
    canUserBet,
    refreshData 
  } = usePredictions();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [betAmount, setBetAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<PredictionOutcome>(PredictionOutcome.UP);

  const categories = [
    { id: 'all', name: 'All', icon: '📊', count: predictions.length },
    { id: 'crypto-prices', name: 'Crypto', icon: '₿', count: 12 },
    { id: 'sports', name: 'Sports', icon: '⚽', count: 8 },
    { id: 'politics', name: 'Politics', icon: '🏛️', count: 5 },
    { id: 'technology', name: 'Tech', icon: '💻', count: 7 },
  ];

  const filteredPredictions = predictions.filter(prediction => {
    if (selectedCategory !== 'all' && prediction.category !== selectedCategory) {
      return false;
    }
    if (searchQuery && !prediction.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handlePlaceBet = async (predictionId: number) => {
    if (!connected) {
      toast.error('Please connect wallet');
      return;
    }
    
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter valid bet amount');
      return;
    }
    
    const success = await placeBetBNB(
      predictionId,
      selectedOutcome,
      parseFloat(betAmount)
    );
    
    if (success) {
      setSelectedPrediction(null);
      setBetAmount('');
      toast.success('Bet placed successfully!');
    }
  };

  const getTimeRemaining = (lockTime: number) => {
    const now = Date.now() / 1000;
    const remaining = lockTime - now;
    
    if (remaining <= 0) return 'Locked';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  const getOutcomeIcon = (outcome: PredictionOutcome) => {
    switch (outcome) {
      case PredictionOutcome.UP: return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case PredictionOutcome.DOWN: return <TrendingDown className="w-4 h-4 text-rose-500" />;
      case PredictionOutcome.DRAW: return <Minus className="w-4 h-4 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#3b82f6]" />
            Predictions Market
          </h1>
          <p className="text-[#a0a0a0] mt-2">
            Predict outcomes, place bets, and win big!
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {userStats && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-[#a0a0a0]">Win Rate</div>
                <div className="text-xl font-bold text-white">
                  {((userStats.wins / userStats.totalBets) * 100 || 0).toFixed(1)}%
                </div>
              </div>
              <div className="h-8 w-px bg-[#1f1f1f]" />
              <div className="text-center">
                <div className="text-sm text-[#a0a0a0]">Total Won</div>
                <div className="text-xl font-bold text-emerald-500">
                  ${parseFloat(userStats.totalWon).toFixed(2)}
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Prediction
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#1a1a1a] hover:bg-[#222] text-[#a0a0a0]'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            <span className="text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search predictions..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#1f1f1f] text-white placeholder-[#707070] focus:outline-none focus:border-[#3b82f6]"
          />
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPredictions.map(prediction => (
          <div
            key={prediction.id}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-5 hover:border-[#3b82f6]/30 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-md bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-medium">
                    {prediction.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#a0a0a0]">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(prediction.lockTime)}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {prediction.title}
                </h3>
                <p className="text-sm text-[#a0a0a0] line-clamp-2">
                  {prediction.description}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center p-3 rounded-lg bg-[#0f0f0f]">
                <div className="text-xs text-[#a0a0a0]">Up Pool</div>
                <div className="text-lg font-bold text-emerald-500">
                  {parseFloat(prediction.upPool).toFixed(2)} BNB
                </div>
                <div className="text-xs text-[#707070]">
                  {calculateOdds(prediction, PredictionOutcome.UP)}x
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-[#0f0f0f]">
                <div className="text-xs text-[#a0a0a0]">Down Pool</div>
                <div className="text-lg font-bold text-rose-500">
                  {parseFloat(prediction.downPool).toFixed(2)} BNB
                </div>
                <div className="text-xs text-[#707070]">
                  {calculateOdds(prediction, PredictionOutcome.DOWN)}x
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-[#0f0f0f]">
                <div className="text-xs text-[#a0a0a0]">Draw Pool</div>
                <div className="text-lg font-bold text-amber-500">
                  {parseFloat(prediction.drawPool).toFixed(2)} BNB
                </div>
                <div className="text-xs text-[#707070]">
                  {calculateOdds(prediction, PredictionOutcome.DRAW)}x
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedPrediction(prediction);
                  setSelectedOutcome(PredictionOutcome.UP);
                }}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Bet Up
              </button>
              
              <button
                onClick={() => {
                  setSelectedPrediction(prediction);
                  setSelectedOutcome(PredictionOutcome.DOWN);
                }}
                className="flex-1 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <TrendingDown className="w-4 h-4" />
                Bet Down
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bet Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#121212] border border-[#1f1f1f] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Place Your Bet</h3>
                <p className="text-sm text-[#a0a0a0]">{selectedPrediction.title}</p>
              </div>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="text-2xl text-[#707070]">×</span>
              </button>
            </div>

            {/* Outcome Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { outcome: PredictionOutcome.UP, label: 'Up', color: 'emerald' },
                { outcome: PredictionOutcome.DOWN, label: 'Down', color: 'rose' },
                { outcome: PredictionOutcome.DRAW, label: 'Draw', color: 'amber' },
              ].map(({ outcome, label, color }) => (
                <button
                  key={outcome}
                  onClick={() => setSelectedOutcome(outcome)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedOutcome === outcome
                      ? `border-${color}-500 bg-${color}-500/10`
                      : 'border-[#1f1f1f] hover:border-[#333]'
                  }`}
                >
                  <div className={`text-center text-${color}-500 font-medium`}>
                    {label}
                  </div>
                  <div className="text-center text-white text-lg font-bold mt-1">
                    {calculateOdds(selectedPrediction, outcome)}x
                  </div>
                </button>
              ))}
            </div>

            {/* Bet Amount */}
            <div className="mb-6">
              <label className="block text-sm text-[#a0a0a0] mb-2">
                Bet Amount (BNB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full pl-4 pr-20 py-3 rounded-xl bg-[#1a1a1a] border border-[#1f1f1f] text-white placeholder-[#707070] focus:outline-none focus:border-[#3b82f6]"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={() => setBetAmount('0.01')}
                    className="px-2 py-1 text-xs rounded-md bg-[#2a2a2a] hover:bg-[#333]"
                  >
                    0.01
                  </button>
                  <button
                    onClick={() => setBetAmount('0.1')}
                    className="px-2 py-1 text-xs rounded-md bg-[#2a2a2a] hover:bg-[#333]"
                  >
                    0.1
                  </button>
                  <button
                    onClick={() => setBetAmount('1')}
                    className="px-2 py-1 text-xs rounded-md bg-[#2a2a2a] hover:bg-[#333]"
                  >
                    1
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#707070] mt-2">
                Min: {selectedPrediction.minBet} BNB • Max: {selectedPrediction.maxBet} BNB
              </div>
            </div>

            {/* Potential Win */}
            <div className="mb-6 p-4 rounded-xl bg-[#0f172a]/50 border border-[#1e293b]">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-[#a0a0a0]">Potential Win</div>
                <div className="text-lg font-bold text-emerald-500">
                  {betAmount ? calculatePotentialWin(
                    selectedPrediction,
                    selectedOutcome,
                    parseFloat(betAmount)
                  ).toFixed(4) : '0.0000'} BNB
                </div>
              </div>
              <div className="text-xs text-[#707070]">
                Odds: {calculateOdds(selectedPrediction, selectedOutcome)}x • 
                Fee: 3% platform + 2% creator
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPrediction(null)}
                className="flex-1 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePlaceBet(selectedPrediction.id)}
                disabled={!betAmount || !canUserBet(selectedPrediction)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Place Bet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPredictions.length === 0 && (
        <div className="text-center py-20">
          <BarChart3 className="w-16 h-16 text-[#3b82f6] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No predictions found</h3>
          <p className="text-[#a0a0a0] mb-6">
            {searchQuery ? 'Try a different search term' : 'Be the first to create a prediction!'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white font-medium flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create First Prediction
          </button>
        </div>
      )}
    </div>
  );
}