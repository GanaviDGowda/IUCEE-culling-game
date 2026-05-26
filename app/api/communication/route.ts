import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch recent sent notifications joined with user info
    const { data: list, error } = await supabase
      .from("notifications")
      .select(`
        id,
        type,
        title,
        body,
        created_at,
        read,
        users (
          name,
          email,
          branch,
          year
        )
      `)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;

    // Group or format for sent log
    const history = list?.map((item: any) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      type: item.type,
      sent_at: item.created_at,
      recipient: item.users?.name || "Global Broadcast",
      recipient_branch: item.users?.branch,
      recipient_year: item.users?.year
    })) || [];

    // Also fetch students for the individual drop-down target
    const { data: students, error: studErr } = await supabase
      .from("users")
      .select("id, name, branch, year")
      .eq("role", "student")
      .order("name", { ascending: true });

    if (studErr) throw studErr;

    return NextResponse.json({
      history,
      students: students || []
    });

  } catch (error: any) {
    console.error("Communication load error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load broadcast history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { title, body: msgBody, target, targetValue, scheduledAt } = body;

    if (!title || !msgBody || !target) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Get admin details
    const { data: adminUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", user.id)
      .single();

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    // Filter recipients based on target type
    let recipientsQuery = supabase.from("users").select("id").eq("role", "student");

    if (target === "branch" && targetValue) {
      recipientsQuery = recipientsQuery.eq("branch", targetValue);
    } else if (target === "year" && targetValue) {
      recipientsQuery = recipientsQuery.eq("year", targetValue);
    } else if (target === "tier" && targetValue) {
      recipientsQuery = recipientsQuery.eq("tier", targetValue);
    } else if (target === "individual" && targetValue) {
      recipientsQuery = recipientsQuery.eq("id", targetValue);
    }

    const { data: recipients, error: recErr } = await recipientsQuery;
    if (recErr) throw recErr;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: "No student matches the broadcast filter" }, { status: 400 });
    }

    // Prepare insert payloads
    const notificationPayloads = recipients.map(r => ({
      user_id: r.id,
      type: "announcement",
      title,
      body: msgBody,
      ref_type: "announcement",
      read: false
    }));

    // If scheduledAt is set, we can simulate scheduling or tag the inserts
    const { error: insErr } = await supabase
      .from("notifications")
      .insert(notificationPayloads);

    if (insErr) throw insErr;

    return NextResponse.json({
      success: true,
      recipientsCount: recipients.length,
      scheduled: !!scheduledAt
    });

  } catch (error: any) {
    console.error("Communication send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
