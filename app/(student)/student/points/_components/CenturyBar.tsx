"use client";

import { Award, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CenturyBarProps {
  points: number;
  onActivateClick: () => void;
}

export function CenturyBar({ points, onActivateClick }: CenturyBarProps) {
  const target = 100;
  const progressPercent = Math.min(Math.round((points / target) * 100), 100);
  const isReady = points >= target;

  return (
    <div className="kogane-panel p-6 border-red-500/10 hover:border-red-500/20 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Progress Info */}
      <div className="space-y-3 w-full md:flex-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] font-heading font-semibold text-amber-500 tracking-widest uppercase block">
              Semester Awakening Progress
            </span>
            <h3 className="text-md font-bold text-white tracking-tight mt-1 flex items-center gap-1.5">
              Century Status Readiness
              {isReady && <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />}
            </h3>
          </div>
          <span className="text-sm font-bold font-mono-stats text-white">
            {points} <span className="text-zinc-650">/ {target} Pts</span>
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden relative">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 relative",
              isReady 
                ? "bg-gradient-to-r from-amber-500 to-red-500 shadow-md shadow-red-500/20 animate-pulse"
                : "bg-red-650"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-[10px] text-zinc-500 leading-relaxed max-w-lg">
          Achieve 100 points to activate your Century privilege. Activating resets your active balance, grants permanent visual cosmetics, and unlocks special colony veto rights.
        </p>
      </div>

      {/* Action Button */}
      <div className="w-full md:w-auto shrink-0">
        {isReady ? (
          <button
            onClick={onActivateClick}
            className="w-full md:px-6 py-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold font-heading rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 border border-amber-400/20 cursor-pointer animate-bounce-subtle"
          >
            <Award className="w-4 h-4 animate-spin-slow" />
            <span>ACTIVATE CENTURY RITUAL</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full md:px-6 py-3 bg-zinc-900/30 border border-zinc-900 text-zinc-600 rounded-xl text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOCKED ({target - points} Pts Left)</span>
          </button>
        )}
      </div>
    </div>
  );
}
