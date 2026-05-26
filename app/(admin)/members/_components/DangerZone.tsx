"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RiErrorWarningLine, 
  RiUserUnfollowLine, 
  RiAlertLine,
  RiCheckDoubleLine,
} from "@remixicon/react";

interface DangerZoneProps {
  searchQuery: string;
}

export function DangerZone({ searchQuery }: DangerZoneProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sheet states
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [sheetType, setSheetType] = useState<"remove" | "warn" | null>(null);
  
  // Form states
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDangerZoneMembers();
  }, []);

  async function fetchDangerZoneMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members?status=Danger Zone");
      const data = await res.json();
      setMembers(data.data || []);
    } catch (err) {
      console.error("Failed to load danger zone members:", err);
    } finally {
      setLoading(false);
    }
  }

  const openSheet = (member: any, type: "remove" | "warn") => {
    setSelectedMember(member);
    setSheetType(type);
    setReason("");
  };

  const closeSheet = () => {
    setSelectedMember(null);
    setSheetType(null);
    setReason("");
  };

  const handleRemove = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "removed",
          reason: reason || "Removed from the game for violating regulations."
        })
      });
      if (res.ok) {
        await fetchDangerZoneMembers();
        closeSheet();
      } else {
        console.error("Failed to remove member");
      }
    } catch (err) {
      console.error("Error removing member:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWarn = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "warn",
          reason: reason || "Official disciplinary warning issued."
        })
      });
      if (res.ok) {
        await fetchDangerZoneMembers();
        closeSheet();
      } else {
        console.error("Failed to warn member");
      }
    } catch (err) {
      console.error("Error warning member:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter members by search query
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.branch && m.branch.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Two tiers based on warnings — everyone here is already below the points threshold
  const criticalMembers = filteredMembers.filter(m => m.warnings >= 2 || m.warning_level === "second");
  const atRiskMembers   = filteredMembers.filter(m => !criticalMembers.includes(m));

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full bg-zinc-900" />
          <Skeleton className="h-28 w-full bg-zinc-900" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
          <RiCheckDoubleLine className="w-12 h-12 mb-3 text-emerald-500" />
          <h3 className="text-base font-semibold text-white">All Safe</h3>
          <p className="text-xs text-zinc-500 mt-1">No members are currently below the points threshold.</p>
        </div>
      ) : (
        <>
          {/* 1. Critical Members — 2+ warnings */}
          {criticalMembers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <RiAlertLine className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-wider">Critical Threat Level ({criticalMembers.length})</h2>
              </div>
              <div className="grid gap-3">
                {criticalMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="p-3 bg-red-950/10 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md shadow-red-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 border border-red-500/20">
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback className="bg-red-950 text-red-400 font-extrabold text-xs">
                          {member.name.slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">{member.name}</h3>
                          <Badge variant="outline" className="text-[8px] bg-red-500/20 text-red-400 border-red-500/30 font-extrabold uppercase py-0.5">
                            {member.warning_level} Warning
                          </Badge>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {member.branch} • Year {member.year} • {member.redeemable_pts ?? 0} Active Pts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-end md:self-auto">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-[10px] font-bold border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                        onClick={() => openSheet(member, "warn")}
                      >
                        Warn
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 text-[10px] font-black bg-red-600 hover:bg-red-500 text-white"
                        onClick={() => openSheet(member, "remove")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. At-Risk Members — below threshold, 0–1 warnings */}
          {atRiskMembers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <RiErrorWarningLine className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-wider">At-Risk — Low Points ({atRiskMembers.length})</h2>
              </div>
              <div className="grid gap-2.5">
                {atRiskMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="p-3 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-zinc-800">
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-extrabold text-xs">
                          {member.name.slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white">{member.name}</h3>
                          {(member.warnings === 1 || member.warning_level === "first") && (
                            <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold py-0">
                              1 Warning
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {member.branch} • Year {member.year} • {member.redeemable_pts ?? 0}/15 Active Pts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-[10px] font-bold border-zinc-850 hover:bg-zinc-800/80 text-zinc-400 hover:text-white"
                        onClick={() => openSheet(member, "warn")}
                      >
                        Warn
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-white"
                        onClick={() => openSheet(member, "remove")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation BottomSheet */}
      <BottomSheet isOpen={sheetType !== null} onClose={closeSheet}>
        {sheetType === "remove" && selectedMember && (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-950/30 flex items-center justify-center text-red-500 border border-red-500/20">
              <RiUserUnfollowLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Permanently Remove Member?</h3>
              <p className="text-xs text-zinc-400 mt-2 px-4">
                Are you sure you want to remove <span className="text-white font-extrabold">{selectedMember.name}</span> from the Culling Game? This action restricts all access.
              </p>
            </div>

            <div className="space-y-3 px-2">
              <Textarea 
                placeholder="Enter official reason for removal..."
                className="bg-zinc-900 border-zinc-800 focus:border-red-500 text-xs rounded-xl h-20"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400 hover:text-white"
                  onClick={closeSheet}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
                  onClick={handleRemove}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Removing..." : "Confirm Removal"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {sheetType === "warn" && selectedMember && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-950/30 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <RiErrorWarningLine className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Issue Official Warning</h3>
              <p className="text-xs text-zinc-400 px-4">
                Increase warning tier for <span className="text-white font-bold">{selectedMember.name}</span>. Currently at {selectedMember.warnings} warnings.
              </p>
            </div>

            <div className="space-y-4 px-2">
              <Textarea 
                placeholder="Reason for this warning..."
                className="bg-zinc-900 border-zinc-800 focus:border-amber-500 text-xs rounded-xl h-20"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
                  onClick={closeSheet}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black rounded-xl h-11 text-xs font-bold"
                  onClick={handleWarn}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Issuing..." : "Confirm Warning"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
