"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  RiAlertFill, 
  RiExternalLinkLine, 
  RiQuestionAnswerFill, 
  RiCheckboxCircleLine 
} from "@remixicon/react";

interface AlertsSectionProps {
  alerts: {
    at_risk_members: Array<{
      id: string;
      name: string;
      avatar_url: string | null;
      redeemable_pts: number;
      branch: string;
      year: number;
    }>;
    pending_appeals: Array<{
      id: string;
      points: number;
      type: string;
      note: string;
      appeal_note: string;
      appealed_at: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  };
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  const router = useRouter();
  
  const hasAtRisk = alerts.at_risk_members.length > 0;
  const hasAppeals = alerts.pending_appeals.length > 0;

  if (!hasAtRisk && !hasAppeals) {
    return (
      <div className="p-4 bg-zinc-950/20 border border-zinc-850 rounded-2xl flex items-center gap-3">
        <div className="p-2 rounded-xl bg-green-950/30 border border-green-900/30 text-green-400">
          <RiCheckboxCircleLine className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-heading">Colony Secured</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">All active members are stable. No warnings or pending appeals reported.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest font-heading">
          System Alerts
        </h3>
      </div>

      <div className="grid gap-3">
        {/* At-risk members */}
        {alerts.at_risk_members.map((member) => (
          <div 
            key={member.id}
            className="p-3.5 bg-red-955 border border-red-900/30 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-400 shrink-0">
                <RiAlertFill className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-white">{member.name}</h4>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 uppercase font-mono">
                  <span>Danger Zone</span>
                  <span>•</span>
                  <span>{member.redeemable_pts} Pts</span>
                  <span>•</span>
                  <span>{member.branch} Y{member.year}</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/members/${member.id}`)}
              className="h-7 px-2 rounded-lg text-[9px] font-black border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/20 flex items-center gap-1 shrink-0"
            >
              Resolve
              <RiExternalLinkLine className="w-3 h-3" />
            </Button>
          </div>
        ))}

        {/* Pending appeals */}
        {alerts.pending_appeals.map((appeal) => (
          <div 
            key={appeal.id}
            className="p-3.5 bg-amber-955 border border-amber-900/30 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/30 flex items-center justify-center text-amber-400 shrink-0">
                <RiQuestionAnswerFill className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-white">{appeal.user?.name || "Member"}</h4>
                <p className="text-[10px] text-zinc-400 font-medium truncate max-w-[200px] md:max-w-md">
                  Appealed {appeal.points} pts: "{appeal.appeal_note}"
                </p>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 uppercase font-mono">
                  <span>Pending Appeal</span>
                  <span>•</span>
                  <span>{appeal.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/points?tab=Appeals")}
              className="h-7 px-2 rounded-lg text-[9px] font-black border-amber-900/30 bg-amber-955 text-amber-400 hover:bg-amber-900/20 flex items-center gap-1 shrink-0"
            >
              Review
              <RiExternalLinkLine className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
