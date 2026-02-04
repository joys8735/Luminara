import { Clock, Users, Loader2, ArrowDown } from "lucide-react";

interface Props {
  status: "not_applied" | "pending" | "approved" | "rejected";
  score: number;
}

export function WhitelistQueue({ status, score }: Props) {
  if (status !== "pending") return null;

  // UI logic (можна легко замінити бекендом)
  const baseQueue = 420;
  const priorityBoost = Math.floor(score / 10) * 8; // чим більший score — тим вище
  const position = Math.max(1, baseQueue - priorityBoost);

  const avgPerHour = 560; // заявок / год
  const hoursLeft = Math.max(0.2, position / avgPerHour);

  return (
    <div className="ui-inner rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#3b82f6]" />
          <h3 className="text-sm font-semibold text-[#e0e0e0]">
            Review Queue
          </h3>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#a0a0a0]">
          <Loader2 className="w-3 h-3 animate-spin" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="ui-card rounded-lg p-3">
          <div className="text-[10px] text-[#707070] mb-1">
            Your position
          </div>
          <div className="text-lg font-semibold text-[#3b82f6]">
            #{position}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#707070] mt-1">
            <ArrowDown className="w-3 h-3" />
            Priority boosts apply
          </div>
        </div>

        <div className="ui-card rounded-lg p-3">
          <div className="text-[10px] text-[#707070] mb-1">
            Est. review time
          </div>
          <div className="text-lg font-semibold text-[#e0e0e0]">
            ~{hoursLeft.toFixed(1)}h
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#707070] mt-1">
            <Clock className="w-3 h-3" />
            Updated dynamically
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#707070]">
        Higher eligibility score reduces queue time.
      </div>
    </div>
  );
}
