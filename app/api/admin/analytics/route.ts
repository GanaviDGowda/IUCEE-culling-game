import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch total counts
    const { data: users, error: usersErr } = await supabase
      .from("users")
      .select("id, name, email, branch, year, tier, status, redeemable_pts, lifetime_pts, domain_badge")
      .eq("role", "student");

    if (usersErr) throw usersErr;

    const totalStudents = users?.length || 0;
    const activeStudents = users?.filter(u => u.status === "active").length || 0;
    const retentionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 1000) / 10 : 100;

    // 2. Point Velocity & Engagement Trends
    const { data: pointLogs, error: logsErr } = await supabase
      .from("point_logs")
      .select("points, type, created_at, status, user_id, note")
      .eq("status", "confirmed");

    if (logsErr) throw logsErr;

    // Point Velocity (Points/Week in past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = pointLogs?.filter(l => new Date(l.created_at) >= thirtyDaysAgo) || [];
    const recentPoints = recentLogs.reduce((sum, l) => sum + l.points, 0);
    const pointVelocity = Math.round(recentPoints / 4.2); // ~4 weeks

    // Weekly engagement trends (6-week timeline)
    const engagementTrend = Array.from({ length: 6 }).map((_, i) => {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);

      const weeklyPoints = pointLogs
        ?.filter(l => {
          const date = new Date(l.created_at);
          return date >= start && date < end;
        })
        .reduce((sum, l) => sum + l.points, 0) || 0;

      return {
        week: `W-${5 - i}`,
        points: weeklyPoints,
        transactions: pointLogs?.filter(l => {
          const date = new Date(l.created_at);
          return date >= start && date < end;
        }).length || 0
      };
    }).reverse();

    // 3. Attendance trends and Inactive members list
    const { data: meetings, error: meetErr } = await supabase
      .from("meetings")
      .select("id, title, date, is_holiday")
      .order("date", { ascending: false });

    if (meetErr) throw meetErr;

    const { data: attendances, error: attErr } = await supabase
      .from("attendance")
      .select("meeting_id, user_id, used_skip");

    if (attErr) throw attErr;

    const recentMeetings = meetings?.slice(0, 5) || [];
    
    // Weekly attendance percentages
    const attendanceTrend = recentMeetings.map((m, idx) => {
      const marked = attendances?.filter(a => a.meeting_id === m.id) || [];
      const markedCount = marked.length;
      const rate = totalStudents > 0 ? Math.round((markedCount / totalStudents) * 100) : 0;
      return {
        meeting: m.title.length > 12 ? m.title.slice(0, 10) + ".." : m.title,
        rate,
        skips: marked.filter(a => a.used_skip).length
      };
    }).reverse();

    // Consistency score (students attending 80%+ of last 5 meetings)
    let consistentCount = 0;
    users?.forEach(u => {
      const userAttends = attendances?.filter(a => a.user_id === u.id && recentMeetings.some(rm => rm.id === a.meeting_id)).length || 0;
      if (recentMeetings.length > 0 && userAttends / recentMeetings.length >= 0.8) {
        consistentCount++;
      }
    });
    const consistencyScore = totalStudents > 0 ? Math.round((consistentCount / totalStudents) * 100) : 100;

    // Inactive members list (0 attendance in last 3 weeks)
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    const activeMeetingIds = meetings?.filter(m => new Date(m.date) >= threeWeeksAgo).map(m => m.id) || [];
    
    const inactiveMembers = users?.filter(u => {
      const attendsCount = attendances?.filter(a => a.user_id === u.id && activeMeetingIds.includes(a.meeting_id)).length || 0;
      return attendsCount === 0 && activeMeetingIds.length > 0;
    }).slice(0, 6) || [];

    // 4. Branch & Year demographic comparison
    const branchComparison = Object.entries(
      users?.reduce((acc, u) => {
        const b = u.branch || "Unknown";
        if (!acc[b]) acc[b] = { count: 0, pts: 0 };
        acc[b].count++;
        acc[b].pts += u.lifetime_pts;
        return acc;
      }, {} as Record<string, { count: number; pts: number }>) || {}
    ).map(([branch, meta]) => ({
      branch,
      averagePoints: meta.count > 0 ? Math.round(meta.pts / meta.count) : 0,
      students: meta.count
    }));

    const cohortView = [1, 2, 3, 4].map(yr => {
      const cohortUsers = users?.filter(u => u.year === yr) || [];
      const totalPts = cohortUsers.reduce((sum, u) => sum + u.lifetime_pts, 0);
      const avgPts = cohortUsers.length > 0 ? Math.round(totalPts / cohortUsers.length) : 0;
      
      // Calculate attendance average for this cohort
      let attendsSum = 0;
      cohortUsers.forEach(u => {
        attendsSum += attendances?.filter(a => a.user_id === u.id).length || 0;
      });
      const avgAttends = cohortUsers.length > 0 && meetings && meetings.length > 0
        ? Math.round((attendsSum / (cohortUsers.length * meetings.length)) * 100)
        : 85;

      return {
        year: `${yr}st Year`,
        averagePoints: avgPts,
        attendanceRate: avgAttends,
        count: cohortUsers.length
      };
    });

    // 5. BOS Rankings (Best Outgoing Student Candidates)
    // Mentorship score = sum of confirmed logs where type = 'mentorship_bonus' or notes contains 'mentorship'
    // Leadership score = sum of confirmed logs where type = 'presentation_bonus' or notes contains 'leadership' or 'present'
    const bosRankings = users
      ?.map(u => {
        const userLogs = pointLogs?.filter(l => l.user_id === u.id) || [];
        const mentorshipScore = userLogs
          .filter(l => l.type === "mentorship_bonus" || l.note?.toLowerCase().includes("mentorship"))
          .reduce((sum, l) => sum + l.points, 0);
        
        const leadershipScore = userLogs
          .filter(l => l.type === "presentation_bonus" || l.note?.toLowerCase().includes("leadership") || l.note?.toLowerCase().includes("present"))
          .reduce((sum, l) => sum + l.points, 0);

        return {
          id: u.id,
          name: u.name,
          branch: u.branch,
          year: u.year,
          lifetimePoints: u.lifetime_pts,
          domainBadge: u.domain_badge || "None",
          mentorshipScore,
          leadershipScore
        };
      })
      .sort((a, b) => b.lifetimePoints - a.lifetimePoints)
      .slice(0, 10) || [];

    return NextResponse.json({
      engagement: {
        retentionRate,
        pointVelocity,
        engagementTrend
      },
      attendance: {
        consistencyScore,
        attendanceTrend,
        inactiveMembers
      },
      demographics: {
        branchComparison,
        cohortView
      },
      bos: {
        rankings: bosRankings
      }
    });

  } catch (error: any) {
    console.error("Analytics aggregation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal database fault during aggregation" },
      { status: 500 }
    );
  }
}
