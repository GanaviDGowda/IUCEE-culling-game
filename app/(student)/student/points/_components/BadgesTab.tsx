"use client";

import { Award, Lock, Sparkles, Flame, Terminal, Users, Calendar, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface EarnedBadge {
  earned_at: string;
  badge: {
    id: string;
    slug: string;
    name: string;
    description: string;
    type: string;
    icon_url: string;
  };
}

interface BadgesTabProps {
  earnedBadges: EarnedBadge[];
}

interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  condition: string;
  type: "milestone" | "streak" | "achievement" | "project" | "social" | "tier" | "award";
}

const ALL_BADGES: BadgeDefinition[] = [
  {
    slug: "first_step",
    name: "First Step",
    description: "Initialize presence inside the colony.",
    condition: "Earn your first point inside the chapter.",
    type: "milestone",
  },
  {
    slug: "speaker",
    name: "Colony Speaker",
    description: "Share cursed techniques with the community.",
    condition: "Deliver your first presentation in a meeting.",
    type: "milestone",
  },
  {
    slug: "regular",
    name: "Sync Regular",
    description: "Maintain a steady link to the barrier.",
    condition: "Attend 10 colony meetings in total.",
    type: "milestone",
  },
  {
    slug: "streak_starter",
    name: "Streak Starter",
    description: "Begin a consecutive barrier sync run.",
    condition: "Achieve a 4-meeting attendance streak with no skips.",
    type: "streak",
  },
  {
    slug: "streak_master",
    name: "Streak Master",
    description: "Attain high-energy synchronization momentum.",
    condition: "Achieve an 8-meeting attendance streak with no skips.",
    type: "streak",
  },
  {
    slug: "hackathon_hero",
    name: "Hackathon Hero",
    description: "Podium placement in a major event.",
    condition: "Secure 1st place in a chapter-authorized hackathon.",
    type: "achievement",
  },
  {
    slug: "builder",
    name: "Colony Builder",
    description: "Consistent project codebase contributions.",
    condition: "Submit 4 consecutive project updates in meetings.",
    type: "project",
  },
  {
    slug: "funded",
    name: "Sorcerer Funded",
    description: "Attract external energy resources to your project.",
    condition: "Secure external funding for a registered project.",
    type: "project",
  },
  {
    slug: "mentor",
    name: "Colony Mentor",
    description: "Guide junior sorcerers in their training.",
    condition: "Register and maintain active mentorship for 1+ month.",
    type: "social",
  },
  {
    slug: "contributor_tier",
    name: "Contributor Class",
    description: "Rise to Contributor tier standing.",
    condition: "Reach Tier 1 (Contributor) for the first time.",
    type: "tier",
  },
  {
    slug: "elite_tier",
    name: "Elite Class",
    description: "Unlock advanced workshop eligibility.",
    condition: "Reach Tier 2 (Elite) for the first time.",
    type: "tier",
  },
  {
    slug: "domain_master_tier",
    name: "Domain Master Class",
    description: "Acquire domain badge classification.",
    condition: "Reach Tier 3 (Domain Master) for the first time.",
    type: "tier",
  },
  {
    slug: "centurion",
    name: "Centurion Member",
    description: "Sacrifice points to lock in permanent cosmetics.",
    condition: "Activate Century status by spending 100 points.",
    type: "tier",
  },
  {
    slug: "best_outgoing_student",
    name: "Best Outgoing Student",
    description: "Highest lifetime points at graduation.",
    condition: "Achieve top points ranking at the end of tenure.",
    type: "award",
  },
];

export function BadgesTab({ earnedBadges }: BadgesTabProps) {
  // Map earned badges by slug for quick lookup
  const earnedSlugs = new Map<string, string>(
    earnedBadges.map((eb) => [eb.badge.slug, eb.earned_at])
  );

  const getBadgeTypeConfig = (type: string) => {
    switch (type) {
      case "streak":
        return {
          icon: Flame,
          color: "text-orange-500 bg-orange-950/20 border-orange-500/20",
          glow: "shadow-orange-500/5",
        };
      case "achievement":
        return {
          icon: Sparkles,
          color: "text-amber-400 bg-amber-950/20 border-amber-500/20",
          glow: "shadow-amber-500/5",
        };
      case "project":
        return {
          icon: Terminal,
          color: "text-emerald-400 bg-emerald-950/20 border-emerald-500/20",
          glow: "shadow-emerald-500/5",
        };
      case "social":
        return {
          icon: Users,
          color: "text-cyan-400 bg-cyan-950/20 border-cyan-500/20",
          glow: "shadow-cyan-500/5",
        };
      case "tier":
        return {
          icon: Award,
          color: "text-red-500 bg-red-950/20 border-red-500/20",
          glow: "shadow-red-500/5",
        };
      case "award":
        return {
          icon: Trophy,
          color: "text-gold-dim bg-yellow-950/20 border-yellow-500/20",
          glow: "shadow-yellow-500/5",
        };
      default: // milestone
        return {
          icon: Calendar,
          color: "text-blue-400 bg-blue-950/20 border-blue-500/20",
          glow: "shadow-blue-500/5",
        };
    }
  };

  const earnedList = ALL_BADGES.filter((b) => earnedSlugs.has(b.slug));
  const lockedList = ALL_BADGES.filter((b) => !earnedSlugs.has(b.slug));

  return (
    <div className="space-y-8">
      {/* Earned Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          EARNED BADGES ({earnedList.length})
        </h3>
        
        {earnedList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {earnedList.map((badge) => {
              const config = getBadgeTypeConfig(badge.type);
              const Icon = config.icon;
              const earnedDate = earnedSlugs.get(badge.slug);

              return (
                <div
                  key={badge.slug}
                  className={cn(
                    "p-5 border bg-zinc-950/40 rounded-2xl flex items-start gap-4 hover:border-zinc-800 transition-all shadow-md",
                    config.glow,
                    badge.slug === "centurion" ? "border-amber-500/20 shadow-amber-500/5" : "border-zinc-900"
                  )}
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border", config.color)}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white tracking-tight">{badge.name}</h4>
                      <span className="text-[8px] font-heading font-semibold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">
                        {badge.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{badge.description}</p>
                    {earnedDate && (
                      <span className="text-[9px] text-zinc-500 font-mono-stats block mt-2">
                        Unlocked on {new Date(earnedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-500 text-xs">
            Unlock badges by actively participating in meetings and colony events.
          </div>
        )}
      </div>

      {/* Locked Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Lock className="w-3.5 h-3.5 text-zinc-650" />
          LOCKED ARCHIVEMENTS ({lockedList.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {lockedList.map((badge) => {
            const config = getBadgeTypeConfig(badge.type);
            const Icon = config.icon;

            return (
              <div
                key={badge.slug}
                className="p-5 border border-zinc-900 bg-zinc-950/20 rounded-2xl flex items-start gap-4 opacity-50 hover:opacity-75 transition-opacity"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-zinc-900 bg-zinc-950 text-zinc-650">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-zinc-400 tracking-tight">{badge.name}</h4>
                    <span className="text-[8px] font-heading font-semibold text-zinc-650 bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded uppercase">
                      {badge.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{badge.description}</p>
                  
                  <div className="mt-2.5 pt-2.5 border-t border-zinc-900/60 flex items-start gap-1.5 text-[9px] text-zinc-500 leading-normal">
                    <Lock className="w-3 h-3 text-zinc-650 shrink-0 mt-0.5" />
                    <span>
                      <span className="font-semibold text-zinc-450 block">UNLOCK CONDITION:</span>
                      {badge.condition}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
