"use client";

import { useEffect, useState } from "react";
import { Award, Flame, Calendar, Trophy, Zap, ShieldAlert, Sparkles } from "lucide-react";
import { CenturyBar } from "./CenturyBar";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  name: string;
  email: string;
  usn: string | null;
  branch: string;
  year: string;
  role: string;
  status: string;
  tier: string;
  redeemable_pts: number;
  lifetime_pts: number;
  current_quarter_pts: number;
  streak: number;
  warning_level: string;
}

interface OverviewTabProps {
  profile: Profile;
  onActivateCentury: () => void;
}

export function OverviewTab({ profile, onActivateCentury }: OverviewTabProps) {
  const getTierInfo = (pts: number) => {
    if (pts < 15) return { current: "Active", next: "Contributor", min: 0, max: 15 };
    if (pts < 30) return { current: "Contributor", next: "Elite", min: 15, max: 30 };
    if (pts < 60) return { current: "Elite", next: "Domain Master", min: 30, max: 60 };
    if (pts < 100) return { current: "Domain Master", next: "Century", min: 60, max: 100 };
    return { current: "Century", next: "Max", min: 100, max: 100 };
  };

  const { current, next, min, max } = getTierInfo(profile.redeemable_pts);
  const tierProgress = max === min ? 100 : Math.min(Math.round(((profile.redeemable_pts - min) / (max - min)) * 100), 100);

  // SVG circular seal properties
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const isCenturyReady = profile.redeemable_pts >= 100;
  
  // Seal progress: map to 100 points
  const activePercent = Math.min(profile.redeemable_pts / 100, 1);
  const strokeDashoffset = circumference - activePercent * circumference;

  // Semester monthly chart mock data
  const semesterChartData = [
    { label: "Feb", value: 15 },
    { label: "Mar", value: 28 },
    { label: "Apr", value: 18 },
    { label: "May (Cur)", value: profile.current_quarter_pts || 14 },
  ];

  const maxChartValue = Math.max(...semesterChartData.map((d) => d.value), 30);

  // Streak bonus progress calculation (bonus awarded every 4 meetings)
  const streakProgress = profile.streak % 4;

  return (
    <div className="space-y-6">
      {/* Top Grid: Cursed Seal & Lifetime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Cursed Energy Seal Meter (Clipped Panel) */}
        <div className="kogane-panel p-6 border-red-500/20 md:col-span-2 flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Circular Cursed Seal */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            {/* Spinning Outer Ring */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full border border-dashed border-red-500/25",
                isCenturyReady ? "animate-spin-fast border-amber-500" : "animate-spin-slow"
              )}
            />
            {/* Pulsing Energy Inner Halo */}
            <div 
              className={cn(
                "absolute inset-3 rounded-full bg-red-950/5 border border-red-500/10 flex items-center justify-center",
                isCenturyReady && "bg-amber-950/10 border-amber-500/30 animate-pulse"
              )}
            />
            
            {/* SVG Seal Arc */}
            <svg className="w-32 h-32 transform -rotate-90 relative z-10">
              {/* Back track */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-zinc-950 fill-none"
                strokeWidth="6"
              />
              {/* Energy Progress Line */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={cn(
                  "fill-none transition-all duration-700 ease-out",
                  isCenturyReady ? "stroke-amber-500 animate-pulse" : "stroke-red-650"
                )}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner values */}
            <div className="absolute flex flex-col items-center justify-center text-center z-20">
              <span className="text-2xl font-bold font-mono-stats text-white leading-none">
                {profile.redeemable_pts}
              </span>
              <span className="text-[8px] font-heading font-semibold text-zinc-500 tracking-wider mt-1 block">
                Cursed Energy
              </span>
            </div>
          </div>

          {/* Tier Progress details */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <span className="text-[9px] font-heading font-semibold text-zinc-500 tracking-wider">
                Colony Tier Standing
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                Class: <span className="text-red-500 capitalize">{current.replace("_", " ")}</span>
              </h3>
            </div>

            {current !== "Century" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Progress to {next}</span>
                  <span className="font-mono-stats text-white">{profile.redeemable_pts} / {max} Pts</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-650 rounded-full transition-all duration-500"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-500 block leading-relaxed">
                  Earn {max - profile.redeemable_pts} more points this quarter to reach {next} class.
                </span>
              </div>
            )}

            {current === "Century" && (
              <div className="p-3 bg-red-950/10 border border-red-950/20 rounded-xl">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 font-heading">
                  <Sparkles className="w-4 h-4 animate-bounce-subtle" />
                  MAX CLAN STANDING UNLOCKED
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1 leading-relaxed">
                  You are eligible to initiate the Century sacrifice checklist below.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lifetime Points & Rank Card */}
        <div className="kogane-panel p-6 border-red-500/20 flex flex-col justify-between min-h-[160px]">
          <div>
            <span className="text-[9px] font-heading font-semibold text-zinc-500 tracking-wider uppercase block">
              Global Colony Stats
            </span>
            <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">
              Best Outgoing Student Track
            </h4>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-stats text-emerald-400">
              {profile.lifetime_pts}
            </span>
            <span className="text-xs text-zinc-500 font-heading">Lifetime Pts</span>
          </div>

          <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
            <span>BOS Standing:</span>
            <span className="font-bold text-white font-mono-stats flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-gold-dim" />
              Colony #1
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Semester monthly charts & Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Semester Points Activity Bar Chart (Left 2/3) */}
        <div className="kogane-panel p-6 border-red-500/20 md:col-span-2 space-y-4">
          <div>
            <span className="text-[9px] font-heading font-semibold text-zinc-500 tracking-wider block">
              Semester Metrics
            </span>
            <h3 className="text-md font-bold text-white tracking-tight mt-0.5">
              Monthly Points Velocity
            </h3>
          </div>

          {/* Customized HTML/CSS Bar Chart Grid */}
          <div className="pt-4 flex items-end justify-around h-44 border-b border-zinc-900 relative">
            {semesterChartData.map((data, idx) => {
              const heightPercent = Math.min((data.value / maxChartValue) * 100, 100);
              return (
                <div key={idx} className="flex flex-col items-center group w-16 relative">
                  {/* Hover tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded text-[9px] font-mono-stats text-white transition-opacity duration-200 pointer-events-none z-30">
                    {data.value} Pts
                  </div>
                  {/* Column bar */}
                  <div 
                    className="w-8 bg-gradient-to-t from-red-950 to-red-650 hover:from-red-900 hover:to-red-500 rounded-t border-t border-red-500/10 hover:border-red-500/35 transition-all duration-300 relative overflow-hidden group-hover:shadow-md group-hover:shadow-red-600/10 cursor-pointer"
                    style={{ height: `${heightPercent}%`, minHeight: "10px" }}
                  />
                  {/* Label */}
                  <span className="text-[10px] text-zinc-500 mt-2 font-heading font-semibold tracking-wider">
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak details card */}
        <div className="kogane-panel p-6 border-red-500/20 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[9px] font-heading font-semibold text-zinc-500 tracking-wider block">
              Engagement Tracker
            </span>
            <h4 className="text-sm font-bold text-white tracking-tight mt-0.5 flex items-center gap-1.5">
              Attendance Streak
              {profile.streak >= 3 && <Flame className="w-4 h-4 text-orange-500 animate-pulse" />}
            </h4>
          </div>

          <div className="my-3 space-y-4">
            {/* Streak count block */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold font-mono-stats text-white block">
                  {profile.streak} Syncs
                </span>
                <span className="text-[9px] text-zinc-500 block leading-none">
                  Current Consecutive Runs
                </span>
              </div>
            </div>

            {/* Next bonus threshold */}
            <div className="space-y-1 text-xs text-zinc-400">
              <div className="flex justify-between text-[10px]">
                <span>Progress to Streak Bonus (+1 pt)</span>
                <span className="font-mono-stats text-white">{streakProgress} / 4</span>
              </div>
              <div className="h-1 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${(streakProgress / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Skip tokens remaining */}
          <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Skip Tokens:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold font-mono-stats",
                    i < 2 // Arjun has 2 skip tokens
                      ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10"
                      : "bg-zinc-950 border-zinc-900 text-zinc-700"
                  )}
                  title={i < 2 ? "Skip token active" : "Token locked"}
                >
                  S
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Century Bar */}
      <CenturyBar points={profile.redeemable_pts} onActivateClick={onActivateCentury} />
    </div>
  );
}
