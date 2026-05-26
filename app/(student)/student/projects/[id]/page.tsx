"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  FolderGit2, Globe, Users, Plus, Award, ArrowLeft, Loader2, CheckCircle2, 
  Terminal, ShieldCheck, DollarSign, Upload, Info 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/student/BottomSheet";

interface Collaborator {
  name: string;
  role: string;
  initials: string;
}

interface ProjectUpdate {
  id: string;
  note: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

interface ProjectData {
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
  collaborators: Collaborator[];
  updates: ProjectUpdate[];
  funding_amount?: string;
  funding_source?: string;
}

const mockProjectsData: Record<string, ProjectData> = {
  "proj-1": {
    id: "proj-1",
    name: "Kogane Web Dashboard",
    description: "Next-generation student metrics hub with responsive layout, glassmorphic design and real-time visualization widgets.",
    github_url: "https://github.com/arjun/kogane",
    external_url: "https://kogane.dev",
    status: "active",
    active: true,
    owner: {
      name: "Arjun Krishnamurthy",
      email: "4mc21cs010@mcehassan.ac.in"
    },
    collaborators: [
      { name: "Arjun Krishnamurthy", role: "Owner / Lead Developer", initials: "AK" },
      { name: "Sneha Patel", role: "Collaborator / UI Designer", initials: "SP" }
    ],
    updates: [
      { id: "upd-1", note: "Implemented initial Supabase DB schema and index configurations.", status: "approved", created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "upd-2", note: "Created standard login forms and cookie session helpers.", status: "approved", created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  "proj-2": {
    id: "proj-2",
    name: "Cursed Speech Transcriber",
    description: "Real-time speech-to-text transcriber specializing in phoneme mapping and semantic matching under high noise ratios.",
    github_url: "https://github.com/arjun/cursed-speech",
    external_url: null,
    status: "funded",
    active: true,
    owner: {
      name: "Arjun Krishnamurthy",
      email: "4mc21cs010@mcehassan.ac.in"
    },
    collaborators: [
      { name: "Arjun Krishnamurthy", role: "Owner / NLP Developer", initials: "AK" },
      { name: "Nikhil Bhat", role: "Collaborator / Audio Systems", initials: "NB" }
    ],
    updates: [
      { id: "upd-1", note: "Optimized acoustic model inference pipeline using ONNX runtime.", status: "approved", created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    funding_amount: "50,000 INR",
    funding_source: "CIE Incubation Grant"
  }
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "team" | "updates" | "funding">("info");
  const [loading, setLoading] = useState(true);

  // Form modals state
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form variables
  const [updateText, setUpdateText] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingSource, setFundingSource] = useState("");

  useEffect(() => {
    // Load project mock details
    const data = mockProjectsData[projectId] || mockProjectsData["proj-1"];
    setProject(data);
    setLoading(false);
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        <p className="text-xs font-heading font-semibold text-zinc-500 tracking-wider">
          EXTRACTING PROJECT SEAL...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center max-w-md mx-auto mt-12 space-y-4">
        <h3 className="text-md font-heading font-bold text-white uppercase tracking-wider">
          Project Not Found
        </h3>
        <Link href="/student/projects" className="text-xs text-red-500 font-bold hover:underline">
          Return to projects roster
        </Link>
      </div>
    );
  }

  const handleWeeklyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const newUpdate: ProjectUpdate = {
        id: `upd-${Math.random().toString(36).substring(2, 9)}`,
        note: updateText,
        status: "pending",
        created_at: new Date().toISOString()
      };
      
      setProject(prev => prev ? {
        ...prev,
        updates: [newUpdate, ...prev.updates]
      } : null);

      toast.success("Progress update logged! Pending conveyor verification (+1 Pt).");
      setUpdateText("");
      setIsUpdateOpen(false);
    } catch {
      toast.error("Failed to submit progress update.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const initials = inviteName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      const newMember: Collaborator = {
        name: inviteName,
        role: "Collaborator",
        initials
      };

      setProject(prev => prev ? {
        ...prev,
        collaborators: [...prev.collaborators, newMember]
      } : null);

      toast.success(`${inviteName} invited to this project.`);
      setInviteName("");
      setInviteEmail("");
      setIsInviteOpen(false);
    } catch {
      toast.error("Failed to submit invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFunding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingAmount.trim() || !fundingSource.trim()) return;

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setProject(prev => prev ? {
        ...prev,
        status: "funded",
        funding_amount: fundingAmount,
        funding_source: fundingSource
      } : null);

      toast.success("Funding claim logged! Administrator review pending (+5 Pts).");
      setIsFundingOpen(false);
    } catch {
      toast.error("Failed to log funding claim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-4 md:py-6 space-y-6 max-w-4xl mx-auto px-4 md:px-6">
      {/* Return link */}
      <Link
        href="/student/projects"
        className="flex items-center gap-1.5 text-xs text-zinc-550 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Roster Overview</span>
      </Link>

      {/* Main Title info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-950 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white tracking-tight">{project.name}</h2>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-bold font-heading border uppercase tracking-wider",
              project.status === "funded"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            )}>
              {project.status}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono-stats block">
            Owner: {project.owner.name} ({project.owner.email})
          </span>
        </div>

        {/* Tab Selection buttons */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-1 flex flex-wrap items-center gap-1">
          {[
            { label: "Info", val: "info" },
            { label: "Team", val: "team" },
            { label: "Updates", val: "updates" },
            { label: "Funding", val: "funding" }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setActiveTab(item.val as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === item.val
                  ? "bg-red-950/20 text-red-500 border border-red-500/10 font-heading"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render active tabs */}
      <div className="space-y-6">
        {activeTab === "info" && (
          <div className="kogane-panel p-6 border-red-500/10 space-y-4">
            <div>
              <span className="text-[9px] font-heading font-semibold text-zinc-500 tracking-wider block">
                Project Abstract
              </span>
              <p className="text-sm text-zinc-350 leading-relaxed mt-2">{project.description}</p>
            </div>

            <div className="pt-4 border-t border-zinc-900/60 flex items-center gap-4 text-xs text-zinc-450">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {project.external_url && (
                <a
                  href={project.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Live Demo Host</span>
                </a>
              )}
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-heading font-bold text-zinc-450 tracking-wider">
                TEAM SORCERERS ({project.collaborators.length})
              </h3>
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold font-heading transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite Collaborator</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.collaborators.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-805 flex items-center justify-center text-[11px] font-mono-stats text-red-500 font-bold shrink-0">
                    {c.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{c.name}</h4>
                    <span className="text-[9px] text-zinc-550 block mt-1">{c.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "updates" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-heading font-bold text-zinc-450 tracking-wider">
                WEEKLY PROGRESS HISTORY ({project.updates.length})
              </h3>
              <button
                onClick={() => setIsUpdateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg text-[10px] font-bold font-heading transition-all active:scale-95 cursor-pointer shadow-lg shadow-red-600/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Weekly Update</span>
              </button>
            </div>

            <div className="space-y-3">
              {project.updates.map((u) => (
                <div
                  key={u.id}
                  className="p-4 border border-zinc-900 bg-zinc-950/40 rounded-xl flex items-start justify-between gap-4 hover:border-zinc-805 transition-all"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">{u.note}</p>
                    <span className="text-[9px] text-zinc-550 font-mono-stats block">
                      Submitted on {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <span className={cn(
                    "px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1",
                    u.status === "approved"
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                      : "text-amber-500 border-amber-500/20 bg-amber-500/5 animate-pulse"
                  )}>
                    {u.status === "approved" ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />}
                    <span>{u.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "funding" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-heading font-bold text-zinc-450 tracking-wider">
                COLONY FUNDING STATUS
              </h3>
              {project.status !== "funded" && (
                <button
                  onClick={() => setIsFundingOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-650 hover:bg-purple-750 text-white rounded-lg text-[10px] font-bold font-heading transition-all active:scale-95 cursor-pointer shadow-lg shadow-purple-600/10"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Notify Funding Claim</span>
                </button>
              )}
            </div>

            {project.status === "funded" ? (
              <div className="kogane-panel p-6 border-purple-500/20 bg-purple-950/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse shrink-0">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-heading tracking-wide">
                      PROJECT EXTERNAL FUNDING CLAIM CONFIRMED
                    </h4>
                    <span className="text-[10px] text-zinc-500 leading-none">
                      Bonus point allocation (+5 Pts) resolved.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-900/60 max-w-sm text-xs">
                  <div>
                    <span className="text-zinc-550 text-[9px] font-heading font-semibold uppercase tracking-wider block">
                      Grant Source
                    </span>
                    <span className="text-zinc-300 font-semibold block mt-0.5">{project.funding_source}</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 text-[9px] font-heading font-semibold uppercase tracking-wider block">
                      Awarded Value
                    </span>
                    <span className="text-purple-400 font-bold block mt-0.5 font-mono-stats">{project.funding_amount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-zinc-900 bg-zinc-950/20 rounded-2xl text-center space-y-3">
                <Info className="w-8 h-8 text-zinc-650 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-400 font-heading uppercase tracking-wide">
                  CLAIM NOT FILED
                </h4>
                <p className="text-xs text-zinc-550 max-w-md mx-auto leading-relaxed">
                  If this project receives any external incubator grant or sponsor funding, notify administrators within 7 days to claim a +5 point bonus.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Update BottomSheet */}
      <BottomSheet isOpen={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} title="Submit Weekly Update">
        <form onSubmit={handleWeeklyUpdate} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="unote" className="text-xs font-semibold text-zinc-400 block">
              Weekly Progress Note *
            </label>
            <textarea
              id="unote"
              required
              rows={4}
              placeholder="Detail what features, tests or integrations you completed this week..."
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-650 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Screenshot proof */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 block">
              Screenshot Attachment (Optional)
            </label>
            <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors relative cursor-pointer group">
              <Upload className="w-5 h-5 text-zinc-550 mx-auto mb-1.5 group-hover:text-zinc-350 transition-colors" />
              <span className="text-xs text-zinc-500 block">Upload progress selfie, screenshot or PDF.</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsUpdateOpen(false)}
              className="w-1/2 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Submit</span>}
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Invite Collaborator BottomSheet */}
      <BottomSheet isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Teammate">
        <form onSubmit={handleInvite} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="colName" className="text-xs font-semibold text-zinc-400 block">
              Teammate Name *
            </label>
            <input
              id="colName"
              type="text"
              required
              placeholder="e.g. Sneha Patel"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="colEmail" className="text-xs font-semibold text-zinc-400 block">
              University Email Address
            </label>
            <input
              id="colEmail"
              type="email"
              placeholder="4mc22cs045@mcehassan.ac.in"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="w-1/2 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send Invite</span>}
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Notify Funding BottomSheet */}
      <BottomSheet isOpen={isFundingOpen} onClose={() => setIsFundingOpen(false)} title="Log Funding Grant">
        <form onSubmit={handleFunding} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="fundSource" className="text-xs font-semibold text-zinc-400 block">
              Funding Agency / Sponsor *
            </label>
            <input
              id="fundSource"
              type="text"
              required
              placeholder="e.g. DST Incubator Grant or MCE CIE Fund"
              value={fundingSource}
              onChange={(e) => setFundingSource(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fundAmount" className="text-xs font-semibold text-zinc-400 block">
              Sanctioned Amount *
            </label>
            <input
              id="fundAmount"
              type="text"
              required
              placeholder="e.g. 50,000 INR"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Screenshot proof */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 block">
              Sanction Letter Proof (Optional)
            </label>
            <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors relative cursor-pointer group">
              <Upload className="w-5 h-5 text-zinc-550 mx-auto mb-1.5 group-hover:text-zinc-350 transition-colors" />
              <span className="text-xs text-zinc-500 block">Upload confirmation letter scan or email screenshot.</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsFundingOpen(false)}
              className="w-1/2 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Submit Claim</span>}
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
