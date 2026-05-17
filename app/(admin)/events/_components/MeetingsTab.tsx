"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { 
  RiVideoChatLine, 
  RiMapPinLine, 
  RiCalendarEventLine, 
  RiAddLine,
  RiArrowRightSLine
} from "@remixicon/react";

export function MeetingsTab() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  async function fetchMeetings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/meetings");
      const data = await res.json();
      setMeetings(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateMeeting = async () => {
    if (!title || !date || !time) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, time, location, agenda })
      });
      if (res.ok) {
        await fetchMeetings();
        setIsOpen(false);
        setTitle("");
        setDate("");
        setTime("");
        setLocation("");
        setAgenda("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Meetings header */}
      <div className="flex justify-between items-center bg-zinc-900/10 border border-zinc-850 p-4 rounded-xl">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Session Management</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Audit past meetings and agenda updates.</p>
        </div>
        <Button 
          size="sm" 
          className="h-8 rounded-lg text-[10px] font-black bg-red-650 hover:bg-red-600 text-white flex items-center gap-1"
          onClick={() => setIsOpen(true)}
        >
          <RiAddLine className="w-3.5 h-3.5" />
          Schedule Session
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 w-full bg-zinc-900/30" />
          <Skeleton className="h-28 w-full bg-zinc-900/30" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 border border-zinc-850 rounded-2xl bg-zinc-900/5 space-y-2">
          <RiVideoChatLine className="w-8 h-8 text-zinc-650 mx-auto" />
          <p className="text-xs font-bold text-zinc-400">No scheduled sessions found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {meetings.map((meet) => (
            <div 
              key={meet.id}
              onClick={() => router.push(`/events/${meet.id}`)}
              className="p-4 bg-zinc-900/15 border border-zinc-850 hover:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-zinc-400">
                    <RiCalendarEventLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{meet.title}</h4>
                    <span className="text-[8px] uppercase font-black text-zinc-550 block">
                      {new Date(meet.date).toLocaleDateString()} • {meet.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <RiMapPinLine className="w-3.5 h-3.5" />
                  <span className="truncate">{meet.location || "Remote"}</span>
                </div>
              </div>

              <RiArrowRightSLine className="w-5 h-5 text-zinc-600 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Floating Scheduled FAB button in bottom-right */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 w-12 h-12 rounded-full bg-red-650 hover:bg-red-600 text-white shadow-lg shadow-red-600/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
        title="Schedule New Session"
      >
        <RiAddLine className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Create Meeting BottomSheet */}
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Schedule Session</h3>
            <p className="text-[10px] text-zinc-500">Define agenda and location configurations for the session.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-555">Session Title</label>
              <Input
                placeholder="e.g. Core team syncup"
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-555">Date</label>
                <Input
                  type="date"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1 text-white"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-555">Time</label>
                <Input
                  type="time"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1 text-white"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-zinc-555">Location / Platform</label>
              <Input
                placeholder="e.g. Google Meet / Seminar Hall 3"
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-zinc-555">Session Agenda</label>
              <Textarea
                placeholder="Details of the session deliverables..."
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-20 p-3 mt-1"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline"
                className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
                onClick={handleCreateMeeting}
                disabled={submitting || !title || !date || !time}
              >
                {submitting ? "Scheduling..." : "Schedule Session"}
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>

    </div>
  );
}
