"use client";

import { useState } from "react";
import { PointLogRow } from "@/components/student/PointLogRow";
import { FilterPills } from "@/components/admin/FilterPills";

interface Log {
  id: string;
  points: number;
  type: string;
  note: string;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
}

interface PointsPageClientProps {
  logs: Log[];
}

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

export function PointsPageClient({ logs }: PointsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === "all") return true;
    return log.status === activeFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterPills
        options={statusOptions}
        activeFilter={activeFilter}
        onChange={setActiveFilter}
      />

      {/* Ledger list */}
      <div className="px-4 md:px-6 space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <PointLogRow key={log.id} log={log} />
          ))
        ) : (
          <div className="text-center p-12 border border-zinc-900 bg-zinc-950/20 rounded-xl text-zinc-500 text-sm">
            No point logs found matching the selected status.
          </div>
        )}
      </div>
    </div>
  );
}
