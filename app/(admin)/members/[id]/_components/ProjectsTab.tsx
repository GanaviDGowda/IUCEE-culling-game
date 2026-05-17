"use client";

import { Badge } from "@/components/ui/badge";
import { 
  RiFolderLine, 
  RiGithubLine, 
  RiExternalLinkLine,
  RiMoneyDollarCircleLine
} from "@remixicon/react";

interface ProjectsTabProps {
  member: any;
}

export function ProjectsTab({ member }: ProjectsTabProps) {
  const projects = member.projects || [];

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
          <RiFolderLine className="w-12 h-12 mb-3 text-zinc-655" />
          <h3 className="text-sm font-semibold text-white">No Linked Projects</h3>
          <p className="text-xs text-zinc-500 mt-1">This member has not registered any projects.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Project Portfolio</h3>
          <div className="grid gap-2">
            {projects.map((proj: any) => (
              <div 
                key={proj.id} 
                className="p-3 bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <RiFolderLine className="w-4 h-4 text-red-500" />
                    <h4 className="text-xs font-bold text-white leading-tight">{proj.name}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {proj.funded && (
                      <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-bold py-0 h-4">
                        <RiMoneyDollarCircleLine className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                        Funded
                      </Badge>
                    )}
                    <Badge variant="outline" className={`text-[8px] font-bold py-0 h-4 ${
                      proj.active 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}>
                      {proj.active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                </div>

                {proj.description && (
                  <p className="text-[10px] text-zinc-400 leading-normal">{proj.description}</p>
                )}

                {/* Project Links */}
                <div className="flex gap-2.5 pt-1 text-[10px]">
                  {proj.github_url && (
                    <a 
                      href={proj.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors"
                    >
                      <RiGithubLine className="w-3.5 h-3.5" />
                      Code Repository
                    </a>
                  )}
                  {proj.external_url && (
                    <a 
                      href={proj.external_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors"
                    >
                      <RiExternalLinkLine className="w-3.5 h-3.5" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
