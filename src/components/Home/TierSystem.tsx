import React from 'react';
import { Shield, Check, X, Star, Zap, Crown, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';

const TierSystem = () => {
  const tiers = [
    {
      name: 'Bronze',
      icon: <Shield className="h-6 w-6" />,
      gradient: 'from-amber-600 to-amber-800',
      stakeAmount: '1,000 SVT',
      lockPeriod: '30 days',
      allocationMultiplier: '1x',
      poolWeight: '1x',
      guaranteedAllocation: false,
      earlyAccess: false,
      kycRequired: true,
      bonus: 'Basic Support',
      airdropEligibility: 'No',
      votingPower: '1x'
    },
    {
      name: 'Silver',
      icon: <Zap className="h-6 w-6" />,
      gradient: 'from-gray-500 to-gray-700',
      stakeAmount: '5,000 SVT',
      lockPeriod: '60 days',
      allocationMultiplier: '3x',
      poolWeight: '3x',
      guaranteedAllocation: false,
      earlyAccess: true,
      kycRequired: true,
      bonus: 'Priority Support',
      airdropEligibility: 'Small Airdrops',
      votingPower: '3x'
    },
    {
      name: 'Gold',
      icon: <Star className="h-6 w-6" />,
      gradient: 'from-yellow-500 to-amber-600',
      stakeAmount: '25,000 SVT',
      lockPeriod: '90 days',
      allocationMultiplier: '8x',
      poolWeight: '8x',
      guaranteedAllocation: true,
      earlyAccess: true,
      kycRequired: true,
      bonus: 'VIP Support',
      airdropEligibility: 'Medium Airdrops',
      votingPower: '8x'
    },
    {
      name: 'Platinum',
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-blue-500 to-purple-600',
      stakeAmount: '100,000 SVT',
      lockPeriod: '180 days',
      allocationMultiplier: '20x',
      poolWeight: '20x',
      guaranteedAllocation: true,
      earlyAccess: true,
      kycRequired: true,
      bonus: 'Dedicated Manager',
      airdropEligibility: 'Exclusive Airdrops',
      votingPower: '20x'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#e0e0e0]">
            Tier System
          </h3>
          <p className="text-sm text-[#a0a0a0] mt-1">
            Stake SVT tokens to unlock higher tiers and access premium IDO allocation, governance, and exclusive rewards
          </p>
        </div>
        <Link
          to="/staking"
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-sm flex items-center gap-2"
        >
          <Gem className="h-4 w-4" />
          Stake Now
        </Link>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden hover:border-[#3b82f6] transition-all duration-200 group"
          >
            {/* Tier Header with Gradient Icon */}
            <div className={`bg-white/5 p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-r ${tier.gradient} p-2 rounded-lg backdrop-blur-sm`}>
                    {tier.icon}
                  </div>
                  <h4 className="text-lg font-semibold">{tier.name}</h4>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star className="h-5 w-5 text-yellow-300" />
                </div>
              </div>
            </div>

            {/* Tier Body */}
            <div className="p-4 space-y-3">
              {/* Core Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[#707070]">Staking</div>
                  <div className="font-medium text-[#e0e0e0] mt-0.5">{tier.stakeAmount}</div>
                </div>
                <div>
                  <div className="text-[#707070]">Lock</div>
                  <div className="font-medium text-[#e0e0e0] mt-0.5">{tier.lockPeriod}</div>
                </div>
                <div>
                  <div className="text-[#707070]">Multiplier</div>
                  <div className="font-medium text-[#3b82f6] mt-0.5">{tier.allocationMultiplier}</div>
                </div>
                <div>
                  <div className="text-[#707070]">Weight</div>
                  <div className="font-medium text-[#3b82f6] mt-0.5">{tier.poolWeight}</div>
                </div>
              </div>

              <div className="border-t border-[#1f1f1f] pt-3 space-y-2">
                {/* Feature Checkmarks */}
                <div className="flex items-center text-xs">
                  <div className={`h-3 w-3 rounded-full mr-2 flex-shrink-0 ${tier.guaranteedAllocation ? 'bg-green-500' : 'bg-[#1a1a1a]'}`} />
                  <span className={tier.guaranteedAllocation ? 'text-[#e0e0e0]' : 'text-[#707070]'}>
                    Guaranteed Allocation
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <div className={`h-3 w-3 rounded-full mr-2 flex-shrink-0 ${tier.earlyAccess ? 'bg-green-500' : 'bg-[#1a1a1a]'}`} />
                  <span className={tier.earlyAccess ? 'text-[#e0e0e0]' : 'text-[#707070]'}>
                    Early Access
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <div className={`h-3 w-3 rounded-full mr-2 flex-shrink-0 ${tier.kycRequired ? 'bg-green-500' : 'bg-[#1a1a1a]'}`} />
                  <span className={tier.kycRequired ? 'text-[#e0e0e0]' : 'text-[#707070]'}>
                    KYC Required
                  </span>
                </div>
              </div>

              {/* Additional Perks */}
              <div className="border-t border-[#1f1f1f] pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#707070]">Bonus</span>
                  <span className="text-[#e0e0e0] font-medium">{tier.bonus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707070]">Airdrops</span>
                  <span className="text-[#e0e0e0] font-medium">{tier.airdropEligibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707070]">Voting Power</span>
                  <span className="text-[#3b82f6] font-medium">{tier.votingPower}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
        <p className="text-xs text-[#707070] text-center leading-relaxed">
          Tiers are calculated based on your total staked SVT across all pools.{' '}
          <span className="text-[#3b82f6] hover:underline cursor-pointer">Learn more about staking</span>
        </p>
      </div>
    </div>
  );
};

export default TierSystem;