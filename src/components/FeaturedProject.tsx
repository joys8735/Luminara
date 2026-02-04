import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Clock, ExternalLink, Flame, Calendar, Target, Users, TrendingUp } from 'lucide-react';
interface FeaturedProjectProps {
  project: any;
  onInvest: (project: any) => void;
}
export function FeaturedProject({
  project,
  onInvest
}: FeaturedProjectProps) {
  const {
    connected
  } = useWallet();
  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <span className="bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 px-3 py-1 rounded text-xs font-medium flex items-center">
            <Flame className="h-3 w-3 mr-1" />
            Active
          </span>;
      case 'upcoming':
        return <span className="bg-[#a0a0a0]/10 text-[#a0a0a0] border border-[#a0a0a0]/20 px-3 py-1 rounded text-xs font-medium flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </span>;
      case 'ended':
        return <span className="bg-[#707070]/10 text-[#707070] border border-[#707070]/20 px-3 py-1 rounded text-xs font-medium">
            Ended
          </span>;
    }
  };
  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const percentRaised = project.raised / project.goal * 100;
  return <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-2/5 lg:w-1/3 relative">
          <div className="absolute top-4 left-4 z-10">
            {getStatusBadge(project.status)}
          </div>
          <img src={project.logo} alt={project.name} className="w-full h-full object-cover min-h-[280px] opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="md:w-3/5 lg:w-2/3 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold text-[#e0e0e0] mb-1">
                {project.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#a0a0a0]">
                  ${project.symbol}
                </span>
                <span className="text-[#707070]">•</span>
                <span className="text-xs text-[#a0a0a0]">
                  Min. Tier: {project.minTier}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#a0a0a0] mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Target className="h-3 w-3 text-[#3b82f6]" />
                <span className="text-[10px] text-[#707070]">Goal</span>
              </div>
              <div className="text-sm font-semibold text-[#e0e0e0]">
                ${(project.goal / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-[#3b82f6]" />
                <span className="text-[10px] text-[#707070]">Raised</span>
              </div>
              <div className="text-sm font-semibold text-[#3b82f6]">
                ${(project.raised / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3 text-[#3b82f6]" />
                <span className="text-[10px] text-[#707070]">Investors</span>
              </div>
              <div className="text-sm font-semibold text-[#e0e0e0]">
                {Math.floor(Math.random() * 500) + 100}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-[#707070]">
                Fundraising Progress
              </span>
              <span className="text-xs font-medium text-[#e0e0e0]">
                {percentRaised.toFixed(1)}% Complete
              </span>
            </div>
            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#3b82f6] rounded-full progress-bar-animated" style={{
              width: `${Math.min(percentRaised, 100)}%`
            }}></div>
            </div>
          </div>

          {/* Dates & Price */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="text-[10px] text-[#707070] mb-0.5 flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" /> Start
              </div>
              <div className="text-xs font-medium text-[#e0e0e0]">
                {formatDate(project.startDate)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#707070] mb-0.5 flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" /> End
              </div>
              <div className="text-xs font-medium text-[#e0e0e0]">
                {formatDate(project.endDate)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#707070] mb-0.5">
                Token Price
              </div>
              <div className="text-xs font-medium text-[#e0e0e0]">
                ${project.price}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#707070] mb-0.5">Category</div>
              <div className="text-xs font-medium text-[#e0e0e0]">
                {project.categories[0]}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={() => onInvest(project)} disabled={!connected || project.status !== 'active'} className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${!connected || project.status !== 'active' ? 'bg-[#1a1a1a] text-[#707070] cursor-not-allowed border border-[#1f1f1f]' : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'}`}>
              {project.status === 'active' ? 'Invest Now' : project.status === 'upcoming' ? 'Coming Soon' : 'Sale Ended'}
            </button>
            <a href={project.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2 px-4 border border-[#1f1f1f] rounded-lg text-[#e0e0e0] hover:bg-[#1a1a1a] transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>;
}
export default FeaturedProject;