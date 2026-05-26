import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BadgeCardProps {
  name: string;
  description: string;
  earnedAt?: string;
  unlocked?: boolean;
}

export function BadgeCard({ name, description, earnedAt, unlocked = true }: BadgeCardProps) {
  const formattedDate = earnedAt 
    ? format(new Date(earnedAt), "MMM dd, yyyy") 
    : undefined;

  return (
    <div className={cn(
      "group relative overflow-hidden border bg-zinc-950/40 p-5 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-300",
      unlocked 
        ? "border-zinc-800 hover:border-red-500/30 hover:bg-zinc-900/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
        : "border-zinc-900 bg-zinc-950/20 opacity-50 select-none"
    )}>
      {/* Glow highlight */}
      {unlocked && (
        <div className="absolute -inset-px bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Icon Badge */}
      <div className={cn(
        "relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300",
        unlocked 
          ? "bg-gradient-to-br from-red-500/10 to-red-600/5 text-red-500 shadow-inner" 
          : "bg-zinc-900 text-zinc-600"
      )}>
        {unlocked ? (
          <>
            <Award className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
            <div className="absolute inset-0 rounded-2xl border border-red-500/20 animate-pulse" />
          </>
        ) : (
          <Lock className="w-6 h-6" />
        )}
      </div>

      <div>
        <h4 className="text-sm font-bold text-zinc-100 tracking-tight transition-colors group-hover:text-white">
          {name}
        </h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-[180px] leading-relaxed">
          {description}
        </p>
      </div>

      {unlocked && formattedDate && (
        <div className="mt-4 text-[10px] text-zinc-500 font-medium bg-zinc-900/50 px-2.5 py-0.5 rounded-full border border-zinc-850">
          Earned {formattedDate}
        </div>
      )}
    </div>
  );
}
