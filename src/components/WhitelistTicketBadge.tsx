import { BadgeCheck, Ticket, Sparkles } from "lucide-react";

interface Props {
  status: "not_applied" | "pending" | "approved" | "rejected";
}

export function WhitelistTicketBadge({ status }: Props) {
  if (status !== "approved") return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#22c55e]/10 to-[#3b82f6]/10 p-4">
      {/* glow */}
      {/* <div className="pointer-events-none absolute -inset-1 opacity-30 bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_60%)]" /> */}

      <div className="relative z-10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#0a0a0a]  flex items-center justify-center">
          <Ticket className="w-6 h-6 text-[#22c55e]" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#e0e0e0]">
              Whitelist NFT Ticket
            </span>
            {/* <BadgeCheck className="w-4 h-4 text-[#22c55e]" /> */}
          </div>

          <div className="text-[10px] text-[#a0a0a0] mt-1">
            Soulbound • Grants early mint access
          </div>
        </div>

        <Sparkles className="w-4 h-4 text-[#22c55e]" />
      </div>
    </div>
  );
}
