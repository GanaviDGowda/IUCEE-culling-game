"use client";

import { 
  RiGroupLine, 
  RiShieldCheckLine, 
  RiQuestionAnswerLine, 
  RiTimeLine 
} from "@remixicon/react";

interface MetricsGridProps {
  metrics: {
    active_members: number;
    danger_zone: number;
    attendance_rate: number;
    open_appeals: number;
    current_quarter: string;
  };
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const cards = [
    {
      title: "Active Students",
      value: metrics.active_members,
      icon: RiGroupLine,
      color: "text-red-400 border-red-950/20 bg-red-955",
      desc: `${metrics.danger_zone} in danger zone`,
    },
    {
      title: "Attendance Rate",
      value: `${metrics.attendance_rate}%`,
      icon: RiShieldCheckLine,
      color: "text-green-400 border-green-950/20 bg-green-955",
      desc: "Target exceeds 80%",
    },
    {
      title: "Open Appeals",
      value: metrics.open_appeals,
      icon: RiQuestionAnswerLine,
      color: "text-amber-400 border-amber-950/20 bg-amber-955",
      desc: `${metrics.open_appeals === 1 ? "1 item" : `${metrics.open_appeals} items`} pending review`,
    },
    {
      title: "Current Quarter",
      value: metrics.current_quarter,
      icon: RiTimeLine,
      color: "text-blue-400 border-blue-950/20 bg-blue-955",
      desc: "Tactical scoring active",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx}
            className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-3 hover:border-zinc-800 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 font-heading">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.color.split(" ")[1]} ${card.color.split(" ")[2]}`}>
                <Icon className={`w-4 h-4 ${card.color.split(" ")[0]} group-hover:scale-110 transition-transform`} />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-black text-white tracking-tight font-mono">
                {card.value}
              </p>
              <p className="text-[9px] text-zinc-500 font-bold tracking-wide uppercase">
                {card.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
