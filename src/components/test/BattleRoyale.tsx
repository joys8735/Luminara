// components/BattleRoyale.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Target, Crown, Users, Zap, Timer, Skull, Shield } from 'lucide-react';

export function BattleRoyale() {
  const [battleState, setBattleState] = useState({
    phase: 'waiting' as 'waiting' | 'registration' | 'predicting' | 'battle' | 'finished',
    players: 87,
    maxPlayers: 100,
    timeLeft: 124, // секунди
    prizePool: 2500,
    round: 1,
    totalRounds: 5,
    survivors: 87,
    eliminated: 13,
    yourStatus: 'alive' as 'alive' | 'eliminated' | 'spectating',
    yourRank: 87,
  });

  const [battleHistory, setBattleHistory] = useState([
    { round: 1, eliminated: 20, survivors: 80 },
    { round: 2, eliminated: 30, survivors: 50 },
    { round: 3, eliminated: 35, survivors: 15 },
    { round: 4, eliminated: 10, survivors: 5 },
    { round: 5, eliminated: 4, survivors: 1 },
  ]);

  // Імітація битви
  useEffect(() => {
    const interval = setInterval(() => {
      setBattleState(prev => {
        // Зміна фаз
        let newPhase = prev.phase;
        if (prev.phase === 'waiting' && prev.players >= prev.maxPlayers) {
          newPhase = 'registration';
        } else if (prev.phase === 'registration' && prev.timeLeft <= 0) {
          newPhase = 'predicting';
        } else if (prev.phase === 'predicting' && prev.timeLeft <= 0) {
          newPhase = 'battle';
        } else if (prev.phase === 'battle' && prev.survivors <= 1) {
          newPhase = 'finished';
        }

        // Елімінація гравців
        let newSurvivors = prev.survivors;
        let newEliminated = prev.eliminated;
        let newRank = prev.yourRank;
        
        if (prev.phase === 'battle' && Math.random() > 0.8) {
          const eliminated = Math.floor(Math.random() * 5) + 1;
          newSurvivors = Math.max(1, prev.survivors - eliminated);
          newEliminated = prev.eliminated + eliminated;
          
          // Можливість елімінації гравця
          if (prev.yourStatus === 'alive' && Math.random() > 0.9) {
            newRank = prev.players - newEliminated;
          }
        }

        return {
          ...prev,
          phase: newPhase,
          timeLeft: prev.timeLeft > 0 ? prev.timeLeft - 1 : 0,
          players: prev.phase === 'waiting' ? 
            Math.min(prev.maxPlayers, prev.players + Math.floor(Math.random() * 3)) : 
            prev.players,
          survivors: newSurvivors,
          eliminated: newEliminated,
          yourRank: newRank,
          yourStatus: prev.yourRank <= newSurvivors ? 'alive' : 'eliminated',
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const joinBattle = () => {
    if (battleState.phase === 'waiting' || battleState.phase === 'registration') {
      setBattleState(prev => ({
        ...prev,
        players: Math.min(prev.maxPlayers, prev.players + 1),
        yourStatus: 'alive',
        yourRank: prev.players + 1,
      }));
    }
  };

  const getPhaseColor = () => {
    switch(battleState.phase) {
      case 'waiting': return 'bg-blue-500';
      case 'registration': return 'bg-purple-500';
      case 'predicting': return 'bg-yellow-500';
      case 'battle': return 'bg-red-500';
      case 'finished': return 'bg-green-500';
    }
  };

  const getPhaseIcon = () => {
    switch(battleState.phase) {
      case 'waiting': return <Timer className="w-4 h-4" />;
      case 'registration': return <Users className="w-4 h-4" />;
      case 'predicting': return <Target className="w-4 h-4" />;
      case 'battle': return <Swords className="w-4 h-4" />;
      case 'finished': return <Crown className="w-4 h-4" />;
    }
  };

  return (
    <div className="ui-card rounded-2xl p-4 relative overflow-hidden">
      {/* Фон з темою битви */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-purple-900/20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Battle Royale</h3>
              <p className="text-[11px] text-[#707070]">Only one survives!</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getPhaseColor()}/20 border ${getPhaseColor()}/30`}>
            {getPhaseIcon()}
            <span className="text-[10px] text-white font-medium capitalize">{battleState.phase}</span>
          </div>
        </div>

        {/* Статистика битви */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
            <div className="text-[10px] text-[#707070]">Players</div>
            <div className="text-lg font-bold text-white">{battleState.players}</div>
            <div className="text-[10px] text-[#707070]">/{battleState.maxPlayers}</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
            <div className="text-[10px] text-[#707070]">Prize Pool</div>
            <div className="text-lg font-bold text-[#facc15]">{battleState.prizePool.toLocaleString()} AP</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
            <div className="text-[10px] text-[#707070]">Survivors</div>
            <div className="text-lg font-bold text-green-400">{battleState.survivors}</div>
            <div className="text-[10px] text-red-400">{battleState.eliminated} eliminated</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
            <div className="text-[10px] text-[#707070]">Your Rank</div>
            <div className={`text-lg font-bold ${
              battleState.yourStatus === 'alive' ? 'text-green-400' : 
              battleState.yourStatus === 'eliminated' ? 'text-red-400' : 
              'text-[#707070]'
            }`}>
              #{battleState.yourRank || '—'}
            </div>
          </div>
        </div>

        {/* Таймер та прогрес */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-[#707070] mb-1">
            <span>Next phase in:</span>
            <span>{Math.floor(battleState.timeLeft / 60)}:{String(battleState.timeLeft % 60).padStart(2, '0')}</span>
          </div>
          <div className="h-2 rounded-full bg-[#111827] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              style={{ width: `${100 - (battleState.timeLeft / 180) * 100}%` }}
            />
          </div>
        </div>

        {/* Візуалізація битви */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-[#707070] mb-2">
            <span>Battle Arena:</span>
            <span>Round {battleState.round}/{battleState.totalRounds}</span>
          </div>
          
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 100 }).map((_, index) => {
              const isAlive = index < battleState.survivors;
              const isYou = battleState.yourRank === index + 1;
              
              return (
                <motion.div
                  key={index}
                  className={`h-6 rounded flex items-center justify-center ${
                    isAlive 
                      ? isYou 
                        ? 'bg-gradient-to-br from-green-500 to-blue-500 border-2 border-white' 
                        : 'bg-gradient-to-br from-green-600 to-green-400'
                      : 'bg-gradient-to-br from-red-600 to-red-400'
                  }`}
                  animate={{
                    scale: isAlive && battleState.phase === 'battle' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: isAlive && battleState.phase === 'battle' ? Infinity : 0,
                    delay: index * 0.05,
                  }}
                >
                  {isYou && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                  {!isAlive && (
                    <Skull className="w-3 h-3 text-white/50" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Ваш статус */}
        <div className={`mb-4 p-3 rounded-xl border ${
          battleState.yourStatus === 'alive' 
            ? 'border-green-500/30 bg-green-500/10' 
            : battleState.yourStatus === 'eliminated'
            ? 'border-red-500/30 bg-red-500/10'
            : 'border-[#1f1f1f] bg-[#111827]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {battleState.yourStatus === 'alive' ? (
                <>
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-[11px] text-green-400 font-semibold">You are still in the battle!</span>
                </>
              ) : battleState.yourStatus === 'eliminated' ? (
                <>
                  <Skull className="w-4 h-4 text-red-400" />
                  <span className="text-[11px] text-red-400 font-semibold">You were eliminated</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 text-[#707070]" />
                  <span className="text-[11px] text-[#707070] font-semibold">Not participating</span>
                </>
              )}
            </div>
            {battleState.yourStatus === 'alive' && (
              <span className="text-[10px] text-white bg-red-600 px-2 py-1 rounded-full">
                Survived {battleState.survivors}/{battleState.players}
              </span>
            )}
          </div>
          
          {battleState.yourStatus === 'alive' && (
            <div className="mt-2 text-[10px] text-[#a0a0a0]">
              Next prediction round starts in {battleState.timeLeft}s. Stay alive!
            </div>
          )}
        </div>

        {/* Кнопка участі */}
        <button
          onClick={joinBattle}
          disabled={battleState.players >= battleState.maxPlayers || battleState.phase === 'battle'}
          className="w-full py-2.5 bg-gradient-to-r from-red-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {battleState.yourStatus === 'alive' ? (
            <div className="flex items-center justify-center gap-2">
              <Swords className="w-4 h-4" />
              <span>Fight On!</span>
            </div>
          ) : battleState.yourStatus === 'eliminated' ? (
            <div className="flex items-center justify-center gap-2">
              <Skull className="w-4 h-4" />
              <span>Spectate Battle</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Join Battle ({battleState.maxPlayers - battleState.players} spots left)</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}