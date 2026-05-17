"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { 
  RiFolderShield2Line, 
  RiCheckLine, 
  RiCloseLine, 
  RiAlertLine,
  RiTimeLine
} from "@remixicon/react";

export function AppealsTab() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"pending" | "approved" | "rejected">("pending");

  // BottomSheet decision state
  const [selectedAppeal, setSelectedAppeal] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, []);

  async function fetchAppeals() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/appeals");
      const data = await res.json();
      setAppeals(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAction = (appeal: any, action: "approved" | "rejected") => {
    setSelectedAppeal(appeal);
    setActionType(action);
    setReviewNote("");
  };

  const handleConfirmAction = async () => {
    if (!selectedAppeal || !actionType) return;
    setSubmittingAction(true);
    try {
      const res = await fetch("/api/admin/appeals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appeal_id: selectedAppeal.id,
          action: actionType,
          review_note: reviewNote
        })
      });
      if (res.ok) {
        await fetchAppeals();
        setSelectedAppeal(null);
        setActionType(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredAppeals = appeals.filter(a => a.status === subTab);

  return (
    <div className="space-y-4">
      
      {/* Sub-navigation buttons */}
      <div className="flex gap-2 border-b border-zinc-850 pb-2">
        {(["pending", "approved", "rejected"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              subTab === tab 
                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab} ({appeals.filter(a => a.status === tab).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-zinc-900/30" />
          <Skeleton className="h-24 w-full bg-zinc-900/30" />
        </div>
      ) : filteredAppeals.length === 0 ? (
        <div className="text-center py-12 border border-zinc-850 rounded-2xl bg-zinc-900/5 space-y-2">
          <RiFolderShield2Line className="w-8 h-8 text-zinc-650 mx-auto" />
          <p className="text-xs font-bold text-zinc-400">No appeals resolved under {subTab} category.</p>
        </div>
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2">
          {filteredAppeals.map((appeal) => (
            <div 
              key={appeal.id} 
              className={`p-4 bg-zinc-900/15 border rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                appeal.status === "pending" ? "border-zinc-850 hover:border-zinc-800" :
                appeal.status === "approved" ? "border-emerald-950/30 bg-emerald-950/5" :
                "border-red-950/30 bg-red-950/5"
              }`}
            >
              
              {/* Profile details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8 border border-zinc-800">
                      <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[10px] font-bold">
                        {appeal.user?.name?.slice(0, 2).toUpperCase() || "ST"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xs font-extrabold text-white leading-tight">{appeal.user?.name}</h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{appeal.user?.email}</p>
                    </div>
                  </div>

                  <Badge className="bg-zinc-850 text-zinc-400 border border-zinc-800 text-[8px] font-black tracking-wider uppercase">
                    Disputed: {appeal.point_log?.points || 0} Pts
                  </Badge>
                </div>

                <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850 space-y-2">
                  <div>
                    <span className="text-[8px] uppercase font-black text-zinc-550 block">Dispute Reason</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed italic">"{appeal.reason}"</p>
                  </div>
                  
                  {appeal.point_log && (
                    <div className="pt-1.5 border-t border-zinc-900 flex justify-between text-[8px] text-zinc-500">
                      <span>Log Note: "{appeal.point_log.note || 'No notes'}"</span>
                      <span>{new Date(appeal.point_log.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status information or pending actions */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/50">
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-550">
                  <RiTimeLine className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Submitted {new Date(appeal.submitted_at).toLocaleDateString()}</span>
                </div>

                {appeal.status === "pending" ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 rounded-lg text-[9px] font-black bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-zinc-850 flex items-center gap-0.5"
                      onClick={() => handleOpenAction(appeal, "rejected")}
                    >
                      <RiCloseLine className="w-3 h-3" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 rounded-lg text-[9px] font-black bg-red-600 hover:bg-red-500 text-white flex items-center gap-0.5"
                      onClick={() => handleOpenAction(appeal, "approved")}
                    >
                      <RiCheckLine className="w-3 h-3" />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <div className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    {appeal.status === "approved" ? (
                      <span className="text-emerald-400">Approved</span>
                    ) : (
                      <span className="text-amber-500">Rejected</span>
                    )}
                    {appeal.review_note && (
                      <span className="text-zinc-550 lowercase font-medium">({appeal.review_note})</span>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Review bottom sheet decision */}
      <BottomSheet isOpen={selectedAppeal !== null} onClose={() => setSelectedAppeal(null)}>
        {selectedAppeal && actionType && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {actionType === "approved" ? "Approve Point Dispute" : "Reject Point Dispute"}
              </h3>
              <p className="text-[10px] text-zinc-550">
                Confirm your decision for {selectedAppeal.user?.name || "Participant"}.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-550 tracking-wider">
                  {actionType === "approved" ? "Optional Review Notes" : "Mandatory Rejection Explanation"}
                </label>
                <Textarea
                  placeholder={actionType === "approved" ? "Add comments or adjust notes..." : "Provide a clear reason for dispute denial..."}
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-24 p-3"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
                  onClick={() => setSelectedAppeal(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className={`flex-1 rounded-xl h-11 text-xs font-black text-white ${
                    actionType === "approved" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-650 hover:bg-red-650/90"
                  }`}
                  onClick={handleConfirmAction}
                  disabled={submittingAction || (actionType === "rejected" && !reviewNote)}
                >
                  {submittingAction ? "Processing..." : `Confirm ${actionType.toUpperCase()}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

    </div>
  );
}
