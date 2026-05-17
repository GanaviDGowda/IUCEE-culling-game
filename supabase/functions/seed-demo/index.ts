import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type DemoUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  usn: string | null;
  phone: string | null;
  branch: string;
  year: string;
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
  referral_code: string;
};

const DEMO_USERS: DemoUser[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    email: "suresh.nayak@mcehassan.ac.in",
    password: "Admin@123",
    name: "Dr. Suresh Nayak",
    usn: null,
    phone: "9845000001",
    branch: "CSE",
    year: "4",
    role: "admin",
    status: "active",
    tier: "active",
    redeemable_pts: 0,
    lifetime_pts: 0,
    current_quarter_pts: 0,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "ADMIN001",
  },
  {
    id: "b0000000-0000-0000-0000-000000000001",
    email: "kavitha.rao@mcehassan.ac.in",
    password: "Nodal@123",
    name: "Prof. Kavitha Rao",
    usn: null,
    phone: "9845000002",
    branch: "ECE",
    year: "4",
    role: "nodal_officer",
    status: "active",
    tier: "active",
    redeemable_pts: 0,
    lifetime_pts: 0,
    current_quarter_pts: 0,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "NODAL01",
  },
  {
    id: "c0000000-0000-0000-0000-000000000001",
    email: "4mc21cs010@mcehassan.ac.in",
    password: "Student@123",
    name: "Arjun Krishnamurthy",
    usn: "4MC21CS010",
    phone: "9900001001",
    branch: "CSE",
    year: "3",
    role: "student",
    status: "active",
    tier: "domain_master",
    redeemable_pts: 62,
    lifetime_pts: 95,
    current_quarter_pts: 14,
    streak: 7,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: "ai_ml",
    referred_by: null,
    referral_code: "ARJ8K1",
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    email: "4mc22cs045@mcehassan.ac.in",
    password: "Student@123",
    name: "Sneha Patel",
    usn: "4MC22CS045",
    phone: "9900001002",
    branch: "CSE",
    year: "2",
    role: "student",
    status: "active",
    tier: "elite",
    redeemable_pts: 38,
    lifetime_pts: 52,
    current_quarter_pts: 10,
    streak: 4,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: "web_dev",
    referred_by: null,
    referral_code: "SNE2P2",
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    email: "4mc21is023@mcehassan.ac.in",
    password: "Student@123",
    name: "Rahul Hegde",
    usn: "4MC21IS023",
    phone: "9900001003",
    branch: "ISE",
    year: "3",
    role: "student",
    status: "active",
    tier: "contributor",
    redeemable_pts: 22,
    lifetime_pts: 41,
    current_quarter_pts: 9,
    streak: 2,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "RHL3I3",
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    email: "4mc24ec067@mcehassan.ac.in",
    password: "Student@123",
    name: "Divya Shankar",
    usn: "4MC24EC067",
    phone: "9900001004",
    branch: "ECE",
    year: "1",
    role: "student",
    status: "active",
    tier: "active",
    redeemable_pts: 8,
    lifetime_pts: 8,
    current_quarter_pts: 5,
    streak: 1,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "DIV4E4",
  },
  {
    id: "c0000000-0000-0000-0000-000000000005",
    email: "4mc21me007@mcehassan.ac.in",
    password: "Student@123",
    name: "Vikram Nagaraj",
    usn: "4MC21ME007",
    phone: "9900001005",
    branch: "MECH",
    year: "4",
    role: "student",
    status: "active",
    tier: "domain_master",
    redeemable_pts: 78,
    lifetime_pts: 130,
    current_quarter_pts: 17,
    streak: 8,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: "hardware",
    referred_by: null,
    referral_code: "VIK5M5",
  },
  {
    id: "c0000000-0000-0000-0000-000000000006",
    email: "4mc23ee012@mcehassan.ac.in",
    password: "Student@123",
    name: "Pooja Gowda",
    usn: "4MC23EE012",
    phone: "9900001006",
    branch: "EEE",
    year: "2",
    role: "student",
    status: "danger_zone",
    tier: "active",
    redeemable_pts: 11,
    lifetime_pts: 18,
    current_quarter_pts: 2,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 1,
    warning_level: "first",
    domain_badge: null,
    referred_by: null,
    referral_code: "POO6E6",
  },
  {
    id: "c0000000-0000-0000-0000-000000000007",
    email: "4mc24cs089@mcehassan.ac.in",
    password: "Student@123",
    name: "Tejas Kulkarni",
    usn: "4MC24CS089",
    phone: "9900001007",
    branch: "CSE",
    year: "1",
    role: "student",
    status: "active",
    tier: "contributor",
    redeemable_pts: 15,
    lifetime_pts: 15,
    current_quarter_pts: 6,
    streak: 3,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "TEJ7C7",
  },
  {
    id: "c0000000-0000-0000-0000-000000000008",
    email: "4mc21cv034@mcehassan.ac.in",
    password: "Student@123",
    name: "Meghana Reddy",
    usn: "4MC21CV034",
    phone: "9900001008",
    branch: "CIVIL",
    year: "3",
    role: "student",
    status: "active",
    tier: "contributor",
    redeemable_pts: 26,
    lifetime_pts: 45,
    current_quarter_pts: 9,
    streak: 2,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: "design",
    referred_by: null,
    referral_code: "MEG8C8",
  },
  {
    id: "c0000000-0000-0000-0000-000000000009",
    email: "4mc21ec055@mcehassan.ac.in",
    password: "Student@123",
    name: "Nikhil Bhat",
    usn: "4MC21EC055",
    phone: "9900001009",
    branch: "ECE",
    year: "4",
    role: "student",
    status: "active",
    tier: "elite",
    redeemable_pts: 45,
    lifetime_pts: 88,
    current_quarter_pts: 11,
    streak: 9,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: "iot",
    referred_by: null,
    referral_code: "NIK9E9",
  },
  {
    id: "c0000000-0000-0000-0000-000000000010",
    email: "4mc23is078@mcehassan.ac.in",
    password: "Student@123",
    name: "Anjali Shetty",
    usn: "4MC23IS078",
    phone: "9900001010",
    branch: "ISE",
    year: "2",
    role: "student",
    status: "danger_zone",
    tier: "active",
    redeemable_pts: 5,
    lifetime_pts: 12,
    current_quarter_pts: 2,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 1,
    warning_level: "first",
    domain_badge: null,
    referred_by: null,
    referral_code: "ANJ0I0",
  },
  {
    id: "c0000000-0000-0000-0000-000000000011",
    email: "4mc23me041@mcehassan.ac.in",
    password: "Student@123",
    name: "Rohit Desai",
    usn: "4MC23ME041",
    phone: "9900001011",
    branch: "MECH",
    year: "2",
    role: "student",
    status: "active",
    tier: "contributor",
    redeemable_pts: 18,
    lifetime_pts: 29,
    current_quarter_pts: 5,
    streak: 1,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "ROH1M1",
  },
  {
    id: "c0000000-0000-0000-0000-000000000012",
    email: "4mc21bt019@mcehassan.ac.in",
    password: "Student@123",
    name: "Priya Nair",
    usn: "4MC21BT019",
    phone: "9900001012",
    branch: "BT",
    year: "3",
    role: "student",
    status: "active",
    tier: "active",
    redeemable_pts: 13,
    lifetime_pts: 22,
    current_quarter_pts: 4,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "PRI2B2",
  },
  {
    id: "c0000000-0000-0000-0000-000000000013",
    email: "4mc21au003@mcehassan.ac.in",
    password: "Student@123",
    name: "Karthik Murthy",
    usn: "4MC21AU003",
    phone: "9900001013",
    branch: "AUTO",
    year: "4",
    role: "student",
    status: "active",
    tier: "domain_master",
    redeemable_pts: 61,
    lifetime_pts: 102,
    current_quarter_pts: 8,
    streak: 5,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: "robotics",
    referred_by: null,
    referral_code: "KAR3A3",
  },
  {
    id: "c0000000-0000-0000-0000-000000000014",
    email: "4mc24ch027@mcehassan.ac.in",
    password: "Student@123",
    name: "Shruti Amin",
    usn: "4MC24CH027",
    phone: "9900001014",
    branch: "CHEM",
    year: "1",
    role: "student",
    status: "active",
    tier: "active",
    redeemable_pts: 4,
    lifetime_pts: 4,
    current_quarter_pts: 1,
    streak: 0,
    century_activated: false,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: null,
    referred_by: null,
    referral_code: "SHR4C4",
  },
  {
    id: "c0000000-0000-0000-0000-000000000015",
    email: "4mc21cs002@mcehassan.ac.in",
    password: "Student@123",
    name: "Aditya Joshi",
    usn: "4MC21CS002",
    phone: "9900001015",
    branch: "CSE",
    year: "4",
    role: "student",
    status: "active",
    tier: "elite",
    redeemable_pts: 32,
    lifetime_pts: 168,
    current_quarter_pts: 7,
    streak: 6,
    century_activated: true,
    skip_tokens: 0,
    warnings: 0,
    warning_level: "none",
    domain_badge: "data_science",
    referred_by: null,
    referral_code: "ADI5J5",
  },
];

const LEGACY_DEMO_EMAILS = [
  "admin@cullinggame.dev",
  "nodal2@cullinggame.dev",
  "coord@cullinggame.dev",
  "nodal@cullinggame.dev",
  "arjun@cullinggame.dev",
  "priya@cullinggame.dev",
  "rahul@cullinggame.dev",
  "sneha@cullinggame.dev",
  "kiran@cullinggame.dev",
  "divya@cullinggame.dev",
  "amit@cullinggame.dev",
  "meera@cullinggame.dev",
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

  const targetEmails = new Set([
    ...DEMO_USERS.map((u) => u.email.toLowerCase()),
    ...LEGACY_DEMO_EMAILS,
  ]);
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
      user_metadata: {
        name: u.name,
        role: u.role,
        branch: u.branch,
        year: u.year,
        usn: u.usn,
        phone: u.phone,
      },
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
      current_streak: u.streak,
      branch: u.branch,
      year: u.year,
      usn: u.usn,
      phone: u.phone,
      referral_code: u.referral_code,
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
      current_streak: u.streak,
      branch: u.branch,
      year: u.year,
      usn: u.usn,
      phone: u.phone,
      referral_code: u.referral_code,
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
