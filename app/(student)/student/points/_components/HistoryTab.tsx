"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Calendar,
  Award,
  Terminal,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Hourglass,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { AppealSheet } from "./AppealSheet";

interface Log {
  id: string;
  points: number;
  type: string;
  note: string;
  status: string;
  created_at: string;
  appeal_status?: "pending" | "approved" | "rejected";
  appeal_reason?: string;
}

interface HistoryTabProps {
  logs: Log[];
}

const statusOptions = [
  { label: "All Logs", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Deductions", value: "deductions" },
];

export function HistoryTab({ logs: initialLogs }: HistoryTabProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isAppealOpen, setIsAppealOpen] = useState(false);

  const getLogTypeConfig = (type: string, points: number) => {
    if (points < 0 || type === "deduction" || type === "century_spend") {
      return { icon: AlertTriangle, color: "text-red-400 bg-red-500/10" };
    }
    switch (type) {
      case "attendance":
        return { icon: Calendar, color: "text-blue-400 bg-blue-500/10" };
      case "presentation_bonus":
      case "presentation":
      case "mentor_bonus":
      case "cie_bonus":
      case "streak_bonus":
      case "referral_bonus":
      case "referral":
        return { icon: Award, color: "text-amber-400 bg-amber-500/10" };
      case "project_update":
      case "project_funded":
        return { icon: Terminal, color: "text-emerald-400 bg-emerald-500/10" };
      default:
        return { icon: Award, color: "text-zinc-400 bg-zinc-500/10" };
    }
  };

  const getStatusConfig = (log: Log) => {
    if (log.appeal_status === "pending") {
      return {
        icon: Hourglass,
        text: "Appeal Under Review",
        styles: "text-amber-500 border-amber-500/25 bg-amber-500/5",
      };
    }
    switch (log.status) {
      case "confirmed":
        return {
          icon: CheckCircle2,
          text: "Confirmed",
          styles: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
        };
      case "rejected":
        return {
          icon: XCircle,
          text: "Rejected",
          styles: "text-red-400 border-red-500/20 bg-red-500/5",
        };
      default:
        return {
          icon: Hourglass,
          text: "Pending Approval",
          styles: "text-amber-400 border-amber-500/20 bg-amber-500/5",
        };
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "deductions") return log.points < 0;
    return log.status === activeFilter;
  });

  const handleAppealClick = (log: Log) => {
    setSelectedLog(log);
    setIsAppealOpen(true);
  };

  const handleAppealSubmit = (logId: string, reason: string) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) => {
        if (log.id === logId) {
          return {
            ...log,
            appeal_status: "pending",
            appeal_reason: reason,
          };
        }
        return log;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-950 pb-4">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              activeFilter === opt.value
                ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-sm"
                : "bg-zinc-900/30 border-zinc-900 text-zinc-400 hover:text-zinc-300 hover:border-zinc-800"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Logs ledger list */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const isPositive = log.points > 0;
            const typeConfig = getLogTypeConfig(log.type, log.points);
            const statusConfig = getStatusConfig(log);
            const Icon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            // Allow appeals on negative transactions or rejected items that haven't been appealed yet
            const isEligibleForAppeal = 
              (log.points < 0 || log.status === "rejected") && 
              log.appeal_status !== "pending";

            let dateStr = "";
            try {
              dateStr = formatDistanceToNow(parseISO(log.created_at), { addSuffix: true });
            } catch {
              dateStr = log.created_at;
            }

            return (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl hover:border-zinc-805 hover:bg-zinc-900/10 transition-all gap-4"
              >
                {/* Left Side: Metadata & Type */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", typeConfig.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{log.note || log.type.replace(/_/g, " ")}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 capitalize">{log.type.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-zinc-650">•</span>
                      <span className="text-[10px] text-zinc-500">{dateStr}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status and Value */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-zinc-900/60 sm:border-t-0 pt-3 sm:pt-0">
                  {/* Status Pill */}
                  <span className={cn(
                    "flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[10px] font-bold leading-none",
                    statusConfig.styles
                  )}>
                    <StatusIcon className="w-3 h-3 animate-pulse-subtle" />
                    {statusConfig.text}
                  </span>

                  {/* Actions / points display */}
                  <div className="flex items-center gap-4">
                    {isEligibleForAppeal && (
                      <button
                        onClick={() => handleAppealClick(log)}
                        className="px-3 py-1 bg-red-950/20 border border-red-500/25 hover:bg-red-900/20 text-red-400 rounded-lg text-[10px] font-bold font-heading transition-all active:scale-95 cursor-pointer"
                      >
                        Contest
                      </button>
                    )}

                    {/* Points display */}
                    <div className="text-right min-w-[50px]">
                      <span className={cn(
                        "text-sm font-bold flex items-center justify-end gap-0.5",
                        isPositive ? "text-emerald-400" : "text-red-400"
                      )}>
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {isPositive ? "+" : ""}
                        {log.points}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-12 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-500 text-xs">
            No point logs found matching the selected filter.
          </div>
        )}
      </div>

      {/* Appeal Sheet */}
      <AppealSheet
        isOpen={isAppealOpen}
        onClose={() => setIsAppealOpen(false)}
        log={selectedLog}
        onAppealSubmit={handleAppealSubmit}
      />
    </div>
  );
}
