import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
}

export function MetricCard({ label, value, delta, deltaLabel }: MetricCardProps) {
  return (
    <div className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {delta !== undefined && (
          <div className={cn(
            "flex items-center text-xs font-medium pb-1",
            delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-zinc-400"
          )}>
            {delta > 0 ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : delta < 0 ? (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            ) : null}
            {Math.abs(delta)}%
            {deltaLabel && <span className="text-zinc-600 ml-1 font-normal">{deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
