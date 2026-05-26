import { createClient } from "@/lib/supabase/server";
import { getPointRule, type PointLogType } from "@/lib/points";
import { NextResponse } from "next/server";

type AwardPayload = {
  user_id?: string;
  user_ids?: string[];
  points?: number;
  type?: string;
  note?: string;
};

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
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const userId = searchParams.get("user_id");

  let query = supabase
    .from("point_logs")
    .select("*, user:users!point_logs_user_id_fkey(id, name, email, avatar_url), awarded_by_user:users!point_logs_awarded_by_fkey(id, name), meeting:meetings(id, title, date, time, location)")
    .order("created_at", { ascending: false })
    .limit(300);

  if (status && status !== "all") query = query.eq("status", status);
  if (type && type !== "all") query = query.eq("type", type);
  if (userId) query = query.eq("user_id", userId);

  const { data: filteredData, error: filteredError } = await query;
  if (filteredError) {
    return NextResponse.json({ error: filteredError.message }, { status: 500 });
  }

  return NextResponse.json({ data: filteredData || [] });
}

export async function POST(request: Request) {
  const { supabase, adminId, error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: AwardPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUserIds = Array.isArray(body.user_ids) ? body.user_ids : body.user_id ? [body.user_id] : [];
  const userIds = [...new Set(rawUserIds.filter((id): id is string => typeof id === "string" && id.length > 0))];
  const rule = typeof body.type === "string" ? getPointRule(body.type) : undefined;
  const points = Number(body.points);
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (userIds.length === 0) {
    return NextResponse.json({ error: "Select at least one member" }, { status: 400 });
  }

  if (!rule) {
    return NextResponse.json({ error: "Invalid point type" }, { status: 400 });
  }

  if (!Number.isInteger(points) || points === 0) {
    return NextResponse.json({ error: "Points must be a non-zero integer" }, { status: 400 });
  }

  if (rule.direction === "deduction" && points >= 0) {
    return NextResponse.json({ error: "Deduction point values must be negative" }, { status: 400 });
  }

  if (rule.direction !== "deduction" && points <= 0) {
    return NextResponse.json({ error: "Award point values must be positive" }, { status: 400 });
  }

  if (rule.requiresNote && note.length < 3) {
    return NextResponse.json({ error: "A clear note is required for this point type" }, { status: 400 });
  }

  const { data: members, error: membersError } = await supabase
    .from("users")
    .select("id, name, redeemable_pts, status")
    .in("id", userIds);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  if (!members || members.length !== userIds.length) {
    return NextResponse.json({ error: "One or more selected members were not found" }, { status: 404 });
  }

  if (points < 0) {
    const insufficient = members.find((member) => member.redeemable_pts + points < 0);
    if (insufficient) {
      return NextResponse.json(
        { error: `${insufficient.name} does not have enough redeemable points for this deduction` },
        { status: 422 },
      );
    }
  }

  const defaultNote =
    note ||
    `${rule.label}: ${points > 0 ? "+" : ""}${points} point${Math.abs(points) === 1 ? "" : "s"}`;

  const rows = userIds.map((userId) => ({
    user_id: userId,
    points,
    redeemable_delta: points,
    lifetime_delta: Math.max(points, 0),
    type: rule.type as PointLogType,
    note: defaultNote,
    status: "pending",
    awarded_by: adminId,
  }));

  const { data: pendingLogs, error: insertError } = await supabase
    .from("point_logs")
    .insert(rows)
    .select("id, user_id");

  if (insertError || !pendingLogs || pendingLogs.length === 0) {
    return NextResponse.json({ error: insertError?.message || "Failed to insert point log" }, { status: 500 });
  }

  const logIds = pendingLogs.map((log) => log.id);

  const { data: confirmedLogs, error: updateError } = await supabase
    .from("point_logs")
    .update({ status: "confirmed", reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .in("id", logIds)
    .select("*, user:users!point_logs_user_id_fkey(id, name, email, avatar_url)");

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("notifications").insert(logIds.map((logId, index) => ({
    user_id: pendingLogs[index].user_id,
    type: points > 0 ? "points_awarded" : "point_deduction",
    title: points > 0 ? `Points awarded: +${points}` : `Points deducted: ${points}`,
    body: defaultNote,
    ref_type: "point_log",
    ref_id: logId,
  })));

  return NextResponse.json({
    data: confirmedLogs || [],
    summary: {
      count: confirmedLogs?.length || 0,
      points_each: points,
      type: rule.type,
    },
  });
}
