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
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "Missing year parameter" }, { status: 400 });
  }

  try {
    const { data, error: rpcError } = await supabase.rpc("get_last_cie_bonus_date", {
      p_year: year
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    const lastDateStr = data?.[0]?.last_date || null;
    if (!lastDateStr) {
      return NextResponse.json({ success: true, last_date: null, days_remaining: 0 });
    }

    const lastDate = new Date(lastDateStr);
    const now = new Date();
    const msDiff = now.getTime() - lastDate.getTime();
    const daysPassed = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 20 - daysPassed);

    return NextResponse.json({
      success: true,
      last_date: lastDateStr,
      days_remaining: daysRemaining
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query rate limit status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, adminId, error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: { year?: string; meeting_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { year, meeting_id } = body;
  if (!year || !["1", "2", "3", "4"].includes(year)) {
    return NextResponse.json({ error: "Select a valid year group (1-4)" }, { status: 400 });
  }

  if (!meeting_id) {
    return NextResponse.json({ error: "Missing meeting_id" }, { status: 400 });
  }

  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc("grant_year_cie_bonus", {
      p_year: year,
      p_admin_id: adminId,
      p_meeting_id: meeting_id
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    const result = typeof rpcResult === "string" ? JSON.parse(rpcResult) : rpcResult;
    if (result && result.success === false) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      count: result.count
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute bulk CIE bonus" }, { status: 500 });
  }
}
