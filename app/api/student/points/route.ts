import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: [
      {
        id: "log-1",
        user_id: "c0000000-0000-0000-0000-000000000001",
        points: 10,
        type: "attendance",
        note: "Attended Weekly Sync #5",
        status: "confirmed",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        meeting: {
          title: "Weekly Sync #5",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      },
      {
        id: "log-2",
        user_id: "c0000000-0000-0000-0000-000000000001",
        points: 25,
        type: "presentation_bonus",
        note: "Presented project architecture demo",
        status: "confirmed",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        meeting: null
      },
      {
        id: "log-3",
        user_id: "c0000000-0000-0000-0000-000000000001",
        points: 15,
        type: "project_update",
        note: "Submitted milestone 1 code review",
        status: "confirmed",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        meeting: null
      },
      {
        id: "log-4",
        user_id: "c0000000-0000-0000-0000-000000000001",
        points: 5,
        type: "referral",
        note: "Referred Sneha Patel",
        status: "confirmed",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        meeting: null
      },
      {
        id: "log-5",
        user_id: "c0000000-0000-0000-0000-000000000001",
        points: 10,
        type: "attendance",
        note: "Attended Weekly Sync #4",
        status: "confirmed",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        meeting: {
          title: "Weekly Sync #4",
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
    ]
  });
}
