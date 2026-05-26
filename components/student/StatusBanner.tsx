import { AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBannerProps {
  status: "active" | "danger_zone" | "removed";
  warningLevel: "none" | "first" | "second";
  streak?: number;
  className?: string;
}

export function StatusBanner({ status, warningLevel, streak = 0, className }: StatusBannerProps) {
  const hasWarnings = warningLevel !== "none";
  const isDangerZone = status === "danger_zone";

  if (!isDangerZone && !hasWarnings && streak < 3) {
    return null; // Don't render anything if everything is normal and streak is low
  }

  return (
    <div className={cn("w-full flex flex-col gap-2 p-1", className)}>
      {isDangerZone && (
        <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-left shadow-lg shadow-red-500/5 animate-pulse">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-400 tracking-tight">Danger Zone Active</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Your quarterly points are currently below the required minimum. Actively attend meetings, present topics, or contribute to projects to raise your standing and avoid removal.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left shadow-lg shadow-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-400 tracking-tight">
                Disciplinary Warning Active ({warningLevel} Strike)
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                You have received a warning strike from an administrator. Maintain full attendance and respect community guidelines to prevent further strikes.
              </p>
            </div>
          </div>
        </div>
      )}

      {streak >= 3 && !isDangerZone && (
        <div className="rounded-xl border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-amber-500/5 p-4 text-left shadow-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">ON FIRE!</span>
              <p className="text-xs text-zinc-300 mt-0.5">
                You are on a <span className="font-bold text-white">{streak}-meeting streak</span>. May your cursed technique prevail.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
