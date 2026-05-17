"use client";

import { Badge } from "@/components/ui/badge";
import { 
  RiCoinsLine, 
  RiUserAddLine, 
  RiRefreshLine 
} from "@remixicon/react";

interface ActivityItem {
  id: string;
  type: "point_award" | "new_member";
  title: string;
  description: string;
  timestamp: string;
  tier?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  isRefreshing: boolean;
  onManualRefresh: () => void;
}

export function ActivityFeed({ activities, isRefreshing, onManualRefresh }: ActivityFeedProps) {
  
  // Format timestamps nicely
  function formatRelativeTime(dateString: string) {
    const elapsed = Date.now() - new Date(dateString).getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-heading">
          Live Activity Feed
        </h3>
        <button 
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-[9px] font-black text-zinc-550 hover:text-white uppercase tracking-wider font-heading transition-colors"
        >
          <RiRefreshLine className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
          Sync
        </button>
      </div>

      <div className="bg-zinc-900/10 border border-zinc-850 p-4 rounded-2xl">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-zinc-550 italic text-[11px]">
            No recent activity captured in the ledger.
          </div>
        ) : (
          <div className="relative border-l border-zinc-900 ml-3.5 pl-5 space-y-5 py-1">
            {activities.map((item) => {
              const isPoint = item.type === "point_award";
              return (
                <div 
                  key={item.id}
                  className="relative group animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  {/* Styled Event Pin */}
                  <span className={`absolute -left-[30px] top-0.5 w-5 h-5 rounded-md flex items-center justify-center border text-[10px] ${
                    isPoint 
                      ? "bg-red-955 border-red-500/20 text-red-400" 
                      : "bg-purple-955 border-purple-500/20 text-purple-400"
                  }`}>
                    {isPoint ? (
                      <RiCoinsLine className="w-3 h-3" />
                    ) : (
                      <RiUserAddLine className="w-3 h-3" />
                    )}
                  </span>

                  {/* Feed Text content */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-white leading-none">
                        {item.title}
                      </h4>
                      <span className="text-[8px] font-black uppercase text-zinc-550 tracking-wider font-heading shrink-0">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {item.description}
                    </p>
                    {item.tier && (
                      <Badge className="bg-zinc-850 text-zinc-400 border border-zinc-800 text-[7px] px-1 h-3.5 capitalize font-black mt-1">
                        {item.tier}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
