"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AwardSheet } from "./AwardSheet";
import { BulkAwardSheet } from "./BulkAwardSheet";
import { 
  RiAwardLine, 
  RiShieldFlashLine, 
  RiStackLine, 
  RiAddLine,
  RiFileList3Line
} from "@remixicon/react";

export function AwardTab() {
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"award" | "deduction">("award");

  const openAward = (mode: "award" | "deduction") => {
    setInitialMode(mode);
    setIsAwardOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Hero Card */}
      <div className="bg-zinc-900/15 border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <RiAwardLine className="w-40 h-40 text-red-500" />
        </div>
        <div className="max-w-md space-y-2">
          <span className="text-[9px] uppercase font-black tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10">Allocations Engine</span>
          <h2 className="text-lg font-black text-white leading-tight">Cursed Energy Management</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Distribute points for active participation or apply necessary system deductions. All transactions are logged securely and updated on real-time participant balance sheets.
          </p>
        </div>
      </div>

      {/* Operation Cards Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        
        {/* 1. Manual Award */}
        <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-500">
              <RiAwardLine className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Manual Award</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Award points to a single student for exceptional domain tasks, workshop assistance, or special contributions.
            </p>
          </div>
          <Button 
            className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold text-white rounded-xl h-10"
            onClick={() => openAward("award")}
          >
            Award Single
          </Button>
        </div>

        {/* 2. Deductions / Penalty */}
        <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-500">
              <RiShieldFlashLine className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Point Deduction</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Subtract curse energy or apply a penalty delta for missing mandatory deliverables or violating game regulations.
            </p>
          </div>
          <Button 
            className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold text-white rounded-xl h-10"
            onClick={() => openAward("deduction")}
          >
            Deduct Points
          </Button>
        </div>

        {/* 3. Bulk Awards */}
        <div className="bg-zinc-900/35 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-500">
              <RiStackLine className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Bulk Distribution</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Distribute points to a group of selected users at once for attending events, hackathons, or unified activities.
            </p>
          </div>
          <Button 
            className="w-full bg-red-600 hover:bg-red-500 text-xs font-black text-white rounded-xl h-10"
            onClick={() => setIsBulkOpen(true)}
          >
            Launch Bulk Award
          </Button>
        </div>

      </div>

      {/* Floating Action Button (FAB) in bottom-right */}
      <button 
        onClick={() => openAward("award")}
        className="fixed bottom-20 md:bottom-6 right-6 w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
        title="Quick Award Points"
      >
        <RiAddLine className="w-6 h-6 stroke-[3]" />
      </button>

      {/* BottomSheets */}
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
