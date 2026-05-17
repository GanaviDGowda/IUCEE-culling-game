"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RiArrowLeftSLine, 
  RiArrowRightSLine, 
  RiVideoChatLine, 
  RiShieldFlashLine,
  RiMapPinLine,
  RiFileList3Line
} from "@remixicon/react";

export function CalendarTab() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [selectedDateString, setSelectedDateString] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  async function fetchCalendarData() {
    setLoading(true);
    try {
      const [meetRes, eventRes] = await Promise.all([
        fetch("/api/admin/meetings"),
        fetch("/api/admin/events")
      ]);
      const meetData = await meetRes.json();
      const eventData = await eventRes.json();
      setMeetings(meetData.data || []);
      setEvents(eventData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calendar math helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyBoxes = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents([]);
    setSelectedDateString(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents([]);
    setSelectedDateString(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleSelectDay = (dayNum: number) => {
    const fullDate = new Date(year, month, dayNum);
    const dateString = fullDate.toISOString().split("T")[0];
    
    // Find all meetings and events on this date
    const dayMeetings = meetings.filter(m => m.date === dateString).map(m => ({ ...m, calendar_item_type: "meeting" }));
    const dayEvents = events.filter(e => {
      if (!e.event_date) return false;
      const eDate = new Date(e.event_date).toISOString().split("T")[0];
      return eDate === dateString;
    }).map(e => ({ ...e, calendar_item_type: "activity" }));

    setSelectedDayEvents([...dayMeetings, ...dayEvents]);
    setSelectedDateString(fullDate.toLocaleDateString(undefined, { dateStyle: "long" }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* Left Column: Calendar Controller + Grid */}
      <div className="space-y-4 lg:col-span-7">
        {/* Calendar header controller */}
        <div className="flex justify-between items-center bg-zinc-900/10 border border-zinc-850 p-2.5 rounded-xl">
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest font-heading">
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevMonth} 
              className="p-1 hover:bg-zinc-855 rounded-lg text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </button>
            <button 
              onClick={nextMonth} 
              className="p-1 hover:bg-zinc-855 rounded-lg text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <RiArrowRightSLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full bg-zinc-900/30 rounded-2xl" />
        ) : (
          <div className="bg-zinc-900/10 border border-zinc-850 p-3.5 rounded-2xl">
            {/* Day Names Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest pb-2.5 border-b border-zinc-900 font-heading">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Monthly Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 mt-2.5">
              {emptyBoxes.map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square" />
              ))}

              {daysArray.map((dayNum) => {
                const fullDate = new Date(year, month, dayNum);
                const dateString = fullDate.toISOString().split("T")[0];

                // Check if any meetings/events match this date
                const hasMeeting = meetings.some(m => m.date === dateString);
                const hasEvent = events.some(e => e.event_date && new Date(e.event_date).toISOString().split("T")[0] === dateString);

                const isSelected = selectedDateString && new Date(selectedDateString).getDate() === dayNum && new Date(selectedDateString).getMonth() === month;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`aspect-square border rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      isSelected 
                        ? "bg-red-955 border-red-500/40 hover:bg-red-950/30" 
                        : "hover:bg-zinc-900 border-transparent hover:border-zinc-800"
                    }`}
                  >
                    <span className={`text-sm sm:text-base font-black font-mono transition-colors ${isSelected ? "text-red-400" : "text-white"}`}>
                      {dayNum}
                    </span>
                    <div className="flex gap-0.5 mt-0.5 absolute bottom-1">
                      {hasMeeting && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />}
                      {hasEvent && <span className="w-1 h-1 rounded-full bg-purple-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Selected Day Agenda feed or placeholder */}
      <div className="lg:col-span-5 w-full lg:sticky lg:top-4">
        {selectedDateString ? (
          <div className="space-y-3 bg-zinc-900/5 border border-zinc-850 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">
              Agenda: {selectedDateString}
            </h3>

            {selectedDayEvents.length === 0 ? (
              <p className="text-[11px] text-zinc-555 italic py-2">No schedules or activities mapped to this date.</p>
            ) : (
              <div className="divide-y divide-zinc-900">
                {selectedDayEvents.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => item.calendar_item_type === "meeting" && router.push(`/events/${item.id}`)}
                    className={`py-2.5 flex items-center justify-between transition-colors ${
                      item.calendar_item_type === "meeting" ? "cursor-pointer hover:bg-zinc-900/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        item.calendar_item_type === "meeting" 
                          ? "bg-red-500/10 border-red-500/20 text-red-400" 
                          : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      }`}>
                        {item.calendar_item_type === "meeting" ? (
                          <RiVideoChatLine className="w-4 h-4" />
                        ) : (
                          <RiShieldFlashLine className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{item.title || item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-zinc-500">
                          <span className="flex items-center gap-0.5">
                            <RiMapPinLine className="w-3 h-3" />
                            {item.location || "Remote"}
                          </span>
                          {item.time && <span>Time: {item.time}</span>}
                        </div>
                      </div>
                    </div>

                    <Badge className={`text-[7px] font-black tracking-widest uppercase ${
                      item.calendar_item_type === "meeting" 
                        ? "bg-red-955 text-red-400 border border-red-900/30" 
                        : "bg-purple-955 text-purple-400 border border-purple-900/30"
                    }`}>
                      {item.calendar_item_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3.5 bg-zinc-900/5 border border-zinc-850 border-dashed p-6 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[280px] lg:min-h-[320px]">
            <RiFileList3Line className="w-7 h-7 text-zinc-650" />
            <div>
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">No Date Selected</h4>
              <p className="text-[10px] text-zinc-555 max-w-xs mt-1.5 leading-relaxed">
                Select a tactical calendar day to inspect detailed schedules, meetings, and activity alignments.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
