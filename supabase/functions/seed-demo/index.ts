import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type DemoUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  status: string;
  tier: string;
  redeemable_pts: number;
  lifetime_pts: number;
  current_quarter_pts: number;
  streak: number;
  century_activated: boolean;
  skip_tokens: number;
  warnings: number;
  warning_level: string;
  domain_badge: string | null;
  referred_by: string | null;
};

const DEMO_USERS: DemoUser[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    email: "admin@cullinggame.dev",
    password: "Admin@123",
    name: "Rajan Mehta",
    role: "admin",
    status: "active",
    tier: "century",
    redeemable_pts: 200,
    lifetime_pts: 480,
    current_quarter_pts: 72,
    streak: 8,
    century_activated: true,
    skip_tokens: 2,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    email: "conveyor@cullinggame.dev",
    password: "Conv@123",
    name: "Lakshmi Nair",
    role: "conveyor",
    status: "active",
    tier: "elite",
    redeemable_pts: 45,
    lifetime_pts: 210,
    current_quarter_pts: 45,
    streak: 4,
    century_activated: false,
    skip_tokens: 1,
    warnings: 0,
    warning_level: "none",
    domain_badge: "Web Dev",
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    email: "coord@cullinggame.dev",
    password: "Coord@123",
    name: "Vikram Singh",
    role: "nodal_officer",
    status: "active",
    tier: "domain_master",
    redeemable_pts: 62,
    lifetime_pts: 310,
    current_quarter_pts: 62,
    streak: 6,
    century_activated: false,
    skip_tokens: 1,
    warnings: 0,
    warning_level: "none",
    domain_badge: "AI/ML",
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    email: "nodal@cullinggame.dev",
    password: "Nodal@123",
    name: "Ananya Iyer",
    role: "nodal_officer",
    status: "active",
    tier: "contributor",
    redeemable_pts: 18,
    lifetime_pts: 95,
    current_quarter_pts: 18,
    streak: 2,
    century_activated: false,
    skip_tokens: 1,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000005",
    email: "arjun@cullinggame.dev",
    password: "Student@123",
    name: "Arjun Sharma",
    role: "student",
    status: "active",
    tier: "elite",
    redeemable_pts: 38,
    lifetime_pts: 185,
    current_quarter_pts: 38,
    streak: 8,
    century_activated: false,
    skip_tokens: 2,
    warnings: 0,
    warning_level: "none",
    domain_badge: "Web Dev",
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000006",
    email: "priya@cullinggame.dev",
    password: "Student@123",
    name: "Priya Patel",
    role: "student",
    status: "active",
    tier: "contributor",
    redeemable_pts: 22,
    lifetime_pts: 110,
    current_quarter_pts: 22,
    streak: 4,
    century_activated: false,
    skip_tokens: 1,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: "c0000000-0000-0000-0000-000000000005",
  },
  {
    id: "c0000000-0000-0000-0000-000000000007",
    email: "rahul@cullinggame.dev",
    password: "Student@123",
    name: "Rahul Gupta",
    role: "student",
    status: "active",
    tier: "active",
    redeemable_pts: 12,
    lifetime_pts: 55,
    current_quarter_pts: 12,
    streak: 2,
    century_activated: false,
    skip_tokens: 1,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000008",
    email: "sneha@cullinggame.dev",
    password: "Student@123",
    name: "Sneha Reddy",
    role: "student",
    status: "danger_zone",
    tier: "active",
    redeemable_pts: 8,
    lifetime_pts: 32,
    current_quarter_pts: 8,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 1,
    warning_level: "first",
    domain_badge: null,
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000009",
    email: "kiran@cullinggame.dev",
    password: "Student@123",
    name: "Kiran Bhat",
    role: "student",
    status: "active",
    tier: "domain_master",
    redeemable_pts: 65,
    lifetime_pts: 290,
    current_quarter_pts: 65,
    streak: 6,
    century_activated: false,
    skip_tokens: 2,
    warnings: 0,
    warning_level: "none",
    domain_badge: "Hardware",
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000010",
    email: "divya@cullinggame.dev",
    password: "Student@123",
    name: "Divya Menon",
    role: "student",
    status: "active",
    tier: "contributor",
    redeemable_pts: 20,
    lifetime_pts: 88,
    current_quarter_pts: 20,
    streak: 3,
    century_activated: false,
    skip_tokens: 1,
    warnings: 0,
    warning_level: "none",
    domain_badge: "Design",
    referred_by: "c0000000-0000-0000-0000-000000000009",
  },
  {
    id: "c0000000-0000-0000-0000-000000000011",
    email: "amit@cullinggame.dev",
    password: "Student@123",
    name: "Amit Kumar",
    role: "student",
    status: "active",
    tier: "active",
    redeemable_pts: 5,
    lifetime_pts: 20,
    current_quarter_pts: 5,
    streak: 1,
    century_activated: false,
    skip_tokens: 1,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000012",
    email: "meera@cullinggame.dev",
    password: "Student@123",
    name: "Meera Joshi",
    role: "student",
    status: "danger_zone",
    tier: "active",
    redeemable_pts: 9,
    lifetime_pts: 40,
    current_quarter_pts: 9,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
  },
];

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let v = 0;
  for (let i = 0; i < a.length; i++) v |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return v === 0;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "*";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!bearer || !timingSafeEqual(bearer, serviceRoleKey)) {
    return new Response(JSON.stringify({ error: "Unauthorized: send Authorization: Bearer <service_role_key>" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const targetEmails = new Set(DEMO_USERS.map((u) => u.email.toLowerCase()));
  const authUsers: { id: string; email?: string }[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
    authUsers.push(...data.users);
    if (data.users.length < 200) break;
    page++;
  }

  for (const u of authUsers) {
    const em = u.email?.toLowerCase();
    if (em && targetEmails.has(em)) {
      await admin.auth.admin.deleteUser(u.id);
    }
  }

  const results: { email: string; ok: boolean; detail?: string }[] = [];

  for (const u of DEMO_USERS) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: u.email.toLowerCase(),
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });

    if (createErr || !created.user) {
      results.push({ email: u.email, ok: false, detail: createErr?.message });
      continue;
    }

    await new Promise((r) => setTimeout(r, 450));

    const { data: generatedProfile, error: generatedProfileErr } = await admin
      .from("users")
      .select("id")
      .eq("auth_id", created.user.id)
      .maybeSingle();

    if (generatedProfileErr) {
      results.push({ email: u.email, ok: false, detail: generatedProfileErr.message });
      continue;
    }

    if (generatedProfile?.id && generatedProfile.id !== u.id) {
      await admin.from("notifications").delete().eq("user_id", generatedProfile.id);
    }

    const patch = {
      id: u.id,
      status: u.status,
      tier: u.tier,
      redeemable_pts: u.redeemable_pts,
      lifetime_pts: u.lifetime_pts,
      current_quarter_pts: u.current_quarter_pts,
      streak: u.streak,
      century_activated: u.century_activated,
      skip_tokens: u.skip_tokens,
      warnings: u.warnings,
      warning_level: u.warning_level,
      domain_badge: u.domain_badge,
      referred_by: u.referred_by,
    };

    const { data: updated, error: upErr } = await admin
      .from("users")
      .update(patch)
      .eq("auth_id", created.user.id)
      .select("id")
      .maybeSingle();

    if (upErr) {
      results.push({ email: u.email, ok: false, detail: upErr.message });
      continue;
    }

    if (updated?.id === u.id) {
      results.push({ email: u.email, ok: true });
      continue;
    }

    const { error: insErr } = await admin.from("users").insert({
      id: u.id,
      auth_id: created.user.id,
      email: u.email.toLowerCase(),
      name: u.name,
      role: u.role,
      status: u.status,
      tier: u.tier,
      redeemable_pts: u.redeemable_pts,
      lifetime_pts: u.lifetime_pts,
      current_quarter_pts: u.current_quarter_pts,
      streak: u.streak,
      century_activated: u.century_activated,
      skip_tokens: u.skip_tokens,
      warnings: u.warnings,
      warning_level: u.warning_level,
      domain_badge: u.domain_badge,
      referred_by: u.referred_by,
    });

    if (insErr) {
      results.push({ email: u.email, ok: false, detail: `no profile row; insert failed: ${insErr.message}` });
    } else {
      results.push({ email: u.email, ok: true });
    }
  }

  const allOk = results.every((r) => r.ok);
  return new Response(JSON.stringify({ ok: allOk, results }), {
    status: allOk ? 200 : 422,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
});
