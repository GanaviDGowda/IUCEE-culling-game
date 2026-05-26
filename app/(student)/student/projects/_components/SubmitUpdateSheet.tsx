"use client";

import { useState, useEffect } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  active: boolean;
}

interface SubmitUpdateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userProjects: Project[];
  onSubmitSuccess: (projectId: string, note: string) => void;
}

export function SubmitUpdateSheet({
  isOpen,
  onClose,
  userProjects,
  onSubmitSuccess,
}: SubmitUpdateSheetProps) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter active projects for submission
  const activeProjects = userProjects.filter((p) => p.active);

  // Update default selected project when list changes or modal opens
  useEffect(() => {
    if (activeProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(activeProjects[0].id);
    }
  }, [activeProjects, selectedProjectId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error("Please select a project to update.");
      return;
    }
    if (!note.trim()) {
      toast.error("Please describe your progress.");
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API lag
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onSubmitSuccess(selectedProjectId, note);
      toast.success("Progress update logged! Pending conveyor verification (+1 Pt).");
      setNote("");
      onClose();
    } catch (err) {
      toast.error("Failed to submit progress update.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Submit Weekly Update">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-zinc-100">
        {/* Project Selector */}
        <div className="space-y-1.5">
          <label htmlFor="proj-select" className="text-xs font-semibold text-zinc-400 block">
            Select Project *
          </label>
          {activeProjects.length > 0 ? (
            <select
              id="proj-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            >
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-950">
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-red-400 p-2 border border-red-500/20 bg-red-500/5 rounded-xl">
              No active projects available to update.
            </div>
          )}
        </div>

        {/* Progress details */}
        <div className="space-y-1.5">
          <label htmlFor="upd-note" className="text-xs font-semibold text-zinc-400 block">
            Weekly Progress Note *
          </label>
          <textarea
            id="upd-note"
            required
            rows={4}
            placeholder="Detail what features, tests or integrations you completed this week..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Screenshot proof */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 block">
            Screenshot Attachment (Optional)
          </label>
          <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors relative cursor-pointer group">
            <Upload className="w-5 h-5 text-zinc-550 mx-auto mb-1.5 group-hover:text-zinc-350 transition-colors" />
            <span className="text-xs text-zinc-550 block">Upload progress selfie, screenshot or PDF.</span>
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
            disabled={submitting || activeProjects.length === 0}
            className="w-1/2 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Submit</span>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
