"use client";

import { useState } from "react";
import { Calendar, MapPin, Award, CheckCircle2, XCircle, Hourglass, Plus, ArrowUpRight, Upload } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ProofUploadSheet } from "./ProofUploadSheet";
import { PresentationSlotSheet } from "./PresentationSlotSheet";
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

interface MyEventsTabProps {
  meetings: Meeting[];
  events: Event[];
  onRSVPToggle: (id: string, isMeeting: boolean, currentlyRegistered: boolean) => Promise<void>;
  onProofSubmit: (id: string, fileName: string) => void;
}

export function MyEventsTab({
  meetings,
  events,
  onRSVPToggle,
  onProofSubmit,
}: MyEventsTabProps) {
  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const hasEventEnded = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      date.setHours(23, 59, 59, 999);
      return date < today;
    } catch {
      return false;
    }
  };

  // 1. Active Registrations: future events/meetings student is registered for
  const activeMeetings = meetings.filter((m) => m.registered && !hasEventEnded(m.date));
  const activeEvents = events.filter((e) => e.registered && !hasEventEnded(e.event_date));

  // 2. Pending Proofs: past events registered for but no proof uploaded
  const pendingProofs = events.filter((e) => e.registered && hasEventEnded(e.event_date) && !e.proof_uploaded);

  // 3. Past Results: past meetings or events with their status
  const pastMeetings = meetings.filter((m) => m.registered && hasEventEnded(m.date));
  const pastEvents = events.filter((e) => e.registered && hasEventEnded(e.event_date) && e.proof_uploaded);

  const handleProofClick = (event: Event) => {
    setSelectedEvent(event);
    setIsProofOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Presentation Slot CTA Header */}
      <div className="flex justify-between items-center border-b border-zinc-950 pb-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-tight">Personal Colony Ledger</h3>
          <p className="text-xs text-zinc-550 mt-1">Review active RSVPs, pitches, and past event proofs.</p>
        </div>
        <button
          onClick={() => setIsSlotOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-600/10 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Pitch Meeting Topic</span>
        </button>
      </div>

      {/* Active Registrations */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-450 tracking-wider flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-red-500" />
          ACTIVE REGISTRATIONS ({activeMeetings.length + activeEvents.length})
        </h3>

        <div className="space-y-3">
          {activeMeetings.map((m) => (
            <div
              key={m.id}
              className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-805 transition-all"
            >
              <div>
                <h4 className="text-xs font-bold text-white truncate">{m.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                  <span className="capitalize">Meeting</span>
                  <span>•</span>
                  <span>{formatDate(m.date)}</span>
                </div>
              </div>
              <button
                onClick={() => onRSVPToggle(m.id, true, true)}
                className="text-[10px] font-bold font-heading text-red-400 bg-red-950/10 border border-red-500/15 hover:bg-red-900/10 px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer self-end sm:self-auto"
              >
                Cancel RSVP
              </button>
            </div>
          ))}

          {activeEvents.map((e) => (
            <div
              key={e.id}
              className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-805 transition-all"
            >
              <div>
                <h4 className="text-xs font-bold text-white truncate">{e.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                  <span className="capitalize">{e.type.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>{formatDate(e.event_date)}</span>
                </div>
              </div>
              <button
                onClick={() => onRSVPToggle(e.id, false, true)}
                className="text-[10px] font-bold font-heading text-red-400 bg-red-950/10 border border-red-500/15 hover:bg-red-900/10 px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer self-end sm:self-auto"
              >
                Cancel Registration
              </button>
            </div>
          ))}

          {activeMeetings.length === 0 && activeEvents.length === 0 && (
            <div className="text-center p-6 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-550 text-xs">
              No upcoming registered colony meetings or activities found.
            </div>
          )}
        </div>
      </div>

      {/* Pending Proofs */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-455 tracking-wider flex items-center gap-2">
          <Upload className="w-3.5 h-3.5 text-amber-500" />
          PENDING PROOFS ({pendingProofs.length})
        </h3>

        <div className="space-y-3">
          {pendingProofs.map((e) => (
            <div
              key={e.id}
              className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-805 transition-all"
            >
              <div>
                <h4 className="text-xs font-bold text-white truncate">{e.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                  <span className="capitalize text-red-400">Proof Required</span>
                  <span>•</span>
                  <span>Ended {formatDate(e.event_date)}</span>
                </div>
              </div>
              <button
                onClick={() => handleProofClick(e)}
                className="flex items-center gap-1 text-[10px] font-bold font-heading bg-white text-zinc-950 hover:bg-zinc-200 px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer self-end sm:self-auto"
              >
                <Upload className="w-3 h-3" />
                <span>Upload proof</span>
              </button>
            </div>
          ))}

          {pendingProofs.length === 0 && (
            <div className="text-center p-6 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-550 text-xs">
              All active point claims are up to date!
            </div>
          )}
        </div>
      </div>

      {/* Past Results / Sync Records */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-450 tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          PAST COLONY RESULTS ({pastMeetings.length + pastEvents.length})
        </h3>

        <div className="space-y-3">
          {pastMeetings.map((m) => (
            <div
              key={m.id}
              className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-xs font-bold text-white truncate">{m.title}</h4>
                <span className="text-[9px] text-zinc-500 block mt-0.5">{formatDate(m.date)}</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Attended</span>
                </span>
                <span className="text-xs font-bold font-mono-stats text-emerald-400">
                  +1 Pt
                </span>
              </div>
            </div>
          ))}

          {pastEvents.map((e) => (
            <div
              key={e.id}
              className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-xs font-bold text-white truncate">{e.name}</h4>
                <span className="text-[9px] text-zinc-500 block mt-0.5">{formatDate(e.event_date)}</span>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 border border-amber-500/25 bg-amber-500/5 text-amber-500 rounded-full text-[10px] font-bold">
                  <Hourglass className="w-3 h-3 text-amber-500" />
                  <span>Proof Pending Review</span>
                </span>
                <span className="text-xs font-bold font-mono-stats text-zinc-500">
                  +{e.pts_offered} Pts
                </span>
              </div>
            </div>
          ))}

          {pastMeetings.length === 0 && pastEvents.length === 0 && (
            <div className="text-center p-6 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-550 text-xs">
              No historical participation records logged.
            </div>
          )}
        </div>
      </div>

      {/* Proof Upload BottomSheet */}
      <ProofUploadSheet
        isOpen={isProofOpen}
        onClose={() => setIsProofOpen(false)}
        item={selectedEvent}
        onProofSubmit={onProofSubmit}
      />

      {/* Presentation Slot proposal BottomSheet */}
      <PresentationSlotSheet
        isOpen={isSlotOpen}
        onClose={() => setIsSlotOpen(false)}
        meetings={meetings.filter((m) => !hasEventEnded(m.date))}
        onProposalSuccess={() => {}}
      />
    </div>
  );
}
