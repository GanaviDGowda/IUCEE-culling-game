"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { Calendar, MapPin, Clock, Award, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  agenda?: string;
  type?: string;
  pts_offered?: number;
  event_date?: string;
  date?: string;
  time?: string;
  location?: string;
  registered: boolean;
}

interface ApplySheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: EventItem | null;
  isMeeting: boolean;
  onRSVPToggle: (id: string, isMeeting: boolean, currentlyRegistered: boolean) => Promise<void>;
}

export function ApplySheet({
  isOpen,
  onClose,
  item,
  isMeeting,
  onRSVPToggle,
}: ApplySheetProps) {
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const title = item.name || item.title || "";
  const dateStr = item.event_date || item.date || "";
  const points = item.pts_offered || (isMeeting ? 1 : 0);
  const locationStr = item.location || "Main Campus";
  const descStr = item.description || item.agenda || "No further details provided.";

  const handleRSVPSubmit = async () => {
    setLoading(true);
    try {
      await onRSVPToggle(item.id, isMeeting, item.registered);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update RSVP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={item.registered ? "Cancel RSVP" : "Confirm RSVP"}>
      <div className="space-y-4 pt-2 text-zinc-100">
        <div>
          <span className="text-[9px] font-heading font-semibold text-red-500 tracking-widest uppercase block">
            {isMeeting ? "Colony Sync Meeting" : `${item.type || "other"} Activity`}
          </span>
          <h3 className="text-md font-bold text-white tracking-tight mt-0.5">{title}</h3>
        </div>

        {/* Date, Location, Points Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-2.5 text-center">
            <Calendar className="w-4 h-4 text-zinc-500 mx-auto mb-1" />
            <span className="text-[9px] text-zinc-500 block">Date</span>
            <span className="text-[10px] font-semibold text-white mt-0.5 truncate block">{dateStr}</span>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-2.5 text-center">
            <MapPin className="w-4 h-4 text-zinc-500 mx-auto mb-1" />
            <span className="text-[9px] text-zinc-500 block">Location</span>
            <span className="text-[10px] font-semibold text-white mt-0.5 truncate block">{locationStr}</span>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-2.5 text-center">
            <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1 animate-pulse" />
            <span className="text-[9px] text-zinc-500 block">Award value</span>
            <span className="text-[10px] font-semibold text-emerald-400 mt-0.5 block font-mono-stats">+{points} Pts</span>
          </div>
        </div>

        {/* Description / details */}
        <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl">
          <p className="text-[9px] font-heading font-semibold text-zinc-500 tracking-wider">DESCRIPTION / AGENDA</p>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{descStr}</p>
        </div>

        {/* Warning Indicator */}
        {!item.registered && !isMeeting && (
          <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-zinc-400 leading-relaxed">
              <span className="text-white font-bold block mb-0.5">PROOF REQUIREMENT NOTICE</span>
              Participation in this activity requires uploading proof of attendance (e.g., certificate or event selfie) afterward. Points will be confirmed by administrators within 7 days.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={handleRSVPSubmit}
            disabled={loading}
            className={cn(
              "w-1/2 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-xl",
              item.registered
                ? "bg-red-950/20 border border-red-500/25 hover:bg-red-900/20 text-red-400 cursor-pointer active:scale-95"
                : "bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer active:scale-95 shadow-md"
            )}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : item.registered ? (
              <span>Cancel RSVP</span>
            ) : (
              <span>Confirm RSVP</span>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
