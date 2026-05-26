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

  return { supabase };
}

export async function GET(request: Request) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    // 1. Fetch active student members
    const { data: students, error: studentsError } = await supabase
      .from("users")
      .select("id, name, email, avatar_url, branch, year, tier, redeemable_pts, lifetime_pts, status, created_at")
      .eq("role", "student")
      .neq("status", "removed");

    if (studentsError || !students) {
      return NextResponse.json({ error: studentsError?.message || "Failed to load student profiles" }, { status: 500 });
    }

    // 2. Fetch confirmed point logs to compute the fast-rising indicator and domain scoring.
    const { data: logs, error: logsError } = await supabase
      .from("point_logs")
      .select("user_id, points, type, created_at")
      .eq("status", "confirmed");

    if (logsError || !logs) {
      return NextResponse.json({ error: logsError?.message || "Failed to load point logs" }, { status: 500 });
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    // Helper: Compute recent positive movement for the main active ranking.
    const pointsRising: Record<string, number> = {};

    // Domain matrices
    const pointsTech: Record<string, number> = {};
    const pointsInnovation: Record<string, number> = {};
    const pointsProjects: Record<string, number> = {};
    const pointsLeadership: Record<string, number> = {};
    const pointsCreative: Record<string, number> = {};

    logs.forEach((log) => {
      const createdTime = new Date(log.created_at).getTime();
      const elapsed = now - createdTime;
      const pts = log.points || 0;
      const uid = log.user_id;

      // Time periods
      if (elapsed <= sevenDaysMs) {
        pointsRising[uid] = (pointsRising[uid] || 0) + pts;
      }
      // Domain classifications
      if (["attendance", "event_1st", "event_2nd", "event_participation"].includes(log.type)) {
        pointsTech[uid] = (pointsTech[uid] || 0) + pts;
      }
      if (["project_funded", "presentation", "manual_award"].includes(log.type)) {
        pointsInnovation[uid] = (pointsInnovation[uid] || 0) + pts;
      }
      if (["project_update", "project_funded"].includes(log.type)) {
        pointsProjects[uid] = (pointsProjects[uid] || 0) + pts;
      }
      if (["presentation", "mentor_bonus", "referral_bonus"].includes(log.type)) {
        pointsLeadership[uid] = (pointsLeadership[uid] || 0) + pts;
      }
      if (["event_special", "event_participation"].includes(log.type)) {
        pointsCreative[uid] = (pointsCreative[uid] || 0) + pts;
      }
    });

    // 3. Main Rankings calculations
    const mainRanking = [...students]
      .map((s) => ({
        ...s,
        active_pts: s.redeemable_pts,
        fast_rising: (pointsRising[s.id] || 0) > 0,
        rising_pts: pointsRising[s.id] || 0,
      }))
      .sort((a, b) => b.redeemable_pts - a.redeemable_pts)
      .slice(0, 20);
    const bosRanking = [...students].sort((a, b) => b.lifetime_pts - a.lifetime_pts).slice(0, 20);

    // 4. Domain Rankings calculations
    const getDomainRank = (scoreMap: Record<string, number>) => {
      return [...students]
        .map((s) => ({ ...s, score: scoreMap[s.id] || 0 }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    };

    const domainRankings = {
      tech: getDomainRank(pointsTech),
      innovation: getDomainRank(pointsInnovation),
      projects: getDomainRank(pointsProjects),
      leadership: getDomainRank(pointsLeadership),
      creative: getDomainRank(pointsCreative),
    };

    // 5. Tier & Demographic Distributions
    const tierDistribution: Record<string, number> = { active: 0, contributor: 0, elite: 0, domain_master: 0, century: 0 };
    const branchDistribution: Record<string, number> = {};
    const yearDistribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
    let centuryUsersCount = 0;

    students.forEach((s) => {
      // Tier count
      const tierKey = s.tier || "active";
      tierDistribution[tierKey] = (tierDistribution[tierKey] || 0) + 1;

      // Branch count
      if (s.branch) {
        const br = s.branch.toUpperCase();
        branchDistribution[br] = (branchDistribution[br] || 0) + 1;
      }

      // Year count
      if (s.year) {
        const yr = String(s.year);
        yearDistribution[yr] = (yearDistribution[yr] || 0) + 1;
      }

      // Century users
      if (s.redeemable_pts >= 100 || s.tier === "century") {
        centuryUsersCount++;
      }
    });

    return NextResponse.json({
      main: {
        ranking: mainRanking,
        bos: bosRanking,
      },
      domain: domainRankings,
      distribution: {
        tiers: tierDistribution,
        branches: branchDistribution,
        years: yearDistribution,
        century_users: centuryUsersCount,
        total_students: students.length,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
