import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { supabase, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, adminId: profile.id };
}

export async function GET(request: Request) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const branch = searchParams.get("branch") || "All";
  const status = searchParams.get("status") || "All";

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
    // Danger zone = any non-removed member whose active (redeemable) points are below the threshold
    query = query.neq("status", "removed").lt("redeemable_pts", 15);
  } else if (status === "All") {
    // Exclude removed users from the general list
    query = query.neq("status", "removed");
  }

  // Main member lists use active points. Lifetime points are reserved for BOS ranking.
  query = query.order("redeemable_pts", { ascending: false });

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    count: count || 0,
  });
}
