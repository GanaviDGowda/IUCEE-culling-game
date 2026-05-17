"use client";

import { useRouter } from "next/navigation";
import { 
  RiCheckboxCircleLine, 
  RiCoinsLine, 
  RiVideoChatLine, 
  RiBroadcastLine 
} from "@remixicon/react";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "Mark Attendance",
      desc: "Register current session attendees",
      icon: RiCheckboxCircleLine,
      color: "bg-red-500/10 border-red-500/20 text-red-400 hover:border-red-500/40",
      onClick: () => router.push("/points?tab=Attendance")
    },
    {
      title: "Award Points",
      desc: "Distribute points to students",
      icon: RiCoinsLine,
      color: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:border-purple-500/40",
      onClick: () => router.push("/points?tab=Award")
    },
    {
      title: "Create Meeting",
      desc: "Schedule a new training session",
      icon: RiVideoChatLine,
      color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-500/40",
      onClick: () => router.push("/events?tab=Meetings")
    },
    {
      title: "Broadcast Alert",
      desc: "Push announcements to all students",
      icon: RiBroadcastLine,
      color: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:border-amber-500/40",
      onClick: () => {
        alert("Broadcast announcement successfully dispatched to all colony members!");
      }
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">
        Quick Operations
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={act.onClick}
              className={`p-3.5 border rounded-2xl flex flex-col items-start text-left space-y-2.5 transition-all duration-300 ${act.color} group`}
            >
              <div className="p-2 rounded-xl bg-zinc-950/40 border border-zinc-900">
                <Icon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-white">{act.title}</h4>
                <p className="text-[9px] text-zinc-500 font-bold leading-normal">{act.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
