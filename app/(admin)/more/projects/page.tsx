"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  RiFolderShield2Line, 
  RiGitRepositoryLine, 
  RiExternalLinkLine, 
  RiCheckboxCircleLine, 
  RiCloseCircleLine,
  RiCoinsLine, 
  RiAlertLine, 
  RiGroupLine,
  RiFileList3Line,
  RiCheckLine,
  RiCloseLine
} from "@remixicon/react";

type TabName = "active" | "updates" | "funding";

export default function AdminProjectsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>("active");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchProjectsData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load project database:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectsData();
  }, [fetchProjectsData]);

  // Handle Weekly Update Approval/Rejection
  const handleUpdateStatus = async (projectId: string, updateId: string, action: "approve_update" | "reject_update") => {
    setProcessingId(updateId);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, updateId })
      });
      if (res.ok) {
        await fetchProjectsData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update progress status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Funding Claim approval
  const handleApproveFunding = async (projectId: string) => {
    setProcessingId(projectId);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_funding" })
      });
      if (res.ok) {
        await fetchProjectsData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to approve funding claim");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48 bg-zinc-900/40" />
          <Skeleton className="h-4 w-64 bg-zinc-900/40" />
        </div>
        <div className="flex gap-2 border-b border-zinc-900 pb-2">
          <Skeleton className="h-8 w-24 bg-zinc-900/40 rounded-lg" />
          <Skeleton className="h-8 w-32 bg-zinc-900/40 rounded-lg" />
          <Skeleton className="h-8 w-32 bg-zinc-900/40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full bg-zinc-900/40 rounded-2xl" />
          <Skeleton className="h-44 w-full bg-zinc-900/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { projects = [], weekly_updates = { pending: [], missing: [], dormant: [] }, funding_claims = { claims: [], awarded: [] } } = data || {};

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest font-heading flex items-center gap-1.5">
          <RiFolderShield2Line className="w-5 h-5 text-red-500" />
          Tactical Projects Registry
        </h2>
        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider font-heading">
          Manage member project updates, allocate weekly progress points, and audit funding claims.
        </p>
      </div>

      {/* Navigation TopTabs */}
      <div className="flex border-b border-zinc-900 gap-1.5 pb-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "active" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Active Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("updates")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "updates" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Weekly Updates ({weekly_updates.pending.length})
        </button>
        <button
          onClick={() => setActiveTab("funding")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "funding" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Funding Claims ({funding_claims.claims.length})
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          TAB 1: ACTIVE PROJECTS
          ──────────────────────────────────────────────────────── */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-550 italic text-sm">
              No tactical projects registered in the database.
            </div>
          ) : (
            projects.map((proj: any) => (
              <div 
                key={proj.id}
                className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-all duration-300 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                        {proj.name}
                      </h3>
                      {proj.github_url && (
                        <a 
                          href={proj.github_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[9px] font-mono text-zinc-550 hover:text-zinc-300 flex items-center gap-0.5 mt-0.5"
                        >
                          <RiGitRepositoryLine className="w-3 h-3" />
                          Repository
                        </a>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <Badge className={`text-[7px] font-black uppercase tracking-widest ${
                        proj.active 
                          ? "bg-green-955 text-green-400 border border-green-900/30" 
                          : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                      }`}>
                        {proj.active ? "Active" : "Inactive"}
                      </Badge>
                      {proj.funded && (
                        <Badge className={`text-[7px] font-black uppercase tracking-widest ${
                          proj.funded_pts_claimed 
                            ? "bg-purple-955 text-purple-400 border border-purple-900/30" 
                            : "bg-amber-955 text-amber-400 border border-amber-900/30"
                        }`}>
                          {proj.funded_pts_claimed ? "Funded (Claimed)" : "Funded (Pending)"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                    {proj.description || "No project documentation registered yet."}
                  </p>
                </div>

                {/* Team member avatar stack + Owner info */}
                <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase text-zinc-550 tracking-wider font-mono">Owner</p>
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5 border border-zinc-800">
                          <AvatarFallback className="bg-zinc-850 text-[8px] font-bold text-zinc-400">
                            {proj.owner?.name?.slice(0,2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-black text-zinc-350">{proj.owner?.name}</span>
                      </div>
                    </div>

                    {proj.team.length > 0 && (
                      <div className="space-y-0.5 pl-3 border-l border-zinc-900">
                        <p className="text-[8px] font-black uppercase text-zinc-550 tracking-wider font-mono">Team</p>
                        <div className="flex -space-x-1.5">
                          {proj.team.slice(0, 4).map((member: any) => (
                            <Avatar key={member.id} className="w-5 h-5 border border-black shrink-0">
                              <AvatarFallback className="bg-zinc-800 text-[8px] font-bold text-zinc-500">
                                {member.name?.slice(0,2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/projects/${proj.id}`)}
                    className="h-7 px-2 rounded-lg text-[9px] font-black border-zinc-800 bg-zinc-900/10 text-zinc-400 hover:bg-zinc-900 flex items-center gap-0.5"
                  >
                    Edit Info
                    <RiExternalLinkLine className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 2: WEEKLY UPDATES
          ──────────────────────────────────────────────────────── */}
      {activeTab === "updates" && (
        <div className="space-y-6">
          
          {/* Submitted Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading">
              Pending Submissions ({weekly_updates.pending.length})
            </h3>

            <div className="space-y-3">
              {weekly_updates.pending.length === 0 ? (
                <div className="p-4 bg-zinc-950/20 border border-zinc-850 border-dashed rounded-2xl text-center text-[10px] text-zinc-550 font-mono uppercase tracking-wider py-8">
                  All weekly updates reviewed. No pending tasks.
                </div>
              ) : (
                weekly_updates.pending.map((update: any) => (
                  <div 
                    key={update.id}
                    className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white">{update.project?.name}</span>
                        <Badge className="bg-red-955 text-red-400 border border-red-900/30 text-[7px] font-black uppercase tracking-widest">
                          Weekly Update
                        </Badge>
                        <span className="text-[9px] text-zinc-500 font-mono font-bold">
                          Submitted by {update.user?.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/50">
                        {update.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Button
                        size="sm"
                        disabled={processingId === update.id}
                        onClick={() => handleUpdateStatus(update.project_id, update.id, "approve_update")}
                        className="h-8 px-3 rounded-lg text-[10px] font-black bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/25 flex items-center gap-1"
                      >
                        <RiCheckLine className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        disabled={processingId === update.id}
                        onClick={() => handleUpdateStatus(update.project_id, update.id, "reject_update")}
                        className="h-8 px-3 rounded-lg text-[10px] font-black bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 flex items-center gap-1"
                      >
                        <RiCloseLine className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Missing Updates Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-heading flex items-center gap-1">
              <RiAlertLine className="w-4 h-4" />
              Missing Weekly updates ({weekly_updates.missing.length})
            </h3>
            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
              {weekly_updates.missing.length === 0 ? (
                <p className="text-[10px] text-zinc-550 italic">None. All active projects submitted updates this week!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {weekly_updates.missing.map((proj: any) => (
                    <div 
                      key={proj.id}
                      onClick={() => router.push(`/projects/${proj.id}`)}
                      className="p-2.5 bg-zinc-950/20 border border-zinc-850/50 hover:border-zinc-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-zinc-300 truncate max-w-[120px]">{proj.name}</p>
                        <p className="text-[8px] font-black uppercase text-zinc-550 font-mono truncate">{proj.owner?.name}</p>
                      </div>
                      <RiExternalLinkLine className="w-3 h-3 text-zinc-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dormant Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest font-heading flex items-center gap-1">
              <RiAlertLine className="w-4 h-4" />
              Dormant projects (&gt;14 days inactive) ({weekly_updates.dormant.length})
            </h3>
            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
              {weekly_updates.dormant.length === 0 ? (
                <p className="text-[10px] text-zinc-550 italic">None. No dormant projects detected.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {weekly_updates.dormant.map((proj: any) => (
                    <div 
                      key={proj.id}
                      onClick={() => router.push(`/projects/${proj.id}`)}
                      className="p-2.5 bg-red-950/5 border border-red-950/30 hover:border-red-900/40 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-red-400 truncate max-w-[120px]">{proj.name}</p>
                        <p className="text-[8px] font-black uppercase text-red-500/50 font-mono truncate">{proj.owner?.name}</p>
                      </div>
                      <RiExternalLinkLine className="w-3 h-3 text-red-900/40" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 3: FUNDING CLAIMS
          ──────────────────────────────────────────────────────── */}
      {activeTab === "funding" && (
        <div className="space-y-6">
          
          {/* Claims Cards */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading">
              Pending Funding Claims ({funding_claims.claims.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funding_claims.claims.length === 0 ? (
                <div className="col-span-full py-8 text-center text-zinc-550 italic text-[11px]">
                  No pending project funding claims.
                </div>
              ) : (
                funding_claims.claims.map((claim: any) => (
                  <div 
                    key={claim.id}
                    className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-black text-white">{claim.name}</h4>
                        <Badge className="bg-amber-955 text-amber-400 border border-amber-900/30 text-[7px] font-black uppercase tracking-widest">
                          Funding Claim
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{claim.description}</p>
                      {claim.funded_proof_url && (
                        <a 
                          href={claim.funded_proof_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[9px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                        >
                          <RiExternalLinkLine className="w-3.5 h-3.5" />
                          Inspect Funding Verification Proof
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-3.5">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black uppercase text-zinc-550 tracking-wider font-mono">Owner</p>
                        <span className="text-[10px] font-black text-zinc-350">{claim.owner?.name}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        disabled={processingId === claim.id}
                        onClick={() => handleApproveFunding(claim.id)}
                        className="h-8 px-3 rounded-lg text-[10px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 flex items-center gap-1"
                      >
                        <RiCoinsLine className="w-3.5 h-3.5" />
                        Approve Claim (+5 Pts)
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Awarded / Claimed Projects */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading">
              Awarded & Funded Projects ({funding_claims.awarded.length})
            </h3>

            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
              {funding_claims.awarded.length === 0 ? (
                <p className="text-[10px] text-zinc-555 italic">No projects have claimed funding rewards yet.</p>
              ) : (
                <div className="divide-y divide-zinc-900">
                  {funding_claims.awarded.map((claim: any) => (
                    <div 
                      key={claim.id}
                      className="py-3 flex items-center justify-between text-left"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-white">{claim.name}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-mono">
                          <span>Owner: {claim.owner?.name}</span>
                          <span>•</span>
                          <span>Claimed: {new Date(claim.funded_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Badge className="bg-green-955 text-green-400 border border-green-900/30 text-[7px] font-black uppercase tracking-widest flex items-center gap-0.5">
                        <RiCheckboxCircleLine className="w-3 h-3" />
                        Points Distributed
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
