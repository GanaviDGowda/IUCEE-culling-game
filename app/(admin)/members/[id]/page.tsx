"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { TopTabs } from "@/components/admin/TopTabs";

// Tabs
import { ProfileTab } from "./_components/ProfileTab";
import { PointsTab } from "./_components/PointsTab";
import { AttendanceTab } from "./_components/AttendanceTab";
import { ProjectsTab } from "./_components/ProjectsTab";
import { WarningsTab } from "./_components/WarningsTab";

// BottomSheets
import { AwardSheet } from "./_components/AwardSheet";
import { WarnSheet } from "./_components/WarnSheet";

// Icons
import { 
  RiArrowLeftSLine, 
  RiMore2Fill,
  RiFlashlightLine,
  RiVipCrownLine,
  RiCompass3Line,
  RiShieldLine,
  RiCloseCircleLine,
  RiUserSettingsLine,
  RiSkullLine,
  RiUserStarLine
} from "@remixicon/react";

const DETAIL_TABS = ["Profile", "Points", "Attendance", "Projects", "Warnings"];

export default function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");
  
  // Sheet toggles
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  const [isWarnOpen, setIsWarnOpen] = useState(false);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  // Form states
  const [selectedRole, setSelectedRole] = useState("student");
  const [domainBadge, setDomainBadge] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [removeReason, setRemoveReason] = useState("");

  useEffect(() => {
    fetchMemberDetail();
  }, [id]);

  async function fetchMemberDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${id}`);
      const data = await res.json();
      setMember(data.data || null);
      if (data.data?.profile) {
        setSelectedRole(data.data.profile.role);
        setDomainBadge(data.data.profile.domain_badge || "");
      }
    } catch (err) {
      console.error("Failed to load member detail:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          domain_badge: selectedRole === "nodal_officer" ? domainBadge : null
        })
      });
      if (res.ok) {
        await fetchMemberDetail();
        setIsRoleOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "removed",
          reason: removeReason || "Suspended by administrator."
        })
      });
      if (res.ok) {
        router.push("/members");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 bg-zinc-900" />
          <Skeleton className="h-5 w-32 bg-zinc-900" />
        </div>
        <div className="flex gap-4 p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
          <Skeleton className="w-16 h-16 rounded-full bg-zinc-800" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3 bg-zinc-800" />
            <Skeleton className="h-3 w-1/2 bg-zinc-800" />
          </div>
        </div>
        <Skeleton className="h-10 w-full bg-zinc-900" />
        <Skeleton className="h-48 w-full bg-zinc-900" />
      </div>
    );
  }

  if (!member || !member.profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <RiSkullLine className="w-12 h-12 text-zinc-650 mx-auto" />
        <h2 className="text-base font-black text-white">Member Not Found</h2>
        <p className="text-xs text-zinc-500">The specified member registry could not be located.</p>
        <Link href="/members">
          <Button className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl mt-2 px-5">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const profile = member.profile;
  const initials = profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* 1. Sticky Header with Action Menu */}
      <header className="flex justify-between items-center px-4 py-3 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/members" className="p-1 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400 hover:text-white">
            <RiArrowLeftSLine className="w-6 h-6" />
          </Link>
          <span className="text-sm font-black text-white truncate max-w-[180px]">{profile.name}</span>
        </div>
        <button 
          onClick={() => setIsOverflowOpen(true)}
          className="p-1.5 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400 hover:text-white"
        >
          <RiMore2Fill className="w-5 h-5" />
        </button>
      </header>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-none space-y-5">
        
        {/* 2. Profile Hero */}
        <section className="p-4 bg-zinc-900/35 border border-zinc-850 rounded-2xl flex items-center gap-4 mt-3">
          <Avatar className="w-16 h-16 border-2 border-red-500/20 shadow-md">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-extrabold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-base font-black text-white leading-tight truncate">{profile.name}</h1>
              {profile.status === "danger_zone" && (
                <Badge className="bg-red-950 text-red-400 border border-red-900/30 text-[8px] font-extrabold uppercase px-1.5 h-4 py-0">
                  Danger
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase px-1.5 h-4.5 py-0">
                <RiVipCrownLine className="w-2.5 h-2.5 mr-0.5" />
                {profile.tier}
              </Badge>
              {profile.domain_badge && (
                <Badge variant="outline" className="text-zinc-400 border-zinc-850 text-[9px] font-bold px-1.5 h-4.5 py-0">
                  <RiCompass3Line className="w-2.5 h-2.5 mr-0.5" />
                  {profile.domain_badge}
                </Badge>
              )}
              {profile.role !== "student" && (
                <Badge className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase px-1.5 h-4.5 py-0">
                  {profile.role.replace(/_/g, " ")}
                </Badge>
              )}
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-850/50">
              <div>
                <p className="text-[8px] uppercase font-black text-zinc-550 tracking-wider">Cursed energy</p>
                <p className="text-sm font-black text-white mt-0.5">{profile.redeemable_pts} <span className="text-[9px] text-zinc-500 font-bold">/ {profile.lifetime_pts} total</span></p>
              </div>
              <div className="w-px h-6 bg-zinc-850" />
              <div>
                <p className="text-[8px] uppercase font-black text-zinc-550 tracking-wider">Active Streak</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RiFlashlightLine className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span className="text-xs font-black text-white">{profile.streak}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sub-navigation tabs */}
        <TopTabs 
          tabs={DETAIL_TABS} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />

        {/* 4. Tab Contents */}
        <main className="pt-1">
          {activeTab === "Profile" && <ProfileTab member={member} />}
          {activeTab === "Points" && <PointsTab member={member} />}
          {activeTab === "Attendance" && <AttendanceTab member={member} />}
          {activeTab === "Projects" && <ProjectsTab member={member} />}
          {activeTab === "Warnings" && <WarningsTab member={member} />}
        </main>
      </div>

      {/* 5. Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-900 z-40 flex gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button 
          variant="outline" 
          className="flex-1 rounded-xl h-11 border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
          onClick={() => setIsWarnOpen(true)}
        >
          <RiShieldLine className="w-4 h-4 mr-1 text-amber-500" />
          Issue Warning
        </Button>
        <Button 
          className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
          onClick={() => setIsAwardOpen(true)}
        >
          Award Points
        </Button>
      </footer>

      {/* Award & Warn BottomSheets */}
      <AwardSheet 
        isOpen={isAwardOpen} 
        onClose={() => setIsAwardOpen(false)} 
        memberId={id} 
        memberName={profile.name} 
        onSuccess={fetchMemberDetail} 
      />

      <WarnSheet 
        isOpen={isWarnOpen} 
        onClose={() => setIsWarnOpen(false)} 
        memberId={id} 
        memberName={profile.name} 
        currentWarnings={profile.warnings || 0} 
        onSuccess={fetchMemberDetail} 
      />

      {/* Overflow Menu Sheet */}
      <BottomSheet isOpen={isOverflowOpen} onClose={() => setIsOverflowOpen(false)}>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Administrative Actions</h3>
            <p className="text-[10px] text-zinc-550">Adjust configurations for {profile.name}</p>
          </div>

          <div className="grid gap-2 px-1">
            <button 
              className="w-full p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-white rounded-xl flex items-center gap-3.5 transition-all text-left"
              onClick={() => {
                setIsOverflowOpen(false);
                setIsRoleOpen(true);
              }}
            >
              <RiUserSettingsLine className="w-4 h-4 text-amber-500" />
              Modify System Role
            </button>
            
            <button 
              className="w-full p-3 bg-red-950/10 hover:bg-red-950/20 border border-red-900/20 hover:border-red-900/40 text-xs font-black text-red-400 rounded-xl flex items-center gap-3.5 transition-all text-left"
              onClick={() => {
                setIsOverflowOpen(false);
                setIsRemoveOpen(true);
              }}
            >
              <RiSkullLine className="w-4 h-4 text-red-500" />
              Remove Member from Game
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Role Management Sheet */}
      <BottomSheet isOpen={isRoleOpen} onClose={() => setIsRoleOpen(false)}>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-950/30 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <RiUserStarLine className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Modify System Role</h3>
            <p className="text-[10px] text-zinc-550">Redesignate role for <span className="text-white font-bold">{profile.name}</span></p>
          </div>

          <div className="space-y-3 px-1">
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Select Role</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl h-11 px-3 mt-1 outline-none focus:border-red-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="nodal_officer">Nodal Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {selectedRole === "nodal_officer" && (
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Domain / Department</label>
                <input
                  placeholder="e.g. Frontend Dev, Core Team"
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl h-11 px-3 mt-1 outline-none focus:border-red-500"
                  value={domainBadge}
                  onChange={(e) => setDomainBadge(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
                onClick={() => setIsRoleOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
                onClick={handleRoleChange}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Save Role"}
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Remove Confirmation Sheet */}
      <BottomSheet isOpen={isRemoveOpen} onClose={() => setIsRemoveOpen(false)}>
        <div className="space-y-5 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-950/30 flex items-center justify-center text-red-500 border border-red-500/20">
            <RiSkullLine className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Permanently Remove Member?</h3>
            <p className="text-xs text-zinc-400 mt-2 px-4">
              Are you sure you want to suspend <span className="text-white font-bold">{profile.name}</span>? This locks their relational status in the culling game databases.
            </p>
          </div>

          <div className="space-y-3 px-2">
            <textarea 
              placeholder="Enter official reason for removal/suspension..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-xs text-white rounded-xl h-20 p-2 outline-none"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
                onClick={() => setIsRemoveOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
                onClick={handleRemoveMember}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Confirm Removal"}
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
