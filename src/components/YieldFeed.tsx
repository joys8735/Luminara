import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type YieldItem = {
  id: number;
  label: string;
  token: string;
  apy: number;
  change: number;
};

const ITEMS: YieldItem[] = [
  { id: 1, label: "Blue Chip Fund", token: "BNB", apy: 19.8, change: +2.4 },
  { id: 2, label: "Metaverse Index", token: "BNB", apy: 28.3, change: +1.1 },
  { id: 3, label: "Launchpad Pool", token: "BNB", apy: 53.7, change: -3.2 },
  { id: 4, label: "Stable Yield Mix", token: "BNB", apy: 14.2, change: +0.6 },
];

export default function YieldFeed() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((prev) => (prev + 1) % ITEMS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${offset * 100}%)` }}
      >
        {ITEMS.map((item) => {
          const positive = item.change >= 0;

          return (
            <div
              key={item.id}
              className="min-w-full flex items-center justify-between rounded-xl  px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-[#e5e7eb]">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#6b7280]">
                    Token: {item.token}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="text-right">
                  <div className="text-[12px] font-semibold text-[#3b82f6]">
                    {item.apy.toFixed(1)}%
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] ${
                      positive ? "text-[#22c55e]" : "text-[#f97316]"
                    }`}
                  >
                    {positive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {positive ? "+" : ""}
                    {item.change.toFixed(1)}%
                  </div>
                </div>

                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
