"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  RiShieldUserLine, 
  RiUserStarLine,
  RiAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine
} from "@remixicon/react";

export function RolesTab() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [nodals, setNodals] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // BottomSheet states
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRole, setSelectedRole] = useState("nodal_officer");
  const [domainBadge, setDomainBadge] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Demote confirm states
  const [demoteConfirmId, setDemoteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchRolesData();
  }, []);

  async function fetchRolesData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members?status=All");
      const data = await res.json();
      const allMembers = data.data || [];
      
      setAdmins(allMembers.filter((m: any) => m.role === "admin"));
      setNodals(allMembers.filter((m: any) => m.role === "nodal_officer"));
      setStudents(allMembers.filter((m: any) => m.role === "student"));
    } catch (err) {
      console.error("Failed to fetch roles data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAssignRole = async () => {
    if (!selectedStudentId) return;
    setAssignLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${selectedStudentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          domain_badge: selectedRole === "nodal_officer" ? domainBadge : null
        })
      });
      if (res.ok) {
        await fetchRolesData();
        setIsAssignOpen(false);
        setSelectedStudentId("");
        setDomainBadge("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "student",
          domain_badge: null
        })
      });
      if (res.ok) {
        await fetchRolesData();
        setDemoteConfirmId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assign Role CTA */}
      <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-800/80 p-3 rounded-xl">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Access Control</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Assign administrative and nodal privileges.</p>
        </div>
        <Button 
          size="sm" 
          className="h-8 rounded-lg text-[10px] font-black bg-red-600 hover:bg-red-500 text-white flex items-center gap-1"
          onClick={() => setIsAssignOpen(true)}
        >
          <RiAddLine className="w-3.5 h-3.5" />
          Assign Role
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full bg-zinc-900" />
          <Skeleton className="h-28 w-full bg-zinc-900" />
        </div>
      ) : (
        <>
          {/* Admin Roles summary list */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <RiShieldUserLine className="w-4 h-4 text-red-500" />
              Role Directories
            </h2>
            <div className="grid gap-2">
              <div className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-white">Administrators</h3>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Full authority over all parameters and systems.</p>
                </div>
                <Badge className="bg-red-950 text-red-400 border border-red-900/30 text-[10px] font-extrabold px-2 py-0.5">
                  {admins.length} Assigned
                </Badge>
              </div>

              <div className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-white">Nodal Officers</h3>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Assigned to track attendance, points, and domain milestones.</p>
                </div>
                <Badge className="bg-amber-950 text-amber-400 border border-amber-900/30 text-[10px] font-extrabold px-2 py-0.5">
                  {nodals.length} Assigned
                </Badge>
              </div>
            </div>
          </div>

          {/* Administrators List */}
          {admins.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Active Administrators</h2>
              <div className="grid gap-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="p-2.5 bg-zinc-900/20 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 border border-zinc-800">
                        <AvatarImage src={admin.avatar_url} />
                        <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[10px] font-bold">
                          {admin.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">{admin.name}</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">{admin.email}</p>
                      </div>
                    </div>
                    {/* Demote administrator */}
                    {demoteConfirmId === admin.id ? (
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1 rounded bg-red-950 text-red-400 border border-red-900/30"
                          onClick={() => handleRemoveRole(admin.id)}
                        >
                          <RiCheckLine className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="p-1 rounded bg-zinc-800 text-zinc-400"
                          onClick={() => setDemoteConfirmId(null)}
                        >
                          <RiCloseLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="p-1.5 rounded-lg bg-zinc-800/40 hover:bg-red-950/20 hover:text-red-400 text-zinc-500 transition-all border border-zinc-800"
                        onClick={() => setDemoteConfirmId(admin.id)}
                        title="Demote to Student"
                      >
                        <RiDeleteBinLine className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nodal Officers List */}
          {nodals.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Active Nodal Officers</h2>
              <div className="grid gap-2">
                {nodals.map((nodal) => (
                  <div key={nodal.id} className="p-2.5 bg-zinc-900/20 border border-zinc-850 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 border border-zinc-800">
                        <AvatarImage src={nodal.avatar_url} />
                        <AvatarFallback className="bg-zinc-850 text-zinc-400 text-[10px] font-bold">
                          {nodal.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white leading-none">{nodal.name}</h4>
                          {nodal.domain_badge && (
                            <Badge className="bg-zinc-800 text-zinc-300 text-[8px] px-1 h-3.5">
                              {nodal.domain_badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-0.5">{nodal.email}</p>
                      </div>
                    </div>
                    {/* Demote nodal officer */}
                    {demoteConfirmId === nodal.id ? (
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1 rounded bg-red-950 text-red-400 border border-red-900/30"
                          onClick={() => handleRemoveRole(nodal.id)}
                        >
                          <RiCheckLine className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="p-1 rounded bg-zinc-800 text-zinc-400"
                          onClick={() => setDemoteConfirmId(null)}
                        >
                          <RiCloseLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="p-1.5 rounded-lg bg-zinc-800/40 hover:bg-red-950/20 hover:text-red-400 text-zinc-500 transition-all border border-zinc-800"
                        onClick={() => setDemoteConfirmId(nodal.id)}
                        title="Demote to Student"
                      >
                        <RiDeleteBinLine className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Assign Role BottomSheet */}
      <BottomSheet isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)}>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Assign Administrator Privileges</h3>
            <p className="text-[10px] text-zinc-500">Promote any active member to Admin or Nodal Officer</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Select Member</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl h-11 px-3 mt-1 outline-none focus:border-red-500"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">-- Choose a student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Role</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl h-11 px-3 mt-1 outline-none focus:border-red-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="nodal_officer">Nodal Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {selectedRole === "nodal_officer" && (
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Domain / Department</label>
                <Input
                  placeholder="e.g. Web Dev, AI/ML, Core Team"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
                  value={domainBadge}
                  onChange={(e) => setDomainBadge(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
                onClick={() => setIsAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl h-11 text-xs font-black"
                onClick={handleAssignRole}
                disabled={assignLoading || !selectedStudentId}
              >
                {assignLoading ? "Assigning..." : "Confirm Designation"}
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
