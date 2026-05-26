"use client";

import { useEffect, useState } from "react";
import { StatusBanner } from "./_components/StatusBanner";
import { StatsStrip } from "./_components/StatsStrip";
import { UpcomingMeetingCard } from "./_components/UpcomingMeetingCard";
import { ActivityFeed } from "./_components/ActivityFeed";
import { ShieldAlert, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  email: string;
  usn: string | null;
  branch: string;
  year: string;
  role: string;
  status: "active" | "danger_zone" | "removed";
  tier: string;
  redeemable_pts: number;
  lifetime_pts: number;
  current_quarter_pts: number;
  streak: number;
  warning_level: "none" | "first" | "second";
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  agenda: string;
}

export default function StudentHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [nextMeeting, setNextMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Parallel fetch from the stub endpoints we created!
      const [meRes, logsRes, attRes, eventsRes] = await Promise.all([
        fetch("/api/student/me"),
        fetch("/api/student/points"),
        fetch("/api/student/attendance"),
        fetch("/api/student/events"),
      ]);

      if (!meRes.ok || !logsRes.ok || !attRes.ok || !eventsRes.ok) {
        throw new Error("Failed to sync colony details");
      }

      const meData = await meRes.json();
      const logsData = await logsRes.json();
      const attData = await attRes.json();
      const eventsData = await eventsRes.json();

      setProfile(meData.profile);
      setLogs(logsData.data || []);
      setAttendance(attData.data || []);

      // Get first upcoming unregistered meeting as the next meeting
      const upcomingMeetings = eventsData.meetings || [];
      if (upcomingMeetings.length > 0) {
        setNextMeeting({
          id: upcomingMeetings[0].id,
          title: upcomingMeetings[0].title,
          date: upcomingMeetings[0].date,
          time: upcomingMeetings[0].time || "17:00:00",
          location: upcomingMeetings[0].location || "Seminar Hall A",
          agenda: upcomingMeetings[0].agenda || "General discussion and technical topics.",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync with Kogane database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        {/* Animated cursed seal styling */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-red-500/10 border-t-red-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-red-500/5 border-b-red-500 animate-spin-reverse" />
          <Loader2 className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-heading font-semibold text-zinc-500 tracking-wider">
            KOGANE PROTOCOL ACTIVE
          </p>
          <p className="text-[10px] text-red-500 font-mono-stats uppercase tracking-widest animate-pulse">
            BARRIER CONNECTION ESTABLISHED...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center max-w-md mx-auto mt-12 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-md font-heading font-bold text-white uppercase tracking-wider">
          Player Profile Not Detected
        </h3>
        <p className="text-xs text-zinc-400">
          Your credentials do not match any player inside this colony. Please contact the administrator.
        </p>
      </div>
    );
  }

  // Calculate stats values
  const meetingsCount = attendance.filter((a) => !a.used_skip).length;
  // Arjun Krishnamurthy is Rank 1 in our mock leaderboard
  const rank = 1;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-950 pb-4">
        <div>
          <span className="text-[9px] font-heading font-semibold text-zinc-500 tracking-widest uppercase">
            Chapter Member Dashboard
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Welcome, {profile.name}
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono-stats text-zinc-400">
            USN: {profile.usn || "N/A"}
          </span>
          <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono-stats text-zinc-400">
            {profile.branch} — Year {profile.year}
          </span>
        </div>
      </div>

      {/* 5-State StatusBanner */}
      <StatusBanner
        status={profile.status}
        warningLevel={profile.warning_level}
        streak={profile.streak}
        points={profile.current_quarter_pts}
      />

      {/* Stats Strip */}
      <StatsStrip
        points={profile.redeemable_pts}
        tier={profile.tier}
        streak={profile.streak}
        meetingsAttended={meetingsCount}
        rank={rank}
      />

      {/* Upcoming Meeting Card */}
      <UpcomingMeetingCard
        meeting={nextMeeting}
        onCheckInSuccess={fetchData} // Re-fetch on check-in to update points ledger & status banner!
      />

      {/* Pinned Announcements and Activity Feed */}
      <ActivityFeed logs={logs} />
    </div>
  );
}
