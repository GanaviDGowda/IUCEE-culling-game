"use client";

import { Badge } from "@/components/ui/badge";
import { 
  RiMailLine, 
  RiExternalLinkLine,
  RiTimeLine,
  RiGitBranchLine,
  RiUserHeartLine,
  RiCpuLine,
  RiShieldFlashLine,
  RiTerminalBoxLine
} from "@remixicon/react";

interface ProfileTabProps {
  member: any;
}

export function ProfileTab({ member }: ProfileTabProps) {
  const profile = member.profile || {};

  return (
    <div className="space-y-6">
      {/* Domain & Classification - 100% Database Driven */}
      <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3.5">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
          <RiShieldFlashLine className="w-4 h-4 text-red-500" />
          Active Designations
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <div className="flex-1 p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-1 min-w-[140px]">
            <span className="text-[9px] uppercase font-black text-zinc-550 tracking-wider block">Game Tier Level</span>
            <span className="text-xs font-black text-white">{profile.tier || "Grade 4"}</span>
          </div>
          <div className="flex-1 p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-1 min-w-[140px]">
            <span className="text-[9px] uppercase font-black text-zinc-550 tracking-wider block">Assigned Domain Badge</span>
            <span className="text-xs font-black text-white">{profile.domain_badge || "None assigned"}</span>
          </div>
        </div>
      </div>

      {/* Info & Credentials */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Contact info */}
        <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3.5">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Contact & Credentials</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <RiMailLine className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Email Address</p>
                <p className="text-white truncate font-medium mt-0.5">{profile.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RiGitBranchLine className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Branch & Year</p>
                <p className="text-white font-medium mt-0.5">
                  {profile.branch || "Unassigned"} • Year {profile.year || "?"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accountability / Meta details */}
        <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3.5">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Accountability Statistics</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <RiTimeLine className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Last Active</p>
                <p className="text-white font-medium mt-0.5">
                  {profile.last_active ? new Date(profile.last_active).toLocaleString() : "Never"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RiExternalLinkLine className="w-4 h-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Referral System</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className="h-4 text-[8px] bg-zinc-900 border-zinc-800 text-zinc-300 font-bold px-1.5 py-0">
                    CODE: {profile.referral_code || "NONE"}
                  </Badge>
                  {profile.grace_used && (
                    <Badge variant="outline" className="h-4 text-[8px] bg-zinc-900 border-zinc-800 text-zinc-300 font-bold px-1.5 py-0">
                      GRACE CONSUMED
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
