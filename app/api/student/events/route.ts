import { NextResponse } from "next/server";

// Keep in-memory RSVP state for the session/process so toggling RSVP works dynamically
let rsvpEventIds = new Set<string>(["evt-1"]);
let rsvpMeetingIds = new Set<string>(["meet-1"]);

export async function GET() {
  const events = [
    {
      id: "evt-1",
      title: "CIE Hackathon 2026",
      description: "A 24-hour hackathon for building cursed technique projects.",
      event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "Incubation Center",
      max_participants: 100,
      points_value: 30,
      created_at: new Date().toISOString()
    },
    {
      id: "evt-2",
      title: "AI/ML Workshop",
      description: "Deep dive into model optimization and inference architectures.",
      event_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "Seminar Hall A",
      max_participants: 50,
      points_value: 15,
      created_at: new Date().toISOString()
    }
  ];

  const meetings = [
    {
      id: "meet-1",
      title: "Weekly Sync #6",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "14:30:00",
      location: "Seminar Hall A",
      agenda: "Status updates and peer reviews.",
      is_holiday: false,
      created_at: new Date().toISOString()
    },
    {
      id: "meet-2",
      title: "Weekly Sync #7",
      date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "14:30:00",
      location: "Seminar Hall A",
      agenda: "Guest lecture on industrial system designs.",
      is_holiday: false,
      created_at: new Date().toISOString()
    }
  ];

  const mappedEvents = events.map(e => ({
    ...e,
    registered: rsvpEventIds.has(e.id)
  }));

  const mappedMeetings = meetings.map(m => ({
    ...m,
    registered: rsvpMeetingIds.has(m.id)
  }));

  return NextResponse.json({
    events: mappedEvents,
    meetings: mappedMeetings
  });
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventId = typeof body.event_id === "string" ? body.event_id : null;
  const meetingId = typeof body.meeting_id === "string" ? body.meeting_id : null;
  const action = body.action === "cancel" ? "cancel" : "rsvp";

  if (!eventId && !meetingId) {
    return NextResponse.json({ error: "Either event_id or meeting_id is required" }, { status: 400 });
  }

  if (action === "cancel") {
    if (eventId) rsvpEventIds.delete(eventId);
    if (meetingId) rsvpMeetingIds.delete(meetingId);
    return NextResponse.json({ success: true, action: "cancelled" });
  } else {
    if (eventId) rsvpEventIds.add(eventId);
    if (meetingId) rsvpMeetingIds.add(meetingId);
    return NextResponse.json({ success: true, action: "rsvp_success" });
  }
}
