import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // TODO: Implement GET detail with real DB call
  return NextResponse.json({
    data: { id, name: "Mock Member Details", tier: "Special Grade" },
  });
}
