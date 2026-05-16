"use client";

import { cn } from "@/lib/utils";

interface TopTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function TopTabs({ tabs, activeTab, onChange }: TopTabsProps) {
  return (
    <div className="w-full flex overflow-x-auto scrollbar-none border-b border-zinc-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
