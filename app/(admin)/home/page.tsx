"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricsGrid } from "./_components/MetricsGrid";
import { AlertsSection } from "./_components/AlertsSection";
import { QuickActions } from "./_components/QuickActions";
import { ActivityFeed } from "./_components/ActivityFeed";
import { 
  RiShieldUserLine, 
  RiArrowRightSLine, 
  RiExternalLinkLine,
  RiFileList3Line
} from "@remixicon/react";

export default function AdminHomePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/home");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();

    // Configure 30-second live background polling intervals
    const interval = setInterval(() => {
      fetchHomeData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchHomeData]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48 bg-zinc-900/40" />
            <Skeleton className="h-4 w-64 bg-zinc-900/40" />
          </div>
          <Skeleton className="h-8 w-20 bg-zinc-900/40 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full bg-zinc-900/40 rounded-2xl" />
              <Skeleton className="h-24 w-full bg-zinc-900/40 rounded-2xl" />
              <Skeleton className="h-24 w-full bg-zinc-900/40 rounded-2xl" />
              <Skeleton className="h-24 w-full bg-zinc-900/40 rounded-2xl" />
            </div>
            <Skeleton className="h-44 w-full bg-zinc-900/40 rounded-2xl" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-32 w-full bg-zinc-900/40 rounded-2xl" />
            <Skeleton className="h-60 w-full bg-zinc-900/40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const { metrics, alerts, pending_actions, activity_feed } = data || {
    metrics: { active_members: 0, danger_zone: 0, attendance_rate: 0, open_appeals: 0, current_quarter: "Q1" },
    alerts: { at_risk_members: [], pending_appeals: [] },
    pending_actions: { pending_registrations: [], pending_appeals_count: 0 },
    activity_feed: []
  };

  const hasPendingRegistrations = pending_actions.pending_registrations.length > 0;
  const totalPendingActions = pending_actions.pending_registrations.length + pending_actions.pending_appeals_count;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Dynamic Header */}
      <div className="flex justify-between items-center bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest font-heading flex items-center gap-1.5">
            <RiShieldUserLine className="w-5 h-5 text-red-500" />
            Tactical Control Center
          </h2>
          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider font-heading">
            System status: fully operational • 30s auto-sync enabled
          </p>
        </div>
        {refreshing && (
          <span className="text-[9px] font-black text-red-400 uppercase tracking-widest font-heading animate-pulse">
            Syncing...
          </span>
        )}
      </div>

      {/* Main Dual Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Metrics + Quick Actions + Pending Actions */}
        <div className="lg:col-span-7 space-y-6">
          <MetricsGrid metrics={metrics} />
          
          <QuickActions />

          {/* Pending Actions List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading">
                Pending Actions Today
              </h3>
              {totalPendingActions > 0 && (
                <Badge className="bg-red-955 text-red-400 border border-red-900/30 text-[8px] font-black uppercase tracking-widest font-heading">
                  {totalPendingActions} Require Action
                </Badge>
              )}
            </div>

            <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-3.5">
              {!hasPendingRegistrations && pending_actions.pending_appeals_count === 0 ? (
                <div className="text-center py-6 space-y-2 flex flex-col items-center justify-center">
                  <RiFileList3Line className="w-7 h-7 text-zinc-650" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-heading">All Tasks Completed</p>
                  <p className="text-[9px] text-zinc-555 max-w-[200px]">You are all caught up for today! No new approvals or tasks mapped.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pending Registrations alert row */}
                  {hasPendingRegistrations && (
                    <div className="p-3 bg-zinc-900/25 border border-zinc-850 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-800 transition-colors">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-white">Pending Registrations</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          {pending_actions.pending_registrations.length} student signup requests waiting for review
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push("/members?tab=Pending")}
                        className="h-7 px-2.5 rounded-lg text-[9px] font-black bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 flex items-center gap-0.5 shrink-0"
                      >
                        Approve
                        <RiArrowRightSLine className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Pending Appeals alert row */}
                  {pending_actions.pending_appeals_count > 0 && (
                    <div className="p-3 bg-zinc-900/25 border border-zinc-850 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-800 transition-colors">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-white">Pending Point Appeals</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          {pending_actions.pending_appeals_count} credit dispute tickets pending admin arbitration
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push("/points?tab=Appeals")}
                        className="h-7 px-2.5 rounded-lg text-[9px] font-black bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 flex items-center gap-0.5 shrink-0"
                      >
                        Audit
                        <RiArrowRightSLine className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: System Warnings + Live Activity Feed */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
          <AlertsSection alerts={alerts} />
          
          <ActivityFeed 
            activities={activity_feed} 
            isRefreshing={refreshing}
            onManualRefresh={() => fetchHomeData()}
          />
        </div>

      </div>

    </div>
  );
}
