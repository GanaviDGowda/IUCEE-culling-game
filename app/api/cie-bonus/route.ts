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
  const meetingId = searchParams.get("meetingId");

  if (!year) {
    return NextResponse.json({ error: "Missing year parameter" }, { status: 400 });
  }

  try {
    let targetDate = new Date();
    if (meetingId && meetingId !== "active") {
      const { data: targetMeeting, error: targetError } = await supabase
        .from("meetings")
        .select("date")
        .eq("id", meetingId)
        .single();

      if (targetError || !targetMeeting) {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
      }
      targetDate = new Date(`${targetMeeting.date}T00:00:00`);
    }

    const { data: logs, error: logsError } = await supabase
      .from("point_logs")
      .select("created_at, meeting:meetings(date), user:users!point_logs_user_id_fkey!inner(year)")
      .eq("type", "cie_bonus")
      .eq("status", "confirmed")
      .eq("user.year", year)
      .order("created_at", { ascending: false })
      .limit(1);

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    const lastLog = logs?.[0] as any;
    const lastDateStr = lastLog?.meeting?.date || lastLog?.created_at || null;
    if (!lastDateStr) {
      return NextResponse.json({ success: true, last_date: null, days_remaining: 0 });
    }

    const lastDate = new Date(`${String(lastDateStr).slice(0, 10)}T00:00:00`);
    const msDiff = targetDate.getTime() - lastDate.getTime();
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
    const { data: targetMeeting, error: targetError } = await supabase
      .from("meetings")
      .select("date")
      .eq("id", meeting_id)
      .single();

    if (targetError || !targetMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const { data: lastLogs, error: lastLogError } = await supabase
      .from("point_logs")
      .select("created_at, meeting:meetings(date), user:users!point_logs_user_id_fkey!inner(year)")
      .eq("type", "cie_bonus")
      .eq("status", "confirmed")
      .eq("user.year", year)
      .order("created_at", { ascending: false })
      .limit(1);

    if (lastLogError) {
      return NextResponse.json({ error: lastLogError.message }, { status: 500 });
    }

    const lastLog = lastLogs?.[0] as any;
    const lastDateStr = lastLog?.meeting?.date || lastLog?.created_at || null;
    if (lastDateStr) {
      const targetDate = new Date(`${targetMeeting.date}T00:00:00`);
      const lastDate = new Date(`${String(lastDateStr).slice(0, 10)}T00:00:00`);
      const daysPassed = Math.floor((targetDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysPassed < 20) {
        return NextResponse.json(
          {
            error: `CIE Skip for Year ${year} is locked for this meet. Select a meet at least ${20 - daysPassed} more day(s) after the last CIE skip meet.`,
          },
          { status: 422 },
        );
      }
    }

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
