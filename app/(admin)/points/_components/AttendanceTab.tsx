"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { 
  RiVideoChatLine, 
  RiGroupLine, 
  RiCheckDoubleLine, 
  RiUserStarLine,
  RiArrowUpDownLine,
  RiCalendarEventLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiCheckboxBlankCircleLine,
  RiLockLine
} from "@remixicon/react";

export function AttendanceTab() {
  const [meeting, setMeeting] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [meetingsList, setMeetingsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");

  // UI state for CIE collapsible dropdown
  const [showCieHub, setShowCieHub] = useState(false);

  // Local unsaved attendance states: Record<userId, { present: boolean | null, used_skip_token: boolean, override_note: string | null }>
  const [localAttendance, setLocalAttendance] = useState<Record<string, { present: boolean | null, used_skip_token: boolean, override_note: string | null }>>({});
  const [saving, setSaving] = useState(false);

  // Override note BottomSheet states
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideStudent, setOverrideStudent] = useState<any | null>(null);
  const [overrideNoteText, setOverrideNoteText] = useState("");

  // CIE Year-wise locks & state
  const [cieLocks, setCieLocks] = useState<Record<string, number>>({
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0
  });
  const [grantingCie, setGrantingCie] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetingsList();
    fetchCieLocks();
  }, []);

  useEffect(() => {
    fetchAttendanceData(selectedMeetingId);
  }, [selectedMeetingId]);

  async function fetchMeetingsList() {
    try {
      const res = await fetch("/api/admin/meetings");
      const data = await res.json();
      setMeetingsList(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCieLocks() {
    try {
      const years = ["1", "2", "3", "4"];
      const newLocks: Record<string, number> = {};
      for (const y of years) {
        const res = await fetch(`/api/admin/cie-bonus?year=${y}`);
        const data = await res.json();
        newLocks[y] = data.days_remaining || 0;
      }
      setCieLocks(newLocks);
    } catch (err) {
      console.error("Failed to load CIE rate locks:", err);
    }
  }

  async function fetchAttendanceData(meetingId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?meetingId=${meetingId}`);
      const data = await res.json();
      if (data.data) {
        setMeeting(data.data.meeting);
        const fetchedMembers = data.data.members || [];
        setMembers(fetchedMembers);

        // Initialize local attendance map
        const initialAtts: Record<string, any> = {};
        fetchedMembers.forEach((m: any) => {
          initialAtts[m.id] = {
            present: m.attendance ? m.attendance.present : null,
            used_skip_token: m.attendance ? m.attendance.used_skip_token : false,
            override_note: m.attendance ? m.attendance.override_note : null
          };
        });
        setLocalAttendance(initialAtts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Row tap handler to cycle state: Unmarked -> Present -> Absent -> Unmarked
  const handleRowTap = (studentId: string) => {
    const student = members.find(m => m.id === studentId);
    if (student?.has_cie_bonus) return; // Locked: do nothing

    setLocalAttendance(prev => {
      const current = prev[studentId] || { present: null, used_skip_token: false, override_note: null };
      let nextPresent: boolean | null = null;

      if (current.present === null) {
        nextPresent = true; // First tap: Present
      } else if (current.present === true) {
        nextPresent = false; // Second tap: Absent
      } else {
        nextPresent = null; // Third tap: reset to Unmarked
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          present: nextPresent
        }
      };
    });
  };

  const handleBulkCheckIn = () => {
    // Optimistically set all non-locked members to Present locally
    setLocalAttendance(prev => {
      const updated = { ...prev };
      members.forEach(m => {
        if (!m.has_cie_bonus) {
          updated[m.id] = {
            ...updated[m.id],
            present: true
          };
        }
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    if (!meeting) return;
    setSaving(true);

    try {
      const updates = Object.entries(localAttendance).map(([userId, val]) => ({
        user_id: userId,
        present: val.present,
        used_skip_token: val.used_skip_token,
        override_note: val.override_note
      }));

      const res = await fetch("/api/admin/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: meeting.id,
          updates
        })
      });

      if (res.ok) {
        alert("All attendance changes successfully synchronized!");
        await fetchAttendanceData(meeting.id);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save attendance.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerYearCIEBonus = async (year: string) => {
    if (!meeting) {
      alert("No active meeting resolved to target.");
      return;
    }

    setGrantingCie(year);
    try {
      const res = await fetch("/api/admin/cie-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, meeting_id: meeting.id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to grant CIE Bonus.");
      } else {
        alert(`Successfully granted CIE Bonus skip tokens to ${data.count} active students in Year ${year}!`);
        fetchCieLocks(); // Refresh locks
        fetchAttendanceData(meeting.id); // Reload skip token counts and card block states
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Failed to grant CIE Bonus.");
    } finally {
      setGrantingCie(null);
    }
  };

  const openOverrideSheet = (e: React.MouseEvent, student: any) => {
    e.stopPropagation(); // Avoid triggering card tap
    setOverrideStudent(student);
    const localVal = localAttendance[student.id];
    setOverrideNoteText(localVal?.override_note || "");
    setIsOverrideOpen(true);
  };

  const submitOverrideNote = () => {
    if (!overrideStudent) return;
    setLocalAttendance(prev => ({
      ...prev,
      [overrideStudent.id]: {
        ...prev[overrideStudent.id],
        override_note: overrideNoteText
      }
    }));
    setIsOverrideOpen(false);
  };

  // Filter members by query
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort members: 1st Year -> 2nd Year -> 3rd Year -> 4th Year, alphabetically by name within each year group
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const yrA = a.year ? Number(a.year) : 99;
    const yrB = b.year ? Number(b.year) : 99;
    if (yrA !== yrB) {
      return yrA - yrB;
    }
    return a.name.localeCompare(b.name);
  });

  // Compute stats based on local unsaved state
  const presentCount = Object.values(localAttendance).filter(v => v.present === true).length;
  
  // Calculate if there are unsaved changes
  const hasChanges = members.some(m => {
    const local = localAttendance[m.id];
    const initialPresent = m.attendance ? m.attendance.present : null;
    const initialNote = m.attendance ? m.attendance.override_note : null;
    return (
      local && 
      (local.present !== initialPresent || local.override_note !== initialNote)
    );
  });

  // Year theme color configs
  const yearThemes: Record<string, {
    border: string,
    bg: string,
    text: string,
    stripe: string,
    hoverBorder: string
  }> = {
    "1": {
      border: "border-cyan-500/15",
      bg: "bg-cyan-955/5",
      text: "text-cyan-400",
      stripe: "border-l-cyan-500",
      hoverBorder: "hover:border-cyan-500/30"
    },
    "2": {
      border: "border-emerald-500/15",
      bg: "bg-emerald-955/5",
      text: "text-emerald-400",
      stripe: "border-l-emerald-500",
      hoverBorder: "hover:border-emerald-500/30"
    },
    "3": {
      border: "border-purple-500/15",
      bg: "bg-purple-955/5",
      text: "text-purple-400",
      stripe: "border-l-purple-500",
      hoverBorder: "hover:border-purple-500/30"
    },
    "4": {
      border: "border-rose-500/15",
      bg: "bg-rose-955/5",
      text: "text-rose-455",
      stripe: "border-l-rose-500",
      hoverBorder: "hover:border-rose-500/30"
    },
    "Unassigned": {
      border: "border-zinc-850",
      bg: "bg-zinc-955/5",
      text: "text-zinc-450",
      stripe: "border-l-zinc-700",
      hoverBorder: "hover:border-zinc-750"
    }
  };

  // Dedicated neon themes for the CIE cards to make them incredibly sleek
  const cieConsoleThemes: Record<string, {
    topStripe: string,
    border: string,
    glow: string,
    badgeText: string,
    badgeBg: string,
    btnGradient: string
  }> = {
    "1": {
      topStripe: "bg-cyan-500",
      border: "border-cyan-500/20",
      glow: "shadow-cyan-950/20",
      badgeText: "text-cyan-400",
      badgeBg: "bg-cyan-950/40 border-cyan-800/30",
      btnGradient: "from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-600"
    },
    "2": {
      topStripe: "bg-emerald-500",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-950/20",
      badgeText: "text-emerald-400",
      badgeBg: "bg-emerald-950/40 border-emerald-800/30",
      btnGradient: "from-emerald-600 to-teal-650 hover:from-emerald-500 hover:to-teal-600"
    },
    "3": {
      topStripe: "bg-purple-500",
      border: "border-purple-500/20",
      glow: "shadow-purple-950/20",
      badgeText: "text-purple-400",
      badgeBg: "bg-purple-950/40 border-purple-800/30",
      btnGradient: "from-purple-600 to-pink-650 hover:from-purple-500 hover:to-pink-600"
    },
    "4": {
      topStripe: "bg-rose-500",
      border: "border-rose-500/20",
      glow: "shadow-rose-950/20",
      badgeText: "text-rose-455",
      badgeBg: "bg-rose-950/40 border-rose-800/30",
      btnGradient: "from-rose-600 to-orange-650 hover:from-rose-500 hover:to-orange-600"
    }
  };

  return (
    <div className="space-y-3.5 pb-20 relative">
      
      {/* Selector & Bulk controls - Sleek single row inline container */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="w-full sm:w-56 bg-zinc-900 border border-zinc-800 text-[11px] text-white rounded-lg h-9 px-2 outline-none focus:border-red-500"
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
          >
            <option value="active">-- Latest Active --</option>
            {meetingsList.map(meet => (
              <option key={meet.id} value={meet.id}>
                {meet.title}
              </option>
            ))}
          </select>
        </div>

        {meeting && (
          <div className="flex gap-1.5 w-full sm:w-auto">
            <Button 
              variant="outline"
              className="flex-1 sm:flex-initial h-9 px-3 rounded-lg text-[11px] font-black border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              onClick={handleBulkCheckIn}
            >
              Mark All Present
            </Button>
            <Button 
              className="flex-1 sm:flex-initial h-9 px-3 rounded-lg text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1"
              onClick={handleSaveAttendance}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        )}
      </div>

      {/* Collapsible CIE Year-wise Attendance Bonus Hub - Redesigned with futuristic console visuals */}
      <div className="bg-zinc-950/30 border border-red-500/10 rounded-2xl overflow-hidden transition-all shadow-xl shadow-black/30">
        <button
          onClick={() => setShowCieHub(!showCieHub)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-red-500/[0.02] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest font-mono">
              [CIE SKIP ENGINE DECK]
            </h3>
          </div>
          <span className="text-[9px] font-black text-zinc-455 uppercase tracking-widest font-mono flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
            <span>{showCieHub ? "COLLAPSE" : "EXPAND CONSOLE"}</span>
            <span className={`transform transition-transform text-[8px] ${showCieHub ? "rotate-180" : ""}`}>▼</span>
          </span>
        </button>

        {showCieHub && (
          <div className="p-3.5 pt-0 border-t border-zinc-900 grid grid-cols-2 md:grid-cols-4 gap-3 animate-in slide-in-from-top-2 duration-300">
            {["1", "2", "3", "4"].map((year) => {
              const lockDays = cieLocks[year] || 0;
              const isLocked = lockDays > 0;
              const isPending = grantingCie === year;
              const cTheme = cieConsoleThemes[year];

              return (
                <div 
                  key={year}
                  className={`relative overflow-hidden bg-zinc-950/60 border rounded-xl flex flex-col justify-between items-start p-3 gap-3 transition-all ${cTheme.border} ${cTheme.glow}`}
                >
                  {/* Neon top stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${cTheme.topStripe}`} />

                  {/* Year spec & status LEDs */}
                  <div className="w-full space-y-1">
                    <div className="flex justify-between items-center w-full">
                      <h4 className="text-[10px] font-black font-mono tracking-widest text-zinc-400">
                        YEAR 0{year}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                      </div>
                    </div>

                    {isLocked && (
                      <div className="w-full mt-0.5 animate-in fade-in duration-200">
                        <div className="text-[7.5px] font-mono font-bold text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded px-1.5 py-0.5 uppercase tracking-wider block text-center">
                          COOLDOWN: {lockDays}D
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High performance dispatch button */}
                  <Button
                    disabled={isLocked || isPending}
                    onClick={() => handleTriggerYearCIEBonus(year)}
                    className={`w-full text-[8.5px] font-black font-mono tracking-wider rounded-lg h-7.5 uppercase transition-all shadow-md ${
                      isLocked 
                        ? "bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed" 
                        : `bg-gradient-to-r ${cTheme.btnGradient} text-white hover:scale-[1.02]`
                    }`}
                  >
                    {isPending ? "DISPATCHING..." : isLocked ? "SYS LOCKED" : "DISPATCH SKIP"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full bg-zinc-900/30" />
          <Skeleton className="h-32 w-full bg-zinc-900/30" />
        </div>
      ) : !meeting ? (
        <div className="text-center py-8 border border-zinc-850 rounded-xl bg-zinc-900/5 space-y-1">
          <RiCalendarEventLine className="w-6 h-6 text-zinc-655 mx-auto" />
          <p className="text-[11px] font-bold text-zinc-400">No session logs resolved.</p>
        </div>
      ) : (
        <>
          {/* Active Meeting Banner: Meeting Name & Present Count inline in same row */}
          <div className="p-3 bg-zinc-900/20 border border-zinc-850 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
              <div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-wider">
                  Active: {meeting.title}
                </h3>
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-850/60 px-2.5 py-1 rounded-lg text-right">
              <span className="text-[9px] font-black text-emerald-400">
                {presentCount} / {members.length} Present
              </span>
            </div>
          </div>

          {/* Members search & filters */}
          <div className="space-y-2">
            <Input 
              placeholder="Search session participants..."
              className="bg-zinc-900 border-zinc-800 text-[11px] rounded-lg h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Flat sorted student list with year color themes (1st -> 2nd -> 3rd -> 4th) */}
            <div className="space-y-1.5">
              {sortedMembers.map((student) => {
                const localState = localAttendance[student.id] || { present: null, used_skip_token: false, override_note: null };
                const isBlocked = student.has_cie_bonus === true;

                const yr = student.year ? String(student.year) : "Unassigned";
                const theme = yearThemes[yr] || yearThemes["Unassigned"];

                // Base card styles with year specific borders and background tints
                let cardStyle = `border border-l-2 ${theme.border} ${theme.bg} ${theme.hoverBorder}`;
                let statusBadge = (
                  <span className="text-[7px] font-black uppercase text-zinc-550 tracking-wider flex items-center gap-0.5">
                    <RiCheckboxBlankCircleLine className="w-3 h-3 text-zinc-650" />
                    Unmarked
                  </span>
                );

                if (localState.present === true) {
                  cardStyle = "border border-l-2 border-emerald-500/30 bg-emerald-955/10 hover:bg-emerald-955/15 hover:border-emerald-500/40";
                  statusBadge = (
                    <span className="text-[7px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-0.5">
                      <RiCheckboxCircleFill className="w-3 h-3 text-emerald-500" />
                      Present
                    </span>
                  );
                } else if (localState.present === false) {
                  cardStyle = "border border-l-2 border-red-500/30 bg-red-955/10 hover:bg-red-955/15 hover:border-red-500/40";
                  statusBadge = (
                    <span className="text-[7px] font-black uppercase text-red-400 tracking-wider flex items-center gap-0.5">
                      <RiCloseCircleFill className="w-3 h-3 text-red-500" />
                      Absent
                    </span>
                  );
                }

                return (
                  <div 
                    key={student.id} 
                    onClick={() => handleRowTap(student.id)}
                    className={`p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none ${cardStyle} ${theme.stripe} ${
                      isBlocked ? "opacity-35 saturate-20 pointer-events-none cursor-not-allowed border-zinc-850 bg-zinc-950/10 border-dashed" : ""
                    }`}
                  >
                    
                    {/* Left: Profile specs */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 border border-zinc-800">
                        <AvatarImage src={student.avatar_url || undefined} />
                        <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[10px] font-bold">
                          {student.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[11px] font-black text-white leading-none">{student.name}</h4>
                          {localState.override_note && (
                            <Badge className="bg-amber-955 text-amber-400 border border-amber-900/20 text-[6px] px-0.5 h-3 font-bold uppercase">
                              NOTE
                            </Badge>
                          )}
                        </div>
                        <p className="text-[8px] text-zinc-555 mt-0.5">
                          {student.branch || "Unassigned"} • Year {student.year || "?"} • Skips: <span className="text-amber-500 font-bold">{student.skip_tokens}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions or lock states */}
                    <div className="flex items-center gap-2 self-center">
                      {isBlocked ? (
                        <div className="flex items-center gap-0.5 text-zinc-650 bg-zinc-950/30 px-1.5 py-0.5 rounded border border-zinc-900/40 text-[6px] font-black uppercase tracking-wider">
                          <RiLockLine className="w-2.5 h-2.5 text-amber-500/65 animate-pulse" />
                          <span>Locked</span>
                        </div>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-6 px-1.5 rounded text-[7px] font-black border-zinc-855 text-zinc-455 hover:bg-zinc-900"
                            onClick={(e) => openOverrideSheet(e, student)}
                          >
                            Note
                          </Button>
                          <div className="bg-zinc-950/45 border border-zinc-850/30 px-2 py-0.5 rounded-lg">
                            {statusBadge}
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Override note BottomSheet */}
      <BottomSheet isOpen={isOverrideOpen} onClose={() => setIsOverrideOpen(false)}>
        {overrideStudent && (
          <div className="space-y-3">
            <div className="text-center space-y-0.5">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Override Note</h3>
              <p className="text-[9px] text-zinc-555">Record explanation for {overrideStudent.name}</p>
            </div>

            <div className="space-y-2">
              <Textarea 
                placeholder="e.g. Approved medical leave / skip applied"
                className="bg-zinc-900 border-zinc-800 text-[11px] rounded-lg h-20 p-2.5"
                value={overrideNoteText}
                onChange={(e: any) => setOverrideNoteText(e.target.value)}
              />

              <div className="flex gap-1.5">
                <Button 
                  variant="outline"
                  className="flex-1 rounded-lg h-9 border-zinc-800 text-[11px] text-zinc-400"
                  onClick={() => setIsOverrideOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-emerald-650 hover:bg-emerald-500 text-white rounded-lg h-9 text-[11px] font-black"
                  onClick={submitOverrideNote}
                >
                  Confirm Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Sleek bottom sticky bar for unsaved changes with premium green buttons */}
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%] max-w-lg bg-zinc-950 border border-zinc-800/80 shadow-2xl shadow-emerald-950/10 p-2.5 rounded-xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[9px]">
              <span className="font-black text-white block">Unsaved updates</span>
              <span className="text-zinc-555">Modified locally</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded text-[9px] font-bold border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              onClick={() => fetchAttendanceData(selectedMeetingId)}
            >
              Reset
            </Button>
            <Button
              size="sm"
              className="h-7 rounded text-[9px] font-black bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={handleSaveAttendance}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
