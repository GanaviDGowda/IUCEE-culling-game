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

  if (profileError || profile?.role !== "admin") {
    return { supabase, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, adminId: profile.id };
}

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("registration_requests")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function PATCH(request: Request) {
  const { supabase, adminId, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  const action = body.action === "reject" ? "reject" : "approve";
  const reviewNote = typeof body.review_note === "string" ? body.review_note.trim() : null;

  if (!id) {
    return NextResponse.json({ error: "Registration id is required" }, { status: 400 });
  }

  const { data: registration, error: registrationError } = await supabase
    .from("registration_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (registrationError || !registration) {
    return NextResponse.json({ error: "Registration request not found" }, { status: 404 });
  }

  if (registration.status !== "pending") {
    return NextResponse.json({ error: "Registration is already reviewed" }, { status: 409 });
  }

  if (action === "reject") {
    const { data, error: updateError } = await supabase
      .from("registration_requests")
      .update({
        status: "rejected",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  if (!registration.auth_uid) {
    return NextResponse.json({ error: "Registration has no linked auth user" }, { status: 422 });
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", registration.auth_uid)
    .maybeSingle();

  if (existingProfileError) {
    return NextResponse.json({ error: existingProfileError.message }, { status: 500 });
  }

  let referredBy: string | null = null;
  if (registration.referral_code) {
    const { data: referrer } = await supabase
      .from("users")
      .select("id")
      .eq("referral_code", registration.referral_code)
      .maybeSingle();
    referredBy = referrer?.id ?? null;
  }

  let profile = existingProfile;
  if (!profile) {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("users")
      .insert({
        auth_id: registration.auth_uid,
        email: registration.email.toLowerCase(),
        name: registration.name,
        role: (registration.role || "student") as any,
        status: "active",
        tier: "active",
        branch: registration.branch,
        year: registration.year,
        usn: registration.usn,
        phone: registration.phone,
        referred_by: referredBy,
        registration_id: registration.id,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    profile = insertedProfile;

    await supabase.from("notifications").insert({
      user_id: profile.id,
      type: "registration_approved",
      title: "Registration approved",
      body: "Your chapter account has been approved. Welcome to the Culling Game.",
    });
  }

  const { data: updatedRegistration, error: updateError } = await supabase
    .from("registration_requests")
    .update({
      status: "approved",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    data: updatedRegistration,
    profile_id: profile?.id,
  });
}
