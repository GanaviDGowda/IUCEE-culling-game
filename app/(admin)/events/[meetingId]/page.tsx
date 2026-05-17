"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  RiArrowLeftSLine, 
  RiVideoChatLine, 
  RiMapPinLine, 
  RiBookOpenLine, 
  RiFileList3Line,
  RiGroupLine,
  RiCheckDoubleLine
} from "@remixicon/react";

export default function MeetingDetailPage() {
  const router = useRouter();
  const { meetingId } = useParams();
  
  const [meeting, setMeeting] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Minutes state
  const [minutes, setMinutes] = useState("");
  const [savingMinutes, setSavingMinutes] = useState(false);

  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId]);

  async function fetchMeetingDetails() {
    setLoading(true);
    try {
      const [meetRes, attRes] = await Promise.all([
        fetch(`/api/admin/meetings/${meetingId}`),
        fetch(`/api/admin/attendance?meetingId=${meetingId}`)
      ]);
      
      const meetData = await meetRes.json();
      const attData = await attRes.json();

      if (meetData.data) {
        setMeeting(meetData.data);
        setMinutes(meetData.data.minutes || "");
      }
      if (attData.data) {
        setMembers(attData.data.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveMinutes = async () => {
    setSavingMinutes(true);
    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes })
      });
      if (res.ok) {
        alert("Session minutes saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMinutes(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 bg-black min-h-screen">
        <Skeleton className="h-10 w-24 bg-zinc-900" />
        <Skeleton className="h-40 w-full bg-zinc-900" />
        <Skeleton className="h-64 w-full bg-zinc-900" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-4 md:p-6 text-center text-zinc-400 bg-black min-h-screen">
        <p>Meeting record not found.</p>
        <Button onClick={() => router.push("/events")} className="mt-4 bg-red-600">
          Back to Events
        </Button>
      </div>
    );
  }

  const presentMembers = members.filter(m => m.attendance?.present);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-black min-h-screen text-white">
      
      {/* Header back button */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.push("/events")}
          className="p-1 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white border border-zinc-800"
        >
          <RiArrowLeftSLine className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xs font-black text-white uppercase tracking-wider">Session Parameters</h2>
          <p className="text-[9px] text-zinc-500 mt-0.5">Audit agenda, record minutes and inspect attendance logs.</p>
        </div>
      </div>

      {/* Hero card */}
      <div className="p-5 bg-zinc-900/15 border border-zinc-850 rounded-2xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <RiVideoChatLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">{meeting.title}</h1>
            <span className="text-[9px] uppercase font-black text-zinc-550 block">
              Scheduled Date: {new Date(meeting.date).toLocaleDateString()} • {meeting.time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <RiMapPinLine className="w-4 h-4 text-zinc-500" />
          <span>Location: {meeting.location || "Remote"}</span>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Agenda & Minutes overrides */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agenda */}
          <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <RiBookOpenLine className="w-4 h-4 text-red-500" />
              Session Agenda
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/20 p-3 rounded-xl border border-zinc-900">
              {meeting.agenda || "No agenda set for this session."}
            </p>
          </div>

          {/* Minutes Overrides */}
          <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <RiFileList3Line className="w-4 h-4 text-red-500" />
              Session Minutes & Takeaways
            </h3>
            
            <Textarea 
              placeholder="Record decision parameters, actionables or takeaways for this session..."
              className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-48 p-3.5 focus:border-red-500"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />

            <Button 
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
              onClick={handleSaveMinutes}
              disabled={savingMinutes}
            >
              {savingMinutes ? "Saving takeaways..." : "Save Takeaways & Minutes"}
            </Button>
          </div>
        </div>

        {/* Right: Real-time Attendance overview */}
        <div className="space-y-6">
          <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <RiGroupLine className="w-4 h-4 text-red-500" />
                Attendance Session
              </h3>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[9px] font-black h-5">
                {presentMembers.length} Present
              </Badge>
            </div>

            {presentMembers.length === 0 ? (
              <p className="text-[11px] text-zinc-500 py-4 text-center">No attendees checked-in yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-none">
                {presentMembers.map((student) => (
                  <div key={student.id} className="p-2 bg-zinc-950/20 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 border border-zinc-800">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[9px] font-bold">
                          {student.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-[11px] font-bold text-white leading-tight">{student.name}</h4>
                        <span className="text-[8px] text-zinc-500 block uppercase font-medium tracking-wide">
                          {student.branch || "Unassigned"} • Year {student.year || "?"}
                        </span>
                      </div>
                    </div>
                    
                    <RiCheckDoubleLine className="w-4 h-4 text-emerald-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
