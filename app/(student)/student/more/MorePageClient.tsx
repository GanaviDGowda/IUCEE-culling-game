"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Trophy, Bell, BellOff, Check, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Standing {
  id: string;
  name: string;
  branch: string;
  year: string;
  tier: string;
  quarter_pts: number;
  rank: number;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface MorePageClientProps {
  standings: Standing[];
  myStanding: Standing | null;
  initialNotifications: Notification[];
}

export function MorePageClient({ standings, myStanding, initialNotifications }: MorePageClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.refresh();
      router.push("/auth/login");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setClearing(true);
    try {
      const response = await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read_all: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to clear notifications");
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setClearing(false);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      const response = await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification");
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-6">
      
      {/* 1. Leaderboard Standings Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Top Standings
        </h3>
        
        <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-4 space-y-3">
          {/* Top 3 standings */}
          <div className="space-y-2">
            {standings.slice(0, 3).map((standing) => (
              <div key={standing.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center font-bold",
                    standing.rank === 1 ? "bg-amber-500/10 text-amber-500" :
                    standing.rank === 2 ? "bg-zinc-300/10 text-zinc-350" :
                    "bg-orange-500/10 text-orange-400"
                  )}>
                    {standing.rank}
                  </span>
                  <span className="text-zinc-200 font-semibold">{standing.name}</span>
                  <span className="text-zinc-650">•</span>
                  <span className="text-zinc-500 uppercase">{standing.branch}</span>
                </div>
                <span className="font-bold text-white">{standing.quarter_pts} pts</span>
              </div>
            ))}
          </div>

          {/* Current user's standing */}
          {myStanding && (
            <div className="pt-3 border-t border-zinc-900/60 mt-2 flex items-center justify-between text-xs bg-red-500/5 p-2.5 rounded-xl border border-red-500/10">
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">Rank #{myStanding.rank}</span>
                <span className="text-zinc-300">(You)</span>
              </div>
              <span className="font-bold text-red-400">{myStanding.quarter_pts} pts</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Notifications section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            Notifications
          </h3>
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              disabled={clearing}
              className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1"
            >
              {clearing ? "Clearing..." : "Mark all read"}
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto border border-zinc-900 bg-zinc-950/40 rounded-2xl p-4 scrollbar-none">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkOneRead(n.id)}
                className={cn(
                  "p-3 rounded-xl border transition-all flex items-start gap-2.5",
                  n.read
                    ? "border-zinc-950 bg-zinc-950/20 opacity-60"
                    : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 cursor-pointer"
                )}
              >
                {!n.read ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                ) : (
                  <Check className="w-3 h-3 text-zinc-600 shrink-0 mt-1" />
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  {n.body && <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{n.body}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-zinc-550 flex flex-col items-center gap-2">
              <BellOff className="w-6 h-6 text-zinc-700" />
              <span>All caught up! No notifications.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Log out card */}
      <button 
        onClick={handleSignOut}
        disabled={loading}
        className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-950/10 border border-red-950/30 hover:bg-red-950/20 transition-all active:scale-[0.98] text-left mt-6"
      >
        <div className="w-10 h-10 rounded-full bg-red-950/50 flex items-center justify-center shrink-0">
          <LogOut className={`w-5 h-5 text-red-400 ${loading ? "animate-pulse" : ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-red-400">
            {loading ? "Signing out..." : "Log out"}
          </h3>
          <p className="text-[10px] text-red-400/60 truncate">End your Kogane Protocol session</p>
        </div>
        <ChevronRight className="w-4 h-4 text-red-800" />
      </button>
    </div>
  );
}
