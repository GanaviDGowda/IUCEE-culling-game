"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  RiTrophyLine, 
  RiMedalLine, 
  RiUserStarLine, 
  RiCpuLine, 
  RiLightbulbLine, 
  RiFolderShield2Line, 
  RiCompass3Line, 
  RiBrushLine,
  RiGroupLine,
  RiPieChartLine,
  RiDoubleQuotesL
} from "@remixicon/react";

type TopTab = "main" | "domain" | "distribution";
type MainPeriod = "ranking" | "bos";
type DomainType = "tech" | "innovation" | "projects" | "leadership" | "creative";

export default function AdminLeaderboardsDashboard() {
  const [activeTab, setActiveTab] = useState<TopTab>("main");
  const [period, setPeriod] = useState<MainPeriod>("ranking");
  const [domain, setDomain] = useState<DomainType>("tech");
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leaderboards");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load leaderboards statistics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

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
        </div>
        <Skeleton className="h-96 w-full bg-zinc-900/40 rounded-2xl" />
      </div>
    );
  }

  const { main = {}, domain: domains = {}, distribution = {} } = data || {};

  const activeMainRank = main[period] || [];
  const activeDomainRank = domains[domain] || [];

  // Helper to render rank icons/medals
  const renderRankBadge = (rankIdx: number) => {
    const rank = rankIdx + 1;
    if (rank === 1) {
      return (
        <span className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black font-mono">
          #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-5 h-5 rounded-md flex items-center justify-center bg-zinc-300/10 border border-zinc-300/30 text-zinc-300 text-[10px] font-black font-mono">
          #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-700/10 border border-amber-700/30 text-amber-600 text-[10px] font-black font-mono">
          #3
        </span>
      );
    }
    return (
      <span className="w-5 h-5 rounded-md flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] font-black font-mono">
        #{rank}
      </span>
    );
  };

  // Helper: render horizontal progress bar gauge
  const renderProgressBar = (value: number, total: number, colorClass: string) => {
    const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-zinc-400 font-mono uppercase">
          <span>{value} ({pct}%)</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Page Title */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest font-heading flex items-center gap-1.5">
          <RiTrophyLine className="w-5 h-5 text-red-500" />
          Colony Leaderboards
        </h2>
        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider font-heading">
          Track high-tier student rankings, domain mastery scoring, and overall member distribution metrics.
        </p>
      </div>

      {/* Main TopTabs */}
      <div className="flex border-b border-zinc-900 gap-1.5 pb-2">
        <button
          onClick={() => setActiveTab("main")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "main" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Main Rankings
        </button>
        <button
          onClick={() => setActiveTab("domain")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "domain" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Domain Rankings
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "distribution" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Tier Distribution
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          TAB 1: MAIN RANKINGS
          ──────────────────────────────────────────────────────── */}
      {activeTab === "main" && (
        <div className="space-y-4">
          
          {/* Period Selection Controls */}
          <div className="flex gap-1 bg-zinc-900/10 border border-zinc-850 p-1 rounded-xl max-w-md">
            {(["ranking", "bos"] as MainPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-1 rounded-lg text-[9px] font-heading font-black uppercase tracking-wider transition-colors ${
                  period === p 
                    ? "bg-red-955 border border-red-900/30 text-red-400" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p === "ranking" ? "Main" : "BOS"}
              </button>
            ))}
          </div>

          {/* Ranked List */}
          <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
            {activeMainRank.length === 0 ? (
              <p className="text-center py-8 text-zinc-555 italic text-sm">No student metrics compiled for this period.</p>
            ) : (
              <div className="divide-y divide-zinc-900">
                {activeMainRank.map((student: any, idx: number) => (
                  <div 
                    key={student.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-900/10 transition-colors px-1"
                  >
                    <div className="flex items-center gap-3">
                      {renderRankBadge(idx)}
                      
                      <Avatar className="w-8 h-8 border border-zinc-800 shrink-0">
                        <AvatarFallback className="bg-zinc-850 text-xs font-bold text-zinc-400">
                          {student.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-white">{student.name}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase font-mono">
                          <span>{student.branch} Y{student.year}</span>
                          <span>•</span>
                          <span className="capitalize">{student.tier || "Active"}</span>
                          {period === "ranking" && student.fast_rising ? (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">Fast rising</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white font-mono leading-none">
                        {period === "bos" ? student.lifetime_pts : student.redeemable_pts}
                      </p>
                      <p className="text-[8px] font-black uppercase text-zinc-550 font-mono mt-0.5 tracking-wider">
                        {period === "bos" ? "Lifetime Pts" : "Active Pts"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 2: DOMAIN RANKINGS
          ──────────────────────────────────────────────────────── */}
      {activeTab === "domain" && (
        <div className="space-y-4">
          
          {/* Domain Sub-tab Navigation */}
          <div className="grid grid-cols-5 gap-1.5 border-b border-zinc-900 pb-2">
            {[
              { id: "tech", label: "Tech", icon: RiCpuLine },
              { id: "innovation", label: "Innovation", icon: RiLightbulbLine },
              { id: "projects", label: "Projects", icon: RiFolderShield2Line },
              { id: "leadership", label: "Leadership", icon: RiCompass3Line },
              { id: "creative", label: "Creative", icon: RiBrushLine },
            ].map((sub) => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setDomain(sub.id as DomainType)}
                  className={`flex flex-col items-center justify-center p-2 border rounded-xl transition-all ${
                    domain === sub.id
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-zinc-950/20 border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1 group-hover:scale-105" />
                  <span className="text-[9px] font-black font-heading uppercase tracking-wider">{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Domain Rankings list */}
          <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
            {activeDomainRank.length === 0 ? (
              <div className="py-8 text-center text-zinc-550 italic text-[11px]">
                No mastery credits recorded in the {domain} domain ledger.
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {activeDomainRank.map((student: any, idx: number) => (
                  <div 
                    key={student.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-900/10 transition-colors px-1"
                  >
                    <div className="flex items-center gap-3">
                      {renderRankBadge(idx)}
                      <Avatar className="w-8 h-8 border border-zinc-800 shrink-0">
                        <AvatarFallback className="bg-zinc-850 text-xs font-bold text-zinc-400">
                          {student.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xs font-black text-white">{student.name}</h4>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase font-mono mt-0.5">
                          {student.branch} Y{student.year}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-red-400 font-mono leading-none">
                        {student.score}
                      </p>
                      <p className="text-[8px] font-black uppercase text-zinc-550 font-mono mt-0.5 tracking-wider">
                        Domain Score
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 3: TIER & DEMOGRAPHIC DISTRIBUTION
          ──────────────────────────────────────────────────────── */}
      {activeTab === "distribution" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          
          {/* Left Column: Tiers and Century users */}
          <div className="space-y-4">
            
            {/* Tiers Distribution Donut Chart */}
            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1 border-b border-zinc-900 pb-2">
                <RiPieChartLine className="w-4 h-4 text-red-500" />
                Tier Distribution
              </h3>

              {(() => {
                const tiersList = [
                  { key: "century", label: "Century Tier", color: "#EF4444" },
                  { key: "domain_master", label: "Domain Master", color: "#8B5CF6" },
                  { key: "elite", label: "Elite Members", color: "#3B82F6" },
                  { key: "contributor", label: "Contributors", color: "#F59E0B" },
                  { key: "active", label: "Active Status", color: "#10B981" },
                ];
                const totalTierStudents = distribution.total_students || 0;
                let accumulatedPercentage = 0;
                
                const segments = tiersList.map((t) => {
                  const val = distribution.tiers?.[t.key] || 0;
                  const percentage = totalTierStudents > 0 ? (val / totalTierStudents) * 100 : 0;
                  const dashArray = 251.327;
                  const dashOffset = dashArray - (percentage / 100) * dashArray;
                  const rotation = (accumulatedPercentage / 100) * 360;
                  accumulatedPercentage += percentage;
                  return {
                    name: t.label,
                    value: val,
                    percentage,
                    dashOffset,
                    rotation,
                    color: t.color
                  };
                }).filter(item => item.value > 0);

                return totalTierStudents === 0 ? (
                  <p className="text-center text-zinc-555 italic py-10 text-xs">No distribution data indexed.</p>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="relative flex items-center justify-center">
                      <svg width="140" height="140" viewBox="0 0 120 120" className="overflow-visible">
                        {/* Background track circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="40"
                          fill="transparent"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="12"
                        />
                        
                        {/* Segment Arcs */}
                        {segments.map((seg: any, idx: number) => (
                          <circle
                            key={idx}
                            cx="60"
                            cy="60"
                            r="40"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="10"
                            strokeDasharray="251.327"
                            strokeDashoffset={seg.dashOffset}
                            transform={`rotate(${seg.rotation - 90} 60 60)`}
                            className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
                          />
                        ))}

                        {/* Donut Center Hole text */}
                        <circle cx="60" cy="60" r="30" className="fill-zinc-950/80" />
                        <text x="60" y="58" textAnchor="middle" fill="#52525b" fontSize="6.5" fontWeight="bold" className="uppercase tracking-widest font-heading">Total</text>
                        <text x="60" y="71" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="black" className="font-mono">{totalTierStudents}</text>
                      </svg>
                    </div>

                    {/* Legends */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-[9px] font-heading font-black">
                      {segments.map((seg: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-900/50 px-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="text-zinc-400 truncate uppercase tracking-wider text-[8.5px]">{seg.name}</span>
                          </div>
                          <span className="text-white font-mono text-[9px] shrink-0 ml-2">
                            {seg.value} <span className="text-zinc-650 text-[8px] font-bold">({Math.round(seg.percentage)}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Century Users Callout */}
            <div className="p-4 bg-red-955 border border-red-900/30 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-400 shrink-0">
                <RiUserStarLine className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-heading">Century Tier Members</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                  There are currently <strong className="text-red-400">{distribution.century_users} students</strong> who have earned 100+ lifetime points, ascending to the legendary Century tier list!
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Branch & Year Splits */}
          <div className="space-y-4">
            
            {/* Branch Split */}
            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1 border-b border-zinc-900 pb-2">
                <RiGroupLine className="w-4 h-4 text-teal-400" />
                Branch Demographic Split
              </h3>

              {(() => {
                const branchColors: Record<string, string> = {
                  CSE: "#3B82F6",
                  ISE: "#8B5CF6",
                  ECE: "#EF4444",
                  ME: "#F59E0B",
                  EEE: "#10B981"
                };
                const totalBranchStudents = distribution.total_students || 0;
                let accumulatedPercentage = 0;
                
                const segments = Object.entries(distribution.branches || {}).map(([branch, count]: any) => {
                  const percentage = totalBranchStudents > 0 ? (count / totalBranchStudents) * 100 : 0;
                  const dashArray = 251.327;
                  const dashOffset = dashArray - (percentage / 100) * dashArray;
                  const rotation = (accumulatedPercentage / 100) * 360;
                  accumulatedPercentage += percentage;
                  return {
                    name: `${branch} Dept`,
                    value: count,
                    percentage,
                    dashOffset,
                    rotation,
                    color: branchColors[branch] || "#6B7280"
                  };
                }).filter(item => item.value > 0);

                return totalBranchStudents === 0 ? (
                  <p className="text-center text-zinc-555 italic py-10 text-xs">No branch data indexed.</p>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="relative flex items-center justify-center">
                      <svg width="140" height="140" viewBox="0 0 120 120" className="overflow-visible">
                        <circle
                          cx="60"
                          cy="60"
                          r="40"
                          fill="transparent"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="12"
                        />
                        {segments.map((seg: any, idx: number) => (
                          <circle
                            key={idx}
                            cx="60"
                            cy="60"
                            r="40"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="10"
                            strokeDasharray="251.327"
                            strokeDashoffset={seg.dashOffset}
                            transform={`rotate(${seg.rotation - 90} 60 60)`}
                            className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
                          />
                        ))}
                        <circle cx="60" cy="60" r="30" className="fill-zinc-950/80" />
                        <text x="60" y="58" textAnchor="middle" fill="#52525b" fontSize="6.5" fontWeight="bold" className="uppercase tracking-widest font-heading">Total</text>
                        <text x="60" y="71" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="black" className="font-mono">{totalBranchStudents}</text>
                      </svg>
                    </div>
                    {/* Legends */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-[9px] font-heading font-black">
                      {segments.map((seg: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-900/50 px-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="text-zinc-400 truncate uppercase tracking-wider text-[8.5px]">{seg.name}</span>
                          </div>
                          <span className="text-white font-mono text-[9px] shrink-0 ml-2">
                            {seg.value} <span className="text-zinc-650 text-[8px] font-bold">({Math.round(seg.percentage)}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Year Split */}
            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1 border-b border-zinc-900 pb-2">
                <RiGroupLine className="w-4 h-4 text-blue-400" />
                Academic Year split
              </h3>

              {(() => {
                const yearColors: Record<string, string> = {
                  "1": "#3B82F6",
                  "2": "#8B5CF6",
                  "3": "#F59E0B",
                  "4": "#EF4444"
                };
                const totalYearStudents = distribution.total_students || 0;
                let accumulatedPercentage = 0;
                
                const segments = [1, 2, 3, 4].map((year) => {
                  const count = distribution.years?.[String(year)] || 0;
                  const percentage = totalYearStudents > 0 ? (count / totalYearStudents) * 100 : 0;
                  const dashArray = 251.327;
                  const dashOffset = dashArray - (percentage / 100) * dashArray;
                  const rotation = (accumulatedPercentage / 100) * 360;
                  accumulatedPercentage += percentage;
                  return {
                    name: `${year}st Year`,
                    value: count,
                    percentage,
                    dashOffset,
                    rotation,
                    color: yearColors[String(year)] || "#6B7280"
                  };
                }).filter(item => item.value > 0);

                return totalYearStudents === 0 ? (
                  <p className="text-center text-zinc-555 italic py-10 text-xs">No year data indexed.</p>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="relative flex items-center justify-center">
                      <svg width="140" height="140" viewBox="0 0 120 120" className="overflow-visible">
                        <circle
                          cx="60"
                          cy="60"
                          r="40"
                          fill="transparent"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="12"
                        />
                        {segments.map((seg: any, idx: number) => (
                          <circle
                            key={idx}
                            cx="60"
                            cy="60"
                            r="40"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="10"
                            strokeDasharray="251.327"
                            strokeDashoffset={seg.dashOffset}
                            transform={`rotate(${seg.rotation - 90} 60 60)`}
                            className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
                          />
                        ))}
                        <circle cx="60" cy="60" r="30" className="fill-zinc-950/80" />
                        <text x="60" y="58" textAnchor="middle" fill="#52525b" fontSize="6.5" fontWeight="bold" className="uppercase tracking-widest font-heading">Total</text>
                        <text x="60" y="71" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="black" className="font-mono">{totalYearStudents}</text>
                      </svg>
                    </div>
                    {/* Legends */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-[9px] font-heading font-black">
                      {segments.map((seg: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-900/50 px-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="text-zinc-400 truncate uppercase tracking-wider text-[8.5px]">{seg.name}</span>
                          </div>
                          <span className="text-white font-mono text-[9px] shrink-0 ml-2">
                            {seg.value} <span className="text-zinc-650 text-[8px] font-bold">({Math.round(seg.percentage)}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
