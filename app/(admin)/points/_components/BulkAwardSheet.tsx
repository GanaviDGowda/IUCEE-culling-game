"use client";

import { useState, useEffect } from "react";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BULK_POINT_RULES } from "@/lib/points";
import { 
  RiUserSearchLine, 
  RiCheckDoubleLine,
  RiArrowLeftSLine,
  RiGroupLine
} from "@remixicon/react";

interface BulkAwardSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const POINT_TYPES = BULK_POINT_RULES;

interface Student {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
}

export function BulkAwardSheet({ isOpen, onClose }: BulkAwardSheetProps) {
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk transaction states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [activityType, setActivityType] = useState("manual_award");
  const [pointsVal, setPointsVal] = useState("10");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error", text: string } | null>(null);

  async function fetchStudents() {
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/admin/members?status=All");
      const data = await res.json();
      setStudents(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(1);
      setSelectedStudentIds([]);
      setNote("");
      setActivityType(POINT_TYPES[0]?.type || "manual_award");
      setPointsVal(String(POINT_TYPES[0]?.defaultPoints || 10));
      fetchStudents();
    }
  }, [isOpen]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      // Deselect all
      setSelectedStudentIds([]);
    } else {
      // Select all filtered
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const handleConfirmBulk = async () => {
    if (selectedStudentIds.length === 0 || !pointsVal || !activityType) return;
    setSubmitting(true);
    setToastMsg(null);
    try {
      const numPoints = parseInt(pointsVal, 10);
      const res = await fetch("/api/admin/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: selectedStudentIds,
          points: numPoints,
          type: activityType,
          note: note || `Bulk points allocation: +${numPoints}`
        })
      });

      if (res.ok) {
        setToastMsg({ type: "success", text: `Successfully allocated points to ${selectedStudentIds.length} members!` });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const data = await res.json();
        setToastMsg({ type: "error", text: data.error || "Bulk transaction failed." });
      }
    } catch {
      setToastMsg({ type: "error", text: "Network connection error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto scrollbar-none pb-4">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="p-1 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white"
              >
                <RiArrowLeftSLine className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Bulk Award Points</h3>
          </div>
          <span className="text-[10px] font-black text-zinc-550">STEP {step} OF 5</span>
        </div>

        {/* Global Toast inside sheet */}
        {toastMsg && (
          <div className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
            toastMsg.type === "success" 
              ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
              : "bg-red-950/20 border-red-900/30 text-red-400"
          }`}>
            {toastMsg.text}
          </div>
        )}

        {/* STEP 1: Search & Check Multiple Players */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div className="relative flex-1">
                <RiUserSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search players..."
                  className="bg-zinc-900 border-zinc-800 text-xs pl-10 rounded-xl h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSelectAll}
                variant="outline"
                className="h-11 rounded-xl text-[10px] font-bold border-zinc-850 hover:bg-zinc-900"
              >
                {selectedStudentIds.length === filteredStudents.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none">
              {loadingStudents ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full bg-zinc-900" />
                  <Skeleton className="h-10 w-full bg-zinc-900" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-[11px] text-zinc-500 text-center py-4">No matching players found.</p>
              ) : (
                filteredStudents.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <button
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`w-full p-2.5 border rounded-xl flex items-center justify-between text-left transition-colors ${
                        isChecked 
                          ? "bg-red-500/5 border-red-500/20" 
                          : "bg-transparent border-transparent hover:bg-zinc-900/60 hover:border-zinc-850"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 border border-zinc-800">
                          <AvatarImage src={student.avatar_url || undefined} />
                          <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[10px] font-bold">
                            {student.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{student.name}</h4>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{student.email}</p>
                        </div>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                        isChecked ? "bg-red-650 border-red-500 text-white" : "border-zinc-700 bg-zinc-900"
                      }`}>
                        {isChecked && <RiCheckDoubleLine className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <Button 
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black flex items-center justify-center gap-2"
              onClick={() => setStep(2)}
              disabled={selectedStudentIds.length === 0}
            >
              Next ({selectedStudentIds.length} Selected)
            </Button>
          </div>
        )}

        {/* STEP 2: Select Activity Type */}
        {step === 2 && (
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Select Activity Classification</label>
            <div className="grid gap-2">
              {POINT_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => {
                    setActivityType(type.type);
                    setPointsVal(String(type.defaultPoints));
                    setStep(3);
                  }}
                  className={`w-full p-3 border rounded-xl text-left text-xs font-bold transition-all ${
                    activityType === type.type 
                      ? "bg-red-500/10 border-red-500/30 text-red-400" 
                      : "bg-zinc-900/40 border-zinc-850 text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <span className="block">{type.label}</span>
                  <span className="mt-1 block text-[10px] font-medium text-zinc-500">{type.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Enter Points Value */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Points Magnitude</label>
              <Input
                type="number"
                placeholder="e.g. 15"
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3"
                value={pointsVal}
                onChange={(e) => setPointsVal(e.target.value)}
              />
              <p className="text-[10px] text-zinc-550">
                Specify points to be awarded to each selected member record simultaneously.
              </p>
            </div>
            <Button 
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
              onClick={() => setStep(4)}
              disabled={!pointsVal}
            >
              Continue
            </Button>
          </div>
        )}

        {/* STEP 4: Add Mandated Review Note */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Mandatory Explanation / Description</label>
              <Textarea
                placeholder="Reason or activity notes..."
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-24 p-3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button 
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
              onClick={() => setStep(5)}
            >
              Review Details
            </Button>
          </div>
        )}

        {/* STEP 5: Confirm & Dispatch */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <RiGroupLine className="w-5 h-5 text-red-500" />
                <span className="text-xs font-bold text-white">{selectedStudentIds.length} Members Targeted</span>
              </div>
              
              <div className="h-px bg-zinc-850" />
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-black text-zinc-550 block">Activity</span>
                  <span className="font-bold text-white capitalize">{activityType.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-zinc-550 block">Balance Delta Per Member</span>
                  <span className="font-black text-emerald-400">+{pointsVal} Points</span>
                </div>
              </div>
              
              {note && (
                <div className="pt-2">
                  <span className="text-[9px] uppercase font-black text-zinc-550 block">Attached Note</span>
                  <p className="text-[11px] text-zinc-400 leading-snug mt-0.5 italic">&quot;{note}&quot;</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black flex items-center justify-center gap-2"
              onClick={handleConfirmBulk}
              disabled={submitting}
            >
              {submitting ? "Processing Bulk Award..." : "Confirm & Commit Bulk Award"}
            </Button>
          </div>
        )}

      </div>
    </BottomSheet>
  );
}
