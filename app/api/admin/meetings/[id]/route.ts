import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: meeting, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !meeting) {
    return NextResponse.json({ error: error?.message || "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({ data: meeting });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { agenda, minutes, title, location, date, time } = body;

  const updateFields: any = {};
  if (agenda !== undefined) updateFields.agenda = agenda;
  if (minutes !== undefined) updateFields.minutes = minutes;
  if (title !== undefined) updateFields.title = title;
  if (location !== undefined) updateFields.location = location;
  if (date !== undefined) updateFields.date = date;
  if (time !== undefined) updateFields.time = time;

  updateFields.updated_at = new Date().toISOString();

  const { data: meeting, error: updateError } = await supabase
    .from("meetings")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ data: meeting });
}
