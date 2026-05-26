"use client";

import { AlertCircle, Calendar, Megaphone, Info, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  body: string;
  tag: "general" | "urgent" | "event" | "info";
  pinned: boolean;
  created_at: string;
}

interface PointLog {
  id: string;
  points: number;
  type: string;
  note: string;
  status: string;
  created_at: string;
}

interface ActivityFeedProps {
  logs: PointLog[];
}

const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "EVALUATION CYCLE DEADLINE",
    body: "The current evaluation quarter will close on June 15th, 2026. All members below 15 points will enter the Danger Zone removal workflow. Verify your points ledger.",
    tag: "urgent",
    pinned: true,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
  },
  {
    id: "ann-2",
    title: "CIE HACKATHON RSVP NOW OPEN",
    body: "Registration for the upcoming CIE Cursed Techniques Hackathon is live in the Events tab. Participate to earn +2 participation points, with up to +30 points for podium finishes.",
    tag: "event",
    pinned: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
  },
  {
    id: "ann-3",
    title: "Skip Token Expiry policy",
    body: "Please note that skip tokens do not carry forward across academic semesters. Unused tokens will decay at the semester reset.",
    tag: "info",
    pinned: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function ActivityFeed({ logs }: ActivityFeedProps) {
  const pinned = mockAnnouncements.filter((a) => a.pinned);
  const otherAnnouncements = mockAnnouncements.filter((a) => !a.pinned);

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case "urgent":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "event":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "info":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "urgent":
        return <AlertCircle className="w-3.5 h-3.5" />;
      case "event":
        return <Calendar className="w-3.5 h-3.5" />;
      case "info":
        return <Info className="w-3.5 h-3.5" />;
      default:
        return <Megaphone className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Announcements Column (Left 2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Megaphone className="w-4 h-4 text-red-500" />
            COLONY ANNOUNCEMENTS
          </h3>
        </div>

        <div className="space-y-4">
          {/* Pinned / Urgent first */}
          {pinned.map((ann) => (
            <div
              key={ann.id}
              className={`kogane-panel p-5 ${
                ann.tag === "urgent"
                  ? "border-red-500/30 shadow-md shadow-red-500/5 animate-pulse-subtle"
                  : "border-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-heading border uppercase tracking-wider flex items-center gap-1 ${getTagStyle(
                      ann.tag
                    )}`}
                  >
                    {getTagIcon(ann.tag)}
                    <span>{ann.tag}</span>
                  </span>
                  {ann.pinned && (
                    <span className="text-[8px] font-heading font-semibold text-amber-500 tracking-wider">
                      PINNED
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-zinc-500 font-mono-stats">
                  {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight mt-3">{ann.title}</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{ann.body}</p>
            </div>
          ))}

          {/* Regular Announcements */}
          {otherAnnouncements.map((ann) => (
            <div key={ann.id} className="kogane-panel p-5 border-zinc-900">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-heading border uppercase tracking-wider flex items-center gap-1 ${getTagStyle(
                    ann.tag
                  )}`}
                >
                  {getTagIcon(ann.tag)}
                  <span>{ann.tag}</span>
                </span>
                <span className="text-[9px] text-zinc-500 font-mono-stats">
                  {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight mt-3">{ann.title}</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{ann.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Point Activity Ledger Column (Right 1/3) */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Zap className="w-4 h-4 text-red-500 animate-pulse" />
            RECENT ACTIVITY
          </h3>
        </div>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {logs && logs.length > 0 ? (
            logs.map((log) => {
              const isEarn = log.points > 0;
              return (
                <div
                  key={log.id}
                  className="p-3 bg-zinc-950/20 border border-zinc-900 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-800 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{log.note || log.type}</h4>
                    <span className="text-[9px] text-zinc-500 font-mono-stats block mt-0.5">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-bold font-mono-stats ${
                        isEarn ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isEarn ? "+" : ""}
                      {log.points}
                    </span>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isEarn ? "text-emerald-500" : "text-red-500"}`} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-8 border border-zinc-900 bg-zinc-950/10 rounded-xl text-zinc-500 text-xs">
              No recent point transactions recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
