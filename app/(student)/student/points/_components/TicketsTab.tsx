"use client";

import { useEffect, useState } from "react";
import { Ticket, TicketIcon, Calendar, CheckCircle2, Hourglass, Lock, AlertTriangle } from "lucide-react";
import { BuyTicketSheet } from "./BuyTicketSheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TicketType {
  code: string;
  name: string;
  active_point_cost: number;
  description: string;
  enabled: boolean;
}

interface Purchase {
  id: string;
  ticket_code: string;
  proposal_text?: string;
  event_title?: string;
  status: "active" | "used" | "pending_review" | "voided";
  created_at: string;
  ticket_type: TicketType;
}

interface TicketsTabProps {
  userPoints: number;
  onPurchaseComplete: (deductPoints: number) => void;
}

const mockTicketTypes: TicketType[] = [
  {
    code: "golden",
    name: "Golden Ticket",
    active_point_cost: 100,
    description: "Submit a binding proposal to pitch funded projects or vote to add/veto a colony rule this semester.",
    enabled: true,
  },
  {
    code: "silver",
    name: "Silver Ticket",
    active_point_cost: 60,
    description: "Acts as a major event ticket or pre-authorized meeting skip voucher with no token penalty.",
    enabled: true,
  },
];

const mockPurchases: Purchase[] = [
  {
    id: "purch-old",
    ticket_code: "silver",
    event_title: "CIE Coding Bootcamp skip",
    status: "used",
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_type: mockTicketTypes[1],
  },
];

export function TicketsTab({ userPoints, onPurchaseComplete }: TicketsTabProps) {
  const [types, setTypes] = useState<TicketType[]>(mockTicketTypes);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets");
      if (!response.ok) throw new Error("Failed to fetch tickets");
      
      const resData = await response.json();
      
      // If we have actual DB ticket types and purchases, load them.
      // Otherwise, keep mock fallbacks for local demo consistency!
      if (resData.ticket_types && resData.ticket_types.length > 0) {
        setTypes(resData.ticket_types);
      }
      if (resData.purchases) {
        setPurchases(resData.purchases);
      }
    } catch (err) {
      // Quietly fall back to mock data
      console.log("Using local mock tickets database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleBuyClick = (type: TicketType) => {
    setSelectedType(type);
    setIsBuyOpen(true);
  };

  const handlePurchaseSuccess = (newPurchase: Purchase) => {
    setPurchases((prev) => [newPurchase, ...prev]);
    onPurchaseComplete(newPurchase.ticket_type.active_point_cost);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "used":
        return "text-zinc-500 border-zinc-900 bg-zinc-950/40";
      case "pending_review":
        return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      default:
        return "text-red-400 border-red-500/20 bg-red-500/5";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case "used":
        return <Lock className="w-3 h-3 text-zinc-650" />;
      default:
        return <Hourglass className="w-3 h-3 text-amber-500" />;
    }
  };

  // One of each type per semester check
  // Filter active/pending purchases in the current semester list
  const hasGolden = purchases.some((p) => p.ticket_code === "golden" && p.status !== "voided");
  const hasSilver = purchases.some((p) => p.ticket_code === "silver" && p.status !== "voided");

  const isPurchased = (code: string) => {
    if (code === "golden") return hasGolden;
    if (code === "silver") return hasSilver;
    return false;
  };

  return (
    <div className="space-y-8">
      {/* Grid of Available Tickets */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
          <TicketIcon className="w-4 h-4 text-red-500" />
          AVAILABLE TICKET TYPES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((type) => {
            const purchased = isPurchased(type.code);
            const hasPoints = userPoints >= type.active_point_cost;
            const isGolden = type.code === "golden";

            let buttonLabel = "Purchase Ticket";
            let canBuy = true;

            if (purchased) {
              buttonLabel = "Limit Reached: One per Semester";
              canBuy = false;
            } else if (!hasPoints) {
              buttonLabel = "Insufficient Points";
              canBuy = false;
            }

            return (
              <div
                key={type.code}
                className={cn(
                  "p-5 border bg-zinc-950/40 rounded-2xl flex flex-col justify-between gap-5 transition-all shadow-md hover:border-zinc-800",
                  isGolden 
                    ? "border-amber-500/10 shadow-amber-500/2" 
                    : "border-zinc-900"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center border",
                        isGolden 
                          ? "bg-amber-950/20 border-amber-500/20 text-amber-400" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-350"
                      )}>
                        <Ticket className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{type.name}</h4>
                    </div>
                    <span className="text-sm font-bold font-mono-stats text-red-500 bg-red-950/10 border border-red-500/15 px-2.5 py-0.5 rounded-lg">
                      {type.active_point_cost} Pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[48px]">
                    {type.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900/60 w-full">
                  {canBuy ? (
                    <button
                      onClick={() => handleBuyClick(type)}
                      className={cn(
                        "w-full py-2 rounded-xl text-xs font-bold font-heading transition-all active:scale-95 cursor-pointer text-center",
                        isGolden
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 shadow-md shadow-amber-500/5"
                          : "bg-white hover:bg-zinc-200 text-zinc-950"
                      )}
                    >
                      {buttonLabel}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 bg-zinc-900/30 border border-zinc-900 text-zinc-650 rounded-xl text-xs font-bold font-heading cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{buttonLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster of Purchased Tickets */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Calendar className="w-4 h-4 text-red-500" />
          MY PURCHASED TICKETS ({purchases.length})
        </h3>

        {purchases.length > 0 ? (
          <div className="space-y-3">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-805 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0",
                    p.ticket_code === "golden" 
                      ? "bg-amber-950/20 border-amber-500/20 text-amber-400" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-350"
                  )}>
                    <Ticket className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white capitalize">
                      {p.ticket_type?.name || p.ticket_code + " ticket"}
                    </h4>
                    <span className="text-[9px] text-zinc-500 font-mono-stats block mt-0.5">
                      Purchased on {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Proposal text summary if golden */}
                {p.proposal_text && (
                  <div className="flex-1 max-w-sm px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-[10px] text-zinc-400 truncate">
                    <span className="text-white font-bold">Proposal: </span>
                    {p.proposal_text}
                  </div>
                )}

                {/* Event title if silver */}
                {p.event_title && (
                  <div className="flex-1 max-w-sm px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-[10px] text-zinc-400 truncate">
                    <span className="text-white font-bold">Target: </span>
                    {p.event_title}
                  </div>
                )}

                <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 pt-2.5 sm:pt-0 border-t border-zinc-900/60 sm:border-t-0">
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                    getStatusStyle(p.status)
                  )}>
                    {getStatusIcon(p.status)}
                    <span>{p.status.replace(/_/g, " ")}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-500 text-xs">
            No ticket purchase records logged this semester.
          </div>
        )}
      </div>

      {/* Buy Ticket BottomSheet */}
      <BuyTicketSheet
        isOpen={isBuyOpen}
        onClose={() => setIsBuyOpen(false)}
        ticketType={selectedType}
        userPoints={userPoints}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  );
}
