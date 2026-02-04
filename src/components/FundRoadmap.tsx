import React from "react";
import { Flag, ArrowRight } from "lucide-react";

export interface RoadmapStep {
  quarter?: string;
  label: string;
  description: string;
}

interface FundRoadmapProps {
  steps: RoadmapStep[];
  compact?: boolean;
  className?: string;
}

const FundRoadmap: React.FC<FundRoadmapProps> = ({
  steps,
  compact = false,
  className = "",
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div
      className={
        "rounded-lg bg-[#050816] border border-[#1f1f1f] p-3 text-xs " +
        className
      }
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flag className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-[11px] font-semibold text-[#e0e0e0]">
            Fund Roadmap
          </span>
        </div>
        {!compact && (
          <span className="text-[10px] text-[#707070]">Planned milestones</span>
        )}
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
              {index !== steps.length - 1 && (
                <div className="flex-1 w-px bg-[#1f2937] mt-0.5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-[#e0e0e0]">
                  {step.quarter || `Phase ${index + 1}`}
                </div>
              </div>
              <div className="text-[11px] text-[#a0a0a0]">
                {step.label && (
                  <span className="text-[#e0e0e0] mr-1">{step.label} —</span>
                )}
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#707070]">
          <ArrowRight className="w-3 h-3" />
          Long-term roadmap may be adjusted depending on market conditions.
        </div>
      )}
    </div>
  );
};

export default FundRoadmap;
