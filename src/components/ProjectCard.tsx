import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Flame, Clock, Calendar, ExternalLink } from 'lucide-react';
interface ProjectCardProps {
  project: any;
  onInvest: () => void;
}
export function ProjectCard({
  project,
  onInvest
}: ProjectCardProps) {
  const {
    connected
  } = useWallet();
  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <div className="absolute top-3 left-3 bg-[#1a1a1a] border border-[#1f1f1f] px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1">
            <Flame className="h-2.5 w-2.5 text-[#3b82f6]" />
            <span className="text-[#e0e0e0]">Active</span>
          </div>;
      case 'upcoming':
        return <div className="absolute top-3 left-3 bg-[#1a1a1a] border border-[#1f1f1f] px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 text-[#a0a0a0]" />
            <span className="text-[#e0e0e0]">Upcoming</span>
          </div>;
      case 'ended':
        return <div className="absolute top-3 left-3 bg-[#1a1a1a] border border-[#1f1f1f] px-2 py-1 rounded text-[10px] font-medium">
            <span className="text-[#707070]">Ended</span>
          </div>;
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
  return <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden hover-lift">
      <div className="h-40 relative">
        {getStatusBadge(project.status)}
        <img src={project.logo} alt={project.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <h3 className="text-[#e0e0e0] text-sm font-semibold">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#a0a0a0] text-xs">${project.symbol}</span>
            <span className="text-[#707070] text-xs">•</span>
            <span className="text-[#a0a0a0] text-xs">{project.minTier}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[#a0a0a0] text-xs mb-3 line-clamp-2">
          {project.description}
        </p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-[#707070]">Progress</span>
              <span className="text-[10px] font-medium text-[#e0e0e0]">
                ${project.raised.toLocaleString()} / $
                {project.goal.toLocaleString()}
              </span>
            </div>
            <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#3b82f6] rounded-full progress-bar-animated" style={{
              width: `${Math.min(percentRaised, 100)}%`
            }}></div>
            </div>
            <div className="mt-1 text-[10px] text-[#707070]">
              {percentRaised.toFixed(1)}% Complete
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-[#707070] flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" /> Start
              </div>
              <div className="text-xs font-medium text-[#e0e0e0] mt-0.5">
                {formatDate(project.startDate)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#707070] flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" /> End
              </div>
              <div className="text-xs font-medium text-[#e0e0e0] mt-0.5">
                {formatDate(project.endDate)}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#1f1f1f]">
            <div>
              <div className="text-[10px] text-[#707070]">Token Price</div>
              <div className="text-xs font-medium text-[#e0e0e0]">
                ${project.price}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#707070]">Min. Tier</div>
              <div className="text-xs font-medium text-[#e0e0e0]">
                {project.minTier}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#1f1f1f]">
        <div className="flex gap-2">
          <button onClick={onInvest} disabled={!connected || project.status !== 'active'} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${!connected || project.status !== 'active' ? 'bg-[#1a1a1a] text-[#707070] cursor-not-allowed border border-[#1f1f1f]' : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'}`}>
            {project.status === 'active' ? 'Invest Now' : project.status === 'upcoming' ? 'Coming Soon' : 'Sale Ended'}
          </button>
          <a href={project.socials.website} target="_blank" rel="noopener noreferrer" className="p-2 border border-[#1f1f1f] rounded-lg text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#e0e0e0] transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>;
}
export default ProjectCard;