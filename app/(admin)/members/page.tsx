"use client";

import { useState, useEffect } from "react";
import { TopTabs } from "@/components/admin/TopTabs";
import { FilterPills } from "@/components/admin/FilterPills";
import { MemberCard } from "@/components/admin/MemberCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RiSearchLine, 
  RiFilter3Line, 
  RiUserSearchLine
} from "@remixicon/react";
import { Input } from "@/components/ui/input";
import { DangerZone } from "./_components/DangerZone";
import { RolesTab } from "./_components/RolesTab";
import { PendingRegistrations } from "./_components/PendingRegistrations";

const TABS = ["All Members", "Pending", "Danger Zone", "Roles"];
const BRANCHES = [
  { label: "All", value: "All" },
  { label: "CSE", value: "CSE" },
  { label: "ISE", value: "ISE" },
  { label: "ECE", value: "ECE" },
  { label: "ME", value: "ME" },
];

export default function AdminMembersPage() {
  const [activeTab, setActiveTab] = useState("All Members");
  const [activeBranch, setActiveBranch] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch members based on filters
  useEffect(() => {
    if (activeTab === "Roles" || activeTab === "Danger Zone" || activeTab === "Pending") {
      setLoading(false);
      return;
    }

    async function fetchMembers() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: debouncedSearch,
          branch: activeBranch,
          status: "All",
        });
        const res = await fetch(`/api/admin/members?${params}`);
        const data = await res.json();
        setMembers(data.data || []);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [debouncedSearch, activeBranch, activeTab]);

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header for Search & Filters */}
      <div className="px-4 pt-2 pb-4 space-y-4">
        <div className="relative group">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
          <Input 
            placeholder={activeTab === "Roles" ? "Search roles..." : "Search members..."} 
            className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-red-500/50 transition-all rounded-xl h-11 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
            <RiFilter3Line className="w-4 h-4" />
          </button>
        </div>

        <TopTabs 
          tabs={TABS} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
      </div>

      {activeTab === "All Members" && (
        <FilterPills 
          options={BRANCHES} 
          activeFilter={activeBranch} 
          onChange={setActiveBranch} 
        />
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-none">
        <div className="grid gap-3 py-4">
          {activeTab === "Danger Zone" ? (
            <DangerZone searchQuery={searchQuery} />
          ) : activeTab === "Pending" ? (
            <PendingRegistrations />
          ) : activeTab === "Roles" ? (
            <RolesTab />
          ) : loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3 bg-zinc-800" />
                  <Skeleton className="h-2 w-1/2 bg-zinc-800" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="w-8 h-8 rounded-lg bg-zinc-800" />
                  <Skeleton className="w-8 h-8 rounded-lg bg-zinc-800" />
                </div>
              </div>
            ))
          ) : members.length > 0 ? (
            members.map((member) => (
              <MemberCard 
                key={member.id}
                id={member.id}
                name={member.name}
                branch={member.branch}
                year={member.year}
                tier={member.tier}
                streak={member.streak}
                showWarn={false}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <RiUserSearchLine className="w-12 h-12 mb-4 text-zinc-600" />
              <h3 className="text-lg font-medium text-white">No results found</h3>
              <p className="text-sm text-zinc-500 mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
