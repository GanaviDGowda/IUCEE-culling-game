import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: error?.message || "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ data: event });
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
  const { 
    name, 
    description, 
    type, 
    pts_1st, 
    pts_2nd, 
    pts_special, 
    pts_participation, 
    pts_offered,
    event_date, 
    location, 
    external_link,
    registration_link,
    max_participants,
    apply_deadline,
    action // e.g. "close_registration"
  } = body;

  const updateFields: any = {};
  
  if (action === "close_registration") {
    // Setting apply_deadline to past instantly closes registration
    updateFields.apply_deadline = new Date().toISOString();
  } else {
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (type !== undefined) updateFields.type = type;
    if (pts_1st !== undefined) updateFields.pts_1st = pts_1st;
    if (pts_2nd !== undefined) updateFields.pts_2nd = pts_2nd;
    if (pts_special !== undefined) updateFields.pts_special = pts_special;
    if (pts_participation !== undefined) updateFields.pts_participation = pts_participation;
    if (pts_offered !== undefined) updateFields.pts_offered = pts_offered;
    if (event_date !== undefined) updateFields.event_date = event_date;
    if (location !== undefined) updateFields.location = location;
    if (external_link !== undefined) updateFields.external_link = external_link;
    if (registration_link !== undefined) updateFields.registration_link = registration_link;
    if (max_participants !== undefined) updateFields.max_participants = max_participants;
    if (apply_deadline !== undefined) updateFields.apply_deadline = apply_deadline;
  }

  updateFields.updated_at = new Date().toISOString();

  const { data: event, error: updateError } = await supabase
    .from("events")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ data: event });
}
