"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/student/BottomSheet";
import { FolderGit2, Plus, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RegisterProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newProject: any) => void;
}

export function RegisterProjectSheet({
  isOpen,
  onClose,
  onRegisterSuccess,
}: RegisterProjectSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required.");
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
        throw new Error(resData.error || "Failed to register project");
      }

      toast.success("Project registered successfully! Invite collaborators next.");
      onRegisterSuccess(resData.data);
      setName("");
      setDescription("");
      setGithubUrl("");
      setExternalUrl("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Register New Project">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-zinc-100">
        <div className="space-y-1.5">
          <label htmlFor="pname" className="text-xs font-semibold text-zinc-400">
            Project Name *
          </label>
          <input
            id="pname"
            type="text"
            required
            placeholder="e.g. Kogane Web Dashboard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pdesc" className="text-xs font-semibold text-zinc-400">
            Description
          </label>
          <textarea
            id="pdesc"
            rows={3}
            placeholder="Explain the purpose, architecture, and technology of your project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-655 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pgh" className="text-xs font-semibold text-zinc-400">
            GitHub Repository URL
          </label>
          <input
            id="pgh"
            type="url"
            placeholder="https://github.com/username/project"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pext" className="text-xs font-semibold text-zinc-400">
            External Live Demo URL
          </label>
          <input
            id="pext"
            type="url"
            placeholder="https://project-demo.com"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
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
  );
}
