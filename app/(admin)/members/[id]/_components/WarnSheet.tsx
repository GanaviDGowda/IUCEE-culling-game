"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RiAlertLine } from "@remixicon/react";

interface WarnSheetProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  currentWarnings: number;
  onSuccess: () => void;
}

export function WarnSheet({ isOpen, onClose, memberId, memberName, currentWarnings, onSuccess }: WarnSheetProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "warn",
          reason: reason || "Official disciplinary warning issued."
        })
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setReason("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-950/30 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <RiAlertLine className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Issue Official Warning</h3>
          <p className="text-[10px] text-zinc-550">
            Designating official warning for <span className="text-white font-bold">{memberName}</span>.
          </p>
          <p className="text-[9px] text-amber-400 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
            Current Warnings: {currentWarnings}
          </p>
        </div>

        <div className="space-y-3 px-1">
          <div>
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Reason for Warning</label>
            <Textarea
              placeholder="Provide clear reason for this disciplinary action..."
              className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-24 mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black rounded-xl h-11 text-xs font-bold"
              onClick={handleConfirm}
              disabled={loading || !reason}
            >
              {loading ? "Issuing..." : "Confirm Warning"}
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
