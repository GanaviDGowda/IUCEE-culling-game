"use client";

import { Badge } from "@/components/ui/badge";
import { 
  RiAlertLine, 
  RiCloseLine, 
  RiShieldLine
} from "@remixicon/react";

interface WarningsTabProps {
  member: any;
}

export function WarningsTab({ member }: WarningsTabProps) {
  const warnings = member.warnings || [];

  return (
    <div className="space-y-4">
      {warnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
          <RiShieldLine className="w-12 h-12 mb-3 text-zinc-650" />
          <h3 className="text-sm font-semibold text-white">Clean Record</h3>
          <p className="text-xs text-zinc-500 mt-1">This member has no official disciplinary warnings.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Disciplinary Records</h3>
          <div className="grid gap-2">
            {warnings.map((warn: any) => {
              const isRemoval = warn.type === "removal";
              return (
                <div 
                  key={warn.id} 
                  className={`p-3 border rounded-xl transition-all flex items-start gap-3 ${
                    isRemoval 
                      ? 'bg-red-950/15 border-red-500/30' 
                      : 'bg-amber-950/10 border-amber-500/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    isRemoval 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {isRemoval ? (
                      <RiCloseLine className="w-4 h-4" />
                    ) : (
                      <RiAlertLine className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-extrabold text-white leading-tight">{warn.title}</h4>
                      <Badge className={`text-[8px] font-bold uppercase shrink-0 py-0 ${
                        isRemoval 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                          : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                      }`}>
                        {warn.type.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <p className="text-[10px] text-zinc-350 mt-1.5 leading-relaxed">{warn.body}</p>
                    
                    <p className="text-[8px] text-zinc-650 mt-2 font-bold uppercase tracking-wider">
                      Stamps: {new Date(warn.created_at).toLocaleString()}
                    </p>
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
