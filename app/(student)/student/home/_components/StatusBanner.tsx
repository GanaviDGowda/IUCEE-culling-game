"use client";

import { Shield, Flame, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBannerProps {
  status: "active" | "danger_zone" | "removed";
  warningLevel: "none" | "first" | "second";
  streak: number;
  points: number;
  className?: string;
}

export function StatusBanner({
  status,
  warningLevel,
  streak = 0,
  points = 0,
  className,
}: StatusBannerProps) {
  // Determine state
  let state: "removed" | "danger" | "strike" | "streak" | "stable" = "stable";

  if (status === "removed") {
    state = "removed";
  } else if (status === "danger_zone" || points < 6) {
    state = "danger";
  } else if (warningLevel !== "none") {
    state = "strike";
  } else if (streak >= 3) {
    state = "streak";
  } else if (points < 15) {
    state = "stable"; // Will render warning as approaching danger zone
  }

  // Render based on state
  if (state === "removed") {
    return (
      <div
        className={cn(
          "w-full p-4 bg-red-950/10 border border-red-950 rounded-xl flex items-start gap-3 shadow-lg shadow-red-950/5",
          className
        )}
      >
        <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-heading font-bold text-red-600 tracking-wider">
            COLONY STATUS: ELIMINATED
          </h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Your membership has been terminated. Please contact a colony Nodal Officer for reinstatement appeals.
          </p>
        </div>
      </div>
    );
  }

  if (state === "danger") {
    return (
      <div
        className={cn(
          "w-full p-4 bg-red-500/5 border border-red-500/40 rounded-xl flex items-start gap-3 shadow-lg shadow-red-500/5 animate-pulse",
          className
        )}
      >
        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-heading font-bold text-red-400 tracking-wider">
            DANGER ZONE / POINT THRESHOLD CRITICAL
          </h4>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Your quarterly points ({points}) have dropped below the required minimum (15). Present topics, register projects, or attend meetings immediately to avoid elimination.
          </p>
        </div>
      </div>
    );
  }

  if (state === "strike") {
    return (
      <div
        className={cn(
          "w-full p-4 bg-amber-600/5 border border-amber-600/40 rounded-xl flex items-start gap-3 shadow-lg shadow-amber-600/5",
          className
        )}
      >
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-heading font-bold text-amber-500 tracking-wider">
            COLONY STRIKE ACTIVE ({warningLevel.toUpperCase()} STRIKE)
          </h4>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            You have active warning strike(s) from administrators. Further absences or code-of-conduct violations will trigger automatic colony elimination.
          </p>
        </div>
      </div>
    );
  }

  if (state === "streak") {
    return (
      <div
        className={cn(
          "w-full p-4 bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-orange-500/30 rounded-xl flex items-center gap-3 shadow-md shadow-orange-500/5",
          className
        )}
      >
        <Flame className="w-5 h-5 text-orange-500 shrink-0 animate-bounce" />
        <div>
          <h4 className="text-xs font-heading font-bold text-orange-400 tracking-wider">
            COLONY STATUS: STREAK ACTIVE
          </h4>
          <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
            On Fire! You have a <span className="font-bold text-white font-mono-stats">{streak}-meeting streak</span>. Keep attending to receive streak point multipliers!
          </p>
        </div>
      </div>
    );
  }

  // stable/approaching danger zone (points < 15)
  if (points < 15) {
    return (
      <div
        className={cn(
          "w-full p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3 shadow-sm",
          className
        )}
      >
        <AlertTriangle className="w-5 h-5 text-amber-500/70 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-heading font-bold text-amber-500/80 tracking-wider">
            COLONY STABILITY: DECREASING
          </h4>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Approaching Danger Zone! Your quarterly points ({points}) are currently below the safe threshold of 15. Active participation is advised before the evaluation cycle ends.
          </p>
        </div>
      </div>
    );
  }

  // default stable
  return (
    <div
      className={cn(
        "w-full p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl flex items-center gap-3 shadow-sm",
        className
      )}
    >
      <Shield className="w-5 h-5 text-emerald-500/80 shrink-0" />
      <div>
        <h4 className="text-xs font-heading font-bold text-zinc-400 tracking-wider">
          COLONY STATUS: SECURED
        </h4>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
          Barrier connection stable. Current points exceed the safety threshold. Excellent work.
        </p>
      </div>
    </div>
  );
}
