import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    profile: {
      id: "c0000000-0000-0000-0000-000000000001",
      email: "4mc21cs010@mcehassan.ac.in",
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
      skip_tokens: 2,
      warnings: 0,
      warning_level: "none",
      domain_badge: "ai_ml",
      referred_by: null,
      referral_code: "ARJ8K1",
      created_at: new Date().toISOString()
    },
    badges: [
      {
        earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        badge: {
          id: "badge-1",
          slug: "ai_ml",
          name: "AI/ML Enthusiast",
          description: "Completed 3 AI/ML-related tasks/projects.",
          type: "domain",
          icon_url: "/badges/aiml.png"
        }
      },
      {
        earned_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        badge: {
          id: "badge-2",
          slug: "perfect_attendance",
          name: "Century Club",
          description: "100% attendance in a single quarter.",
          type: "attendance",
          icon_url: "/badges/attendance.png"
        }
      }
    ],
  });
}
