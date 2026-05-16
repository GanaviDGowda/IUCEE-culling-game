"use client";

import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterPillsProps {
  options: FilterOption[];
  activeFilter: string;
  onChange: (value: string) => void;
}

export function FilterPills({ options, activeFilter, onChange }: FilterPillsProps) {
  return (
    <div className="w-full flex gap-2 overflow-x-auto scrollbar-none py-2 px-4">
      {options.map((option) => {
        const isActive = activeFilter === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              isActive 
                ? "bg-white text-black" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
