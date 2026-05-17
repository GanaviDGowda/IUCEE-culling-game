"use client";

import { Badge } from "@/components/ui/badge";
import { 
  RiCheckLine, 
  RiCloseLine, 
  RiCalendarLine,
  RiCupLine 
} from "@remixicon/react";

interface AttendanceTabProps {
  member: any;
}

export function AttendanceTab({ member }: AttendanceTabProps) {
  const attendance = member.attendance || [];
  const meetings = member.meetings || [];

  // Map meeting presence
  const meetingList = meetings.map((meeting: any) => {
    const record = attendance.find((a: any) => a.meeting_id === meeting.id);
    return {
      ...meeting,
      present: !!record,
      usedSkip: record ? record.used_skip : false,
      markedAt: record ? record.marked_at : null
    };
  });

  return (
    <div className="space-y-4">
      {meetingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
          <RiCalendarLine className="w-12 h-12 mb-3 text-zinc-650" />
          <h3 className="text-sm font-semibold text-white">No Scheduled Sessions</h3>
          <p className="text-xs text-zinc-500 mt-1">There are no meetings recorded in the system.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Session Attendance Log</h3>
          <div className="grid gap-2">
            {meetingList.map((session: any) => (
              <div 
                key={session.id} 
                className="p-3 bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div className={`p-2 rounded-lg border ${
                    session.present 
                      ? session.usedSkip 
                        ? 'bg-amber-950/20 text-amber-400 border-amber-900/20'
                        : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/20'
                      : 'bg-red-950/20 text-red-400 border-red-900/20'
                  }`}>
                    {session.present ? (
                      session.usedSkip ? (
                        <RiCupLine className="w-4 h-4" />
                      ) : (
                        <RiCheckLine className="w-4 h-4" />
                      )
                    ) : (
                      <RiCloseLine className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{session.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {new Date(session.date).toLocaleDateString()} • {session.time || "No time"}
                    </p>
                    {session.markedAt && (
                      <p className="text-[8px] text-zinc-600 mt-1">
                        Checked-in: {new Date(session.markedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {session.present ? (
                    session.usedSkip ? (
                      <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-500 text-[8px] font-bold">
                        Skip Applied
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[8px] font-bold">
                        Present
                      </Badge>
                    )
                  ) : (
                    <Badge className="bg-red-500/10 border-red-500/20 text-red-500 text-[8px] font-bold">
                      Absent
                    </Badge>
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
