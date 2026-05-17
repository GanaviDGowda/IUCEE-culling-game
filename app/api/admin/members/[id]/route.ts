import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch User Profile
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // 2. Fetch Points History
  const { data: points } = await supabase
    .from("point_logs")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  // 3. Fetch Attendance joined with meetings
  const { data: attendance } = await supabase
    .from("attendance")
    .select("*, meetings(*)")
    .eq("user_id", id)
    .order("marked_at", { ascending: false });

  // Fetch all meetings to figure out absent sessions
  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .order("date", { ascending: false });

  // 4. Fetch Projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*, project_collaborators(*)")
    .eq("owner_id", id);

  // 5. Fetch Mentorships
  const { data: mentorships } = await supabase
    .from("mentorships")
    .select(`
      *,
      mentor:users!mentorships_mentor_id_fkey(id, name, email),
      mentee:users!mentorships_mentee_id_fkey(id, name, email)
    `)
    .or(`mentor_id.eq.${id},mentee_id.eq.${id}`);

  // 6. Fetch Warnings (notifications related to warnings/disciplinary actions)
  const { data: warnings } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", id)
    .in("type", ["danger_zone", "nodal_strike", "removal"])
    .order("created_at", { ascending: false });

  return NextResponse.json({
    data: {
      profile: user,
      points: points || [],
      attendance: attendance || [],
      meetings: meetings || [],
      projects: projects || [],
      mentorships: mentorships || [],
      warnings: warnings || []
    }
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { action, reason, severity, role, status, domain_badge } = body;

  // Case 1: Warn Action
  if (action === "warn") {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("warnings")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const newWarnings = (user.warnings || 0) + 1;
    const newLevel = newWarnings === 1 ? "first" : "second";

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        warnings: newWarnings,
        warning_level: newLevel,
        status: "danger_zone"
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Record warning notification
    await supabase.from("notifications").insert({
      user_id: id,
      type: "danger_zone",
      title: `Official Warning Issued (${newLevel.toUpperCase()} LEVEL)`,
      body: reason || `Disciplinary action taken by administrator.`,
    });

    return NextResponse.json({ data: updatedUser });
  }

  // Case 2: General updates (role, status, domain badge)
  const updates: any = {};
  if (role !== undefined) updates.role = role;
  if (status !== undefined) updates.status = status;
  if (domain_badge !== undefined) updates.domain_badge = domain_badge;

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // If status changed to 'removed', record notification
  if (status === "removed") {
    await supabase.from("notifications").insert({
      user_id: id,
      type: "removal",
      title: "Account Suspended / Removed",
      body: reason || "Your account has been removed from the active culling game by the administrator.",
    });
  }

  return NextResponse.json({ data: updatedUser });
}
