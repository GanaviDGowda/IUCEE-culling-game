"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { AlertTriangle, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Log {
  id: string;
  points: number;
  type: string;
  note: string;
  status: string;
  created_at: string;
}

interface AppealSheetProps {
  isOpen: boolean;
  onClose: () => void;
  log: Log | null;
  onAppealSubmit: (logId: string, appealReason: string) => void;
}

export function AppealSheet({
  isOpen,
  onClose,
  log,
  onAppealSubmit,
}: AppealSheetProps) {
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!log) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Justification reason is required.");
      return;
    }

    setLoading(true);
    try {
      // Simulate appeal submission to an API endpoint
      const response = await fetch("/api/student/points", {
        method: "POST", // Simulating adding an appeal status metadata
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_id: log.id,
          appeal_reason: reason,
          has_proof: !!file,
        }),
      });

      // Even if endpoint returns mock success, we trigger state update
      onAppealSubmit(log.id, reason);
      toast.success("Cursed energy contest logged. Review pending by Nodal Officer.");
      setReason("");
      setFile(null);
      onClose();
    } catch (err) {
      toast.error("Failed to submit appeal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Contest Point Deduction">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-zinc-100">
        {/* Warning Indicator */}
        <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-white font-bold block mb-0.5">Contesting Transaction:</span>
            {log.note || log.type.replace(/_/g, " ")} ({log.points} Pts) on {new Date(log.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Justification Textarea */}
        <div className="space-y-1.5">
          <label htmlFor="reason" className="text-xs font-semibold text-zinc-400">
            Justification Note *
          </label>
          <textarea
            id="reason"
            required
            rows={4}
            placeholder="Explain why this deduction or rejection should be reversed..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Proof Upload Simulation */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 block">
            Evidence (Optional)
          </label>
          <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors relative cursor-pointer group">
            <input
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) setFile(selectedFile);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-5 h-5 text-zinc-500 mx-auto group-hover:text-zinc-300 transition-colors mb-1.5" />
            {file ? (
              <span className="text-xs text-emerald-400 font-medium truncate block max-w-[250px] mx-auto">
                {file.name}
              </span>
            ) : (
              <span className="text-xs text-zinc-500 block">
                Click to upload screenshot, report or document proof.
              </span>
            )}
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
              <span>Submit Appeal</span>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
