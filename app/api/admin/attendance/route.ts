import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: Implement GET attendance
  return NextResponse.json({
    data: [
      { date: "2023-10-01", attendees: 45 }
    ],
  });
}

export async function POST(request: Request) {
  // TODO: Implement POST mark attendance
  const body = await request.json();
  return NextResponse.json({
    message: "Attendance marked",
    record: body,
  });
}
