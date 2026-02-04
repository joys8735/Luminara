import React from "react";
import { Bot, Shield, Activity } from "lucide-react";

type Level = "Low" | "Medium" | "High";

interface TrustScoreProps {
  score: number; // 0–100
  stability: Level;
  liquidity: Level;
  risk: Level;
  className?: string;
}

function levelColor(level: Level) {
  switch (level) {
    case "High":
      return "text-green-400";
    case "Medium":
      return "text-yellow-400";
    case "Low":
      return "text-red-400";
    default:
      return "text-[#e0e0e0]";
  }
}

function scoreLabel(score: number) {
  if (score >= 85) return "Institutional-grade";
  if (score >= 70) return "Strong & stable";
  if (score >= 55) return "Balanced";
  if (score >= 40) return "Experimental";
  return "High-risk zone";
}

const TrustScore: React.FC<TrustScoreProps> = ({
  score,
  stability,
  liquidity,
  risk,
  className = "",
}) => {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div
      className={
        " rounded-xl p-1 text-xs space-y-2 " +
        className
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#0b1120] border border-[#1f1f1f] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-[#a855f7]" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#707070]">
              AI Trust Score
            </div>
            <div className="text-[11px] text-[#a0a0a0]">
              {scoreLabel(clamped)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-[#e0e0e0]">
            {clamped}/100
          </div>
          <div className="text-[10px] text-[#707070]">Model v1.0</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-[#0b1120] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#22c1c3] via-[#3b82f6] to-[#a855f7]"
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#707070]">
          <span>Lower Confidence</span>
          <span>Higher Confidence</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[10px] text-[#707070]">
            <Shield className="w-3 h-3 text-[#3b82f6]" />
            Stability
          </div>
          <div className={"text-[11px] font-semibold " + levelColor(stability)}>
            {stability}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[10px] text-[#707070]">
            <Activity className="w-3 h-3 text-[#22c1c3]" />
            Liquidity
          </div>
          <div className={"text-[11px] font-semibold " + levelColor(liquidity)}>
            {liquidity}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[10px] text-[#707070]">
            <Shield className="w-3 h-3 text-[#f97373]" />
            Risk
          </div>
          <div className={"text-[11px] font-semibold " + levelColor(risk)}>
            {risk}
          </div>
        </div>
      </div>

      <div className="pt-1 border-t border-[#111827] mt-1 text-[10px] text-[#707070] flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c1c3] animate-pulse" />
        Model uses fund size, APY stability, liquidity and risk profile.
      </div>
    </div>
  );
};

export default TrustScore;
