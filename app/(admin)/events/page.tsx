"use client";

import { useState } from "react";
import { TopTabs } from "@/components/admin/TopTabs";

// Sub tabs
import { MeetingsTab } from "./_components/MeetingsTab";
import { ActivitiesTab } from "./_components/ActivitiesTab";
import { CalendarTab } from "./_components/CalendarTab";

const EVENTS_TABS = ["Meetings", "Activities", "Calendar"];

export default function MeetingsAndEventsPage() {
  const [activeTab, setActiveTab] = useState("Meetings");

  return (
    <div className="flex flex-col h-full bg-black min-h-[calc(100vh-3.5rem)] md:min-h-screen">
      <div className="p-4 md:p-6 space-y-6 flex-1 pb-24 md:pb-6">
        
        {/* Navigation Tabs */}
        <TopTabs 
          tabs={EVENTS_TABS} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />

        {/* Tab content mount */}
        <main className="mt-4">
          {activeTab === "Meetings" && <MeetingsTab />}
          {activeTab === "Activities" && <ActivitiesTab />}
          {activeTab === "Calendar" && <CalendarTab />}
        </main>
      </div>
    </div>
  );
}
