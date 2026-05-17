"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_POINT_RULES } from "@/lib/points";
import { RiAwardLine } from "@remixicon/react";

interface AwardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  onSuccess: () => void;
}

const POINT_TYPES = ADMIN_POINT_RULES;

export function AwardSheet({ isOpen, onClose, memberId, memberName, onSuccess }: AwardSheetProps) {
  const [points, setPoints] = useState("");
  const [type, setType] = useState("manual_award");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const pts = parseInt(points);
    if (isNaN(pts) || !type) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: memberId,
          // If deduction, enforce negative points; otherwise positive points
          points: type === "deduction" ? -Math.abs(pts) : Math.abs(pts),
          type,
          note: note || `Awarded points for ${type.replace(/_/g, ' ')}.`
        })
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setPoints("");
        setNote("");
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
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/30 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <RiAwardLine className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Award Cursed Energy</h3>
          <p className="text-[10px] text-zinc-550">Adjust points for <span className="text-white font-bold">{memberName}</span></p>
        </div>

        <div className="space-y-3 px-1">
          <div>
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Activity Category</label>
            <select
              className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl h-11 px-3 mt-1 outline-none focus:border-red-500"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {POINT_TYPES.map((pt) => (
                <option key={pt.type} value={pt.type}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Point Amount</label>
            <Input
              type="number"
              placeholder="e.g. 15"
              className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Official Memo / Notes</label>
            <Textarea
              placeholder="Enter details of accomplishments or penalties..."
              className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-20 mt-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
              onClick={handleConfirm}
              disabled={loading || !points}
            >
              {loading ? "Awarding..." : "Confirm Award"}
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
