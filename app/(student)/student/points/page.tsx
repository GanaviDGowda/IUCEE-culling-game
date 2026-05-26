"use client";

import { useEffect, useState } from "react";
import { OverviewTab } from "./_components/OverviewTab";
import { HistoryTab } from "./_components/HistoryTab";
import { BadgesTab } from "./_components/BadgesTab";
import { TicketsTab } from "./_components/TicketsTab";
import { CenturyConfirmModal } from "./_components/CenturyConfirmModal";
import { Loader2, ShieldAlert, Sparkles, Flame, HelpCircle } from "lucide-react";
import { toast } from "sonner";
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

export default function StudentPointsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "ledger" | "badges" | "tickets">("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activating, setActivating] = useState(false);

  // Century Ritual Sequence State: null | "darken" | "sacrificing" | "awakening" | "complete"
  const [ritualState, setRitualState] = useState<null | "darken" | "sacrificing" | "awakening" | "complete">(null);

  const fetchData = async () => {
    try {
      const [meRes, logsRes] = await Promise.all([
        fetch("/api/student/me"),
        fetch("/api/student/points"),
      ]);

      if (!meRes.ok || !logsRes.ok) {
        throw new Error("Failed to sync points metrics");
      }

      const meData = await meRes.json();
      const logsData = await logsRes.json();

      setProfile(meData.profile);
      setEarnedBadges(meData.badges || []);
      setLogs(logsData.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load ledger database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivateCentury = async () => {
    setIsModalOpen(false);
    setActivating(true);

    // Start JJK Ritual Animation Sequence!
    try {
      // 1. Darken UI (JJK curtain expands)
      setRitualState("darken");
      await new Promise((r) => setTimeout(r, 1000));

      // 2. 100 Points Sacrificed text
      setRitualState("sacrificing");
      await new Promise((r) => setTimeout(r, 1500));

      // 3. Awakening Complete text
      setRitualState("awakening");
      await new Promise((r) => setTimeout(r, 1500));

      // 4. Complete, reset state and post data
      const response = await fetch("/api/student/me", {
        method: "GET", // Re-fetch details to simulate resetting
      });

      // Update mock profile state locally to simulate point reset immediately!
      if (profile) {
        setProfile({
          ...profile,
          redeemable_pts: 0,
          tier: "century",
          current_quarter_pts: 0,
        });

        // Add deduction log to logs list
        const newLog = {
          id: `log-${Math.random().toString(36).substring(2, 9)}`,
          points: -100,
          type: "century_spend",
          note: "Sacrificed 100 points for Colony Century status",
          status: "confirmed",
          created_at: new Date().toISOString(),
          meeting: null,
        };
        setLogs((prev) => [newLog, ...prev]);
      }

      setRitualState("complete");
      await new Promise((r) => setTimeout(r, 1000));
      
      toast.success("Century status successfully awakened! Veto rights active.");
    } catch (err: any) {
      toast.error("Colony ritual failed. Cursed energy dispersion.");
    } finally {
      setRitualState(null);
      setActivating(false);
    }
  };

  const handlePurchaseComplete = (cost: number) => {
    if (profile) {
      setProfile({
        ...profile,
        redeemable_pts: Math.max(profile.redeemable_pts - cost, 0)
      });

      const newLog = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        points: -cost,
        type: "deduction",
        note: `Purchased Colony Ticket`,
        status: "confirmed",
        created_at: new Date().toISOString(),
        meeting: null
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-red-500/10 border-t-red-500 animate-spin" />
          <Loader2 className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <p className="text-xs font-heading font-semibold text-zinc-500 tracking-wider">
          SYNCHRONIZING LEDGER FLOW...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center max-w-md mx-auto mt-12 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-md font-heading font-bold text-white uppercase tracking-wider">
          Colony Sync Failed
        </h3>
        <p className="text-xs text-zinc-400">
          We could not authenticate your points balance. Contact coordinator support.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 space-y-6 relative min-h-screen">
      {/* JJK Ritual Overlay Screen */}
      {ritualState && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-6 transition-all duration-500 animate-in fade-in">
          {/* Barrier Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.15)_0%,transparent_60%)] animate-pulse" />
          
          <div className="relative z-10 text-center space-y-4">
            {ritualState === "darken" && (
              <div className="space-y-2 animate-pulse">
                <span className="text-[10px] font-heading font-semibold text-zinc-500 tracking-widest block">
                  INITIATING CURSED CONTRACT
                </span>
                <h2 className="text-xl font-bold font-heading text-red-500 tracking-widest">
                  EXPANDING THE BARRIER...
                </h2>
              </div>
            )}

            {ritualState === "sacrificing" && (
              <div className="space-y-2 animate-bounce-subtle">
                <span className="text-[10px] font-heading font-semibold text-zinc-500 tracking-widest block">
                  BOUNDING VOW SACRIFICE
                </span>
                <h2 className="text-2xl font-bold font-heading text-white tracking-widest">
                  100 POINTS SACRIFICED
                </h2>
              </div>
            )}

            {ritualState === "awakening" && (
              <div className="space-y-2 flex flex-col items-center">
                <Sparkles className="w-8 h-8 text-amber-500 animate-spin-slow mb-2" />
                <span className="text-[10px] font-heading font-semibold text-amber-500 tracking-widest block">
                  RITUAL COMPLETE
                </span>
                <h2 className="text-2xl font-bold font-heading text-amber-400 tracking-widest animate-pulse">
                  AWAKENING COMPLETE
                </h2>
              </div>
            )}

            {ritualState === "complete" && (
              <div className="space-y-1">
                <h2 className="text-md font-bold font-heading text-zinc-400">
                  WELCOMING CENTURION MEMBER
                </h2>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Info / Tabs Switcher */}
      <div className="flex justify-between items-center px-4 md:px-6 border-b border-zinc-950 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Points Ledger</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Track point transactions and rank progress.</p>
        </div>

        {/* Tab switchers */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-1 flex items-center gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "overview"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "ledger"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "badges"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Badges
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "tickets"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Tickets
          </button>
        </div>
      </div>

      {/* Render active tab */}
      <div className="px-4 md:px-6">
        {activeTab === "overview" ? (
          <OverviewTab
            profile={profile}
            onActivateCentury={() => setIsModalOpen(true)}
          />
        ) : activeTab === "ledger" ? (
          <HistoryTab logs={logs} />
        ) : activeTab === "badges" ? (
          <BadgesTab earnedBadges={earnedBadges} />
        ) : (
          <TicketsTab
            userPoints={profile.redeemable_pts}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
      </div>

      {/* Century Confirmation Modal */}
      <CenturyConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleActivateCentury}
        isLoading={activating}
      />
    </div>
  );
}
