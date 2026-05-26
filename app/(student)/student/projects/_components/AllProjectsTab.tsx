"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderGit2, Globe, ExternalLink, Search, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  github_url: string | null;
  external_url: string | null;
  status: string;
  active: boolean;
  owner: {
    name: string;
    email: string;
  };
  collaborators_count: number;
}

interface AllProjectsTabProps {
  userProjects: any[];
}

// Simulated other projects in the colony
const colonyProjectsMock: Project[] = [
  {
    id: "proj-3",
    name: "Domain Expansion Simulator",
    description: "A sandbox tool for modeling barrier physics, environmental conditions, and sure-hit attack vectors within local domain coordinates.",
    github_url: "https://github.com/megumi/domain-sim",
    external_url: "https://domain-sim.colony",
    status: "active",
    active: true,
    owner: { name: "Megumi Fushiguro", email: "megumi.f@colony.edu" },
    collaborators_count: 2
  },
  {
    id: "proj-4",
    name: "Cursed Energy Battery Pack",
    description: "Hardware micro-controller firmware designed to store and dissipate residual ambient cursed energy into standard lithium-ion modules.",
    github_url: "https://github.com/maki/ce-battery",
    external_url: null,
    status: "funded",
    active: true,
    owner: { name: "Maki Zenin", email: "maki.z@colony.edu" },
    collaborators_count: 3
  },
  {
    id: "proj-5",
    name: "Shikigami Automation Framework",
    description: "Declarative orchestration layer for programming shikigami pathfinding and multi-agent coordination routines via JSON manifests.",
    github_url: "https://github.com/yuta/shikigami-orch",
    external_url: "https://shikigami.io",
    status: "active",
    active: true,
    owner: { name: "Yuta Okkotsu", email: "yuta.o@colony.edu" },
    collaborators_count: 4
  },
  {
    id: "proj-6",
    name: "Reverse Cursed Healing API",
    description: "Low-latency REST server estimating anatomical reconstruction trajectories based on positive cursed energy multiplication matrices.",
    github_url: null,
    external_url: "https://rct-heal.colony",
    status: "completed",
    active: false,
    owner: { name: "Shoko Ieiri", email: "shoko.i@colony.edu" },
    collaborators_count: 1
  }
];

export function AllProjectsTab({ userProjects }: AllProjectsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "funded" | "completed">("all");

  // Combine user projects and colony mock projects
  const allProjectsList: Project[] = [
    ...userProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      github_url: p.github_url || null,
      external_url: p.external_url || null,
      status: p.status || "active",
      active: p.active,
      owner: p.owner || { name: "Arjun Krishnamurthy", email: "4mc21cs010@mcehassan.ac.in" },
      collaborators_count: p.collaborators?.length || (p.id === "proj-2" ? 2 : 1)
    })),
    ...colonyProjectsMock
  ];

  // Filtering Logic
  const filteredProjects = allProjectsList.filter((project) => {
    // Search Query Match
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Status Filter Match
    const matchesStatus =
      statusFilter === "all" ||
      project.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "funded":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-zinc-900 text-zinc-550 border-zinc-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-950 pb-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-tight">Colony Database</h3>
          <p className="text-xs text-zinc-550 mt-1">Browse all active and funded developer projects in the colony.</p>
        </div>

        {/* Filter Pills */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-1 flex items-center gap-1 self-start md:self-auto">
          {(["all", "active", "funded", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all tracking-wider",
                statusFilter === status
                  ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                  : "text-zinc-550 hover:text-zinc-300"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-650">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search by project name, techniques, or sorcerer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950/50 border border-zinc-900 focus:border-red-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:ring-1 focus:ring-red-500/10 focus:outline-none transition-all"
        />
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="kogane-panel p-5 border-zinc-900 bg-zinc-950/40 flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight truncate flex-1">
                    {project.name}
                  </h4>
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

              {/* Footer info & links */}
              <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between text-[10px]">
                <div className="space-y-0.5">
                  <span className="text-zinc-550 block font-mono-stats uppercase text-[8px] tracking-wider">
                    Lead Sorcerer
                  </span>
                  <span className="text-zinc-300 font-semibold">{project.owner.name}</span>
                </div>

                {/* Project Links (Read-only view redirects to details) */}
                <div className="flex items-center gap-3">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-550 hover:text-white transition-colors"
                      title="GitHub Repository"
                    >
                      <FolderGit2 className="w-4 h-4" />
                    </a>
                  )}
                  {project.external_url && (
                    <a
                      href={project.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-550 hover:text-white transition-colors"
                      title="Live Demo"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  <Link
                    href={`/student/projects/${project.id}`}
                    className="text-red-500/85 hover:text-red-400 text-xs font-bold font-heading flex items-center gap-1 pl-1"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center p-16 border border-zinc-900 bg-zinc-950/10 rounded-2xl text-zinc-550 text-xs flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="w-7 h-7 text-zinc-700" />
            <span>No matching projects discovered in the colony registry.</span>
          </div>
        )}
      </div>
    </div>
  );
}
