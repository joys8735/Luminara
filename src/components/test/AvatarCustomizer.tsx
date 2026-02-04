// components/AvatarCustomizer.tsx
'use client';

import React, { useState } from 'react';
import { Palette, Star, Trophy, Zap, Flame, Crown, Sparkles } from 'lucide-react';

const AVATARS = [
  { id: 'default', emoji: '👤', name: 'Default', unlocked: true },
  { id: 'trader', emoji: '💼', name: 'Trader', unlocked: true },
  { id: 'whale', emoji: '🐋', name: 'Whale', requires: '1000 AP' },
  { id: 'dragon', emoji: '🐲', name: 'Dragon', requires: '5000 AP' },
  { id: 'phoenix', emoji: '🔥', name: 'Phoenix', requires: '10000 AP' },
  { id: 'wizard', emoji: '🧙', name: 'Wizard', requires: '25000 AP' },
  { id: 'robot', emoji: '🤖', name: 'AI Master', requires: '50000 AP' },
  { id: 'alien', emoji: '👽', name: 'Alien', requires: '100000 AP' },
];

const FRAMES = [
  { id: 'none', name: 'No Frame', unlocked: true },
  { id: 'bronze', name: 'Bronze Frame', color: '#CD7F32', requires: '500 AP' },
  { id: 'silver', name: 'Silver Frame', color: '#C0C0C0', requires: '2500 AP' },
  { id: 'gold', name: 'Gold Frame', color: '#FFD700', requires: '10000 AP' },
  { id: 'platinum', name: 'Platinum Frame', color: '#E5E4E2', requires: '25000 AP' },
  { id: 'diamond', name: 'Diamond Frame', color: '#B9F2FF', requires: '50000 AP' },
  { id: 'rainbow', name: 'Rainbow Frame', color: 'gradient', requires: 'Win 7 days streak' },
  { id: 'animated', name: 'Animated Frame', color: 'animated', requires: 'Top 1 weekly' },
];

const EFFECTS = [
  { id: 'none', name: 'No Effect', unlocked: true },
  { id: 'sparkles', name: 'Sparkles', icon: <Sparkles className="w-3 h-3" />, requires: '100 AP' },
  { id: 'glow', name: 'Glow', icon: <Zap className="w-3 h-3" />, requires: '500 AP' },
  { id: 'fire', name: 'Fire', icon: <Flame className="w-3 h-3" />, requires: '7 day streak' },
  { id: 'halo', name: 'Halo', icon: <Star className="w-3 h-3" />, requires: '90% accuracy' },
  { id: 'crown', name: 'Crown', icon: <Crown className="w-3 h-3" />, requires: 'Top 10 weekly' },
];

