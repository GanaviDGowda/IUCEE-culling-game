"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, MapPin, Clock, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { ApplySheet } from "./ApplySheet";
import { cn } from "@/lib/utils";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  agenda: string;
  registered: boolean;
}

interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  pts_offered: number;
  event_date: string;
  location: string;
  registered: boolean;
}

interface CalendarTabProps {
  meetings: Meeting[];
  events: Event[];
  onRSVPToggle: (id: string, isMeeting: boolean, currentlyRegistered: boolean) => Promise<void>;
  loadingId: string | null;
}

export function CalendarTab({
  meetings,
  events,
  onRSVPToggle,
  loadingId,
}: CalendarTabProps) {
  // Calendar month is fixed to May 2026 for high-fidelity demo consistency
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed: 4 is May

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isMeeting, setIsMeeting] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper: Get number of days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate blank spaces for previous month offset
  const blanks = Array.from({ length: firstDay });
  // Generate days array [1, 2, ..., daysInMonth]
  const monthDays = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  // Helper: Find events/meetings on a specific calendar day
  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    const dayMeetings = meetings.filter((m) => m.date === dateStr);
    const dayEvents = events.filter((e) => e.event_date === dateStr);

    return {
      meetings: dayMeetings,
      events: dayEvents,
      totalCount: dayMeetings.length + dayEvents.length,
    };
  };

  const handleDayClick = (dayEvents: { meetings: any[]; events: any[] }) => {
    if (dayEvents.meetings.length > 0) {
      setSelectedItem(dayEvents.meetings[0]);
      setIsMeeting(true);
      setIsDetailOpen(true);
    } else if (dayEvents.events.length > 0) {
      setSelectedItem(dayEvents.events[0]);
      setIsMeeting(false);
      setIsDetailOpen(true);
    }
  };

  const getDotColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "hackathon":
        return "bg-purple-500 shadow-sm shadow-purple-500/50";
      case "cultural":
        return "bg-orange-500 shadow-sm shadow-orange-500/50";
      case "nss":
      case "industry_visit":
        return "bg-blue-500 shadow-sm shadow-blue-500/50";
      default: // meeting
        return "bg-teal-500 shadow-sm shadow-teal-500/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-950 pb-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-tight">Colony Calendar</h3>
          <p className="text-xs text-zinc-500 mt-1">Holographic barrier synchronization times.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear((y) => y - 1);
              } else {
                setCurrentMonth((m) => m - 1);
              }
            }}
            className="p-1.5 border border-zinc-900 bg-zinc-950/40 rounded-lg hover:border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold font-heading text-white min-w-[100px] text-center uppercase tracking-wider">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear((y) => y + 1);
              } else {
                setCurrentMonth((m) => m + 1);
              }
            }}
            className="p-1.5 border border-zinc-900 bg-zinc-950/40 rounded-lg hover:border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-heading font-semibold text-zinc-500 tracking-wider">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Monthly Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Blanks */}
        {blanks.map((_, idx) => (
          <div key={`blank-${idx}`} className="aspect-square bg-zinc-950/10 border border-zinc-950/40 rounded-xl opacity-20" />
        ))}

        {/* Month Days */}
        {monthDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.totalCount > 0;
          const isToday = day === 26 && currentMonth === 4 && currentYear === 2026; // Mock Today = May 26, 2026

          return (
            <div
              key={`day-${day}`}
              onClick={hasEvents ? () => handleDayClick(dayEvents) : undefined}
              className={cn(
                "aspect-square p-2 border bg-zinc-950/30 rounded-xl flex flex-col justify-between transition-all relative group",
                hasEvents ? "border-red-500/10 hover:border-red-500/35 cursor-pointer bg-zinc-950/50" : "border-zinc-950",
                isToday && "border-red-600 bg-red-950/5 shadow-md shadow-red-600/5"
              )}
            >
              {/* Day number */}
              <span className={cn(
                "text-xs font-bold font-mono-stats",
                isToday ? "text-red-500" : hasEvents ? "text-zinc-200" : "text-zinc-550"
              )}>
                {day}
              </span>

              {/* Event indicators (colored dots) */}
              {hasEvents && (
                <div className="flex items-center gap-1 flex-wrap mt-auto">
                  {dayEvents.meetings.map((m) => (
                    <div
                      key={m.id}
                      className="w-1.5 h-1.5 rounded-full bg-teal-500"
                      title={m.title}
                    />
                  ))}
                  {dayEvents.events.map((e) => (
                    <div
                      key={e.id}
                      className={cn("w-1.5 h-1.5 rounded-full", getDotColor(e.type))}
                      title={e.name}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Details Box Legend */}
      <div className="p-4 bg-zinc-950/20 border border-zinc-900 rounded-xl space-y-2">
        <span className="text-[9px] font-heading font-semibold text-zinc-500 uppercase tracking-widest block">
          Colony Legend
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Colony Sync Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Hackathon Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>NSS / Industry Visit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Cultural Event</span>
          </div>
        </div>
      </div>

      {/* Apply / Detail sheet */}
      <ApplySheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={selectedItem}
        isMeeting={isMeeting}
        onRSVPToggle={onRSVPToggle}
      />
    </div>
  );
}
