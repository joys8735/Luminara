import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Gift } from 'lucide-react';
const DailyRewardCard = () => {
  const {
    claimDailyReward,
    lastRewardClaim,
    canClaimReward
  } = useProject();
  const formatLastClaim = () => {
    if (!lastRewardClaim) return 'Never claimed';
    return lastRewardClaim.toLocaleString();
  };
  return <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Daily Rewards
        </h2>
        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
          <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Visit daily to claim your rewards and earn free SVT tokens!
      </p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 dark:text-gray-400">Daily reward</span>
          <span className="text-gray-700 dark:text-gray-300">50 SVT</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last claimed</span>
          <span className="text-gray-700 dark:text-gray-300">
            {formatLastClaim()}
          </span>
        </div>
      </div>
      <button onClick={claimDailyReward} disabled={!canClaimReward} className={`w-full py-2 px-4 rounded-lg font-medium ${canClaimReward ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}>
        {canClaimReward ? 'Claim Daily Reward' : 'Already Claimed Today'}
      </button>
    </div>;
};
export default DailyRewardCard;