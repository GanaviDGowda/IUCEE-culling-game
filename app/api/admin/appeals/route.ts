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

export async function GET() {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return authError;

  const { data, error: queryError } = await supabase
    .from("point_appeals")
    .select(`
      *,
      user:users(id, name, email, avatar_url),
      point_log:point_logs(id, points, type, note, created_at)
    `)
    .order("submitted_at", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const { supabase, adminId, error: authError } = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { appeal_id, action, review_note } = body;

  if (!appeal_id || !action || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: currentAppeal, error: currentAppealError } = await supabase
    .from("point_appeals")
    .select("*, point_log:point_logs(id, points, type, note, status)")
    .eq("id", appeal_id)
    .single();

  if (currentAppealError || !currentAppeal) {
    return NextResponse.json({ error: currentAppealError?.message || "Appeal not found" }, { status: 404 });
  }

  if (currentAppeal.status !== "pending") {
    return NextResponse.json({ error: "Appeal has already been reviewed" }, { status: 409 });
  }

  const { data: appeal, error: appealError } = await supabase
    .from("point_appeals")
    .update({
      status: action,
      review_note: review_note || null,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", appeal_id)
    .select()
    .single();

  if (appealError || !appeal) {
    return NextResponse.json({ error: appealError?.message || "Appeal not found" }, { status: 500 });
  }

  await supabase
    .from("point_logs")
    .update({
      appeal_status: action,
      appeal_note: review_note || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId
    })
    .eq("id", appeal.point_log_id);

  let reversalLog = null;
  const disputedLog = currentAppeal.point_log;
  if (action === "approved" && disputedLog?.points < 0) {
    const pointsToRestore = Math.abs(disputedLog.points);
    const { data: pendingReversal, error: reversalInsertError } = await supabase
      .from("point_logs")
      .insert({
        user_id: appeal.user_id,
        type: "manual_award",
        points: pointsToRestore,
        redeemable_delta: pointsToRestore,
        lifetime_delta: 0,
        status: "pending",
        awarded_by: adminId,
        note: review_note || `Appeal approved. Reversal for disputed deduction ${disputedLog.id}.`,
      })
      .select("id")
      .single();

    if (reversalInsertError || !pendingReversal) {
      return NextResponse.json(
        { error: reversalInsertError?.message || "Appeal approved, but reversal log could not be created" },
        { status: 500 },
      );
    }

    const { data: confirmedReversal, error: reversalConfirmError } = await supabase
      .from("point_logs")
      .update({ status: "confirmed", reviewed_by: adminId, reviewed_at: new Date().toISOString() })
      .eq("id", pendingReversal.id)
      .select()
      .single();

    if (reversalConfirmError) {
      return NextResponse.json({ error: reversalConfirmError.message }, { status: 500 });
    }

    reversalLog = confirmedReversal;
  }

  const pointsText = disputedLog ? `${disputedLog.points} points` : "points";
  await supabase.from("notifications").insert({
    user_id: appeal.user_id,
    type: "appeal_resolved",
    title: `Point Appeal ${action.toUpperCase()}`,
    body: review_note || `Your appeal regarding disputed ${pointsText} has been ${action}.`,
    ref_type: "point_appeal",
    ref_id: appeal.id
  });

  return NextResponse.json({ data: appeal, reversal_log: reversalLog });
}
