"use client";

import { useState, useEffect } from "react";
import { SubmitUpdateSheet } from "./SubmitUpdateSheet";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Plus, Terminal, GitCommit, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  status: string;
  active: boolean;
}

interface ProjectUpdate {
  id: string;
  projectId: string;
  projectName: string;
  note: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

interface Commit {
  hash: string;
  projectName: string;
  message: string;
  author: string;
  created_at: string;
  cursedEnergy: number;
}

interface UpdatesTabProps {
  userProjects: Project[];
  updates: ProjectUpdate[];
  onAddUpdate: (projectId: string, note: string) => void;
}

// Initial mock commits synchronized from the project repositories
const initialCommits: Commit[] = [
  {
    hash: "fe28a10",
    projectName: "Kogane Web Dashboard",
    message: "perf: optimize circular cursed progress SVG rendering",
    author: "Arjun K.",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    cursedEnergy: 15
  },
  {
    hash: "90a88b1",
    projectName: "Cursed Speech Transcriber",
    message: "feat: add phoneme mapping matrices for speech input",
    author: "Arjun K.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    cursedEnergy: 32
  },
  {
    hash: "cb89a31",
    projectName: "Kogane Web Dashboard",
    message: "feat: integrate vaul bottomsheet for appeal forms",
    author: "Sneha P.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cursedEnergy: 24
  },
  {
    hash: "27c13aa",
    projectName: "Cursed Speech Transcriber",
    message: "chore: configure onnx runtime dependencies",
    author: "Nikhil B.",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    cursedEnergy: 8
  },
  {
    hash: "d028ef4",
    projectName: "Kogane Web Dashboard",
    message: "fix: alignment of stats cards on mobile viewports",
    author: "Arjun K.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    cursedEnergy: 5
  }
];

export function UpdatesTab({ userProjects, updates, onAddUpdate }: UpdatesTabProps) {
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [commits, setCommits] = useState<Commit[]>(initialCommits);

  // Sync commits feed when updates change (simulate automatic git commit on report submission)
  useEffect(() => {
    // Check if there are any new updates that are not represented in commits
    const latestUpdate = updates[0];
    if (latestUpdate) {
      const alreadyHasCommit = commits.some(
        (c) => c.message.includes(latestUpdate.note.substring(0, 30))
      );
      if (!alreadyHasCommit) {
        const generatedCommit: Commit = {
          hash: Math.random().toString(16).substring(2, 9),
          projectName: latestUpdate.projectName,
          message: `docs: weekly progress report - "${latestUpdate.note.substring(0, 45)}..."`,
          author: "Arjun K.",
          created_at: latestUpdate.created_at,
          cursedEnergy: 10
        };
        setCommits((prev) => [generatedCommit, ...prev]);
      }
    }
  }, [updates, commits]);

  // Check if any active project has missed weekly report (elapsed time > 7 days or no reports)
  const getMissedUpdateProjects = () => {
    const activeProjects = userProjects.filter((p) => p.active);
    const missedList: Project[] = [];

    activeProjects.forEach((project) => {
      const projUpdates = updates.filter((u) => u.projectId === project.id);
      if (projUpdates.length === 0) {
        missedList.push(project);
      } else {
        // Find latest update date
        const latestUpdateDate = new Date(
          Math.max(...projUpdates.map((u) => new Date(u.created_at).getTime()))
        );
        const daysElapsed = (Date.now() - latestUpdateDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysElapsed > 7) {
          missedList.push(project);
        }
      }
    });

    return missedList;
  };

  const missedProjects = getMissedUpdateProjects();
  const hasMissedUpdates = missedProjects.length > 0;

  return (
    <div className="space-y-6">
      {/* Missed Warning Banner */}
      {hasMissedUpdates && (
        <div className="border border-red-500/25 bg-red-950/15 p-4 rounded-2xl relative overflow-hidden animate-pulse">
          {/* Decorative Glitch Border */}
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-600" />
          
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-heading text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>WARNING: MISSING WEEKLY PROGRESS REPORT</span>
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Cursed seal stability decomposing. The following active projects have missed their weekly updates (deadline is 7 days):
                <span className="font-semibold text-white ml-1">
                  {missedProjects.map((p) => p.name).join(", ")}
                </span>
                . Unresolved reports trigger a <span className="text-red-400 font-bold font-mono-stats">-1 Pt/Week</span> penalty.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-zinc-950 pb-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-tight">Weekly Progress Report</h3>
          <p className="text-xs text-zinc-550 mt-1">Submit mandatory updates for active projects to maintain standing.</p>
        </div>
        <button
          onClick={() => setIsUpdateSheetOpen(true)}
          disabled={userProjects.filter((p) => p.active).length === 0}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-900 disabled:text-zinc-650 disabled:border-zinc-900 border border-red-500/20 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-600/10 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Update</span>
        </button>
      </div>

      {/* Two Column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weekly Reports Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-heading font-bold text-zinc-555 tracking-wider">
            SUBMISSION TIMELINE ({updates.length})
          </h4>

          {updates.length > 0 ? (
            <div className="space-y-3">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex items-start justify-between gap-4 hover:border-zinc-805 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-heading font-bold text-zinc-400 uppercase tracking-wider">
                        {update.projectName}
                      </span>
                      <span className="text-[9px] text-zinc-650 font-mono-stats">
                        • {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-350 leading-relaxed max-w-xl">
                      {update.note}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className={cn(
                    "px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 font-heading",
                    update.status === "approved"
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                      : update.status === "pending"
                      ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                      : "text-red-500 border-red-500/20 bg-red-500/5"
                  )}>
                    {update.status === "approved" ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    ) : update.status === "pending" ? (
                      <Loader2 className="w-2.5 h-2.5 text-amber-500 animate-spin" />
                    ) : (
                      <Clock className="w-2.5 h-2.5 text-red-500" />
                    )}
                    <span>{update.status}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border border-zinc-900 bg-zinc-950/10 rounded-2xl text-zinc-550 text-xs">
              No progress reports logged yet.
            </div>
          )}
        </div>

        {/* Right Column: Git Commits Feed */}
        <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-950 pt-6 lg:pt-0 lg:pl-6">
          <h4 className="text-xs font-heading font-bold text-zinc-555 tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-red-500/70" />
            <span>CURSED CODE COMMITS</span>
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {commits.map((commit) => (
              <div
                key={commit.hash}
                className="p-3 border border-zinc-950 bg-zinc-950/20 hover:border-zinc-900 rounded-xl space-y-2 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Hash */}
                  <span className="text-[10px] font-mono-stats text-red-500 bg-red-950/10 border border-red-950/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {commit.hash}
                  </span>
                  
                  {/* Project Tag */}
                  <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider truncate max-w-[120px]" title={commit.projectName}>
                    {commit.projectName}
                  </span>
                </div>

                <p className="text-xs text-zinc-450 leading-relaxed font-mono-stats line-clamp-2">
                  {commit.message}
                </p>

                <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-zinc-900/40">
                  {/* Author details */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[7px] font-bold text-zinc-400">
                      {commit.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="text-zinc-500">{commit.author}</span>
                  </div>

                  {/* Cursed Energy metric */}
                  <span className="text-[8px] text-amber-500/80 font-mono-stats font-bold">
                    +{commit.cursedEnergy} CE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Update Bottom Sheet */}
      <SubmitUpdateSheet
        isOpen={isUpdateSheetOpen}
        onClose={() => setIsUpdateSheetOpen(false)}
        userProjects={userProjects}
        onSubmitSuccess={onAddUpdate}
      />
    </div>
  );
}
