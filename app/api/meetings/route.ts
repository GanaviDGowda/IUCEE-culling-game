import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, date, time, location, agenda } = body;

  if (!title || !date || !time) {
    return NextResponse.json({ error: "Missing required fields (title, date, time)" }, { status: 400 });
  }

  // Create new meeting inside the database
  const { data: meeting, error: insertError } = await supabase
    .from("meetings")
    .insert({
      title,
      date,
      time,
      location: location || "Remote",
      agenda: agenda || "",
      created_by: adminUser.id
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data: meeting });
}
