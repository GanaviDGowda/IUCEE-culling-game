"use client";

import { Badge } from "@/components/ui/badge";
import { 
  RiFlashlightLine, 
  RiArrowUpDoubleLine, 
  RiArrowDownDoubleLine,
  RiFileListLine
} from "@remixicon/react";

interface PointsTabProps {
  member: any;
}

export function PointsTab({ member }: PointsTabProps) {
  const points = member.points || [];

  return (
    <div className="space-y-4">
      {points.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
          <RiFileListLine className="w-12 h-12 mb-3 text-zinc-600" />
          <h3 className="text-sm font-semibold text-white">No Point Records</h3>
          <p className="text-xs text-zinc-500 mt-1">This member has not earned or spent points yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Point Transaction History</h3>
          <div className="grid gap-2">
            {points.map((log: any) => {
              const isPositive = log.points > 0;
              return (
                <div 
                  key={log.id} 
                  className="p-3 bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20' : 'bg-red-950/20 text-red-400 border border-red-900/20'}`}>
                      {isPositive ? (
                        <RiArrowUpDoubleLine className="w-4 h-4" />
                      ) : (
                        <RiArrowDownDoubleLine className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white capitalize">
                          {log.type.replace(/_/g, " ")}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-[8px] uppercase px-1 py-0 ${
                            log.status === "confirmed" 
                              ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
                              : log.status === "pending"
                              ? "bg-amber-950/20 border-amber-900/30 text-amber-400"
                              : "bg-red-950/20 border-red-900/30 text-red-400"
                          }`}
                        >
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{log.note || "No note recorded."}</p>
                      <p className="text-[8px] text-zinc-550 mt-1">
                        {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-sm font-black flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? "+" : ""}
                      {log.points}
                    </span>
                    {log.quarter && (
                      <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider mt-0.5">
                        {log.quarter}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
