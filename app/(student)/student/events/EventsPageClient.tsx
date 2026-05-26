"use client";

import { useState } from "react";
import { TopTabs } from "@/components/admin/TopTabs";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, Clock, CheckCircle2, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
}

interface EventsPageClientProps {
  initialMeetings: Meeting[];
  initialEvents: Event[];
}

export function EventsPageClient({ initialMeetings, initialEvents }: EventsPageClientProps) {
  const [activeTab, setActiveTab] = useState("Meetings");
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleRSVP = async (id: string, type: "meeting" | "event", currentlyRegistered: boolean) => {
    setLoadingId(id);
    try {
      const response = await fetch("/api/student/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: type === "meeting" ? id : undefined,
          event_id: type === "event" ? id : undefined,
          action: currentlyRegistered ? "cancel" : "rsvp",
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to update RSVP");
      }

      if (type === "meeting") {
        setMeetings((prev) =>
          prev.map((m) => (m.id === id ? { ...m, registered: !currentlyRegistered } : m))
        );
      } else {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, registered: !currentlyRegistered } : e))
        );
      }

      toast.success(currentlyRegistered ? "RSVP cancelled" : "RSVP confirmed successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      // timeStr might be "18:00:00" or similar
      const parts = timeStr.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-4 md:px-6">
        <TopTabs
          tabs={["Meetings", "Hackathons & Activities"]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="px-4 md:px-6 space-y-4">
        {activeTab === "Meetings" ? (
          meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-800 transition-all"
              >
                <div className="space-y-2 min-w-0">
                  <h4 className="text-md font-bold text-white tracking-tight truncate">{meeting.title}</h4>
                  
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {formatDate(meeting.date)}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {formatTime(meeting.time)}
                    </span>
                    {meeting.location && (
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {meeting.location}
                      </span>
                    )}
                  </div>
                  
                  {meeting.agenda && (
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-xl line-clamp-2">
                      Agenda: {meeting.agenda}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <button
                    disabled={loadingId === meeting.id}
                    onClick={() => handleRSVP(meeting.id, "meeting", meeting.registered)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      meeting.registered
                        ? "bg-zinc-900 border border-zinc-850 text-emerald-400 hover:text-red-400 hover:border-red-900/50"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {loadingId === meeting.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : meeting.registered ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Attending</span>
                      </>
                    ) : (
                      <span>RSVP</span>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-12 border border-zinc-900 bg-zinc-950/20 rounded-xl text-zinc-500 text-sm">
              No meetings scheduled currently.
            </div>
          )
        ) : events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-800 transition-all"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-md font-bold text-white tracking-tight truncate">{event.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                    {event.type}
                  </span>
                  {event.pts_offered && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      +{event.pts_offered} pts
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {formatDate(event.event_date)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {event.location}
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xl line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <button
                  disabled={loadingId === event.id}
                  onClick={() => handleRSVP(event.id, "event", event.registered)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    event.registered
                      ? "bg-zinc-900 border border-zinc-850 text-emerald-400 hover:text-red-400 hover:border-red-900/50"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {loadingId === event.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : event.registered ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Registered</span>
                    </>
                  ) : (
                    <span>Register</span>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 border border-zinc-900 bg-zinc-950/20 rounded-xl text-zinc-500 text-sm">
            No events scheduled currently.
          </div>
        )}
      </div>
    </div>
  );
}
