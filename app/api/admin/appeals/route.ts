import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: Implement GET appeals
  return NextResponse.json({
    data: [
      { id: "app-1", member: "User 2", reason: "Missed points", status: "pending" }
    ],
  });
}

export async function PATCH(request: Request) {
  // TODO: Implement PATCH approve/reject
  const body = await request.json();
  return NextResponse.json({
    message: "Appeal updated",
    appeal: body,
  });
}
