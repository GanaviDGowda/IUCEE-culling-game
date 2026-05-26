"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventItem {
  id: string;
  name?: string;
  title?: string;
  event_date?: string;
  date?: string;
  pts_offered?: number;
}

interface ProofUploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: EventItem | null;
  onProofSubmit: (id: string, fileName: string) => void;
}

export function ProofUploadSheet({
  isOpen,
  onClose,
  item,
  onProofSubmit,
}: ProofUploadSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const title = item.name || item.title || "";
  const points = item.pts_offered || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a proof file first.");
      return;
    }

    setLoading(true);
    try {
      // Simulate file upload API
      await new Promise((r) => setTimeout(r, 1500));
      onProofSubmit(item.id, file.name);
      toast.success("Proof uploaded successfully! Administrator review pending.");
      setFile(null);
      onClose();
    } catch (err) {
      toast.error("Failed to upload proof.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Upload Event Proof">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-zinc-100">
        <div>
          <span className="text-[9px] font-heading font-semibold text-red-500 tracking-widest uppercase block">
            Participation Evidence
          </span>
          <h3 className="text-md font-bold text-white tracking-tight mt-0.5">{title}</h3>
          <span className="text-[10px] text-zinc-500 font-mono-stats mt-1 block">
            Value to claim: <span className="text-emerald-400 font-bold">+{points} Pts</span>
          </span>
        </div>

        {/* Upload Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 block">
            Select Attachment File
          </label>
          <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-750 transition-colors relative cursor-pointer group">
            <input
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) setFile(selectedFile);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-6 h-6 text-zinc-500 mx-auto group-hover:text-zinc-350 transition-colors mb-2" />
            {file ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium max-w-[280px] mx-auto">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            ) : (
              <span className="text-xs text-zinc-550 block leading-relaxed">
                Choose a PDF, PNG, or JPG showing certificate, leaderboard placement, or coordinate selfie.
              </span>
            )}
          </div>
        </div>

        {/* Admin note */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-xl flex items-start gap-2 text-xs text-zinc-500 leading-normal">
          <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-zinc-400 block text-[10px]">Verification Protocol:</span>
            Proof is reviewed manually by chapter conveyors. Points are added to your ledger upon confirmation (max 7 days).
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
            disabled={loading || !file}
            className={cn(
              "w-1/2 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-xl",
              file
                ? "bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer active:scale-95 shadow-md"
                : "bg-zinc-900 border border-zinc-805 text-zinc-650 cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Submit Proof</span>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
