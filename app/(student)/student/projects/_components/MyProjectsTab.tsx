"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderGit2, Plus, Globe, ExternalLink, Users } from "lucide-react";
import { RegisterProjectSheet } from "./RegisterProjectSheet";
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
  collaborators?: string[]; // Initials or names
}

interface MyProjectsTabProps {
  projects: Project[];
  onRegisterSuccess: (newProject: Project) => void;
}

export function MyProjectsTab({ projects, onRegisterSuccess }: MyProjectsTabProps) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleRegisterSuccess = (newProject: Project) => {
    const projectWithTeam = {
      ...newProject,
      collaborators: ["AK"] // Arjun Krishnamurthy
    };
    onRegisterSuccess(projectWithTeam);
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "funded":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-900 text-zinc-550 border-zinc-800";
    }
  };

  return (
    <div className="space-y-6 relative min-h-[60vh] pb-20 px-4 md:px-6">
      {/* Description header */}
      <div className="flex justify-between items-center border-b border-zinc-950 pb-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-tight">Active Colony Projects</h3>
          <p className="text-xs text-zinc-500 mt-1">Submit updates, claim funding bonuses, and manage your team.</p>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => {
            const teamInitials = project.collaborators || ["AK", "SP"]; // Fallback to mock initials stack

            return (
              <div
                key={project.id}
                className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Link to project details [id]/page.tsx */}
                    <Link
                      href={`/student/projects/${project.id}`}
                      className="text-sm font-bold text-white tracking-tight hover:text-red-500 transition-colors truncate block flex-1"
                    >
                      {project.name}
                    </Link>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-bold font-heading border uppercase tracking-wider",
                      getStatusStyle(project.status)
                    )}>
                      {project.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[48px] line-clamp-3">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Team Avatars Stack & Links */}
                <div className="pt-3.5 border-t border-zinc-900/60 flex items-center justify-between">
                  {/* Avatar list stack */}
                  <div className="flex items-center -space-x-2">
                    {teamInitials.map((initial, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-400 font-mono-stats"
                        title={initial}
                      >
                        {initial}
                      </div>
                    ))}
                    <div
                      className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-[9px] text-zinc-600 cursor-pointer hover:border-zinc-700 hover:text-zinc-400 transition-colors"
                      title="Manage team"
                    >
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Actions Links */}
                  <div className="flex items-center gap-3">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-550 hover:text-white transition-colors"
                        title="GitHub repository"
                      >
                        <FolderGit2 className="w-4.5 h-4.5" />
                      </a>
                    )}
                    {project.external_url && (
                      <a
                        href={project.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-550 hover:text-white transition-colors"
                        title="Live demo link"
                      >
                        <Globe className="w-4.5 h-4.5" />
                      </a>
                    )}
                    <Link
                      href={`/student/projects/${project.id}`}
                      className="text-red-500 hover:text-red-400 text-xs font-bold font-heading flex items-center gap-1 pl-1"
                    >
                      <span>Manage</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 text-center p-16 border border-zinc-900 bg-zinc-950/10 rounded-2xl text-zinc-500 text-sm">
            No projects registered yet. Click the Floating Action Button below to register your first project.
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsRegisterOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 z-40 w-12 h-12 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 transition-all cursor-pointer border border-red-500/20"
        title="Register Project"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Register Sheet BottomSheet */}
      <RegisterProjectSheet
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
