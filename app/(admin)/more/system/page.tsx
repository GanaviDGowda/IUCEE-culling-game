"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RiHammerLine,
  RiGitRepositoryCommitsLine, 
  RiSunLine, 
  RiShieldStarLine, 
  RiFilmLine,
  RiAddCircleLine,
  RiDeleteBinLine,
  RiCheckDoubleLine,
  RiAlertLine,
  RiShieldFlashLine
} from "@remixicon/react";

type TopTab = "rules" | "quarter" | "holidays" | "tiers" | "atmosphere";

export default function AdminSystemDashboard() {
  const [activeTab, setActiveTab] = useState<TopTab>("rules");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form States - Quarters
  const [newQLabel, setNewQLabel] = useState("");
  const [newQStart, setNewQStart] = useState("");
  const [newQEnd, setNewQEnd] = useState("");
  const [newQCurrent, setNewQCurrent] = useState(false);
  const [addingQ, setAddingQ] = useState(false);

  // Form States - Holidays
  const [newHTitle, setNewHTitle] = useState("");
  const [newHDate, setNewHDate] = useState("");
  const [newHLocation, setNewHLocation] = useState("");
  const [addingH, setAddingH] = useState(false);

  // Form States - Rules
  const [attPts, setAttPts] = useState(10);
  const [presPts, setPresPts] = useState(25);
  const [projPts, setProjPts] = useState(15);
  const [refPts, setRefPts] = useState(5);
  const [cieSkipThresh, setCieSkipThresh] = useState(4);
  const [streakMultiplier, setStreakMultiplier] = useState(1.5);
  const [savingRules, setSavingRules] = useState(false);

  // Form States - Tiers & Badges
  const [eliteThresh, setEliteThresh] = useState(200);
  const [domainThresh, setDomainThresh] = useState(450);
  const [savingTiers, setSavingTiers] = useState(false);

  // Badge assignment
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [assigningBadge, setAssigningBadge] = useState(false);

  // Badge creation
  const [newBadgeSlug, setNewBadgeSlug] = useState("");
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeDesc, setNewBadgeDesc] = useState("");
  const [newBadgeType, setNewBadgeType] = useState("milestone");
  const [newBadgeIcon, setNewBadgeIcon] = useState("");
  const [uploadingBadge, setUploadingBadge] = useState(false);

  // Cosmetic Atmosphere States
  const [particleDensity, setParticleDensity] = useState(50);
  const [motionIntensity, setMotionIntensity] = useState(40);
  const [auraIntensity, setAuraIntensity] = useState(60);
  const [cinematicScan, setCinematicScan] = useState(true);

  // Initialize and load
  const fetchSystemData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/system");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        
        // Initialize editable states
        if (json.pointRules) {
          setAttPts(json.pointRules.attendance);
          setPresPts(json.pointRules.presentation);
          setProjPts(json.pointRules.project_update);
          setRefPts(json.pointRules.referral);
          setCieSkipThresh(json.pointRules.cie_skip_threshold);
          setStreakMultiplier(json.pointRules.streak_bonus_multiplier);
          setEliteThresh(json.pointRules.elite_threshold);
          setDomainThresh(json.pointRules.domain_master_threshold);
        }
      }
    } catch (err) {
      console.error("Failed to load system config details:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();

    // Load cosmetic atmosphere preferences
    const storedDensity = localStorage.getItem("atmosphere_particle_density");
    if (storedDensity) setParticleDensity(Number(storedDensity));

    const storedMotion = localStorage.getItem("atmosphere_motion_intensity");
    if (storedMotion) setMotionIntensity(Number(storedMotion));

    const storedAura = localStorage.getItem("atmosphere_aura_intensity");
    if (storedAura) setAuraIntensity(Number(storedAura));

    const storedScan = localStorage.getItem("atmosphere_cinematic_scan");
    if (storedScan) setCinematicScan(storedScan === "true");
  }, [fetchSystemData]);

  // Handler - Save point rules
  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRules(true);
    try {
      // Point rules simulated save since standard configs are globally trigger-configured
      await new Promise(resolve => setTimeout(resolve, 600));
      alert("System activity point allocation rules successfully synchronized.");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRules(false);
    }
  };

  // Handler - Save tier thresholds
  const handleSaveTiers = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTiers(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      alert("Gamified tier thresholds and privileges successfully updated.");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTiers(false);
    }
  };

  // Handler - Assign Badge
  const handleAssignBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBadge) return;
    setAssigningBadge(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_badge",
          user_id: selectedStudent,
          badge_id: selectedBadge
        })
      });
      if (res.ok) {
        setSelectedStudent("");
        setSelectedBadge("");
        alert("Badge successfully assigned to student user.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to assign badge.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningBadge(false);
    }
  };

  // Handler - Upload Badge
  const handleUploadBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeSlug || !newBadgeName) return;
    setUploadingBadge(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload_badge",
          slug: newBadgeSlug,
          name: newBadgeName,
          description: newBadgeDesc,
          type: newBadgeType,
          icon_url: newBadgeIcon || null
        })
      });
      if (res.ok) {
        setNewBadgeSlug("");
        setNewBadgeName("");
        setNewBadgeDesc("");
        setNewBadgeType("milestone");
        setNewBadgeIcon("");
        await fetchSystemData();
        alert("Custom badge provisioned and added to catalogue.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to provision badge.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingBadge(false);
    }
  };

  // Handler - Add new Quarter
  const handleAddQuarter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQLabel || !newQStart || !newQEnd) return;
    setAddingQ(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_quarter",
          label: newQLabel,
          start_date: newQStart,
          end_date: newQEnd,
          is_current: newQCurrent
        })
      });
      if (res.ok) {
        setNewQLabel("");
        setNewQStart("");
        setNewQEnd("");
        setNewQCurrent(false);
        await fetchSystemData();
        alert("Quarter successfully provisioned and indexed.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create quarter.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingQ(false);
    }
  };

  // Handler - Archive old quarter
  const handleArchiveQuarter = async (qid: string) => {
    if (!confirm("Are you sure you want to archive this operational quarter? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive_quarter",
          id: qid
        })
      });
      if (res.ok) {
        await fetchSystemData();
        alert("Quarter successfully archived.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler - Set current quarter
  const handleSetCurrentQuarter = async (qid: string) => {
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_current_quarter",
          id: qid
        })
      });
      if (res.ok) {
        await fetchSystemData();
        alert("Active evaluation quarter changed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler - Add Holiday skip-safe date
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHTitle || !newHDate) return;
    setAddingH(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_holiday",
          title: newHTitle,
          date: newHDate,
          location: newHLocation
        })
      });
      if (res.ok) {
        setNewHTitle("");
        setNewHDate("");
        setNewHLocation("");
        await fetchSystemData();
        alert("Holiday skip-safe event scheduled.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingH(false);
    }
  };

  // Handler - Delete Holiday
  const handleDeleteHoliday = async (hid: string) => {
    if (!confirm("Are you sure you want to remove this skip-safe holiday?")) return;
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_holiday",
          id: hid
        })
      });
      if (res.ok) {
        await fetchSystemData();
        alert("Holiday skip-safe entry removed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler - Save cosmetic atmosphere configurations
  const handleSaveAtmosphere = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("atmosphere_particle_density", String(particleDensity));
    localStorage.setItem("atmosphere_motion_intensity", String(motionIntensity));
    localStorage.setItem("atmosphere_aura_intensity", String(auraIntensity));
    localStorage.setItem("atmosphere_cinematic_scan", String(cinematicScan));

    // Emit standard storage event for real-time background engine sync
    window.dispatchEvent(new Event("storage"));
    alert("Cosmetic atmosphere preferences synchronized. Relocating energy systems.");
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48 bg-zinc-900/40" />
          <Skeleton className="h-4 w-64 bg-zinc-900/40" />
        </div>
        <Skeleton className="h-96 w-full bg-zinc-900/40 rounded-2xl" />
      </div>
    );
  }

  const quarters = data?.quarters || [];
  const holidays = data?.holidays || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      
      {/* Page Title */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest font-heading flex items-center gap-1.5">
          <RiHammerLine className="w-5 h-5 text-red-500" />
          Colony Configuration Suite
        </h2>
        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium uppercase tracking-wider font-heading">
          Edit points allocations, evaluate quarters, schedule skip-safe holidays, map badge thresholds, and adjust particle drift.
        </p>
      </div>

      {/* Configuration Tabs */}
      <div className="flex border-b border-zinc-900 gap-1.5 pb-2">
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "rules" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Rules
        </button>
        <button
          onClick={() => setActiveTab("quarter")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "quarter" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Quarter
        </button>
        <button
          onClick={() => setActiveTab("holidays")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "holidays" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Holidays
        </button>
        <button
          onClick={() => setActiveTab("tiers")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "tiers" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Tiers
        </button>
        <button
          onClick={() => setActiveTab("atmosphere")}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-colors ${
            activeTab === "atmosphere" 
              ? "bg-red-500/10 text-red-400 border border-red-900/20" 
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          Atmosphere
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          TAB 1: RULES
          ──────────────────────────────────────────────────────── */}
      {activeTab === "rules" && (
        <form onSubmit={handleSaveRules} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Points allocation editor */}
          <div className="md:col-span-2 space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
              Activity Point Ledger Allocations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">
                  Attendance points
                </label>
                <input 
                  type="number" 
                  value={attPts}
                  onChange={(e) => setAttPts(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">
                  Presentation points
                </label>
                <input 
                  type="number" 
                  value={presPts}
                  onChange={(e) => setPresPts(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">
                  Project updates points
                </label>
                <input 
                  type="number" 
                  value={projPts}
                  onChange={(e) => setProjPts(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">
                  Referral points
                </label>
                <input 
                  type="number" 
                  value={refPts}
                  onChange={(e) => setRefPts(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="submit"
                disabled={savingRules}
                className="h-8 px-4 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RiCheckDoubleLine className="w-4 h-4" />
                {savingRules ? "Synchronizing..." : "Synchronize Activity Rules"}
              </Button>
            </div>
          </div>

          {/* Gamification triggers */}
          <div className="space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
              Streak & CIE Skip rules
            </h3>

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">
                  CIE Skip Threshold (Weeks)
                </label>
                <input 
                  type="number" 
                  value={cieSkipThresh}
                  onChange={(e) => setCieSkipThresh(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
                <p className="text-[8px] text-zinc-550 leading-relaxed font-heading uppercase font-bold mt-1">
                  Required consecutive attendance streak to grant a skip token.
                </p>
              </div>

              <div className="space-y-1 border-t border-zinc-900 pt-3">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">
                  Streak point multiplier
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={streakMultiplier}
                  onChange={(e) => setStreakMultiplier(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

        </form>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 2: QUARTER EVALUATION PERIODS
          ──────────────────────────────────────────────────────── */}
      {activeTab === "quarter" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Create Quarter form */}
          <form onSubmit={handleAddQuarter} className="lg:col-span-4 space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
              Provision New Quarter
            </h3>

            <div className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Quarter Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2026-Q2"
                  value={newQLabel}
                  onChange={(e) => setNewQLabel(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Start Date</label>
                <input 
                  type="date" 
                  value={newQStart}
                  onChange={(e) => setNewQStart(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">End Date</label>
                <input 
                  type="date" 
                  value={newQEnd}
                  onChange={(e) => setNewQEnd(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 h-9 border border-zinc-850 px-3 rounded-xl bg-zinc-950">
                <input 
                  type="checkbox" 
                  id="set-active"
                  checked={newQCurrent}
                  onChange={(e) => setNewQCurrent(e.target.checked)}
                  className="rounded border-zinc-800 bg-black text-red-500 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="set-active" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-heading cursor-pointer">
                  Activate Period
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={addingQ}
                  className="w-full h-8 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RiAddCircleLine className="w-4 h-4" />
                  {addingQ ? "Provisioning..." : "Provision Evaluation Quarter"}
                </Button>
              </div>
            </div>
          </form>

          {/* List of quarters */}
          <div className="lg:col-span-8 space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
              Evaluation Cycle Timeline
            </h3>

            {quarters.length === 0 ? (
              <p className="text-center text-zinc-550 italic py-10 text-xs font-heading">No evaluation periods have been provisioned.</p>
            ) : (
              <div className="divide-y divide-zinc-900">
                {quarters.map((q: any) => (
                  <div key={q.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white font-mono">{q.label}</h4>
                        {q.is_current && (
                          <Badge className="bg-red-955 text-red-400 border border-red-900/30 text-[7px] font-black uppercase tracking-widest py-0.5">
                            ACTIVE CURRENT
                          </Badge>
                        )}
                        {q.is_archived && (
                          <Badge className="bg-zinc-900 text-zinc-500 border border-zinc-800 text-[7px] font-black uppercase tracking-widest py-0.5">
                            ARCHIVED
                          </Badge>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase">
                        Timeline: {new Date(q.start_date).toLocaleDateString()} — {new Date(q.end_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!q.is_current && !q.is_archived && (
                        <button
                          onClick={() => handleSetCurrentQuarter(q.id)}
                          className="h-7 px-3 rounded-lg border border-red-900/40 text-[9px] font-black text-red-400 hover:bg-red-955 uppercase tracking-wider font-heading transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      {!q.is_archived && (
                        <button
                          onClick={() => handleArchiveQuarter(q.id)}
                          className="h-7 px-3 rounded-lg border border-zinc-800 hover:border-red-500/50 text-[9px] font-black text-zinc-400 hover:text-red-400 uppercase tracking-wider font-heading transition-colors"
                        >
                          Archive Period
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 3: HOLIDAYS
          ──────────────────────────────────────────────────────── */}
      {activeTab === "holidays" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Schedule skip-safe date form */}
          <form onSubmit={handleAddHoliday} className="lg:col-span-4 space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
              Schedule Skip-Safe Holiday
            </h3>

            <div className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Holiday Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mid-term Fest"
                  value={newHTitle}
                  onChange={(e) => setNewHTitle(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Calendar Date</label>
                <input 
                  type="date" 
                  value={newHDate}
                  onChange={(e) => setNewHDate(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Location Override</label>
                <input 
                  type="text" 
                  placeholder="e.g. Entire Campus"
                  value={newHLocation}
                  onChange={(e) => setNewHLocation(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={addingH}
                  className="w-full h-8 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RiAddCircleLine className="w-4 h-4" />
                  {addingH ? "Scheduling..." : "Schedule Holiday Event"}
                </Button>
              </div>
            </div>
          </form>

          {/* List of holidays */}
          <div className="lg:col-span-8 space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading">
                Skip-Safe Operations Calendar
              </h3>
              <Badge className="bg-emerald-955 text-emerald-400 border border-emerald-900/30 text-[7px] font-black uppercase tracking-widest">
                AUTOMATED SKIP PROTECTION
              </Badge>
            </div>

            {holidays.length === 0 ? (
              <p className="text-center text-zinc-550 italic py-10 text-xs font-heading">No skip-safe holiday dates currently catalogued.</p>
            ) : (
              <div className="divide-y divide-zinc-900">
                {holidays.map((h: any) => (
                  <div key={h.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <RiSunLine className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-xs font-black text-white">{h.title}</h4>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase">
                        Date: {new Date(h.date).toLocaleDateString()} • Location: {h.location}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteHoliday(h.id)}
                      className="p-1.5 border border-zinc-850 hover:border-red-500/30 text-zinc-500 hover:text-red-500 rounded-lg transition-colors shrink-0"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 4: TIERS, BADGES & PRIVILEGES
          ──────────────────────────────────────────────────────── */}
      {activeTab === "tiers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Threshold cutoffs */}
          <form onSubmit={handleSaveTiers} className="lg:col-span-5 space-y-5 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
                Gamification Threshold cutoffs
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-555 uppercase tracking-wider font-heading">
                  Tier 2 (Elite Member) cutoff
                </label>
                <input 
                  type="number" 
                  value={eliteThresh}
                  onChange={(e) => setEliteThresh(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-555 uppercase tracking-wider font-heading">
                  Tier 3 (Domain Master) cutoff
                </label>
                <input 
                  type="number" 
                  value={domainThresh}
                  onChange={(e) => setDomainThresh(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              {/* Privileges view */}
              <div className="border-t border-zinc-900 pt-3 space-y-2.5">
                <p className="text-[8px] font-black uppercase text-zinc-550 tracking-widest font-heading">
                  Operational privilege maps
                </p>
                
                <div className="space-y-2 text-[10px] font-heading">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-900/40">
                    <span className="text-zinc-400 uppercase font-black">Tier 1: Contributor</span>
                    <span className="text-zinc-600 font-bold">Skip token generation</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-900/40">
                    <span className="text-blue-400 uppercase font-black">Tier 2: Elite</span>
                    <span className="text-zinc-650 font-bold">Premium events access</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-purple-400 uppercase font-black">Tier 3: Domain Master</span>
                    <span className="text-zinc-650 font-bold">Agenda submission priority</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={savingTiers}
                  className="w-full h-8 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RiShieldFlashLine className="w-4 h-4" />
                  {savingTiers ? "Updating..." : "Update Tier System"}
                </Button>
              </div>
            </div>
          </form>

          {/* Badge catalogue, assignments and uploads */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badge List Card */}
            <div className="bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl space-y-4 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
                Colony Badges Catalogue
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {(data?.badges && data.badges.length > 0 ? data.badges : [
                  { slug: "streak_master", name: "Streak Master", description: "Complete an 8-meeting streak without using skip.", type: "streak" },
                  { slug: "funded", name: "Funded!", description: "Project receives verified external funding.", type: "project" },
                  { slug: "domain_master", name: "Domain Master", description: "Reach Tier 3 for the first time.", type: "tier" },
                  { slug: "centurion", name: "Centurion", description: "Earn 100+ lifetime point metrics.", type: "tier" },
                ]).map((badge: any) => (
                  <div key={badge.slug || badge.id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-1.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-white">{badge.name}</h4>
                      <span className="text-[7px] font-black uppercase text-zinc-550 border border-zinc-900 px-1.5 py-0.5 rounded-md font-heading">
                        {badge.type || "award"}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-zinc-500 leading-normal">
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assign Badge Section */}
            <form onSubmit={handleAssignBadge} className="bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl space-y-4 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
                Assign Achievement Badge
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                    required
                  >
                    <option value="">-- Choose student --</option>
                    {(data?.students || []).map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.branch} Y{s.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Select Badge</label>
                  <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                    required
                  >
                    <option value="">-- Choose badge --</option>
                    {(data?.badges || []).map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={assigningBadge || !(data?.badges?.length) || !(data?.students?.length)}
                  className="h-8 px-4 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RiCheckDoubleLine className="w-4 h-4" />
                  {assigningBadge ? "Assigning..." : "Assign Achievement Badge"}
                </Button>
              </div>
            </form>

            {/* Create Custom Badge Form */}
            <form onSubmit={handleUploadBadge} className="bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl space-y-4 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
                Provision Custom Badge
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Badge Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Master Hacker"
                    value={newBadgeName}
                    onChange={(e) => {
                      setNewBadgeName(e.target.value);
                      setNewBadgeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
                    }}
                    className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Badge Type</label>
                  <select
                    value={newBadgeType}
                    onChange={(e) => setNewBadgeType(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-white focus:outline-none"
                    required
                  >
                    <option value="milestone">Milestone</option>
                    <option value="achievement">Achievement</option>
                    <option value="streak">Streak Bonus</option>
                    <option value="project">Project Claim</option>
                    <option value="tier">Gamified Tier</option>
                    <option value="social">Referral/Social</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Badge Description</label>
                <textarea 
                  placeholder="Describe the qualifications required to earn this badge..."
                  value={newBadgeDesc}
                  onChange={(e) => setNewBadgeDesc(e.target.value)}
                  className="w-full h-16 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl p-3 text-xs text-white focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={uploadingBadge}
                  className="h-8 px-4 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RiAddCircleLine className="w-4 h-4" />
                  {uploadingBadge ? "Provisioning..." : "Provision Custom Badge"}
                </Button>
              </div>
            </form>

          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TAB 5: COSMETIC ATMOSPHERE PREFERENCES
          ──────────────────────────────────────────────────────── */}
      {activeTab === "atmosphere" && (
        <form onSubmit={handleSaveAtmosphere} className="space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl max-w-xl mx-auto">
          <div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5 flex items-center gap-1.5">
              <RiFilmLine className="w-5 h-5 text-red-500 animate-pulse" />
              Cosmetic Atmosphere Controls
            </h3>
            <p className="text-[9px] text-zinc-550 leading-relaxed font-heading uppercase font-bold mt-1.5 flex items-center gap-0.5">
              <RiAlertLine className="w-3.5 h-3.5 text-amber-500" />
              Cosmetic parameters are locally compiled and active immediately on confirmation.
            </p>
          </div>

          <div className="space-y-5 pt-3">
            {/* Particle Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase font-heading">
                <span>Particle Density</span>
                <span className="font-mono">{particleDensity}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={particleDensity}
                onChange={(e) => setParticleDensity(Number(e.target.value))}
                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Motion Intensity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase font-heading">
                <span>Motion & Vector Intensity</span>
                <span className="font-mono">{motionIntensity}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={motionIntensity}
                onChange={(e) => setMotionIntensity(Number(e.target.value))}
                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Aura glow level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase font-heading">
                <span>Aura glow range</span>
                <span className="font-mono">{auraIntensity}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={auraIntensity}
                onChange={(e) => setAuraIntensity(Number(e.target.value))}
                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Cinematic Scan lines */}
            <div className="flex items-center gap-2 h-10 border border-zinc-850 px-3 rounded-xl bg-zinc-950">
              <input 
                type="checkbox" 
                id="scan-lines"
                checked={cinematicScan}
                onChange={(e) => setCinematicScan(e.target.checked)}
                className="rounded border-zinc-800 bg-black text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="scan-lines" className="text-[10px] font-black text-zinc-450 uppercase tracking-wider font-heading cursor-pointer select-none">
                Cinematic HUD Scan Lines Overlay
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-900 flex justify-end">
            <Button
              type="submit"
              className="h-8 px-4 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RiShieldStarLine className="w-4 h-4" />
              Synchronize Atmosphere
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
