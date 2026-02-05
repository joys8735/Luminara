// src/components/HeaderRewardsPill.tsx
import { Gift, Sparkles, Clock, Ticket, PackageOpen } from 'lucide-react';
import { useRewardsHeaderStats } from '../rewards/useRewardsHeaderStats';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function fmt(sec: number) {
  const s = Math.max(0, sec);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}
function formatCooldown(sec: number) {
  if (sec <= 0) return 'Claim';

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function HeaderRewardsPill() {
  const { alphaPoints, streak, fragments, boostActive, cooldownSec, canClaim, openedTotal } =
    useRewardsHeaderStats();
  const [expanded, setExpanded] = useState(false);

  // Мобильная версия - компактный вид
  const MobileCompactView = () => (
    <div className="md:hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center ml-14 gap-2 px-3 py-3 rounded-xl ui-card"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-[11px] text-[#e0e0e0] font-semibold">{alphaPoints.toLocaleString()}</span>
        </div>
        {boostActive && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[10px] text-[#22c55e]">Boost</span>
          </div>
        )}
      </button>
    </div>
  );

  const MobileExpandedView = () => (
    <div className="md:hidden fixed inset-x-0 top-16 bg-[var(--header)] border-b border-[#1f1f1f]/60 z-30 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#e0e0e0]">Rewards</h3>
        <button 
          onClick={() => setExpanded(false)}
          className="text-[#707070] hover:text-[#e0e0e0]"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl ui-card">
          <Sparkles className="w-4 h-4 text-[#3b82f6]" />
          <div className="text-[11px]">
            <div className="text-[#a0a0a0]">Streak</div>
            <div className="text-[#e0e0e0] font-semibold">{streak}/7</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl ui-card">
          <Gift className="w-4 h-4 text-[#3b82f6]" />
          <div className="text-[11px]">
            <div className="text-[#a0a0a0]">AP </div>
            <div className="text-[#e0e0e0] font-semibold">{alphaPoints.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl ui-card">
          <Ticket className="w-4 h-4 text-[#facc15]" />
          <div className="text-[11px]">
            <div className="text-[#a0a0a0]">Ticket</div>
            <div className="text-[#e0e0e0] font-semibold">{fragments}/10</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl ui-card">
          <PackageOpen className="w-4 h-4 text-[#3b82f6]" />
          <div className="text-[11px]">
            <div className="text-[#a0a0a0]">Opened</div>
            <div className="text-[#e0e0e0] font-semibold">{openedTotal}</div>
          </div>
        </div>
      </div>

      {cooldownSec > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl ring-1 ring-[#3b82f6]/30">
          <Clock className="w-3 h-3 text-[#3b82f6]" />
          <div className="text-[11px] text-[#a0a0a0]">
            Next claim in <span className="text-[#e0e0e0] font-semibold">{formatCooldown(cooldownSec)}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Десктоп версия (оригинальная)
  const DesktopView = () => (
    <div className="hidden md:flex items-center gap-1 ">
      {/* <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl ui-card">
        <Sparkles className="w-4 h-4 text-[#3b82f6]" />
        <div className="text-[11px] text-[#a0a0a0]">
          Streak <span className="text-[#e0e0e0] font-semibold">{streak}/7</span>
          {boostActive && <span className="ml-2 text-[#22c55e]">Boost</span>}
        </div>
      </div> */}

      <div className="flex items-center gap-2 px-3 py-2 rounded-full ">
        <Gift className="w-4 h-4 text-[#3b82f6]" />
        <div className="text-[11px] text-[#a0a0a0]">
          AP <span className="text-[#e0e0e0] font-semibold">{alphaPoints.toLocaleString()} </span>
            
            {cooldownSec === 0 ? (
  <Link
    to="/rewards"
    className="ml-1 inline-flex items-center rounded-[6px] bg-emerald-500/20 px-2  text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
  >
    Claim
  </Link>
) : (
  <span className="ml-1 rounded-[4px] bg-[var(--header)] px-2 py-1 text-[11px] font-semibold text-[#e0e0e0]">
    {formatCooldown(cooldownSec)}
  </span>
)}

        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full ">
        <Ticket className="w-4 h-4 text-[#facc15]" />
        <div className="text-[11px] text-[#a0a0a0]">
          Ticket <span className="text-[#e0e0e0] font-semibold">{fragments}/10</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full ">
        <PackageOpen className="w-4 h-4 text-[#3b82f6]" />
        <div className="text-[11px] text-[#a0a0a0]">
          Opened <span className="text-[#e0e0e0] font-semibold">{openedTotal}</span>
        </div>
      </div>

      {/* {cooldownSec > 0 && (
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl ui-card">
          <Clock className="w-4 h-4 text-[#3b82f6]" />
          <div className="text-[11px] text-[#a0a0a0]">
            Next claim in <span className="text-[#e0e0e0] font-semibold">{fmt(cooldownSec)}</span>
          </div>
        </div>
      )} */}
    </div>
  );

  return (
    <>
      <DesktopView />
      <MobileCompactView />
      {expanded && <MobileExpandedView />}
    </>
  );
}