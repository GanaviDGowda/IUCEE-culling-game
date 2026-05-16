// Supabase Edge Function: add-user
// Deno 2 · SECURITY DEFINER pattern via service-role key
//
// POST /functions/v1/add-user
// Authorization: Bearer <admin user access token>
//
// Body (JSON):
// {
//   "name":     "Arjun Sharma",
//   "email":    "arjun@cullinggame.dev",
//   "password": "SecurePass@123",
//   "role":     "student" | "conveyor" | "nodal_officer" | "admin"
// }
//
// Returns (JSON):
// { "user": { ...auth_user }, "profile": { ...public.users row } }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ────────────────────────────────────────────────────────────────────

type UserRole = "student" | "conveyor" | "nodal_officer" | "admin";

interface AddUserPayload {
  name:     string;
  email:    string;
  password: string;
  role:     UserRole;
}

interface ErrorResponse { error: string; details?: string; }

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALLOWED_ROLES: UserRole[] = [
  "student", "conveyor", "nodal_officer", "admin",
];

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin":  origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

function json(body: unknown, status = 200, origin = "*") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function error(msg: string, status = 400, details?: string, origin = "*"): Response {
  const body: ErrorResponse = { error: msg };
  if (details) body.details = details;
  return json(body, status, origin);
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "*";

  // ── CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return error("Method not allowed. Use POST.", 405, undefined, origin);
  }

  // ── Env vars (set in Supabase dashboard → Edge Functions → Secrets)
  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return error(
      "Server misconfiguration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.",
      500, undefined, origin,
    );
  }

  // ── Authenticate the caller — must be an admin user or use service key directly
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return error("Missing or invalid Authorization header.", 401, undefined, origin);
  }

  const callerToken = authHeader.slice(7);

  // Admin client (service role) — bypasses RLS for admin operations
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Caller client (their JWT) — used to verify who is calling
  const callerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${callerToken}` } },
  });

  // Verify caller session
  const { data: { user: callerUser }, error: sessionErr } =
    await callerClient.auth.getUser(callerToken);

  if (sessionErr || !callerUser) {
    return error("Unauthorized: invalid token.", 401, undefined, origin);
  }

  // Verify caller is an admin in public.users
  const { data: callerProfile, error: profileErr } = await adminClient
    .from("users")
    .select("role")
    .eq("auth_id", callerUser.id)
    .single();

  if (profileErr || !callerProfile) {
    return error("Caller profile not found.", 403, undefined, origin);
  }

  if (callerProfile.role !== "admin") {
    return error(
      "Forbidden: only admins can create users via this endpoint.",
      403, undefined, origin,
    );
  }

  // ── Parse & validate body
  let payload: AddUserPayload;
  try {
    payload = await req.json();
  } catch {
    return error("Invalid JSON body.", 400, undefined, origin);
  }

  const { name, email, password, role } = payload;

  if (!name?.trim())  return error("'name' is required.", 400, undefined, origin);
  if (!email?.trim()) return error("'email' is required.", 400, undefined, origin);
  if (!password)      return error("'password' is required.", 400, undefined, origin);
  if (password.length < 6) {
    return error("'password' must be at least 6 characters.", 400, undefined, origin);
  }
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return error(
      `'role' must be one of: ${ALLOWED_ROLES.join(", ")}.`,
      400, undefined, origin,
    );
  }

  // ── Check for duplicate email
  const { data: existingUsers } = await adminClient
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .limit(1);

  if (existingUsers && existingUsers.length > 0) {
    return error("A user with this email already exists.", 409, undefined, origin);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedName = name.trim();

  // ── 1. Create auth user (admin API — no email confirmation required)
  // The DB trigger `on_auth_user_created` should create public.users.
  const { data: authData, error: createAuthErr } =
    await adminClient.auth.admin.createUser({
      email:            normalizedEmail,
      password,
      email_confirm:    true,           // skip email confirmation flow
      user_metadata: {
        name:  trimmedName,
        role,
      },
    });

  if (createAuthErr || !authData.user) {
    return error(
      "Failed to create auth user.",
      500,
      createAuthErr?.message,
      origin,
    );
  }

  const authUser = authData.user;

  // ── 2. Read/update the public.users profile row
  // Most installs create this row from the auth trigger. If the trigger has not
  // fired yet, or is missing in an older environment, fall back to inserting it.
  await new Promise((resolve) => setTimeout(resolve, 250));

  const { data: triggerProfile, error: triggerProfileErr } = await adminClient
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (triggerProfileErr) {
    await adminClient.auth.admin.deleteUser(authUser.id);
    return error(
      "Failed to verify created user profile. Auth user rolled back.",
      500,
      triggerProfileErr.message,
      origin,
    );
  }

  const profileCreatedByTrigger = Boolean(triggerProfile);
  let profile = triggerProfile;

  if (profile) {
    const { data: updatedProfile, error: updateErr } = await adminClient
      .from("users")
      .update({
        email: normalizedEmail,
        name: trimmedName,
        role,
      })
      .eq("auth_id", authUser.id)
      .select()
      .single();

    if (updateErr) {
      await adminClient.auth.admin.deleteUser(authUser.id);
      return error(
        "Failed to update created user profile. Auth user rolled back.",
        500,
        updateErr.message,
        origin,
      );
    }

    profile = updatedProfile;
  } else {
    const { data: insertedProfile, error: insertErr } = await adminClient
      .from("users")
      .insert({
        auth_id: authUser.id,
        email:   normalizedEmail,
        name:    trimmedName,
        role,
      })
      .select()
      .single();

    if (insertErr) {
      // Roll back: delete the auth user so it doesn't become an orphan
      await adminClient.auth.admin.deleteUser(authUser.id);

      return error(
        "Failed to create user profile. Auth user rolled back.",
        500,
        insertErr.message,
        origin,
      );
    }

    profile = insertedProfile;
  }

  if (!profile) {
    await adminClient.auth.admin.deleteUser(authUser.id);
    return error(
      "Failed to create user profile. Auth user rolled back.",
      500,
      "Profile row was not returned after create.",
      origin,
    );
  }

  // ── 3. Send a welcome notification if the trigger was unavailable.
  if (!profileCreatedByTrigger) {
    await adminClient.from("notifications").insert({
      user_id: profile.id,
      type:    "points_awarded",
      title:   "Welcome to the Culling Game",
      body:    `Your account has been created with the role: ${role}. May your cursed technique prevail.`,
      ref_type: null,
      ref_id:   null,
    });
  }

  // ── Success
  return json(
    {
      message: "User created successfully.",
      user: {
        id:       authUser.id,
        email:    authUser.email,
        confirmed: authUser.email_confirmed_at !== null,
      },
      profile: {
        id:            profile.id,
        name:          profile.name,
        email:         profile.email,
        role:          profile.role,
        tier:          profile.tier,
        referral_code: profile.referral_code,
        created_at:    profile.created_at,
      },
    },
    201,
    origin,
  );
});
