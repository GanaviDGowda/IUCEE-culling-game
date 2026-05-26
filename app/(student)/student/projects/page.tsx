"use client";

import { useEffect, useState } from "react";
import { MyProjectsTab } from "./_components/MyProjectsTab";
import { AllProjectsTab } from "./_components/AllProjectsTab";
import { UpdatesTab } from "./_components/UpdatesTab";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  github_url: string | null;
  external_url: string | null;
  status: string;
  active: boolean;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  collaborators?: string[];
}

interface ProjectUpdate {
  id: string;
  projectId: string;
  projectName: string;
  note: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export default function StudentProjectsPage() {
  const [activeTab, setActiveTab] = useState<"my-projects" | "all-projects" | "updates">("my-projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize weekly updates history
  // proj-2 was last updated 8 days ago, which is > 7 days, so it triggers the warning banner initially.
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/student/projects");
      if (!response.ok) throw new Error("Failed to fetch project listings.");
      
      const resData = await response.json();
      const mapped = (resData.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        github_url: p.github_url || null,
        external_url: p.external_url || null,
        status: p.status || "active",
        active: p.active,
        owner: p.owner || { name: "Arjun Krishnamurthy", email: "4mc21cs010@mcehassan.ac.in" },
        collaborators: p.id === "proj-1" ? ["AK", "SP"] : ["AK", "NB"],
      }));

      setProjects(mapped);

      // Set initial chronological updates list using the fetched projects
      setUpdates([
        {
          id: "upd-1",
          projectId: "proj-1",
          projectName: "Kogane Web Dashboard",
          note: "Implemented initial Supabase DB schema and index configurations.",
          status: "approved",
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "upd-2",
          projectId: "proj-2",
          projectName: "Cursed Speech Transcriber",
          note: "Optimized acoustic model inference pipeline using ONNX runtime.",
          status: "approved",
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "upd-3",
          projectId: "proj-1",
          projectName: "Kogane Web Dashboard",
          note: "Created standard login forms and cookie session helpers.",
          status: "approved",
          created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync project database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRegisterSuccess = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleAddUpdate = (projectId: string, note: string) => {
    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) return;

    const newUpdate: ProjectUpdate = {
      id: `upd-${Math.random().toString(36).substring(2, 9)}`,
      projectId,
      projectName: targetProject.name,
      note,
      created_at: new Date().toISOString(),
      status: "pending"
    };

    setUpdates((prev) => [newUpdate, ...prev]);
  };

  // Helper to determine if there are missed weekly updates on tab switcher level
  const checkHasMissedUpdates = () => {
    const activeProjects = projects.filter((p) => p.active);
    if (activeProjects.length === 0) return false;

    for (const project of activeProjects) {
      const projUpdates = updates.filter((u) => u.projectId === project.id);
      if (projUpdates.length === 0) {
        return true;
      }
      const latestUpdateDate = new Date(
        Math.max(...projUpdates.map((u) => new Date(u.created_at).getTime()))
      );
      const daysElapsed = (Date.now() - latestUpdateDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysElapsed > 7) {
        return true;
      }
    }
    return false;
  };

  const hasMissedUpdates = checkHasMissedUpdates();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-red-500/10 border-t-red-500 animate-spin" />
          <Loader2 className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <p className="text-xs font-heading font-semibold text-zinc-500 tracking-wider">
          ESTABLISHING PROJECTS FEED...
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* Header Info / Tabs Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center px-4 md:px-6 border-b border-zinc-950 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Project Roster</h2>
          <p className="text-[11px] text-zinc-550 mt-0.5">Manage details, submit updates, and claim funding.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-1 flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("my-projects")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeTab === "my-projects"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-550 hover:text-zinc-350"
            )}
          >
            My Projects
          </button>
          <button
            onClick={() => setActiveTab("all-projects")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeTab === "all-projects"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-550 hover:text-zinc-350"
            )}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveTab("updates")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer",
              activeTab === "updates"
                ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                : "text-zinc-550 hover:text-zinc-350"
            )}
          >
            <span>Weekly Updates</span>
            {hasMissedUpdates && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-650 rounded-full animate-pulse border border-zinc-950" />
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Render */}
      <div className="px-4 md:px-6">
        {activeTab === "my-projects" && (
          <MyProjectsTab
            projects={projects}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
        {activeTab === "all-projects" && (
          <AllProjectsTab
            userProjects={projects}
          />
        )}
        {activeTab === "updates" && (
          <UpdatesTab
            userProjects={projects}
            updates={updates}
            onAddUpdate={handleAddUpdate}
          />
        )}
      </div>
    </div>
  );
}
