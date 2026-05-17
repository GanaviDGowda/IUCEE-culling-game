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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    // Fetch single project details with owner, team, and updates
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*, owner:users(id, name, email, avatar_url, branch, year)")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [
      { data: collaborators },
      { data: updates }
    ] = await Promise.all([
      supabase.from("project_collaborators").select("user:users(id, name, email, avatar_url, branch, year)").eq("project_id", id),
      supabase.from("project_updates").select("*, user:users(id, name)").eq("project_id", id).order("submitted_at", { ascending: false })
    ]);

    return NextResponse.json({
      project: {
        ...project,
        team: (collaborators || []).map((c) => c.user),
        updates: updates || []
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, adminId, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, updateId, name, description, github_url, external_url, active, funded } = body;

    // 1. Approve Weekly Update
    if (action === "approve_update") {
      if (!updateId) {
        return NextResponse.json({ error: "Missing updateId" }, { status: 400 });
      }

      // Fetch update data to find submitter (user_id)
      const { data: update, error: fetchErr } = await supabase
        .from("project_updates")
        .select("*")
        .eq("id", updateId)
        .single();

      if (fetchErr || !update) {
        return NextResponse.json({ error: "Weekly update not found" }, { status: 404 });
      }

      // Update status to confirmed
      const { error: updateErr } = await supabase
        .from("project_updates")
        .update({
          status: "confirmed",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", updateId);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      // Award 1 point for Project Update
      const { error: pointErr } = await supabase
        .from("point_logs")
        .insert({
          user_id: update.user_id,
          project_id: id,
          type: "project_update",
          points: 1,
          redeemable_delta: 1,
          lifetime_delta: 1,
          status: "confirmed",
          awarded_by: adminId,
          note: `Approved weekly update for project milestone`
        });

      // Update submitter's points
      await supabase.rpc("increment_user_points", {
        target_user_id: update.user_id,
        redeemable_pts_delta: 1,
        lifetime_pts_delta: 1
      });

      return NextResponse.json({ success: true, message: "Weekly update approved, 1 point awarded." });
    }

    // 2. Reject Weekly Update
    if (action === "reject_update") {
      if (!updateId) {
        return NextResponse.json({ error: "Missing updateId" }, { status: 400 });
      }

      const { error: updateErr } = await supabase
        .from("project_updates")
        .update({
          status: "rejected",
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", updateId);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Weekly update rejected." });
    }

    // 3. Approve Funding Claim
    if (action === "approve_funding") {
      // Get project details to award points to owner
      const { data: project, error: fetchErr } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Update project funding claimed status
      const { error: updateErr } = await supabase
        .from("projects")
        .update({
          funded_pts_claimed: true,
          funded_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      // Award 5 points for Project Funding Claim to owner
      await supabase
        .from("point_logs")
        .insert({
          user_id: project.owner_id,
          project_id: id,
          type: "project_funded",
          points: 5,
          redeemable_delta: 5,
          lifetime_delta: 5,
          status: "confirmed",
          awarded_by: adminId,
          note: `Approved funding claim reward for project`
        });

      // Update owner's points
      await supabase.rpc("increment_user_points", {
        target_user_id: project.owner_id,
        redeemable_pts_delta: 5,
        lifetime_pts_delta: 5
      });

      return NextResponse.json({ success: true, message: "Funding claim approved, 5 points awarded." });
    }

    // 4. Edit Project Details
    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (github_url !== undefined) updatePayload.github_url = github_url;
    if (external_url !== undefined) updatePayload.external_url = external_url;
    if (active !== undefined) updatePayload.active = active;
    if (funded !== undefined) updatePayload.funded = funded;

    const { error: updateErr } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Project parameters updated successfully." });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
