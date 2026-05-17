"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  RiPieChart2Line, 
  RiLineChartLine, 
  RiPulseLine,
  RiGroupLine, 
  RiCompass3Line, 
  RiTrophyLine,
  RiHeartPulseLine,
  RiSparklingLine,
  RiArrowRightUpLine,
  RiUserUnfollowLine,
  RiFolderChartLine
} from "@remixicon/react";

type TopTab = "engagement" | "attendance" | "demographics" | "bos";

export default function AdminAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TopTab>("engagement");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics suite:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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

  const { engagement = {}, attendance = {}, demographics = {}, bos = {} } = data || {};

  // Standard safe fallbacks
  const engagementTrend = engagement.engagementTrend || [];
  const attendanceTrend = attendance.attendanceTrend || [];
  const inactiveMembers = attendance.inactiveMembers || [];
  const branchComparison = demographics.branchComparison || [];
  const cohortView = demographics.cohortView || [];
  const bosRankings = bos.rankings || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest font-heading flex items-center gap-1.5">
          <RiPieChart2Line className="w-5 h-5 text-red-500 animate-pulse" />
          Colony Intelligence Hub
        </h2>
        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider font-heading">
          Real-time metrics, transactional trends, engagement diagnostics, and BOS rank indices.
        </p>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-zinc-900 gap-1.5 pb-2">
        <button
          onClick={() => setActiveTab("engagement")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "engagement" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Engagement
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "attendance" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab("demographics")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "demographics" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Branch & Year
        </button>
        <button
          onClick={() => setActiveTab("bos")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "bos" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          BOS Rankings
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          TAB 1: ENGAGEMENT
          ──────────────────────────────────────────────────────── */}
      {activeTab === "engagement" && (
        <div className="space-y-6">
          
          {/* Key Engagement metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Retention Rate */}
            <div className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest font-heading">
                  Active Retention Rate
                </p>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  {engagement.retentionRate}%
                </h3>
                <p className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
                  Stable colony status • Target exceeds 90%
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border border-red-900/20 bg-red-955 flex items-center justify-center text-red-400 shrink-0">
                <RiHeartPulseLine className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            {/* Point Velocity */}
            <div className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-550 tracking-widest font-heading">
                  Point Generation Velocity
                </p>
                <h3 className="text-3xl font-black text-red-400 font-mono tracking-tight flex items-baseline gap-1">
                  +{engagement.pointVelocity}
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-heading">Pts/Wk</span>
                </h3>
                <p className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <RiArrowRightUpLine className="w-3.5 h-3.5 text-green-500" />
                  Highly active transactional ledger confirmations
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border border-purple-900/20 bg-purple-955 flex items-center justify-center text-purple-400 shrink-0">
                <RiSparklingLine className="w-7 h-7" />
              </div>
            </div>

          </div>

          {/* Inline SVG Participation Trend Chart */}
          <div className="p-5 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-4">
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1">
                <RiLineChartLine className="w-4 h-4 text-red-500" />
                Colony Transactional Engagement
              </h3>
              <p className="text-[9px] text-zinc-550 font-medium uppercase mt-0.5">
                Confirmed point logs index velocity over the past 6 weeks
              </p>
            </div>

            {engagementTrend.length === 0 ? (
              <p className="text-center text-zinc-550 italic py-12 text-xs font-heading">Insufficient trend points available.</p>
            ) : (
              <div className="relative pt-4">
                {/* Custom inline responsive SVG Chart */}
                <svg className="w-full h-44 overflow-visible" viewBox="0 0 600 150">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DC2626" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                  <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />

                  {/* SVG Path Calculation for 6 data items */}
                  {(() => {
                    const maxVal = Math.max(...engagementTrend.map((d: any) => d.points), 100);
                    const coords = engagementTrend.map((d: any, idx: number) => {
                      const x = (idx / 5) * 600;
                      const y = 140 - (d.points / maxVal) * 110;
                      return { x, y };
                    });

                    const pathD = `M ${coords.map((c: any) => `${c.x} ${c.y}`).join(" L ")}`;
                    const areaD = `${pathD} L 600 140 L 0 140 Z`;

                    return (
                      <>
                        {/* Area gradient underlay */}
                        <path d={areaD} fill="url(#areaGrad)" />
                        
                        {/* High definition stroke path */}
                        <path d={pathD} fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive Data dots */}
                        {coords.map((c: any, idx: number) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle cx={c.x} cy={c.y} r="4.5" fill="#E8E4DC" stroke="#8B0000" strokeWidth="2" />
                            <circle cx={c.x} cy={c.y} r="9" fill="#DC2626" opacity="0" className="hover:opacity-30 transition-opacity" />
                            {/* Text labels for point values on top */}
                            <text x={c.x} y={c.y - 12} fill="#E8E4DC" fontSize="8" fontWeight="black" textAnchor="middle" className="font-mono">
                              {engagementTrend[idx].points} Pts
                            </text>
                            {/* Axis Label */}
                            <text x={c.x} y="152" fill="#6B7280" fontSize="8" fontWeight="black" textAnchor="middle" className="font-heading">
                              {engagementTrend[idx].week}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 2: ATTENDANCE
          ──────────────────────────────────────────────────────── */}
      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Attendance trend & Consistency */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Consistency score card */}
            <div className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest font-heading">
                  Attendance Consistency Index
                </p>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  {attendance.consistencyScore}%
                </h3>
                <p className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
                  Students maintaining 80%+ consistency over the last 5 cycles
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border border-green-900/20 bg-green-955 flex items-center justify-center text-green-400 shrink-0">
                <RiPulseLine className="w-7 h-7" />
              </div>
            </div>

            {/* Attendance Trend Chart */}
            <div className="p-5 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-4">
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1">
                  <RiLineChartLine className="w-4 h-4 text-green-400" />
                  Historical Attendance Curves
                </h3>
                <p className="text-[9px] text-zinc-550 font-medium uppercase mt-0.5">
                  Percentage rate of active attendance in the most recent meetings
                </p>
              </div>

              {attendanceTrend.length === 0 ? (
                <p className="text-center text-zinc-550 italic py-12 text-xs font-heading">No attendance sessions recorded.</p>
              ) : (
                <div className="relative pt-4">
                  <svg className="w-full h-40 overflow-visible" viewBox="0 0 600 120">
                    <line x1="0" y1="15" x2="600" y2="15" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                    <line x1="0" y1="55" x2="600" y2="55" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                    <line x1="0" y1="95" x2="600" y2="95" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />

                    {(() => {
                      const coords = attendanceTrend.map((d: any, idx: number) => {
                        const x = (idx / Math.max(attendanceTrend.length - 1, 1)) * 600;
                        const y = 110 - (d.rate / 100) * 85;
                        return { x, y };
                      });

                      const pathD = `M ${coords.map((c: any) => `${c.x} ${c.y}`).join(" L ")}`;

                      return (
                        <>
                          {/* Attendance line */}
                          <path d={pathD} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Dots */}
                          {coords.map((c: any, idx: number) => (
                            <g key={idx}>
                              <circle cx={c.x} cy={c.y} r="4" fill="#E8E4DC" stroke="#15803D" strokeWidth="2" />
                              <text x={c.x} y={c.y - 10} fill="#E8E4DC" fontSize="8" fontWeight="black" textAnchor="middle" className="font-mono">
                                {attendanceTrend[idx].rate}%
                              </text>
                              <text x={c.x} y="118" fill="#6B7280" fontSize="7" fontWeight="black" textAnchor="middle" className="font-heading">
                                {attendanceTrend[idx].meeting}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Inactive list */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest font-heading flex items-center gap-1">
              <RiUserUnfollowLine className="w-4 h-4 text-red-500 animate-pulse" />
              Dormant / At-Risk Members
            </h3>

            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
              <p className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-3.5">
                Students with 0 marked cycles in the past 21 days
              </p>

              {inactiveMembers.length === 0 ? (
                <div className="py-6 text-center text-zinc-550 italic text-[11px] font-heading">
                  Colony secured. No inactive members.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {inactiveMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 border border-zinc-850 shrink-0">
                          <AvatarFallback className="bg-zinc-850 text-[10px] font-bold text-zinc-400">
                            {member.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[11px] font-bold text-zinc-300 leading-none">{member.name}</p>
                          <p className="text-[8px] text-zinc-550 font-black uppercase mt-0.5 font-heading">
                            {member.branch} Y{member.year}
                          </p>
                        </div>
                      </div>

                      <Badge className="bg-red-955 text-red-400 border border-red-900/30 text-[7px] font-black uppercase tracking-widest h-4 shrink-0">
                        INACTIVE
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 3: BRANCH & YEAR
          ──────────────────────────────────────────────────────── */}
      {activeTab === "demographics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          
          {/* Branch Performance Comparison */}
          <div className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-4">
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1">
                <RiFolderChartLine className="w-4 h-4 text-purple-400" />
                Branch Point Comparisons
              </h3>
              <p className="text-[9px] text-zinc-550 font-medium uppercase mt-0.5">
                Average lifetime points aggregated per department split
              </p>
            </div>

            {branchComparison.length === 0 ? (
              <p className="text-center text-zinc-550 italic py-10 text-xs">No branch distributions indexed.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {branchComparison.map((item: any) => {
                  const maxPoints = Math.max(...branchComparison.map((i: any) => i.averagePoints), 10);
                  const pct = Math.round((item.averagePoints / maxPoints) * 100);
                  
                  return (
                    <div key={item.branch} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase font-heading">
                        <span>{item.branch} Department</span>
                        <span className="font-mono">{item.averagePoints} Avg Pts</span>
                      </div>
                      
                      <div className="h-2.5 w-full bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
                        <div 
                          className="h-full rounded-lg bg-gradient-to-r from-red-600 to-purple-600 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[8px] text-zinc-650 font-black uppercase font-heading">
                        {item.students} members registered
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Cohort view */}
          <div className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-4">
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1">
                <RiGroupLine className="w-4 h-4 text-blue-400" />
                Academic Cohort Matrices
              </h3>
              <p className="text-[9px] text-zinc-550 font-medium uppercase mt-0.5">
                Comparative averages across student engineering batches
              </p>
            </div>

            <div className="divide-y divide-zinc-900">
              {cohortView.map((item: any) => (
                <div key={item.year} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-white font-heading">{item.year} Cohort</h4>
                    <p className="text-[9px] text-zinc-550 font-bold uppercase">
                      {item.count} registered scholars
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-right shrink-0">
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-white font-mono leading-none">
                        {item.averagePoints} Pts
                      </p>
                      <p className="text-[8px] font-black uppercase text-zinc-550 tracking-wider font-heading mt-0.5">
                        Avg Score
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-green-400 font-mono leading-none">
                        {item.attendanceRate}%
                      </p>
                      <p className="text-[8px] font-black uppercase text-zinc-555 tracking-wider font-heading mt-0.5">
                        Attendance
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 4: BOS RANKINGS
          ──────────────────────────────────────────────────────── */}
      {activeTab === "bos" && (
        <div className="space-y-4">
          
          <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-4">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2.5">
              <RiTrophyLine className="w-5 h-5 text-amber-500 animate-pulse" />
              <h3 className="text-[10px] font-black text-zinc-455 uppercase tracking-widest font-heading">
                Best Outgoing Student Candidates
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500 font-heading">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Scholars Name</th>
                    <th className="py-2.5 px-3">Branch & Year</th>
                    <th className="py-2.5 px-3 text-right">Mentorship Pts</th>
                    <th className="py-2.5 px-3 text-right">Leadership Pts</th>
                    <th className="py-2.5 px-3">Domain Badge</th>
                    <th className="py-2.5 px-3 text-right">Lifetime Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono">
                  {bosRankings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-zinc-550 italic font-heading">
                        No outstanding BOS scholars metrics calculated.
                      </td>
                    </tr>
                  ) : (
                    bosRankings.map((student: any, idx: number) => (
                      <tr 
                        key={student.id}
                        className="hover:bg-zinc-900/15 transition-colors font-mono"
                      >
                        <td className="py-3 px-3">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black ${
                            idx === 0 
                              ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px]"
                              : idx === 1
                              ? "bg-zinc-300/10 border border-zinc-300/30 text-zinc-300 text-[10px]"
                              : idx === 2
                              ? "bg-amber-700/10 border border-amber-700/30 text-amber-600 text-[10px]"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px]"
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {student.name}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 uppercase font-heading text-[10px] font-black">
                          {student.branch} Y{student.year}
                        </td>
                        <td className="py-3 px-3 text-right text-purple-400 font-bold">
                          {student.mentorshipScore}
                        </td>
                        <td className="py-3 px-3 text-right text-blue-400 font-bold">
                          {student.leadershipScore}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className="bg-zinc-850 text-zinc-400 border border-zinc-800 text-[8px] uppercase tracking-widest font-black font-heading py-0.5">
                            {student.domainBadge}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-white text-sm">
                          {student.lifetimePoints}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
