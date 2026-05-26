import { NextResponse } from "next/server";

export async function GET() {
  const standings = [
    {
      id: "c0000000-0000-0000-0000-000000000001",
      name: "Arjun Krishnamurthy",
      branch: "CSE",
      year: 3,
      lifetime_pts: 95,
      current_quarter_pts: 14,
      tier: "domain_master",
      rank: 1
    },
    {
      id: "c0000000-0000-0000-0000-000000000005",
      name: "Vikram Nagaraj",
      branch: "MECH",
      year: 4,
      lifetime_pts: 80,
      current_quarter_pts: 17,
      tier: "domain_master",
      rank: 2
    },
    {
      id: "c0000000-0000-0000-0000-000000000002",
      name: "Sneha Patel",
      branch: "CSE",
      year: 2,
      lifetime_pts: 52,
      current_quarter_pts: 10,
      tier: "elite",
      rank: 3
    },
    {
      id: "c0000000-0000-0000-0000-000000000008",
      name: "Meghana Reddy",
      branch: "CIVIL",
      year: 3,
      lifetime_pts: 45,
      current_quarter_pts: 9,
      tier: "contributor",
      rank: 4
    },
    {
      id: "c0000000-0000-0000-0000-000000000009",
      name: "Nikhil Bhat",
      branch: "ECE",
      year: 4,
      lifetime_pts: 42,
      current_quarter_pts: 11,
      tier: "elite",
      rank: 5
    }
  ];

  const me = standings.find(s => s.id === "c0000000-0000-0000-0000-000000000001") || null;

  return NextResponse.json({
    standings,
    me
  });
}
