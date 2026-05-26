import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { MorePageClient } from "./MorePageClient";
import { redirect } from "next/navigation";

export default async function StudentMorePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", session.user.id)
    .single();

  if (!profile) {
    redirect("/auth/pending-approval");
  }

  // Fetch top 5 on leaderboard
  const { data: standings } = await supabase
    .from("leaderboard_current")
    .select("id, name, branch, year, tier, quarter_pts, rank")
    .order("rank", { ascending: true })
    .limit(5);

  // Fetch current user standing on leaderboard
  const { data: myStanding } = await supabase
    .from("leaderboard_current")
    .select("id, name, branch, year, tier, quarter_pts, rank")
    .eq("id", profile.id)
    .maybeSingle();

  // Fetch user notifications (last 20)
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, read, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const mappedStandings = (standings || []).map((s) => ({
    id: s.id,
    name: s.name,
    branch: s.branch || "",
    year: s.year || "",
    tier: s.tier || "active",
    quarter_pts: s.quarter_pts || 0,
    rank: s.rank || 0,
  }));

  const mappedMyStanding = myStanding
    ? {
        id: myStanding.id,
        name: myStanding.name,
        branch: myStanding.branch || "",
        year: myStanding.year || "",
        tier: myStanding.tier || "active",
        quarter_pts: myStanding.quarter_pts || 0,
        rank: myStanding.rank || 0,
      }
    : null;

  const mappedNotifications = (notifications || []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body || "",
    read: n.read,
    created_at: n.created_at,
  }));

  return (
    <div className="py-4 md:py-6">
      <MorePageClient
        standings={mappedStandings}
        myStanding={mappedMyStanding}
        initialNotifications={mappedNotifications}
      />
    </div>
  );
}
