import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  LineChart,
  Gift,
  Wallet,
  Shield,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

interface PremiumFeaturesSectionProps {
  hasPremium: boolean;
  walletAddress?: string;
}

const PremiumFeaturesSection: React.FC<PremiumFeaturesSectionProps> = ({
  hasPremium,
  walletAddress,
}) => {
  const premiumDestinations = [
    {
      key: "predictions",
      title: "Predictions Arena",
      desc: "AI hints, premium stats, streaks & risk profile for short-term rounds.",
      to: "/predictions",
      label: "Trading / Predictions",
      icon: LineChart,
      color: "from-blue-500 to-cyan-500",
      status: "live",
    },
    {
      key: "rewards",
      title: "Daily Rewards & Airdrops",
      desc: "Better multipliers, more tickets and visibility for time-limited rewards.",
      to: "/rewards",
      label: "Quests & Airdrops",
      icon: Gift,
      color: "from-yellow-500 to-orange-500",
      status: "live",
    },
    {
      key: "staking",
      title: "Staking & Pools",
      desc: "Smarter pool suggestions and APY helpers once staking UI is fully wired.",
      to: "/staking",
      label: "Staking & Pools",
      icon: Wallet,
      color: "from-purple-500 to-pink-500",
      status: "soon",
    },
  ];

  const features = [
    {
      icon: Target,
      title: "AI-Powered Insights",
      desc: "Get smart predictions and risk analysis",
      active: hasPremium,
      coverage: hasPremium ? 85 : 0,
    },
    {
      icon: Zap,
      title: "Reward Multipliers",
      desc: "Earn more from every action you take",
      active: hasPremium,
      coverage: hasPremium ? 70 : 0,
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      desc: "Track performance with detailed stats",
      active: hasPremium,
      coverage: hasPremium ? 60 : 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Feature Cards */}
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_65%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#3b82f6]" />
              <h2 className="text-base font-semibold text-[#e0e0e0]">
                Premium Features
              </h2>
            </div>
            <p className="text-[11px] text-[#a0a0a0]">
              One subscription unlocks advanced features across the entire platform
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-[#121212] border border-[#1f1f1f] rounded-xl p-4 relative overflow-hidden hover:border-[#3b82f6]/50 transition-all"
            >
              <div className="pointer-events-none absolute -inset-0.5 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_center,_#3b82f6_0,_transparent_70%)] transition-opacity" />
              
              <div className="relative z-10 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  feature.active 
                    ? "bg-gradient-to-br from-[#3b82f6]/20 to-[#a855f7]/20 border border-[#3b82f6]/30" 
                    : "bg-[#050816] border border-[#1f1f1f]"
                }`}>
                  <feature.icon className={`w-5 h-5 ${
                    feature.active ? "text-[#3b82f6]" : "text-[#707070]"
                  }`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-[#e0e0e0]">
                      {feature.title}
                    </h3>
                    {feature.active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#a0a0a0] mb-3">
                    {feature.desc}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#707070]">Coverage</span>
                      <span className={feature.active ? "text-[#3b82f6]" : "text-[#707070]"}>
                        {feature.coverage}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.coverage}%` }}
                        transition={{ duration: 1, delay: idx * 0.2 }}
                        className={`h-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7] ${
                          !feature.active ? "opacity-30" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Card */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#22c55e]" />
            <h3 className="text-sm font-semibold text-[#e0e0e0]">
              What Premium Does
            </h3>
          </div>

          <ul className="space-y-2 text-[11px]">
            <li className="flex items-start gap-2 text-[#a0a0a0]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] mt-0.5 flex-shrink-0" />
              <span>AI-powered risk analysis and probability zones for smarter decisions</span>
            </li>
            <li className="flex items-start gap-2 text-[#a0a0a0]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] mt-0.5 flex-shrink-0" />
              <span>Reward multipliers and boosts across predictions and quests</span>
            </li>
            <li className="flex items-start gap-2 text-[#a0a0a0]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] mt-0.5 flex-shrink-0" />
              <span>Advanced analytics and performance tracking tools</span>
            </li>
          </ul>

          {hasPremium && walletAddress && (
            <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-start gap-2 text-[10px] text-[#707070]">
              <Clock className="w-3.5 h-3.5 mt-0.5 text-[#3b82f6] flex-shrink-0" />
              <p>
                Premium active for {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Module Cards */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_60%)]" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#e0e0e0]">
              Premium Modules
            </h2>
            <span className="px-2 py-0.5 rounded-full border border-[#1f1f1f] bg-[#050816] text-[10px] text-[#a0a0a0]">
              {hasPremium ? "Unlocked" : "Preview"}
            </span>
          </div>

          <p className="text-[11px] text-[#a0a0a0]">
            Access premium features across these modules
          </p>

          <div className="space-y-3">
            {premiumDestinations.map((module, idx) => (
              <motion.div
                key={module.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
              >
                <Link
                  to={module.to}
                  className="group block rounded-xl border border-[#1f1f1f] bg-[#050816] overflow-hidden hover:border-[#3b82f6]/70 transition-all"
                >
                  {/* Image Header */}
                  <div className="relative w-full h-28 overflow-hidden">
                    <img
                      src={`/premium/${module.key}.png`}
                      alt={module.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/premium/default.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border backdrop-blur-sm ${
                        module.status === "live"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                      }`}>
                        {module.status === "live" ? "Live" : "Coming Soon"}
                      </span>
                    </div>

                    {/* Module Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <module.icon className="w-4 h-4 text-white" />
                        <span className="text-[10px] text-[#9ca3af]">
                          {module.label}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {module.title}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-[#707070] line-clamp-2 flex-1">
                      {module.desc}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] flex-shrink-0">
                      <span className={hasPremium ? "text-[#3b82f6] font-medium" : "text-[#a0a0a0]"}>
                        {hasPremium ? "Open" : "Preview"}
                      </span>
                      <ArrowRight className={`w-3 h-3 transition-transform group-hover:translate-x-1 ${
                        hasPremium ? "text-[#3b82f6]" : "text-[#707070]"
                      }`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1f1f1f] text-[10px] text-[#707070]">
            {hasPremium 
              ? "Your premium features are active across all modules"
              : "Activate Premium to unlock advanced features in all modules"
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeaturesSection;
