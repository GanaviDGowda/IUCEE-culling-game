"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  RiArrowLeftSLine, 
  RiSave3Line, 
  RiShieldFlashLine, 
  RiGroupLine, 
  RiFileList3Line, 
  RiGitRepositoryLine, 
  RiExternalLinkLine 
} from "@remixicon/react";

export default function AdminProjectDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [active, setActive] = useState(true);
  const [funded, setFunded] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`);
      if (res.ok) {
        const json = await res.json();
        setProject(json.project);
        
        // Initialize form fields
        setName(json.project.name || "");
        setDescription(json.project.description || "");
        setGithubUrl(json.project.github_url || "");
        setExternalUrl(json.project.external_url || "");
        setActive(json.project.active);
        setFunded(json.project.funded);
      } else {
        router.push("/projects");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          github_url: githubUrl,
          external_url: externalUrl,
          active,
          funded
        })
      });
      if (res.ok) {
        await fetchProjectDetails();
        alert("Project details successfully saved.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update project details.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32 bg-zinc-900/40" />
        <Skeleton className="h-10 w-96 bg-zinc-900/40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2 bg-zinc-900/40 rounded-2xl" />
          <Skeleton className="h-96 bg-zinc-900/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      
      {/* Back button link */}
      <button 
        onClick={() => router.push("/projects")} 
        className="flex items-center gap-1 text-[10px] font-black text-zinc-550 hover:text-white uppercase tracking-wider font-heading transition-colors"
      >
        <RiArrowLeftSLine className="w-4 h-4" />
        Back to Registry
      </button>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white">{project.name}</h2>
            <Badge className={`text-[7px] font-black uppercase tracking-widest ${
              project.active 
                ? "bg-green-955 text-green-400 border border-green-900/30" 
                : "bg-zinc-900 text-zinc-500 border border-zinc-800"
            }`}>
              {project.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
            Project Key: {project.id}
          </p>
        </div>

        {project.funded && (
          <div className="p-2 bg-amber-955 border border-amber-900/30 rounded-xl flex items-center gap-2">
            <RiShieldFlashLine className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[9px] font-black text-white uppercase tracking-wider font-mono">Funded Venture</p>
              <p className="text-[8px] text-amber-500 font-bold uppercase font-mono">
                {project.funded_pts_claimed ? "Claim verified" : "Claim pending"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Editor & details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Editor */}
        <form onSubmit={handleSaveChanges} className="lg:col-span-8 space-y-4 bg-zinc-900/10 border border-zinc-850 p-5 rounded-2xl">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading border-b border-zinc-900 pb-2.5">
            Update Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Project Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">GitHub URL</label>
              <input 
                type="url" 
                value={githubUrl} 
                onChange={(e) => setGithubUrl(e.target.value)} 
                className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Live / Demo Link</label>
              <input 
                type="url" 
                value={externalUrl} 
                onChange={(e) => setExternalUrl(e.target.value)} 
                className="w-full h-9 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl px-3 text-xs text-white focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 items-end h-full">
              <div className="flex items-center gap-2 h-9 border border-zinc-850 px-3 rounded-xl bg-zinc-950">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={active} 
                  onChange={(e) => setActive(e.target.checked)} 
                  className="rounded border-zinc-800 bg-black text-red-500 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="active" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-heading cursor-pointer">
                  Active Status
                </label>
              </div>

              <div className="flex items-center gap-2 h-9 border border-zinc-850 px-3 rounded-xl bg-zinc-950">
                <input 
                  type="checkbox" 
                  id="funded"
                  checked={funded} 
                  onChange={(e) => setFunded(e.target.checked)} 
                  className="rounded border-zinc-800 bg-black text-red-500 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="funded" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-heading cursor-pointer">
                  Funded Claim
                </label>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider font-heading">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full h-24 bg-zinc-950 border border-zinc-850 focus:border-red-500/50 rounded-xl p-3 text-xs text-white focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={saving}
              className="h-8 px-4 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RiSave3Line className="w-4 h-4" />
              {saving ? "Saving..." : "Save Parameters"}
            </Button>
          </div>
        </form>

        {/* Right Column: Owner & Collaborators + Weekly Updates Timeline */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Team Panel */}
          <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1">
              <RiGroupLine className="w-4 h-4" />
              Project Roster
            </h3>
            
            <div className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <p className="text-[8px] font-black uppercase text-zinc-555 tracking-wider font-heading">Owner</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7 border border-zinc-855">
                    <AvatarFallback className="bg-zinc-850 text-xs font-bold text-zinc-400">
                      {project.owner?.name?.slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-black text-white leading-none">{project.owner?.name}</p>
                    <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase mt-0.5">
                      {project.owner?.branch} Y{project.owner?.year}
                    </p>
                  </div>
                </div>
              </div>

              {project.team.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                  <p className="text-[8px] font-black uppercase text-zinc-555 tracking-wider font-heading">Collaborators</p>
                  <div className="space-y-2">
                    {project.team.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-zinc-850">
                          <AvatarFallback className="bg-zinc-900 text-[10px] font-bold text-zinc-550">
                            {member.name?.slice(0,2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[11px] font-bold text-zinc-350 leading-none">{member.name}</p>
                          <p className="text-[8px] text-zinc-650 font-mono font-black uppercase mt-0.5">
                            {member.branch} Y{member.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Updates History */}
          <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading flex items-center gap-1">
              <RiFileList3Line className="w-4 h-4" />
              Updates Timeline
            </h3>

            <div className="pt-1">
              {project.updates.length === 0 ? (
                <p className="text-[10px] text-zinc-550 italic py-4">No progress updates recorded yet.</p>
              ) : (
                <div className="relative border-l border-zinc-900 ml-1.5 pl-3.5 space-y-4">
                  {project.updates.map((upd: any) => (
                    <div key={upd.id} className="relative space-y-1 text-left">
                      <span className={`absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full border ${
                        upd.status === "confirmed" 
                          ? "bg-green-500 border-green-900/30" 
                          : upd.status === "rejected" 
                          ? "bg-red-500 border-red-900/30" 
                          : "bg-amber-500 border-amber-900/30"
                      }`} />
                      
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9px] font-black text-zinc-300 leading-none">{upd.user?.name}</span>
                        <span className="text-[8px] font-black font-mono text-zinc-550 uppercase">
                          {new Date(upd.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        "{upd.content}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
