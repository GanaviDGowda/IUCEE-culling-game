import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  RiVipCrownLine, 
  RiFlashlightLine, 
  RiErrorWarningLine, 
  RiEyeLine,
  RiAwardLine 
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MemberCardProps {
  id: string;
  name: string;
  branch: string;
  year: string;
  tier: string;
  streak: number;
  avatarUrl?: string;
  showWarn?: boolean;
  onAward?: () => void;
  onWarn?: () => void;
}

export function MemberCard({ 
  id, 
  name, 
  branch, 
  year, 
  tier, 
  streak, 
  avatarUrl, 
  showWarn = false,
  onAward, 
  onWarn 
}: MemberCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/60 transition-all group">
      {/* Left: Avatar */}
      <Avatar className="w-10 h-10 border border-zinc-800 shrink-0 group-hover:border-zinc-700 transition-colors">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold text-xs">{initials}</AvatarFallback>
      </Avatar>
      
      {/* Center: Info */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white truncate leading-none">{name}</h3>
          <div className="flex items-center gap-1 bg-red-500/10 px-1 py-0.5 rounded-full border border-red-500/20 shrink-0">
            <RiFlashlightLine className="w-2.5 h-2.5 text-red-500 fill-red-500" />
            <span className="text-[9px] font-bold text-red-500">{streak}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] text-zinc-500 truncate">
            {branch || "Unspecified"} • Y{year || "?"}
          </p>
          <Badge variant="outline" className={cn(
            "text-[8px] uppercase h-3.5 px-1 border-zinc-800 text-zinc-500 font-bold shrink-0",
            tier?.toLowerCase().includes("special") && "text-red-400 border-red-900/30 bg-red-950/20"
          )}>
            {tier || "Active"}
          </Badge>
        </div>
      </div>

      {/* Right: Inline Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button 
          onClick={onAward}
          className="p-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-500/70 hover:text-emerald-500 transition-all border border-emerald-500/10"
          title="Award"
        >
          <RiAwardLine className="w-4 h-4" />
        </button>
        
        {showWarn && (
          <button 
            onClick={onWarn}
            className="p-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/15 text-amber-500/70 hover:text-amber-500 transition-all border border-amber-500/10"
            title="Warn"
          >
            <RiErrorWarningLine className="w-4 h-4" />
          </button>
        )}

        <Link 
          href={`/members/${id}`}
          className="p-1.5 rounded-lg bg-blue-500/5 hover:bg-blue-500/15 text-blue-500/70 hover:text-blue-500 transition-all border border-blue-500/10"
          title="View"
        >
          <RiEyeLine className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
