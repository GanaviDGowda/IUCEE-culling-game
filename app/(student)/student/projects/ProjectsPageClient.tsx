"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { FolderGit2, Plus, Globe, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  github_url: string | null;
  external_url: string | null;
  status: string;
  active: boolean;
}

interface ProjectsPageClientProps {
  initialProjects: Project[];
}

export function ProjectsPageClient({ initialProjects }: ProjectsPageClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          github_url: githubUrl || null,
          external_url: externalUrl || null,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to submit project");
      }

      setProjects((prev) => [resData.data, ...prev]);
      toast.success("Project registered successfully!");
      setIsSheetOpen(false);
      
      // Reset Form
      setName("");
      setDescription("");
      setGithubUrl("");
      setExternalUrl("");
      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-6">
      {/* Create Button */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-tight">Active Projects</h3>
          <p className="text-xs text-zinc-500 mt-1">Manage and register your developer projects here.</p>
        </div>
        <button
          onClick={() => setIsSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-600/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight truncate">{project.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    project.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : project.status === "funded"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed min-h-[40px] line-clamp-3">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-zinc-900/60">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {project.external_url && (
                  <a
                    href={project.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors ml-auto"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center p-16 border border-zinc-900 bg-zinc-950/20 rounded-2xl text-zinc-500 text-sm">
            No projects registered yet. Click &quot;Register Project&quot; above to submit your first project!
          </div>
        )}
      </div>

      {/* Register BottomSheet */}
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Register New Project">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="pname" className="text-xs font-semibold text-zinc-400">Project Name *</label>
            <input
              id="pname"
              type="text"
              required
              placeholder="e.g. Kogane Web Dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pdesc" className="text-xs font-semibold text-zinc-400">Description</label>
            <textarea
              id="pdesc"
              rows={3}
              placeholder="Explain your cursed technique project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pgh" className="text-xs font-semibold text-zinc-400">GitHub URL</label>
            <input
              id="pgh"
              type="url"
              placeholder="https://github.com/username/project"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pext" className="text-xs font-semibold text-zinc-400">External Live Demo URL</label>
            <input
              id="pext"
              type="url"
              placeholder="https://project-demo.com"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="w-1/2 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Register</span>
              )}
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
