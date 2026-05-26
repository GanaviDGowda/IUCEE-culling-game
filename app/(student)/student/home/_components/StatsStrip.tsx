"use client";

import { Award, Flame, Calendar, Trophy, Zap } from "lucide-react";

interface StatsStripProps {
  points: number;
  tier: string;
  streak: number;
  meetingsAttended: number;
  rank: number;
}

export function StatsStrip({
  points,
  tier,
  streak,
  meetingsAttended,
  rank,
}: StatsStripProps) {
  const stats = [
    {
      label: "Cursed Energy",
      value: `${points} Pts`,
      icon: Zap,
      color: "text-red-500",
      description: "Redeemable Balance",
    },
    {
      label: "Player Class",
      value: tier.replace("_", " "),
      icon: Award,
      color: "text-amber-500",
      description: "Current Tier",
      capitalize: true,
    },
    {
      label: "Active Streak",
      value: `${streak} Wins`,
      icon: Flame,
      color: "text-orange-500 animate-pulse",
      description: "Consecutive Attendance",
    },
    {
      label: "Barrier Syncs",
      value: `${meetingsAttended} Attended`,
      icon: Calendar,
      color: "text-emerald-500",
      description: "Meetings Count",
    },
    {
      label: "Colony Rank",
      value: `#${rank}`,
      icon: Trophy,
      color: "text-gold-dim",
      description: "Leaderboard Position",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="kogane-panel p-4 flex flex-col justify-between min-h-[100px] hover:border-red-500/40 transition-colors group"
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-[10px] font-heading font-semibold text-zinc-500 tracking-wider">
                {stat.label}
              </span>
              <Icon className={`w-4 h-4 ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </div>

            <div className="mt-3">
              <span className={`text-lg font-bold font-mono-stats text-white block ${stat.capitalize ? "capitalize" : ""}`}>
                {stat.value}
              </span>
              <span className="text-[9px] text-zinc-500 block mt-0.5 font-sans leading-none truncate">
                {stat.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
