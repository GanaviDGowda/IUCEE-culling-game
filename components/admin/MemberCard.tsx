import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  name: string;
  branch: string;
  year: string;
  tier: string;
  avatarUrl?: string;
  onAction?: () => void;
}

export function MemberCard({ name, branch, year, tier, avatarUrl, onAction }: MemberCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
      <Avatar className="w-12 h-12 border border-zinc-800">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="bg-zinc-800 text-zinc-400">{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
          <Badge variant="outline" className={cn(
            "ml-2 text-[10px] uppercase border-zinc-700",
            tier.toLowerCase() === "special grade" ? "text-red-400 border-red-900/50 bg-red-950/20" : "text-zinc-400"
          )}>
            {tier}
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-1 truncate">
          {branch} • Year {year}
        </p>
      </div>
      
      <button 
        onClick={onAction}
        className="p-2 text-zinc-500 hover:text-white transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}
