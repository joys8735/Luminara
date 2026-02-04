// components/DailyPriceChallenge.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Target, Trophy, Clock, Users, Award } from 'lucide-react';

interface DailyPriceChallengeProps {
  btcPrice: number; // Поточна ціна BTC
}

export function DailyPriceChallenge({ btcPrice }: DailyPriceChallengeProps) {
  const [prediction, setPrediction] = useState<{
    guess: number;
    submitted: boolean;
    submittedAt: number | null;
    reward?: number;
  }>({ 
    guess: btcPrice, // Автоматично заповнюємо поточною ціною
    submitted: false,
    submittedAt: null 
  });

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [prizePool, setPrizePool] = useState<number>(500);

  // Розрахунок часу до 18:00 UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      
      // Встановлюємо 18:00 UTC сьогодні
      target.setUTCHours(18, 0, 0, 0);
      
      // Якщо вже після 18:00, то встановлюємо на завтра
      if (now > target) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    // Рандомна кількість гравців
    setTotalPlayers(Math.floor(Math.random() * 200) + 50);
    
    // Збільшуємо призовий фонд з часом
    setPrizePool(500 + Math.floor(Date.now() / 3600000) * 10);
    
    return () => clearInterval(interval);
  }, []);

  // Перевіряємо чи вже була зроблена ставка сьогодні
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`price_prediction_${today}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setPrediction(parsed);
    }
  }, []);

  const handleSubmit = () => {
    if (!prediction.guess || prediction.guess <= 0) return;
    
    const today = new Date().toDateString();
    const newPrediction = {
      ...prediction,
      submitted: true,
      submittedAt: Date.now(),
      reward: Math.floor(Math.random() * 300) + 100 // Випадкова нагорода 100-400 AP
    };
    
    setPrediction(newPrediction);
    localStorage.setItem(`price_prediction_${today}`, JSON.stringify(newPrediction));
    
    // Оновлюємо статистику
    setTotalPlayers(prev => prev + 1);
    setPrizePool(prev => prev + 10);
  };

  const difference = prediction.submitted 
    ? Math.abs(prediction.guess - btcPrice).toFixed(2)
    : null;

  return (
    <div className="ui-card rounded-2xl p-4 relative overflow-hidden">
      {/* Фоновий ефект */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#facc15]/5 via-transparent to-[#3b82f6]/5" />
      
      <div className="relative z-10">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#facc15] to-[#f97316] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Price Challenge</h3>
              <p className="text-[11px] text-[#707070]">
                Guess BTC price at 18:00 UTC
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#111827] border border-[#1f1f1f]">
            <Clock className="w-3 h-3 text-[#22c1c3]" />
            <span className="text-[10px] text-white font-medium">{timeLeft}</span>
          </div>
        </div>

        {/* Current BTC Price */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#111827] to-[#1e293b] border border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/icons/btc.png" 
                alt="BTC" 
                className="w-6 h-6"
              />
              <div>
                <div className="text-[10px] text-[#707070]">Current BTC price</div>
                <div className="text-lg font-bold text-white">
                  ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#707070]">Prize pool</div>
              <div className="text-sm font-bold text-[#facc15]">
                {prizePool.toLocaleString()} AP
              </div>
            </div>
          </div>
        </div>

        {/* Форма передбачення */}
        {!prediction.submitted ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[#a0a0a0]">Your prediction ($)</label>
                <span className="text-[10px] text-[#707070]">
                  Current: ${btcPrice.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={prediction.guess}
                  onChange={(e) => setPrediction({
                    ...prediction, 
                    guess: parseFloat(e.target.value) || btcPrice
                  })}
                  className="w-full pl-8 pr-3 py-2.5 bg-[#111827] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
                  placeholder="Enter your prediction"
                  step="0.01"
                  min="0"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707070] text-sm">$</span>
                
                {/* Quick buttons */}
                <div className="flex gap-1 mt-2">
                  {[0.95, 1, 1.05].map((multiplier) => (
                    <button
                      key={multiplier}
                      onClick={() => setPrediction({
                        ...prediction,
                        guess: Math.round(btcPrice * multiplier * 100) / 100
                      })}
                      className="flex-1 px-2 py-1 text-[10px] bg-[#111827] rounded hover:bg-[#1f1f1f] border border-[#1f1f1f] text-[#a0a0a0]"
                    >
                      {multiplier === 1 ? 'Same' : multiplier < 1 ? '-5%' : '+5%'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-[#111827]">
                <div className="text-[#707070]">Players</div>
                <div className="text-white font-semibold">{totalPlayers}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#111827]">
                <div className="text-[#707070]">Avg guess</div>
                <div className="text-white font-semibold">
                  ${(btcPrice * (0.98 + Math.random() * 0.04)).toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#111827]">
                <div className="text-[#707070]">Closest wins</div>
                <div className="text-[#facc15] font-semibold">100-500 AP</div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!prediction.guess}
              className="w-full py-2.5 bg-gradient-to-r from-[#facc15] to-[#f97316] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Prediction
            </button>

            <div className="text-[10px] text-center text-[#707070]">
              One entry per day • Results at 18:05 UTC
            </div>
          </div>
        ) : (
          /* Submitted state */
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#111827] to-[#1e293b] border border-[#1f1f1f] text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#facc15]/10 mb-2">
                <Target className="w-3 h-3 text-[#facc15]" />
                <span className="text-xs text-[#facc15] font-medium">Prediction Submitted!</span>
              </div>
              
              <div className="text-sm text-white mb-1">
                Your guess: <span className="font-bold">${prediction.guess.toLocaleString()}</span>
              </div>
              
              <div className="text-[12px] text-[#a0a0a0]">
                Difference: <span className="text-white font-medium">${difference}</span> • 
                Potential reward: <span className="text-[#facc15] font-medium">up to {prediction.reward} AP</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-[#707070]">
                  <span className="text-white">{totalPlayers}</span> players competing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3 text-[#facc15]" />
                <span className="text-[#707070]">
                  Prize pool: <span className="text-[#facc15]">{prizePool.toLocaleString()} AP</span>
                </span>
              </div>
            </div>

            <div className="text-[10px] text-center text-[#707070]">
              Good luck! Check back after 18:00 UTC to see if you won
            </div>
          </div>
        )}

        {/* Previous winners (статика) */}
        <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
          <div className="text-[10px] text-[#707070] mb-2">Yesterday's winners</div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7] flex items-center justify-center text-xs font-bold">
                🥇
              </div>
              <div>
                <div className="text-white">@CryptoPro</div>
                <div className="text-[#22c1c3]">+450 AP</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#a0a0a0]">Difference: $42.15</div>
              <div className="text-white">Guess: $61,234.56</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}