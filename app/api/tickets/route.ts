import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const [typesResult, purchasesResult] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("*")
      .eq("enabled", true)
      .order("active_point_cost", { ascending: false }),
    supabase
      .from("ticket_purchases")
      .select("*, ticket_type:ticket_types(*)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (typesResult.error) {
    return NextResponse.json({ error: typesResult.error.message }, { status: 500 });
  }

  if (purchasesResult.error) {
    return NextResponse.json({ error: purchasesResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ticket_types: typesResult.data || [],
    purchases: purchasesResult.data || [],
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ticket_code?: string; proposal_text?: string; event_title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("buy_ticket", {
    p_ticket_code: body.ticket_code,
    p_proposal_text: body.proposal_text || null,
    p_event_title: body.event_title || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.success) {
    return NextResponse.json({ error: data?.error || "Ticket purchase failed" }, { status: 422 });
  }

  return NextResponse.json({ data });
}
