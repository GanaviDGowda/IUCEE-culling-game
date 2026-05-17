"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_POINT_RULES, formatPointType } from "@/lib/points";
import { 
  RiDownloadLine,
  RiHistoryLine
} from "@remixicon/react";

interface PointLog {
  id: string;
  type: string;
  points: number;
  note?: string | null;
  created_at: string;
  user?: { name?: string | null };
  users?: { name?: string | null };
}

export function LogsTab() {
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/points");
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);

  // Filter logs on client side
  const filteredLogs = logs.filter(log => {
    const studentName = log.user?.name || log.users?.name || "";
    const noteText = log.note || "";
    const matchesSearch = 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noteText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || log.type === selectedType;

    const matchesDate = !dateFilter || new Date(log.created_at).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    
    // Construct CSV content
    const csvHeaders = "Name,Activity Type,Points Delta,Timestamp,Attached Note\n";
    const csvRows = filteredLogs.map(log => {
      const name = `"${(log.user?.name || log.users?.name || "Unknown").replace(/"/g, '""')}"`;
      const type = `"${formatPointType(log.type)}"`;
      const points = log.points;
      const timestamp = `"${new Date(log.created_at).toLocaleString()}"`;
      const note = `"${(log.note || "").replace(/"/g, '""')}"`;
      return `${name},${type},${points},${timestamp},${note}`;
    }).join("\n");

    const blob = new Blob([csvHeaders + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Kogane_Point_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Search and Filters Segment */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-zinc-900/10 border border-zinc-850 p-3 rounded-2xl">
        <div className="sm:col-span-2">
          <label className="text-[8px] font-black uppercase text-zinc-550 tracking-wider">Search Player / Explanation</label>
          <Input 
            placeholder="Search logs..." 
            className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-9 mt-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[8px] font-black uppercase text-zinc-550 tracking-wider">Class Filter</label>
          <select
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl h-9 px-2 mt-1 outline-none"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Classifications</option>
            {ADMIN_POINT_RULES.map((rule) => (
              <option key={rule.type} value={rule.type}>{rule.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[8px] font-black uppercase text-zinc-550 tracking-wider">Date Track</label>
          <Input 
            type="date"
            className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-9 mt-1 text-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* CSV Export & Header counts */}
      <div className="flex justify-between items-center bg-zinc-900/5 p-2 px-3 border border-zinc-850 rounded-xl">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
          {filteredLogs.length} Transaction Records Resolved
        </span>
        <Button 
          size="sm" 
          onClick={exportToCSV}
          disabled={filteredLogs.length === 0}
          className="h-8 rounded-lg text-[9px] font-black bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white flex items-center gap-1"
        >
          <RiDownloadLine className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Chronological Logs List */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full bg-zinc-900/30" />
          <Skeleton className="h-12 w-full bg-zinc-900/30" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 border border-zinc-850 rounded-2xl bg-zinc-900/5 space-y-2">
          <RiHistoryLine className="w-8 h-8 text-zinc-650 mx-auto" />
          <p className="text-xs font-bold text-zinc-400">No point transactions matches filters.</p>
        </div>
      ) : (
        <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-900/5 divide-y divide-zinc-900">
          {filteredLogs.map((log) => {
            const isPositive = log.points >= 0;
            return (
              <div key={log.id} className="p-3 flex items-center justify-between hover:bg-zinc-900/10">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-zinc-800">
                    <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[10px] font-bold">
                      {(log.user?.name || log.users?.name)?.slice(0, 2).toUpperCase() || "PL"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white leading-none">{log.user?.name || log.users?.name || "System"}</h4>
                      <Badge className="bg-zinc-850 text-zinc-400 text-[7px] px-1 h-3.5 uppercase font-extrabold tracking-wider">
                        {formatPointType(log.type)}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 italic">
                      &quot;{log.note || "No comments attached."}&quot;
                    </p>
                    <span className="text-[8px] text-zinc-600 block mt-0.5">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={`text-xs font-black ${isPositive ? "text-emerald-400" : "text-amber-500"}`}>
                  {isPositive ? "+" : ""}{log.points} Pts
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
