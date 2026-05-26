"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RiMegaphoneLine, 
  RiSendPlane2Line, 
  RiHistoryLine, 
  RiCalendarEventLine, 
  RiUserVoiceLine,
  RiGroup2Line,
  RiShieldUserLine,
  RiArrowRightLine,
  RiCheckDoubleLine
} from "@remixicon/react";

type TargetType = "all" | "branch" | "year" | "tier" | "individual";

export default function AdminCommunicationDashboard() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Data lists
  const [history, setHistory] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Form States
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<TargetType>("all");
  const [targetValue, setTargetValue] = useState("");
  
  // Scheduled Options
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  const fetchCommunicationSuite = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/communication");
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history || []);
        setStudents(json.students || []);
      }
    } catch (err) {
      console.error("Failed to load communication metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunicationSuite();
  }, [fetchCommunicationSuite]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    
    setSending(true);
    try {
      const res = await fetch("/api/admin/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          target,
          targetValue: target === "all" ? "" : targetValue,
          scheduledAt: isScheduled ? scheduledDate : null
        })
      });

      if (res.ok) {
        const json = await res.json();
        alert(`Signal successfully dispatched to ${json.recipientsCount} recipient(s) ${json.scheduled ? "(scheduled)" : ""}.`);
        
        // Reset Form
        setTitle("");
        setBody("");
        setTarget("all");
        setTargetValue("");
        setIsScheduled(false);
        setScheduledDate("");
        
        await fetchCommunicationSuite();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to broadcast signal.");
      }
    } catch (err) {
      console.error(err);
      alert("Broadcast pipeline failed.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48 bg-zinc-900/40" />
          <Skeleton className="h-4 w-64 bg-zinc-900/40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2 bg-zinc-900/40 rounded-2xl" />
          <Skeleton className="h-96 bg-zinc-900/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest font-heading flex items-center gap-1.5">
          <RiMegaphoneLine className="w-5 h-5 text-red-500 animate-bounce" />
          Colony Broadcaster Hub
        </h2>
        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider font-heading">
          Dispatch announcements, broadcast mobile-alert notifications, target branches or specific tiers, and schedule feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Compose Broadcaster */}
        <form onSubmit={handleBroadcast} className="lg:col-span-7 space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
            Compile Broadcast Signal
          </h3>

          <div className="space-y-3.5 pt-1">
            
            {/* Target Scope Selectors */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Broadcast Target</label>
              <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-xl">
                {(["all", "branch", "year", "tier", "individual"] as TargetType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTarget(t);
                      setTargetValue("");
                    }}
                    className={`py-1.5 rounded-lg text-[9px] font-heading font-black uppercase tracking-wider transition-colors ${
                      target === t 
                        ? "bg-red-955 border border-red-900/30 text-red-400" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Target value fields */}
            {target === "branch" && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[9px] font-black text-zinc-550 uppercase tracking-wider font-heading">Select Department Branch</label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">-- Pick branch --</option>
                  <option value="CSE">CSE Department</option>
                  <option value="ISE">ISE Department</option>
                  <option value="ECE">ECE Department</option>
                  <option value="EEE">EEE Department</option>
                </select>
              </div>
            )}

            {target === "year" && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[9px] font-black text-zinc-550 uppercase tracking-wider font-heading">Select Year Group</label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">-- Pick year --</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            )}

            {target === "tier" && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Select Scholar Tier</label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">-- Pick tier status --</option>
                  <option value="active">Active Members</option>
                  <option value="contributor">Contributor (Tier 1)</option>
                  <option value="elite">Elite Members (Tier 2)</option>
                  <option value="domain_master">Domain Master (Tier 3)</option>
                  <option value="century">Century Outlaws</option>
                </select>
              </div>
            )}

            {target === "individual" && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Select Recipient Scholar</label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">-- Select student --</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.branch} Y{s.year})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notification Title */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Notification Title</label>
              <input 
                type="text" 
                placeholder="e.g. Main evaluation ledger closed"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Notification Body */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Message Body</label>
              <textarea 
                placeholder="Write your dispatch announcement detail here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-24 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl p-3 text-xs text-white focus:outline-none transition-colors resize-none"
                required
              />
            </div>

            {/* Scheduled Dispatch option */}
            <div className="space-y-2 border-t border-zinc-900 pt-3">
              <div className="flex items-center gap-2 h-9 border border-zinc-850 px-3 rounded-xl bg-zinc-950">
                <input 
                  type="checkbox" 
                  id="scheduled-toggle"
                  checked={isScheduled} 
                  onChange={(e) => setIsScheduled(e.target.checked)} 
                  className="rounded border-zinc-800 bg-black text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="scheduled-toggle" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-heading cursor-pointer flex items-center gap-1">
                  <RiCalendarEventLine className="w-3.5 h-3.5" />
                  Schedule Dispatch Time
                </label>
              </div>

              {isScheduled && (
                <div className="space-y-1 animate-in slide-in-from-top-1 duration-200 pl-1">
                  <label className="text-[8px] font-black text-zinc-550 uppercase tracking-wider font-heading">Select dispatch time</label>
                  <input 
                    type="datetime-local" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={sending}
              className="h-8 px-4 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RiSendPlane2Line className="w-4 h-4" />
              {sending ? "Broadcasting..." : "Broadcast Signal"}
            </Button>
          </div>
        </form>

        {/* Right Column: Sent history */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-1">
            <RiHistoryLine className="w-4 h-4 text-zinc-400" />
            <h3 className="text-[10px] font-black text-zinc-455 uppercase tracking-widest font-heading">
              Operational Dispatch Ledger
            </h3>
          </div>

          <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-3 max-h-[460px] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-zinc-550 italic py-10 text-xs font-heading">No past notifications transmitted.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h: any) => (
                  <div key={h.id} className="p-3 bg-zinc-950/60 border border-zinc-855 rounded-xl space-y-2 text-left">
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-1.5">
                      <div className="flex items-center gap-1">
                        {h.recipient === "Global Broadcast" ? (
                          <RiGroup2Line className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <RiUserVoiceLine className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span className="text-[9px] font-black uppercase text-zinc-300 leading-none truncate max-w-[120px]">
                          {h.recipient}
                        </span>
                      </div>
                      
                      <span className="text-[7.5px] font-bold font-mono text-zinc-555 uppercase">
                        {new Date(h.sent_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-[11px] font-black text-white leading-normal">{h.title}</h4>
                    <p className="text-[9.5px] text-zinc-500 leading-relaxed italic">
                      "{h.body}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
