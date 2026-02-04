import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { toast } from 'sonner';
import { Gift, X, Star, Sparkles } from 'lucide-react';
const DailyLoginRewards = () => {
  const {
    connected
  } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [claimed, setClaimed] = useState(false);
  const rewards = [{
    day: 1,
    reward: '10 SVT',
    type: 'tokens'
  }, {
    day: 2,
    reward: '15 SVT',
    type: 'tokens'
  }, {
    day: 3,
    reward: '5% Discount Coupon',
    type: 'coupon'
  }, {
    day: 4,
    reward: '25 SVT',
    type: 'tokens'
  }, {
    day: 5,
    reward: '10% Discount Coupon',
    type: 'coupon'
  }, {
    day: 6,
    reward: '50 SVT',
    type: 'tokens'
  }, {
    day: 7,
    reward: 'Free NFT Mint',
    type: 'special'
  }];
  useEffect(() => {
    if (connected && !claimed) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connected, claimed]);
  const handleClaim = () => {
    const todayReward = rewards[currentDay - 1];
    toast.success(`Claimed: ${todayReward.reward}!`, {
      description: 'Come back tomorrow for more rewards!'
    });
    setClaimed(true);
    setShowModal(false);
  };
  if (!showModal) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-xl p-0.5 max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-[10px] p-6 relative">
          <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors">
            <X className="h-6 w-6" />
          </button>
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Gift className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Daily Login Reward
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Day {currentDay} of 7
            </p>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {rewards.map(item => <div key={item.day} className={`p-2 rounded-lg text-center transition-all duration-200 ${item.day === currentDay ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110' : item.day < currentDay ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                <div className="text-xs font-medium">{item.day}</div>
                {item.day === currentDay && <Sparkles className="h-3 w-3 mx-auto mt-1" />}
                {item.day < currentDay && <Star className="h-3 w-3 mx-auto mt-1" />}
              </div>)}
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Today's Reward
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {rewards[currentDay - 1].reward}
              </div>
            </div>
          </div>
          <button onClick={handleClaim} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
            Claim Reward
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            Login daily to unlock bigger rewards!
          </p>
        </div>
      </div>
    </div>;
};
export default DailyLoginRewards;