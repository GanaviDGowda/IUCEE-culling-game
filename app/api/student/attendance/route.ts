import { NextResponse } from "next/server";

// Keep in-memory attendance list for the process so checking in dynamically appends to the list
let attendanceData = [
  {
    id: "att-1",
    meeting_id: "m-1",
    user_id: "c0000000-0000-0000-0000-000000000001",
    marked_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    used_skip: false,
    meeting: {
      id: "m-1",
      title: "Weekly Sync #5",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "Seminar Hall A",
      agenda: "Sprint reviews and domain progress presentations.",
      is_holiday: false
    }
  },
  {
    id: "att-2",
    meeting_id: "m-2",
    user_id: "c0000000-0000-0000-0000-000000000001",
    marked_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    used_skip: false,
    meeting: {
      id: "m-2",
      title: "Weekly Sync #4",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "Seminar Hall A",
      agenda: "Interactive session on cloud patterns.",
      is_holiday: false
    }
  },
  {
    id: "att-3",
    meeting_id: "m-3",
    user_id: "c0000000-0000-0000-0000-000000000001",
    marked_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    used_skip: true,
    meeting: {
      id: "m-3",
      title: "Weekly Sync #3",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "Seminar Hall B",
      agenda: "Introductory git and GitHub workshop.",
      is_holiday: false
    }
  }
];

export async function GET() {
  return NextResponse.json({
    data: attendanceData
  });
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const meetingId = body.meeting_id;
  if (!meetingId) {
    return NextResponse.json({ error: "meeting_id is required" }, { status: 400 });
  }

  // Simulate inserting attendance
  const newAttendance = {
    id: `att-${Math.random().toString(36).substring(2, 9)}`,
    meeting_id: meetingId,
    user_id: "c0000000-0000-0000-0000-000000000001",
    marked_at: new Date().toISOString(),
    used_skip: false,
    meeting: {
      id: meetingId,
      title: "Weekly Sync #6 (Today)",
      date: new Date().toLocaleDateString("sv-SE"),
      location: "Seminar Hall A",
      agenda: "Sprint updates and peer reviews.",
      is_holiday: false
    }
  };

  // Add to front of the list
  attendanceData = [newAttendance, ...attendanceData];

  return NextResponse.json({ success: true, data: newAttendance });
}
