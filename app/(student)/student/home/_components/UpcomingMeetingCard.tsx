"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  date: string; // e.g. "2026-05-27"
  time: string; // e.g. "14:30:00"
  location: string;
  agenda: string;
}

interface UpcomingMeetingCardProps {
  meeting: Meeting | null;
  initialCheckedIn?: boolean;
  onCheckInSuccess?: () => void;
}

export function UpcomingMeetingCard({
  meeting,
  initialCheckedIn = false,
  onCheckInSuccess,
}: UpcomingMeetingCardProps) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [loading, setLoading] = useState(false);
  const [isToday, setIsToday] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ended: false,
  });

  useEffect(() => {
    if (!meeting) return;

    // Check if the meeting date is today
    const checkIsToday = () => {
      const todayStr = new Date().toLocaleDateString("sv-SE"); // Returns YYYY-MM-DD
      setIsToday(meeting.date === todayStr);
    };

    checkIsToday();
    const todayInterval = setInterval(checkIsToday, 60000);

    // Countdown logic
    const targetDate = new Date(`${meeting.date}T${meeting.time || "00:00:00"}`);
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setCountdown({ days: d, hours: h, minutes: m, seconds: s, ended: false });
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(todayInterval);
      clearInterval(countdownInterval);
    };
  }, [meeting]);

  if (!meeting) {
    return (
      <div className="kogane-panel p-6 text-center text-zinc-500">
        <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <h4 className="text-sm font-heading font-bold text-zinc-400">NO MEETING SCHEDULED</h4>
        <p className="text-xs mt-1">Keep watch for upcoming colony barrier synchronizations.</p>
      </div>
    );
  }

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // Simulate API call to check-in
      const response = await fetch("/api/student/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meeting_id: meeting.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to record check-in");
      }

      setCheckedIn(true);
      toast.success("Checked in successfully! +1 Point awarded.");
      if (onCheckInSuccess) {
        onCheckInSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to check in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kogane-panel p-6 border-red-500/20 hover:border-red-500/35 transition-all">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Left Side: Meeting Details */}
        <div className="space-y-4 flex-1">
          <div>
            <span className="text-[9px] font-heading font-semibold text-red-500 tracking-widest uppercase">
              Upcoming Colony Synchronization
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1">{meeting.title}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500/60" />
              <span>{meeting.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500/60" />
              <span>{meeting.time || "TBA"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500/60" />
              <span className="truncate">{meeting.location}</span>
            </div>
          </div>

          {meeting.agenda && (
            <div className="p-3 bg-zinc-950/60 border border-zinc-900/60 rounded-lg">
              <p className="text-[10px] font-heading font-semibold text-zinc-500">AGENDA</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{meeting.agenda}</p>
            </div>
          )}
        </div>

        {/* Right Side: Countdown and Action */}
        <div className="flex flex-col items-center justify-between md:w-56 border-t md:border-t-0 md:border-l border-zinc-900/80 pt-6 md:pt-0 md:pl-6 shrink-0">
          <div className="text-center w-full">
            <span className="text-[9px] font-heading font-semibold text-zinc-500 tracking-wider">
              BARRIER LOCKDOWN IN
            </span>
            
            {countdown.ended ? (
              <div className="text-sm font-bold text-red-500 mt-2 font-mono-stats">
                SYNCHRONIZATION ACTIVE
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mt-2 w-full max-w-[200px] mx-auto">
                {[
                  { label: "D", val: countdown.days },
                  { label: "H", val: countdown.hours },
                  { label: "M", val: countdown.minutes },
                  { label: "S", val: countdown.seconds },
                ].map((item, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-lg p-1 text-center">
                    <span className="text-lg font-bold font-mono-stats text-white block">
                      {String(item.val).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] font-heading text-zinc-500 block">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full mt-6 md:mt-0">
            {checkedIn ? (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 rounded-xl text-xs font-bold font-heading">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>CHECKED IN (+1 PT)</span>
              </div>
            ) : isToday ? (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 disabled:cursor-not-allowed text-white border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs font-bold font-heading transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/10"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>CHECK IN NOW</span>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-zinc-900/30 border border-zinc-900/80 text-zinc-500 rounded-xl text-xs font-bold font-heading cursor-not-allowed"
              >
                CHECK-IN LOCKED
              </button>
            )}
            
            {!checkedIn && !isToday && (
              <span className="text-[9px] text-zinc-500 text-center block mt-1.5 font-sans leading-relaxed">
                Check-in activates automatically on meeting day.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
