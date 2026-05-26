import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch quarters
    const { data: quarters, error: qErr } = await supabase
      .from("quarters")
      .select("*")
      .order("created_at", { ascending: false });

    if (qErr) throw qErr;

    // 2. Fetch holidays (meetings with is_holiday = true)
    const { data: holidays, error: hErr } = await supabase
      .from("meetings")
      .select("id, title, date, location")
      .eq("is_holiday", true)
      .order("date", { ascending: false });

    if (hErr) throw hErr;

    // 3. Fetch badges catalogue
    const { data: badges, error: bErr } = await supabase
      .from("badges")
      .select("*")
      .order("name", { ascending: true });

    if (bErr) throw bErr;

    // 4. Fetch students for assignment
    const { data: students, error: sErr } = await supabase
      .from("users")
      .select("id, name, branch, year")
      .eq("role", "student")
      .order("name", { ascending: true });

    if (sErr) throw sErr;

    const { data: ticketTypes, error: ticketErr } = await supabase
      .from("ticket_types")
      .select("*")
      .order("active_point_cost", { ascending: false });

    if (ticketErr) throw ticketErr;

    // 5. Fetch point rules from static/dynamic mock config
    const pointRules = {
      attendance: 10,
      presentation: 25,
      project_update: 15,
      referral: 5,
      cie_skip_threshold: 4,
      elite_threshold: 200,
      domain_master_threshold: 450,
      streak_bonus_multiplier: 1.5
    };

    return NextResponse.json({
      quarters: quarters || [],
      holidays: holidays || [],
      badges: badges || [],
      students: students || [],
      ticketTypes: ticketTypes || [],
      pointRules
    });

  } catch (error: any) {
    console.error("System configuration load error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load system configuration metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { action, ...payload } = body;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Get admin profile id
    const { data: adminUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", user.id)
      .single();

    if (!adminUser || !["admin", "nodal_officer"].includes(adminUser.role)) {
      return NextResponse.json({ error: "Privileged access required" }, { status: 403 });
    }

    if (action === "upsert_ticket_type") {
      if (adminUser.role !== "nodal_officer") {
        return NextResponse.json({ error: "Only the nodal officer can change ticket rules" }, { status: 403 });
      }

      const { code, name, active_point_cost, description, approval_mode, enabled } = payload;
      const { data, error } = await supabase
        .from("ticket_types")
        .upsert({
          code,
          name,
          active_point_cost,
          description,
          approval_mode,
          enabled,
          updated_by: adminUser.id,
          updated_at: new Date().toISOString()
        }, { onConflict: "code" })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, ticket_type: data });
    }

    if (adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    if (action === "create_quarter") {
      const { label, start_date, end_date, is_current } = payload;
      
      // If current is selected, unset previous current quarters
      if (is_current) {
        await supabase
          .from("quarters")
          .update({ is_current: false, is_active: false })
          .eq("is_current", true);
      }

      const { data, error } = await supabase
        .from("quarters")
        .insert([{
          label,
          start_date,
          end_date,
          is_current: !!is_current,
          is_active: !!is_current,
          is_archived: false,
          archived: false
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, quarter: data });
    }

    if (action === "archive_quarter") {
      const { id } = payload;
      const { data, error } = await supabase
        .from("quarters")
        .update({ is_archived: true, is_current: false, is_active: false, archived: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, quarter: data });
    }

    if (action === "set_current_quarter") {
      const { id } = payload;
      
      // Clear previous current
      await supabase
        .from("quarters")
        .update({ is_current: false, is_active: false })
        .or("is_current.eq.true,is_active.eq.true");

      const { data, error } = await supabase
        .from("quarters")
        .update({ is_current: true, is_active: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, quarter: data });
    }

    if (action === "add_holiday") {
      const { title, date, location } = payload;
      const { data, error } = await supabase
        .from("meetings")
        .insert([{
          title,
          date,
          time: "00:00:00",
          location: location || "Campus-wide",
          agenda: "Campus skip-safe holiday. No attendance checks enforced.",
          is_holiday: true,
          created_by: adminUser.id
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, holiday: data });
    }

    if (action === "delete_holiday") {
      const { id } = payload;
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "assign_badge") {
      const { user_id, badge_id } = payload;
      const { data, error } = await supabase
        .from("user_badges")
        .insert([{ user_id, badge_id }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, user_badge: data });
    }

    if (action === "upload_badge") {
      const { slug, name, description, type, icon_url } = payload;
      const { data, error } = await supabase
        .from("badges")
        .insert([{ slug, name, description, type, icon_url }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, badge: data });
    }

    if (action === "update_quarter_dates") {
      const { id, label, start_date, end_date } = payload;
      const { data, error } = await supabase
        .from("quarters")
        .update({
          label,
          start_date,
          end_date
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, quarter: data });
    }

    if (action === "end_quarter_early") {
      const { id } = payload;

      // 1. Recalculate tiers for all students to lock in final achievements
      const { error: rpcError } = await supabase.rpc("recalculate_tiers");
      if (rpcError) throw rpcError;

      // 2. Archive and deactivate the completed semester
      const { error: archiveError } = await supabase
        .from("quarters")
        .update({
          is_current: false,
          is_active: false,
          is_archived: true,
          archived: true
        })
        .eq("id", id);
      if (archiveError) throw archiveError;

      // 3. Reset quarterly/semester points and grace tokens for active students for the new semester
      const { error: resetError } = await supabase
        .from("users")
        .update({
          redeemable_pts: 0,
          current_quarter_pts: 0,
          grace_used: false,
          status: "danger_zone",
          tier: "active"
        })
        .eq("role", "student")
        .neq("status", "removed");
      if (resetError) throw resetError;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported system action method" }, { status: 400 });

  } catch (error: any) {
    console.error("System configuration mutate error:", error);
    return NextResponse.json(
      { error: error.message || "Database mutation failure" },
      { status: 500 }
    );
  }
}
