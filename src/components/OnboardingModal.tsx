// components/OnboardingModal.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Додано useEffect
import { motion } from 'framer-motion';
import { X, Check, Sparkles, Star, Zap, Target, Trophy } from 'lucide-react';
import { useProfile } from '../hooks/test/useProfile'; // ФІКС: правильний шлях

// Експортуйте інтерфейс
export interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const { profile, allAvatars: avatars, allFrames: frames, updateUsername, updateAvatar, updateAvatarFrame, completeOnboarding } = useProfile(); // ФІКС: allAvatars і allFrames
  
  const [step, setStep] = useState(1);
  const [tempUsername, setTempUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [selectedFrame, setSelectedFrame] = useState('none');
  
  // Ініціалізація при завантаженні
  useEffect(() => {
    if (profile) {
      setTempUsername(profile.username || '');
      setSelectedAvatar(profile.avatar || 'avatar1');
      setSelectedFrame(profile.avatarFrame || 'none');
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleComplete = () => {
    // Обробляємо ім'я
    if (tempUsername.trim()) {
      const result = updateUsername(tempUsername);
      if (!result.success) {
        console.error('Failed to update username:', result.message);
      }
    }
    
    // Обробляємо аватар та фрейм
    updateAvatar(selectedAvatar);
    updateAvatarFrame(selectedFrame);
    
    // Завершуємо онбординг
    completeOnboarding();
    onComplete();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
    completeOnboarding();
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#a855f7] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome to Alpha Trading!</h3>
              <p className="text-[#a0a0a0] text-sm">
                Let's customize your profile to get started. This will only take a minute.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e293b]">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#22c1c3] to-[#3b82f6] flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-semibold text-white">Choose Avatar</div>
                <div className="text-[10px] text-[#707070]">Express yourself</div>
              </div>
              
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e293b]">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#facc15] to-[#f97316] flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-semibold text-white">Set Name</div>
                <div className="text-[10px] text-[#707070]">How others see you</div>
              </div>
              
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e293b]">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-semibold text-white">Get Rewards</div>
                <div className="text-[10px] text-[#707070]">+500 XP bonus</div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Choose Your Avatar</h3>
              <p className="text-[#a0a0a0] text-sm mb-6">
                Pick an avatar that represents your trading style
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {avatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                    selectedAvatar === avatar.id
                      ? 'ui-card scale-105'
                      : 'ui-inner hover:scale-102'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[#1f1f1f] mb-1">
    <img 
      src={avatar.imageUrl} 
      alt={avatar.name}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement!.innerHTML = `
          <div class="w-full h-full bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center">
            <span class="text-lg">${avatar.name.charAt(0)}</span>
          </div>
        `;
      }}
    />
  </div>
  <span className="text-[10px] text-white truncate w-full text-center">
    {avatar.name}
  </span>
                  {selectedAvatar === avatar.id && (
                    <Check className="absolute bg-black/70 p-0.5 rounded-full mt-5 ml-8 w-4 h-4 text-white mt-1" />
                  )}
                </button>
              ))}
            </div>

            {/* Фрейми */}
            <div className="mt-4">
              <div className="text-xs text-[#707070] mb-2">Avatar Frame (Optional)</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {frames.map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`flex-shrink-0 p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                      selectedFrame === frame.id
                        ? 'ring-2 ring-[#3b82f6]'
                        : ''
                    } ${frame.unlocked ? 'bg-gradient-to-br from-[#111827] to-[#1e293b]' : 'opacity-90'}`}
                    disabled={!frame.unlocked}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        frame.id === 'none' ? 'border border-[#1f1f1f]' :
                        frame.id === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500' :
                        frame.id === 'nebula' ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-green-500' :
                        `border-2 border-[${frame.color}]`
                      }`}
                    >
                      <span className="text-xl">👤</span>
                    </div>
                    <span className="text-[10px] text-white mt-1">{frame.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Choose Your Name</h3>
              <p className="text-[#a0a0a0] text-sm mb-6">
                This name will appear on leaderboards and in the community
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center mb-4">
  <div className="relative">
    <div 
      className={`p-1 rounded-full ${
        selectedFrame === 'none' ? '' : ''
      }`}
      style={{
        background: selectedFrame === 'rainbow' 
          ? 'linear-gradient(45deg, #ff0000, #ff9900, #ffff00, #00ff00, #00ffff, #0000ff, #9900ff)' 
          : selectedFrame === 'nebula'
          ? 'linear-gradient(45deg, #8a2be2, #00bfff, #00fa9a)'
          : frames.find(f => f.id === selectedFrame)?.color || 'transparent',
        padding: selectedFrame !== 'none' ? '4px' : '0'
      }}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1f1f1f]">
        <img 
          src={avatars.find(a => a.id === selectedAvatar)?.imageUrl || 'https://static.beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75&crop=0,0,100,100'} 
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
</div>

              <div>
                <label className="block text-xs text-[#707070] mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-[#111827] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
                  maxLength={20}
                />
                <div className="text-right text-[10px] text-[#707070] mt-1">
                  {tempUsername.length}/20 characters
                </div>
              </div>

              <div className="text-[10px] text-[#707070] space-y-1">
                <p>• Names can be changed later</p>
                <p>• Keep it respectful and trader-friendly</p>
                <p>• Best names are memorable and unique</p>
              </div>
            </div>

            {/* Приклади імен */}
            <div>
              <div className="text-xs text-[#707070] mb-2">Name Examples:</div>
              <div className="flex flex-wrap gap-2">
                {['CryptoTrader', 'BitcoinHunter', 'MoonWhale', 'AlphaWolf', 'PredictionPro'].map(name => (
                  <button
                    key={name}
                    onClick={() => setTempUsername(name)}
                    className="px-3 py-1 text-xs bg-gradient-to-br from-[#111827] to-[#1e293b] rounded-full hover:bg-[#1e293b] transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ui-card rounded-2xl max-w-md w-full p-6 relative"
      >
        {/* Прогрес бар */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-[#707070] mb-2">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? 'Welcome' : step === 2 ? 'Avatar' : 'Name'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#3b82f6] via-[#a855f7] to-[#ec4899] transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Контент кроку */}
        {renderStep()}

        {/* Кнопки навігації */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white transition-colors"
            >
              Skip for now
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!tempUsername.trim()}
              className="px-6 py-2 bg-gradient-to-r from-[#22c1c3] to-[#3b82f6] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Setup
            </button>
          )}
        </div>

        {/* Бонус за завершення */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-[#facc15]/10 to-transparent border border-[#facc15]/20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#facc15]" />
            <span className="text-xs text-white">
              Complete setup to earn <span className="text-[#facc15] font-bold">+500 XP</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}