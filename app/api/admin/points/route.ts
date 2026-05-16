import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: Implement GET logs
  return NextResponse.json({
    data: [
      { id: "log-1", member: "User 1", points: 50, reason: "Task complete" }
    ],
  });
}

export async function POST(request: Request) {
  // TODO: Implement POST award points
  const body = await request.json();
  return NextResponse.json({
    message: "Points awarded",
    awarded: body,
  });
}
