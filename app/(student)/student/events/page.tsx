"use client";

import { useEffect, useState } from "react";
import { UpcomingTab } from "./_components/UpcomingTab";
import { MyEventsTab } from "./_components/MyEventsTab";
import { CalendarTab } from "./_components/CalendarTab";
import { Loader2, ShieldAlert, Sparkles, Flame } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  agenda: string;
  registered: boolean;
}

interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  pts_offered: number;
  event_date: string;
  location: string;
  registered: boolean;
  proof_required?: boolean;
  proof_uploaded?: boolean;
}

export default function StudentEventsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "my_events" | "calendar">("upcoming");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/student/events");
      if (!response.ok) throw new Error("Failed to fetch events database");
      
      const resData = await response.json();
      
      const mappedMeetings = (resData.meetings || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        time: m.time,
        location: m.location || "",
        agenda: m.agenda || "",
        registered: m.registered || false,
      }));

      const mappedEvents = (resData.events || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        description: e.description || "",
        type: e.type,
        pts_offered: e.pts_offered || e.pts_participation || 15, // Fallback points
        event_date: e.event_date || "",
        location: e.location || "",
        registered: e.registered || false,
        proof_required: e.proof_required !== false, // Default requires proof
        proof_uploaded: false,
      }));

      setMeetings(mappedMeetings);
      setEvents(mappedEvents);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync colony schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRSVPToggle = async (id: string, isMeeting: boolean, currentlyRegistered: boolean) => {
    setLoadingId(id);
    try {
      const response = await fetch("/api/student/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: isMeeting ? id : undefined,
          event_id: !isMeeting ? id : undefined,
          action: currentlyRegistered ? "cancel" : "rsvp",
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to update RSVP");
      }

      if (isMeeting) {
        setMeetings((prev) =>
          prev.map((m) => (m.id === id ? { ...m, registered: !currentlyRegistered } : m))
        );
      } else {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, registered: !currentlyRegistered } : e))
        );
      }

      toast.success(currentlyRegistered ? "RSVP cancelled successfully." : "RSVP confirmed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit RSVP request.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleProofSubmit = (id: string, fileName: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, proof_uploaded: true } : e))
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-red-500/10 border-t-red-500 animate-spin" />
          <Loader2 className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <p className="text-xs font-heading font-semibold text-zinc-500 tracking-wider">
          SCANNING COLONY HORIZONS...
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* Header Info / Tabs Switcher */}
      <div className="flex justify-between items-center px-4 md:px-6 border-b border-zinc-950 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Colony Events</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Participate in activities and sync meeting events.</p>
        </div>

        {/* Tab switcher */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-1 flex items-center gap-1">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "upcoming"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("my_events")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "my_events"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            My Registry
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "calendar"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Render active tab content */}
      <div className="px-4 md:px-6">
        {activeTab === "upcoming" ? (
          <UpcomingTab
            meetings={meetings}
            events={events}
            onRSVPToggle={handleRSVPToggle}
            onProofSubmit={handleProofSubmit}
            loadingId={loadingId}
          />
        ) : activeTab === "my_events" ? (
          <MyEventsTab
            meetings={meetings}
            events={events}
            onRSVPToggle={handleRSVPToggle}
            onProofSubmit={handleProofSubmit}
          />
        ) : (
          <CalendarTab
            meetings={meetings}
            events={events}
            onRSVPToggle={handleRSVPToggle}
            loadingId={loadingId}
          />
        )}
      </div>
    </div>
  );
}
