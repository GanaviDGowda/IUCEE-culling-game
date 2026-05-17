"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/admin/BottomSheet";
import { 
  RiShieldFlashLine, 
  RiMapPinLine, 
  RiGroupLine, 
  RiAddLine,
  RiMailSendLine,
  RiFileList3Line,
  RiLockLine
} from "@remixicon/react";

export function ActivitiesTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Form states (Create and Edit share)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("workshop");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [ptsOffered, setPtsOffered] = useState("20");
  const [maxParticipants, setMaxParticipants] = useState("50");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateOrEditEvent = async () => {
    if (!name || !eventDate) return;
    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/events/${editingId}` : "/api/admin/events";
      const method = editingId ? "PATCH" : "POST";
      
      const payload = {
        name,
        type,
        description,
        event_date: new Date(eventDate).toISOString(),
        location,
        pts_offered: parseInt(ptsOffered, 10),
        max_participants: parseInt(maxParticipants, 10)
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchEvents();
        setIsOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseRegistration = async (eventId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close_registration" })
      });
      if (res.ok) {
        await fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = (eventName: string) => {
    alert(`Broadcast announcement successfully dispatched to all participants for activity: ${eventName}`);
  };

  const openEdit = (event: any) => {
    setEditingId(event.id);
    setName(event.name);
    setType(event.type);
    setDescription(event.description || "");
    setEventDate(event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "");
    setLocation(event.location || "");
    setPtsOffered(String(event.pts_offered || 20));
    setMaxParticipants(String(event.max_participants || 50));
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setType("workshop");
    setDescription("");
    setEventDate("");
    setLocation("");
    setPtsOffered("20");
    setMaxParticipants("50");
  };

  return (
    <div className="space-y-6">
      
      {/* Header operations */}
      <div className="flex justify-between items-center bg-zinc-900/10 border border-zinc-850 p-4 rounded-xl">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Activity Management</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Track registrations, participation capacity and deadlines.</p>
        </div>
        <Button 
          size="sm" 
          className="h-8 rounded-lg text-[10px] font-black bg-red-655 hover:bg-red-600 text-white flex items-center gap-1"
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          <RiAddLine className="w-3.5 h-3.5" />
          Create Activity
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full bg-zinc-900/30" />
          <Skeleton className="h-28 w-full bg-zinc-900/30" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 border border-zinc-850 rounded-2xl bg-zinc-900/5 space-y-2">
          <RiShieldFlashLine className="w-8 h-8 text-zinc-650 mx-auto" />
          <p className="text-xs font-bold text-zinc-400">No active events found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const isClosed = event.apply_deadline && new Date(event.apply_deadline) <= new Date();
            return (
              <div 
                key={event.id}
                className="p-4 bg-zinc-900/15 border border-zinc-850 rounded-2xl space-y-4 hover:border-zinc-800 transition-all"
              >
                
                {/* Details layout */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white">{event.name}</h4>
                        <Badge className="bg-zinc-850 text-zinc-400 text-[7px] px-1 h-3.5 capitalize font-bold">
                          {event.type ? event.type.replace('_', ' ') : ""}
                        </Badge>
                      </div>
                      <span className="text-[8px] uppercase font-black text-zinc-555 block">
                        {new Date(event.event_date).toLocaleString()}
                      </span>
                    </div>

                    <Badge className="bg-red-950/20 text-red-400 border border-red-900/30 text-[9px] font-black h-5">
                      {event.pts_offered} Pts Offered
                    </Badge>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed truncate">
                    {event.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] text-zinc-550">
                    <span className="flex items-center gap-1">
                      <RiMapPinLine className="w-3.5 h-3.5 text-zinc-500" />
                      {event.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <RiGroupLine className="w-3.5 h-3.5 text-zinc-500" />
                      {event.participation_count || 0} / {event.max_participants || "∞"} Registered
                    </span>
                  </div>
                </div>

                {/* Inline Actions */}
                <div className="pt-3 border-t border-zinc-900/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 rounded-lg text-[9px] font-bold border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                      onClick={() => openEdit(event)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 rounded-lg text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 flex items-center gap-0.5"
                      onClick={() => handleBroadcast(event.name)}
                    >
                      <RiMailSendLine className="w-3.5 h-3.5" />
                      Broadcast
                    </Button>
                  </div>

                  {!isClosed ? (
                    <Button 
                      size="sm" 
                      className="h-7 rounded-lg text-[9px] font-black bg-zinc-900 border border-red-900/30 text-red-400 hover:bg-red-950/10 flex items-center gap-0.5"
                      onClick={() => handleCloseRegistration(event.id)}
                    >
                      <RiLockLine className="w-3 h-3 text-red-500" />
                      Close Registration
                    </Button>
                  ) : (
                    <span className="text-[8px] font-black uppercase text-zinc-650 tracking-wider">Registration Closed</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit BottomSheet */}
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {editingId ? "Edit Activity Parameters" : "Create Activity"}
            </h3>
            <p className="text-[10px] text-zinc-500">Configure participant registrations and point allocations.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-555">Activity Name</label>
              <Input
                placeholder="e.g. Kogane Web Hackathon"
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-555">Classification</label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl h-11 px-3 mt-1 outline-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="workshop">Workshop</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="cultural">Cultural</option>
                  <option value="nss">NSS</option>
                  <option value="industry_visit">Industry Visit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-555">Event Date / Time</label>
                <Input
                  type="datetime-local"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1 text-white"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-555">Points Offered</label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
                  value={ptsOffered}
                  onChange={(e) => setPtsOffered(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-555">Max Participant Slots</label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-zinc-555">Location / Platform</label>
              <Input
                placeholder="e.g. Seminar Hall / Discord Stage"
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-11 px-3 mt-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-zinc-555">Description</label>
              <Textarea
                placeholder="Add brief details for participants..."
                className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-16 p-3 mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline"
                className="flex-1 rounded-xl h-11 border-zinc-800 text-xs text-zinc-400"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-655 hover:bg-red-600 text-white rounded-xl h-11 text-xs font-black"
                onClick={handleCreateOrEditEvent}
                disabled={submitting || !name || !eventDate}
              >
                {submitting ? "Processing..." : editingId ? "Save Changes" : "Create Activity"}
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>

    </div>
  );
}
