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
} from "lucide-react";

interface PointLogRowProps {
  log: {
    id: string;
    points: number;
    type: string;
    note: string;
    status: "pending" | "confirmed" | "rejected";
    created_at: string;
  };
}

const getLogTypeConfig = (type: string) => {
  switch (type) {
    case "attendance":
      return { icon: Calendar, color: "text-blue-400 bg-blue-500/10" };
    case "presentation":
    case "mentor_bonus":
    case "cie_bonus":
    case "streak_bonus":
    case "referral_bonus":
      return { icon: Award, color: "text-amber-400 bg-amber-500/10" };
    case "project_update":
    case "project_funded":
      return { icon: Terminal, color: "text-emerald-400 bg-emerald-500/10" };
    case "deduction":
      return { icon: AlertTriangle, color: "text-red-400 bg-red-500/10" };
    default:
      return { icon: Award, color: "text-zinc-400 bg-zinc-500/10" };
  }
};

const getStatusConfig = (status: "pending" | "confirmed" | "rejected") => {
  switch (status) {
    case "confirmed":
      return { icon: CheckCircle2, text: "Confirmed", styles: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" };
    case "rejected":
      return { icon: XCircle, text: "Rejected", styles: "text-red-400 border-red-500/20 bg-red-500/5" };
    default:
      return { icon: Hourglass, text: "Pending", styles: "text-amber-400 border-amber-500/20 bg-amber-500/5" };
  }
};

export function PointLogRow({ log }: PointLogRowProps) {
  const typeConfig = getLogTypeConfig(log.type);
  const statusConfig = getStatusConfig(log.status);
  const Icon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;
  const isPositive = log.points > 0;
  
  // Format date safely
  let dateStr = "";
  try {
    dateStr = formatDistanceToNow(parseISO(log.created_at), { addSuffix: true });
  } catch {
    dateStr = log.created_at;
  }

  return (
    <div className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl hover:border-zinc-800 hover:bg-zinc-900/20 transition-all gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", typeConfig.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-100 truncate">{log.note}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-zinc-500 capitalize">{log.type.replace(/_/g, " ")}</span>
            <span className="text-[10px] text-zinc-600">•</span>
            <span className="text-[10px] text-zinc-500">{dateStr}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Status Pill */}
        <span className={cn(
          "hidden sm:flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-[10px] font-medium leading-none",
          statusConfig.styles
        )}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.text}
        </span>

        {/* Points Display */}
        <div className="text-right">
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
          {/* Mobile Status Indicator dot */}
          <span className={cn(
            "sm:hidden text-[9px] font-medium capitalize block mt-0.5 text-right",
            log.status === "confirmed" ? "text-emerald-500/70" : log.status === "rejected" ? "text-red-500/70" : "text-amber-500/70"
          )}>
            {log.status}
          </span>
        </div>
      </div>
    </div>
  );
}
