import { NextResponse } from "next/server";

let notifications = [
  {
    id: "notif-1",
    user_id: "c0000000-0000-0000-0000-000000000001",
    title: "Points Approved",
    message: "Your presentation bonus points (+25 pts) have been confirmed by coordinator.",
    type: "points",
    read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read_at: null
  },
  {
    id: "notif-2",
    user_id: "c0000000-0000-0000-0000-000000000001",
    title: "Badge Earned!",
    message: "Congratulations! You have unlocked the AI/ML Enthusiast badge.",
    type: "badge",
    read: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read_at: null
  },
  {
    id: "notif-3",
    user_id: "c0000000-0000-0000-0000-000000000001",
    title: "Upcoming CIE Hackathon",
    message: "RSVP for the CIE Hackathon coming up next week to earn point bonuses.",
    type: "general",
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ data: notifications });
}

export async function PATCH(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const id = typeof body.id === "string" ? body.id : null;
  const readAll = body.read_all === true;

  if (readAll) {
    notifications = notifications.map(n => ({
      ...n,
      read: true,
      read_at: new Date().toISOString()
    }));
    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
  }

  notifications = notifications.map(n => {
    if (n.id === id) {
      return {
        ...n,
        read: true,
        read_at: new Date().toISOString()
      };
    }
    return n;
  });

  return NextResponse.json({ success: true });
}
