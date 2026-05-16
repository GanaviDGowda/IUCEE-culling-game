import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: Implement GET events
  return NextResponse.json({
    data: [
      { id: "evt-1", name: "Exchange Event", date: "2023-10-15" }
    ],
  });
}

export async function POST(request: Request) {
  // TODO: Implement POST create event
  const body = await request.json();
  return NextResponse.json({
    message: "Event created",
    event: body,
  });
}
