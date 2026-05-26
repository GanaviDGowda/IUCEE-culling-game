"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Award, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface CenturyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CenturyConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CenturyConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [checkedOne, setCheckedOne] = useState(false);
  const [checkedTwo, setCheckedTwo] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const isFormValid = checkedOne && checkedTwo;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden border border-red-500/30 bg-zinc-950 p-6 shadow-2xl rounded-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Border Accent Header */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-heading font-semibold text-red-500 tracking-widest uppercase block">
              Binding Vow Initiation
            </span>
            <h3 className="text-md font-bold text-white tracking-tight mt-0.5">
              ACTIVATE CENTURY PRIVILEGE
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Sacrificing 100 redeemable points unlocks supreme Colony rights. This action is final and cannot be undone.
            </p>
          </div>
        </div>

        {/* Privileges Summary */}
        <div className="p-3.5 bg-zinc-900/50 border border-zinc-900 rounded-xl space-y-2">
          <span className="text-[8px] font-heading font-semibold text-zinc-500 uppercase tracking-widest block">
            Granted Privileges
          </span>
          <ul className="text-xs text-zinc-300 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Priority veto rights on a single admin colony decision (removals excluded).</li>
            <li>Permanent <span className="font-bold text-red-400 font-heading">Centurion</span> cosmetic badge on the Leaderboard.</li>
            <li>Direct bypass approval for pitching funded projects to administrative coordinators.</li>
            <li>Highest priority selection for industrial visits, tech talks, and regional conferences.</li>
          </ul>
        </div>

        {/* 2-Step Confirmation Form */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checkedOne}
              onChange={(e) => setCheckedOne(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-red-600 focus:ring-red-500/40 focus:ring-offset-zinc-950 focus:outline-none"
            />
            <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
              I understand that <span className="text-white font-semibold">exactly 100 redeemable points</span> will be deducted, and any point surplus above 100 will decay to 0.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checkedTwo}
              onChange={(e) => setCheckedTwo(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-red-600 focus:ring-red-500/40 focus:ring-offset-zinc-950 focus:outline-none"
            />
            <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
              I understand that my next month's minimum point target raises to <span className="text-white font-semibold">30 points</span> to sustain my standing in the colony.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-900">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={isLoading || !isFormValid}
            onClick={onConfirm}
            className={cn(
              "px-5 py-2 text-xs font-bold font-heading rounded-xl transition-all flex items-center justify-center gap-1.5",
              isFormValid
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10 cursor-pointer active:scale-95"
                : "bg-zinc-900 border border-zinc-805 text-zinc-600 cursor-not-allowed"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>ACTIVATE CENTURY</span>
          </button>
        </div>
      </div>
    </div>
  );
}
