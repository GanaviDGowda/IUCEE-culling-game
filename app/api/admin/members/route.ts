import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: Implement GET list with real DB call and filters
  return NextResponse.json({
    data: [
      { id: "1", name: "Mock Member 1", tier: "Special Grade" },
      { id: "2", name: "Mock Member 2", tier: "Grade 1" },
    ],
    count: 2,
  });
}
