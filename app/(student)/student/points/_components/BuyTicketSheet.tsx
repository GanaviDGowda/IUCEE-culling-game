"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TicketType {
  code: string;
  name: string;
  active_point_cost: number;
  description: string;
}

interface BuyTicketSheetProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: TicketType | null;
  userPoints: number;
  onPurchaseSuccess: (purchase: any) => void;
}

export function BuyTicketSheet({
  isOpen,
  onClose,
  ticketType,
  userPoints,
  onPurchaseSuccess,
}: BuyTicketSheetProps) {
  const [proposalText, setProposalText] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(false);

  if (!ticketType) return null;

  const cost = ticketType.active_point_cost;
  const isGolden = ticketType.code === "golden";
  const hasEnoughPoints = userPoints >= cost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasEnoughPoints) {
      toast.error("Insufficient active points for this transaction.");
      return;
    }

    if (isGolden && !proposalText.trim()) {
      toast.error("A proposal justification is mandatory for a Golden Ticket.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_code: ticketType.code,
          proposal_text: isGolden ? proposalText : null,
          event_title: !isGolden && eventTitle ? eventTitle : null,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to finalize purchase");
      }

      // Simulate a local purchased ticket record
      const simulatedPurchase = {
        id: `purch-${Math.random().toString(36).substring(2, 9)}`,
        ticket_code: ticketType.code,
        proposal_text: isGolden ? proposalText : null,
        event_title: !isGolden && eventTitle ? eventTitle : null,
        status: isGolden ? "pending_review" : "active",
        created_at: new Date().toISOString(),
        ticket_type: ticketType,
      };

      toast.success(`${ticketType.name} purchased successfully!`);
      onPurchaseSuccess(simulatedPurchase);
      
      // Reset state
      setProposalText("");
      setEventTitle("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Purchase ${ticketType.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-zinc-100">
        {/* Cost & Balance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-3 text-center">
            <span className="text-[9px] font-heading font-semibold text-zinc-500 uppercase tracking-wider block">
              Ticket Cost
            </span>
            <span className="text-md font-bold font-mono-stats text-red-500 mt-1 block">
              {cost} Pts
            </span>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-3 text-center">
            <span className="text-[9px] font-heading font-semibold text-zinc-500 uppercase tracking-wider block">
              Active Balance
            </span>
            <span className="text-md font-bold font-mono-stats text-white mt-1 block">
              {userPoints} Pts
            </span>
          </div>
        </div>

        {/* Deduction Warning */}
        <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-[10px] text-zinc-400 leading-relaxed">
            <span className="text-white font-bold block mb-0.5">ACTIVE POINT DEDUCTION WARNING</span>
            This transaction will deduct <span className="font-semibold text-white">{cost} points</span> from your quarterly redeemable balance. Your lifetime cumulative points and global rank are unaffected.
          </div>
        </div>

        {/* Golden Ticket Details Form */}
        {isGolden ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="proposal" className="text-xs font-semibold text-zinc-400 block">
                Colony Rule / Event Proposal *
              </label>
              <textarea
                id="proposal"
                required
                rows={4}
                placeholder="Explain the new colony rule or event you want to pitch. Golden Tickets require Nodal Officer sign-off or 25% student voting-rights approval..."
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        ) : (
          /* Silver Ticket Details Form */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="eventTitle" className="text-xs font-semibold text-zinc-400 block">
                Target Activity or Event Title (Optional)
              </label>
              <input
                id="eventTitle"
                type="text"
                placeholder="e.g. CIE Workshop Attendance Skip"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
              />
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
            type="submit"
            disabled={loading || !hasEnoughPoints}
            className={cn(
              "w-1/2 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-xl",
              hasEnoughPoints
                ? "bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer active:scale-95 shadow-md"
                : "bg-zinc-900 border border-zinc-805 text-zinc-600 cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Purchase Ticket</span>
            )}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
