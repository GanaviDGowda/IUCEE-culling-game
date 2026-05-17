"use client";

import { useState, useEffect } from "react";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_POINT_RULES } from "@/lib/points";
import { 
  RiUserSearchLine, 
  RiArrowLeftSLine
} from "@remixicon/react";

interface AwardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "award" | "deduction";
}

const POINT_TYPES = ADMIN_POINT_RULES;

interface Student {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
}

export function AwardSheet({ isOpen, onClose, initialMode }: AwardSheetProps) {
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Transaction form states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activityType, setActivityType] = useState("manual_award");
  const [pointsVal, setPointsVal] = useState("");
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
      setSelectedStudent(null);
      setNote("");
      if (initialMode === "deduction") {
        setActivityType("manual_adjustment");
        setPointsVal("10");
      } else {
        const defaultRule = POINT_TYPES.find((rule) => rule.direction === "award");
        setActivityType(defaultRule?.type || "manual_award");
        setPointsVal(String(defaultRule?.defaultPoints || 10));
      }
      fetchStudents();
    }
  }, [isOpen, initialMode]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    if (initialMode === "deduction") {
      setActivityType("manual_adjustment");
      setStep(3); // Skip step 2 (Select Activity Type) for deductions
    } else {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selectedStudent || !pointsVal || !activityType) return;
    setSubmitting(true);
    setToastMsg(null);
    try {
      const numPoints = parseInt(pointsVal, 10);
      const finalPoints = initialMode === "deduction" ? -Math.abs(numPoints) : numPoints;
      const res = await fetch("/api/admin/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedStudent.id,
          points: finalPoints,
          type: activityType,
          note: note || `${initialMode === "deduction" ? "Deduction penalty" : "Points award"}: ${finalPoints >= 0 ? "+" : ""}${finalPoints}`
        })
      });

      if (res.ok) {
        setToastMsg({ type: "success", text: "Points transaction processed successfully!" });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const errorData = await res.json();
        setToastMsg({ type: "error", text: errorData.error || "Failed to process transaction." });
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
                onClick={() => {
                  if (step === 3 && initialMode === "deduction") {
                    setStep(1); // Go back directly to student selection
                  } else {
                    setStep(step - 1);
                  }
                }}
                className="p-1 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white"
              >
                <RiArrowLeftSLine className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {initialMode === "deduction" ? "Subtract Energy" : "Award Points"}
            </h3>
          </div>
          <span className="text-[10px] font-black text-zinc-550">
            STEP {step} OF {initialMode === "deduction" ? "5 (SKIPPED 2)" : "5"}
          </span>
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

        {/* STEP 1: Search & Select Player */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="relative">
              <RiUserSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search players by name or email..."
                className="bg-zinc-900 border-zinc-800 text-xs pl-10 rounded-xl h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="w-full p-2.5 hover:bg-zinc-900/60 border border-transparent hover:border-zinc-850 rounded-xl flex items-center justify-between text-left transition-colors"
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
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Select Activity Type (Awards Only) */}
        {step === 2 && initialMode !== "deduction" && (
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
                  <span className="mt-1 block text-[10px] font-medium text-zinc-550">{type.description}</span>
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
                placeholder="e.g. 10"
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3"
                value={pointsVal}
                onChange={(e) => setPointsVal(e.target.value)}
              />
              <p className="text-[10px] text-zinc-500 leading-snug">
                {initialMode === "deduction" 
                  ? "Enter the positive amount of points you want to subtract from this member's balance." 
                  : "Enter the positive amount of points you want to award to this member."
                }
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
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                {initialMode === "deduction" ? "Reason for Deduction (Required)" : "Mandatory Explanation / Description"}
              </label>
              <Textarea
                placeholder={initialMode === "deduction" ? "e.g. Missed phase 1 submission deadline" : "Reason or activity notes..."}
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-24 p-3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button 
              className="w-full bg-red-650 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
              onClick={() => setStep(5)}
              disabled={initialMode === "deduction" && !note.trim()}
            >
              Review Details
            </Button>
          </div>
        )}

        {/* STEP 5: Confirm & Dispatch */}
        {step === 5 && selectedStudent && (
          <div className="space-y-4">
            <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-9 h-9 border border-zinc-800">
                  <AvatarImage src={selectedStudent.avatar_url || undefined} />
                  <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[10px] font-bold">
                    {selectedStudent.name.slice(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{selectedStudent.name}</h4>
                  <p className="text-[9px] text-zinc-500">{selectedStudent.email}</p>
                </div>
              </div>
              
              <div className="h-px bg-zinc-850" />
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-black text-zinc-550 block">Activity</span>
                  <span className="font-bold text-white capitalize">{activityType.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-zinc-550 block">Balance Delta</span>
                  <span className={`font-black ${initialMode === "deduction" ? "text-amber-500" : "text-emerald-400"}`}>
                    {initialMode === "deduction" ? "-" : "+"}{pointsVal} Points
                  </span>
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
              className="w-full bg-red-650 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black flex items-center justify-center gap-2"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Confirm & Commit"}
            </Button>
          </div>
        )}

      </div>
    </BottomSheet>
  );
}
