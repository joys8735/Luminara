import React from "react";

export default function SkeletonPage() {
  return (
    <div className="space-y-6">
      {/* Hero placeholder */}
      <div className="h-12 w-64 bg-[#1f1f1f] rounded-md animate-pulse" />
      <div className="h-5 w-96 bg-[#1f1f1f] rounded-md animate-pulse" />
      {/* Features placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-full bg-[#1f1f1f] rounded-md animate-pulse" />
        ))}
      </div>
    </div>
  );
}
