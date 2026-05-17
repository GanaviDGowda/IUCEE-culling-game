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
type MainPeriod = "all_time" | "quarterly" | "monthly" | "rising";
type DomainType = "tech" | "innovation" | "projects" | "leadership" | "creative";

export default function AdminLeaderboardsDashboard() {
  const [activeTab, setActiveTab] = useState<TopTab>("main");
  const [period, setPeriod] = useState<MainPeriod>("all_time");
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
        <h2 className="text-sm font-black text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
          <RiTrophyLine className="w-5 h-5 text-red-500" />
          Colony Leaderboards
        </h2>
        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider font-mono">
          Track high-tier student rankings, domain mastery scoring, and overall member distribution metrics.
        </p>
      </div>

      {/* Main TopTabs */}
      <div className="flex border-b border-zinc-900 gap-1.5 pb-2">
        <button
          onClick={() => setActiveTab("main")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-colors ${
            activeTab === "main" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Main Rankings
        </button>
        <button
          onClick={() => setActiveTab("domain")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-colors ${
            activeTab === "domain" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Domain Rankings
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-colors ${
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
            {(["all_time", "quarterly", "monthly", "rising"] as MainPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-colors ${
                  period === p 
                    ? "bg-red-955 border border-red-900/30 text-red-400" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p.replace("_", " ")}
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
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white font-mono leading-none">
                        {period === "all_time" ? student.lifetime_pts : student.period_pts}
                      </p>
                      <p className="text-[8px] font-black uppercase text-zinc-550 font-mono mt-0.5 tracking-wider">
                        {period === "all_time" ? "Lifetime Pts" : "Period Pts"}
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
                  <span className="text-[9px] font-black font-mono uppercase tracking-wider">{sub.label}</span>
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
            
            {/* Tiers Distribution Bar Chart */}
            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1 border-b border-zinc-900 pb-2">
                <RiPieChartLine className="w-4 h-4" />
                Tier Distribution
              </h3>

              <div className="space-y-3.5 pt-1">
                {[
                  { key: "century", label: "Century Tier", color: "bg-red-500" },
                  { key: "domain_master", label: "Domain Master", color: "bg-purple-500" },
                  { key: "elite", label: "Elite Members", color: "bg-blue-500" },
                  { key: "contributor", label: "Contributors", color: "bg-amber-500" },
                  { key: "active", label: "Active Status", color: "bg-zinc-500" },
                ].map((tier) => (
                  <div key={tier.key} className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider font-mono">
                      {tier.label}
                    </span>
                    {renderProgressBar(
                      distribution.tiers?.[tier.key] || 0,
                      distribution.total_students || 1,
                      tier.color
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Century Users Callout */}
            <div className="p-4 bg-red-955 border border-red-900/30 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-400 shrink-0">
                <RiUserStarLine className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Century Tier Members</h4>
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
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1 border-b border-zinc-900 pb-2">
                <RiGroupLine className="w-4 h-4" />
                Branch Demographic Split
              </h3>

              <div className="space-y-3.5 pt-1">
                {Object.keys(distribution.branches || {}).length === 0 ? (
                  <p className="text-[10px] text-zinc-555 italic">No branch data indexed.</p>
                ) : (
                  Object.entries(distribution.branches || {}).map(([branch, count]: any) => (
                    <div key={branch} className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider font-mono">
                        {branch} Department
                      </span>
                      {renderProgressBar(count, distribution.total_students || 1, "bg-teal-500")}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Year Split */}
            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1 border-b border-zinc-900 pb-2">
                <RiGroupLine className="w-4 h-4" />
                Academic Year split
              </h3>

              <div className="space-y-3.5 pt-1">
                {[1, 2, 3, 4].map((year) => (
                  <div key={year} className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider font-mono">
                      {year}st Year Students
                    </span>
                    {renderProgressBar(
                      distribution.years?.[String(year)] || 0,
                      distribution.total_students || 1,
                      "bg-blue-500"
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
