"use client";

import { useState } from "react";
import { TopTabs } from "@/components/admin/TopTabs";

// Tabs
import { AttendanceTab } from "./_components/AttendanceTab";
import { LogsTab } from "./_components/LogsTab";
import { AppealsTab } from "./_components/AppealsTab";

// Point Sheets & Icons
import { AwardSheet } from "./_components/AwardSheet";
import { BulkAwardSheet } from "./_components/BulkAwardSheet";
import { 
  RiAddLine, 
  RiSubtractLine, 
  RiAwardLine, 
  RiStackLine 
} from "@remixicon/react";

const POINTS_TABS = ["Attendance", "Logs", "Appeals"];

export default function PointsAdministrationPage() {
  const [activeTab, setActiveTab] = useState("Attendance");
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"award" | "deduction">("award");

  const openAward = (mode: "award" | "deduction") => {
    setInitialMode(mode);
    setIsAwardOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-black min-h-[calc(100vh-3.5rem)] md:min-h-screen relative">
      <div className="p-4 md:p-6 space-y-6 flex-1 pb-24 md:pb-6">
        
        {/* Top Segment Tabs */}
        <TopTabs 
          tabs={POINTS_TABS} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />

        {/* Tab content mount */}
        <main className="mt-4">
          {activeTab === "Attendance" && <AttendanceTab />}
          {activeTab === "Logs" && <LogsTab />}
          {activeTab === "Appeals" && <AppealsTab />}
        </main>
      </div>

      {/* Floating Point Hub in bottom-right */}
      <div className="fixed bottom-20 md:bottom-6 right-6 flex flex-col items-end gap-3.5 z-50">
        
        {/* Expanding option bubble for + button */}
        {plusMenuOpen && (
          <div className="flex flex-col gap-2 bg-zinc-950/95 border border-zinc-800 p-2.5 rounded-2xl shadow-xl shadow-red-950/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-250 w-44">
            <button
              onClick={() => {
                openAward("award");
                setPlusMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-2 hover:bg-zinc-900 rounded-xl text-left transition-colors w-full group"
            >
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 transition-colors group-hover:bg-red-500 group-hover:text-white">
                <RiAwardLine className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white">Single Award</p>
                <p className="text-[8px] text-zinc-500">Award single player</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsBulkOpen(true);
                setPlusMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-2 hover:bg-zinc-900 rounded-xl text-left transition-colors w-full group"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                <RiStackLine className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white">Bulk Award</p>
                <p className="text-[8px] text-zinc-500">Award multiple users</p>
              </div>
            </button>
          </div>
        )}

        <div className="flex gap-3">
          {/* Minus (-) Floating Button for Deductions */}
          <button
            onClick={() => {
              setPlusMenuOpen(false);
              openAward("deduction");
            }}
            className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-amber-500/40"
            title="Deduct Points"
          >
            <RiSubtractLine className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Plus (+) Floating Button for Awards */}
          <button
            onClick={() => setPlusMenuOpen(!plusMenuOpen)}
            className={`w-12 h-12 rounded-full text-white shadow-lg shadow-red-650/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-red-500/40 ${
              plusMenuOpen ? "bg-zinc-800 rotate-45" : "bg-red-600 hover:bg-red-500"
            }`}
            title="Award Actions"
          >
            <RiAddLine className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Global BottomSheets */}
      <AwardSheet 
        isOpen={isAwardOpen} 
        onClose={() => setIsAwardOpen(false)} 
        initialMode={initialMode}
      />

      <BulkAwardSheet 
        isOpen={isBulkOpen} 
        onClose={() => setIsBulkOpen(false)} 
      />

    </div>
  );
}
