import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also query the registrations count per event from calendar_rsvp
  const { data: rsvps, error: rsvpError } = await supabase
    .from("calendar_rsvp")
    .select("event_id");

  let mappedData = data || [];
  if (!rsvpError && rsvps) {
    mappedData = data.map((event) => {
      const participationCount = rsvps.filter((r) => r.event_id === event.id).length;
      return {
        ...event,
        participation_count: participationCount
      };
    });
  }

  return NextResponse.json({ data: mappedData });
}

export async function POST(request: Request) {
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
    apply_deadline
  } = body;

  if (!name || !type || !event_date) {
    return NextResponse.json({ error: "Missing required fields (name, type, event_date)" }, { status: 400 });
  }

  // Create new event
  const { data: event, error: insertError } = await supabase
    .from("events")
    .insert({
      name,
      description: description || "",
      type,
      pts_1st: pts_1st || null,
      pts_2nd: pts_2nd || null,
      pts_special: pts_special || null,
      pts_participation: pts_participation || null,
      pts_offered: pts_offered || null,
      event_date,
      location: location || "Remote",
      external_link: external_link || "",
      registration_link: registration_link || "",
      max_participants: max_participants || null,
      apply_deadline: apply_deadline || null,
      created_by: adminUser.id
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data: event });
}
