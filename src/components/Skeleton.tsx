// src/components/ui/Skeleton.tsx
import React from "react";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#1f1f1f] rounded-md relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-500/20 to-transparent animate-[shimmer_1.5s_infinite]"></div>
    </div>
  );
}
