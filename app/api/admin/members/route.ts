import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const branch = searchParams.get("branch") || "All";
  const status = searchParams.get("status") || "All";

  const supabase = await createClient();

  let query = supabase
    .from("users")
    .select("*", { count: "exact" });

  // Filtering
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (branch !== "All") {
    query = query.eq("branch", branch);
  }

  if (status === "Danger Zone") {
    query = query.eq("status", "danger_zone");
  } else if (status === "All") {
    // Optionally exclude removed users? Usually admin wants to see all active/danger
    query = query.neq("status", "removed");
  }

  // Order by points or name? Let's do points descending
  query = query.order("lifetime_pts", { ascending: false });

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    count: count || 0,
  });
}
