"use client";

import { useState } from "react";
import { Calendar, MapPin, Clock, Award, ShieldAlert, CheckCircle2, UserCheck, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ApplySheet } from "./ApplySheet";
import { ProofUploadSheet } from "./ProofUploadSheet";
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

interface UpcomingTabProps {
  meetings: Meeting[];
  events: Event[];
  onRSVPToggle: (id: string, isMeeting: boolean, currentlyRegistered: boolean) => Promise<void>;
  onProofSubmit: (id: string, fileName: string) => void;
  loadingId: string | null;
}

export function UpcomingTab({
  meetings,
  events,
  onRSVPToggle,
  onProofSubmit,
  loadingId,
}: UpcomingTabProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isMeeting, setIsMeeting] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
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

  const getTagStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "hackathon":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "cultural":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "nss":
      case "industry_visit":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: // meeting or other
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    }
  };

  const handleApplyClick = (item: any, isMeet: boolean) => {
    setSelectedItem(item);
    setIsMeeting(isMeet);
    setIsApplyOpen(true);
  };

  const handleProofClick = (item: any) => {
    setSelectedItem(item);
    setIsProofOpen(true);
  };

  const hasEventEnded = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      // Reset times to compare dates
      date.setHours(23, 59, 59, 999);
      return date < today;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Meetings Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Calendar className="w-4 h-4 text-red-500" />
          COLONY MEETING SYNCS
        </h3>

        <div className="space-y-3">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-805 transition-all"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">{meeting.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold font-heading border uppercase tracking-wider bg-teal-500/10 text-teal-400 border-teal-500/20">
                      Sync Meeting
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-zinc-450">
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
                    onClick={() => handleApplyClick(meeting, true)}
                    className={cn(
                      "w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      meeting.registered
                        ? "bg-zinc-900 border border-zinc-850 text-emerald-400 hover:text-red-400 hover:border-red-900/50"
                        : "bg-white text-zinc-950 hover:bg-zinc-200"
                    )}
                  >
                    {loadingId === meeting.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : meeting.registered ? (
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
            <div className="text-center p-8 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-500 text-xs">
              No meetings scheduled currently.
            </div>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Award className="w-4 h-4 text-red-500" />
          HACKATHONS & COLONY ACTIVITIES
        </h3>

        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event) => {
              const ended = hasEventEnded(event.event_date);
              const configStyle = getTagStyle(event.type);

              return (
                <div
                  key={event.id}
                  className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-805 transition-all"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white tracking-tight truncate">{event.name}</h4>
                      <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-bold font-heading border uppercase tracking-wider", configStyle)}>
                        {event.type.replace(/_/g, " ")}
                      </span>
                      {event.pts_offered > 0 && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 font-mono-stats">
                          +{event.pts_offered} Pts
                        </span>
                      )}
                      {ended && (
                        <span className="text-[8px] font-heading font-semibold text-zinc-500 border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded uppercase">
                          Ended
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-zinc-450">
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
                    {ended ? (
                      event.registered ? (
                        event.proof_uploaded ? (
                          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs font-bold font-heading">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Proof Under Review</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleProofClick(event)}
                            className="w-full sm:w-auto px-4 py-2 bg-red-950/20 border border-red-500/25 hover:bg-red-900/20 text-red-400 rounded-xl text-xs font-bold font-heading transition-all active:scale-95 cursor-pointer"
                          >
                            Upload Proof
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider">
                          No Registration
                        </span>
                      )
                    ) : (
                      <button
                        disabled={loadingId === event.id}
                        onClick={() => handleApplyClick(event, false)}
                        className={cn(
                          "w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                          event.registered
                            ? "bg-zinc-900 border border-zinc-850 text-emerald-400 hover:text-red-400 hover:border-red-900/50"
                            : "bg-white text-zinc-950 hover:bg-zinc-200"
                        )}
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
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-8 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-500 text-xs">
              No active events scheduled currently.
            </div>
          )}
        </div>
      </div>

      {/* Apply Sheet */}
      <ApplySheet
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        item={selectedItem}
        isMeeting={isMeeting}
        onRSVPToggle={onRSVPToggle}
      />

      {/* Proof Sheet */}
      <ProofUploadSheet
        isOpen={isProofOpen}
        onClose={() => setIsProofOpen(false)}
        item={selectedItem}
        onProofSubmit={onProofSubmit}
      />
    </div>
  );
}