export function AvatarCustomizer() {
  const [selectedAvatar, setSelectedAvatar] = useState('default');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [previewScale, setPreviewScale] = useState(1);

  const userAP = 1520; // Приклад кількості AP

  const getUnlockedItems = () => {
    const unlockedAvatars = AVATARS.filter(a => a.unlocked || 
      (a.requires && parseInt(a.requires) <= userAP)).length;
    const unlockedFrames = FRAMES.filter(f => f.unlocked || 
      (f.requires && (f.requires.includes('AP') ? parseInt(f.requires) <= userAP : true))).length;
    const unlockedEffects = EFFECTS.filter(e => e.unlocked || 
      (e.requires && (e.requires.includes('AP') ? parseInt(e.requires) <= userAP : true))).length;
    
    return { unlockedAvatars, unlockedFrames, unlockedEffects };
  };

  const { unlockedAvatars, unlockedFrames, unlockedEffects } = getUnlockedItems();

  const isUnlocked = (item: any) => {
    if (item.unlocked) return true;
    if (item.requires) {
      if (item.requires.includes('AP')) {
        return parseInt(item.requires) <= userAP;
      }
      // Для спеціальних умов
      return false;
    }
    return false;
  };

  return (
    <div className="ui-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Avatar Customizer</h3>
            <p className="text-[11px] text-[#707070]">Show off your achievements</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] text-[#707070]">Your AP</div>
          <div className="text-sm font-bold text-white">{userAP.toLocaleString()}</div>
        </div>
      </div>

      {/* Попередній перегляд */}
      <div className="mb-6 flex justify-center">
        <div className="relative">
          {/* Ефект */}
          {selectedEffect === 'sparkles' && (
            <div className="absolute inset-0 animate-pulse">
              <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-yellow-400" />
              <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400" />
              <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-yellow-400" />
              <Sparkles className="absolute -bottom-2 -right-2 w-4 h-4 text-yellow-400" />
            </div>
          )}
          
          {/* Фрейм */}
          <div className={`p-4 rounded-full ${
            selectedFrame === 'none' ? '' :
            selectedFrame === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 p-1' :
            selectedFrame === 'animated' ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse p-1' :
            `border-4 border-[${FRAMES.find(f => f.id === selectedFrame)?.color}]`
          }`}>
            {/* Аватар */}
            <div className={`text-4xl ${
              selectedEffect === 'glow' ? 'animate-glow' :
              selectedEffect === 'fire' ? 'animate-pulse' :
              ''
            }`}>
              {AVATARS.find(a => a.id === selectedAvatar)?.emoji}
            </div>
          </div>
          
          {selectedEffect === 'halo' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <Star className="w-6 h-6 text-yellow-400 animate-spin" />
            </div>
          )}
          
          {selectedEffect === 'crown' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          )}
        </div>
      </div>

      {/* Прогрес колекції */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <div className="text-[10px] text-[#707070]">Avatars</div>
          <div className="text-sm font-bold text-white">{unlockedAvatars}/{AVATARS.length}</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <div className="text-[10px] text-[#707070]">Frames</div>
          <div className="text-sm font-bold text-white">{unlockedFrames}/{FRAMES.length}</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <div className="text-[10px] text-[#707070]">Effects</div>
          <div className="text-sm font-bold text-white">{unlockedEffects}/{EFFECTS.length}</div>
        </div>
      </div>

      {/* Вибор аватара */}
      <div className="mb-4">
        <div className="text-[10px] text-[#707070] mb-2">Select Avatar</div>
        <div className="grid grid-cols-4 gap-2">
          {AVATARS.map(avatar => {
            const unlocked = isUnlocked(avatar);
            return (
              <button
                key={avatar.id}
                onClick={() => unlocked && setSelectedAvatar(avatar.id)}
                className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                  selectedAvatar === avatar.id 
                    ? 'bg-gradient-to-br from-[#3b82f6] to-[#a855f7]' 
                    : unlocked 
                    ? 'bg-gradient-to-br from-[#111827] to-[#1e293b] hover:bg-[#1e293b]'
                    : 'bg-gradient-to-br from-[#111827] to-[#1e293b] opacity-50'
                }`}
                disabled={!unlocked}
              >
                <span className="text-xl mb-1">{avatar.emoji}</span>
                <span className="text-[10px] text-white truncate w-full text-center">
                  {avatar.name}
                </span>
                {!unlocked && avatar.requires && (
                  <span className="text-[8px] text-[#707070] mt-1">{avatar.requires}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Вибор фрейма */}
      <div className="mb-4">
        <div className="text-[10px] text-[#707070] mb-2">Select Frame</div>
        <div className="grid grid-cols-4 gap-2">
          {FRAMES.map(frame => {
            const unlocked = isUnlocked(frame);
            return (
              <button
                key={frame.id}
                onClick={() => unlocked && setSelectedFrame(frame.id)}
                className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                  selectedFrame === frame.id 
                    ? 'ring-2 ring-[#3b82f6]' 
                    : ''
                } ${
                  unlocked 
                    ? 'bg-gradient-to-br from-[#111827] to-[#1e293b] hover:bg-[#1e293b]'
                    : 'bg-gradient-to-br from-[#111827] to-[#1e293b] opacity-50'
                }`}
                disabled={!unlocked}
              >
                <div className={`w-8 h-8 rounded-full ${
                  frame.id === 'none' ? 'border border-[#1f1f1f]' :
                  frame.id === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500' :
                  frame.id === 'animated' ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' :
                  `border-2 border-[${frame.color}]`
                }`} />
                <span className="text-[10px] text-white mt-1 truncate w-full text-center">
                  {frame.name}
                </span>
                {!unlocked && frame.requires && (
                  <span className="text-[8px] text-[#707070] mt-1">{frame.requires}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Вибор ефекту */}
      <div>
        <div className="text-[10px] text-[#707070] mb-2">Select Effect</div>
        <div className="grid grid-cols-3 gap-2">
          {EFFECTS.map(effect => {
            const unlocked = isUnlocked(effect);
            return (
              <button
                key={effect.id}
                onClick={() => unlocked && setSelectedEffect(effect.id)}
                className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                  selectedEffect === effect.id 
                    ? 'bg-gradient-to-br from-[#facc15] to-[#f97316]' 
                    : unlocked 
                    ? 'bg-gradient-to-br from-[#111827] to-[#1e293b] hover:bg-[#1e293b]'
                    : 'bg-gradient-to-br from-[#111827] to-[#1e293b] opacity-50'
                }`}
                disabled={!unlocked}
              >
                <div className="w-6 h-6 flex items-center justify-center mb-1">
                  {effect.id === 'none' ? '🚫' : effect.icon}
                </div>
                <span className="text-[10px] text-white truncate w-full text-center">
                  {effect.name}
                </span>
                {!unlocked && effect.requires && (
                  <span className="text-[8px] text-[#707070] mt-1">{effect.requires}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Призив до дії */}
      <div className="mt-4 p-2 rounded-lg bg-gradient-to-r from-[#3b82f6]/10 to-transparent border border-[#3b82f6]/20">
        <div className="text-center text-[10px]">
          <span className="text-[#3b82f6]">Earn more AP </span>
          <span className="text-white">to unlock exclusive cosmetics!</span>
        </div>
      </div>
    </div>
  );
}