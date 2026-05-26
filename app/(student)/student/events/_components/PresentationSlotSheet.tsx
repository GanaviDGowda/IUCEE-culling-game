"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { Loader2, Award, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  date: string;
}

interface PresentationSlotSheetProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: Meeting[];
  onProposalSuccess: () => void;
}

export function PresentationSlotSheet({
  isOpen,
  onClose,
  meetings,
  onProposalSuccess,
}: PresentationSlotSheetProps) {
  const [meetingId, setMeetingId] = useState("");
  const [topic, setTopic] = useState("");
  const [abstract, setAbstract] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingId) {
      toast.error("Please select a target meeting.");
      return;
    }
    if (!topic.trim()) {
      toast.error("Topic title is required.");
      return;
    }

    setLoading(true);
    try {
      // Simulate presentation request POST API
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Presentation request logged! Conveyor will review agenda slot.");
      onProposalSuccess();
      setTopic("");
      setAbstract("");
      setMeetingId("");
      onClose();
    } catch (err) {
      toast.error("Failed to register presentation request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Request Presentation Slot">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-zinc-100">
        <div>
          <span className="text-[9px] font-heading font-semibold text-red-500 tracking-widest uppercase block">
            Cursed Tech Share slot
          </span>
          <h3 className="text-md font-bold text-white tracking-tight mt-0.5">Pitch Meeting Topic</h3>
          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
            Leading a technical presentation grants <span className="font-bold text-emerald-400 font-mono-stats">+2 points</span> upon conveyor approval.
          </p>
        </div>

        {/* Meeting Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="meeting" className="text-xs font-semibold text-zinc-400">
            Target Meeting *
          </label>
          <select
            id="meeting"
            required
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
          >
            <option value="" className="text-zinc-600">Select an upcoming meeting...</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id} className="text-white">
                {m.title} ({m.date})
              </option>
            ))}
          </select>
        </div>

        {/* Topic Title */}
        <div className="space-y-1.5">
          <label htmlFor="topic" className="text-xs font-semibold text-zinc-400">
            Presentation Topic Title *
          </label>
          <input
            id="topic"
            type="text"
            required
            placeholder="e.g. Serverless edge functions with Rust"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Abstract */}
        <div className="space-y-1.5">
          <label htmlFor="abstract" className="text-xs font-semibold text-zinc-400">
            Abstract / Details
          </label>
          <textarea
            id="abstract"
            rows={3}
            placeholder="Briefly explain what you will present, key takeaways, and slide links..."
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-xl flex items-start gap-2 text-xs text-zinc-500 leading-normal">
          <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-zinc-450 block text-[10px]">Agenda Priority:</span>
            T3 Domain Master class members receive priority scheduling and double vote weights.
          </div>
        </div>

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
            type="submit"
            disabled={loading}
            className="w-1/2 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Request Slot</span>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
