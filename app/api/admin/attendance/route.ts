import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  let meetingId = searchParams.get("meetingId");

  if (!meetingId) {
    return NextResponse.json({ error: "Missing meetingId parameter" }, { status: 400 });
  }

  // If meetingId is "active", resolve the latest meeting chronologically
  if (meetingId === "active") {
    const { data: latestMeeting, error: meetError } = await supabase
      .from("meetings")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: false })
      .limit(1)
      .single();

    if (meetError || !latestMeeting) {
      return NextResponse.json({ data: { meeting: null, members: [] } });
    }
    meetingId = latestMeeting.id;
  }

  // Get meeting details
  const { data: meeting, error: meetDetailsError } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", meetingId)
    .single();

  if (meetDetailsError || !meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  // Fetch all active student members
  const { data: students, error: studentsError } = await supabase
    .from("users")
    .select("id, name, email, avatar_url, branch, year, current_streak, skip_tokens")
    .eq("role", "student")
    .is("removed_at", null)
    .order("name", { ascending: true });

  if (studentsError) {
    return NextResponse.json({ error: studentsError.message }, { status: 500 });
  }

  // Fetch all attendance logs for this meeting
  const { data: attendanceLogs, error: attError } = await supabase
    .from("attendance")
    .select("*")
    .eq("meeting_id", meetingId);

  if (attError) {
    return NextResponse.json({ error: attError.message }, { status: 500 });
  }

  // Fetch all cie_bonus point logs for this meeting
  const { data: cieBonusLogs } = await supabase
    .from("point_logs")
    .select("user_id")
    .eq("meeting_id", meetingId)
    .eq("type", "cie_bonus")
    .eq("status", "confirmed");

  // Map students to their attendance records
  const members = students.map((student) => {
    const log = attendanceLogs.find((l) => l.user_id === student.id);
    const hasCieBonus = cieBonusLogs?.some((c) => c.user_id === student.id) ?? false;
    return {
      ...student,
      has_cie_bonus: hasCieBonus,
      attendance: log ? {
        id: log.id,
        present: log.present,
        used_skip_token: log.used_skip_token,
        override_note: log.override_note
      } : null
    };
  });

  return NextResponse.json({ data: { meeting, members } });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the admin's database profile ID (to respect attendance_marked_by_fkey)
  const { data: adminProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", adminUser.id)
    .single();

  const realAdminId = adminProfile?.id || null;

  const body = await request.json();
  const { meeting_id, user_id, present, used_skip_token, override_note, bulk, updates } = body;

  if (!meeting_id) {
    return NextResponse.json({ error: "Missing meeting_id" }, { status: 400 });
  }

  // Handle bulk check-in (marks all students present)
  if (bulk) {
    const { data: students, error: studentsError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "student")
      .is("removed_at", null);

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 });
    }

    const rows = students.map((s) => ({
      meeting_id,
      user_id: s.id,
      present: true,
      used_skip_token: false,
      marked_by: realAdminId,
      marked_at: new Date().toISOString()
    }));

    const { error: upsertError } = await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "meeting_id, user_id" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Recalculate present_count for meeting
    await supabase
      .from("meetings")
      .update({ present_count: rows.length })
      .eq("id", meeting_id);

    return NextResponse.json({ success: true, count: rows.length });
  }

  // Handle custom bulk updates list
  if (updates && Array.isArray(updates)) {
    try {
      const { data: existingLogs } = await supabase
        .from("attendance")
        .select("user_id, used_skip_token")
        .eq("meeting_id", meeting_id);

      const toUpsert = [];
      const toDeleteUserIds = [];

      for (const u of updates) {
        const existing = existingLogs?.find((l) => l.user_id === u.user_id);
        const wasUsingSkip = existing?.used_skip_token ?? false;
        const isNowUsingSkip = u.used_skip_token === true;

        if (!wasUsingSkip && isNowUsingSkip) {
          // Consume Skip Token
          const { data: userRecord } = await supabase
            .from("users")
            .select("skip_tokens")
            .eq("id", u.user_id)
            .single();

          if (userRecord && userRecord.skip_tokens > 0) {
            await supabase
              .from("users")
              .update({ skip_tokens: userRecord.skip_tokens - 1 })
              .eq("id", u.user_id);

            const { data: token } = await supabase
              .from("skip_tokens")
              .select("id")
              .eq("user_id", u.user_id)
              .eq("used", false)
              .limit(1)
              .maybeSingle();

            if (token) {
              await supabase
                .from("skip_tokens")
                .update({
                  used: true,
                  used_at: new Date().toISOString(),
                  used_for_meeting: meeting_id
                })
                .eq("id", token.id);
            }

            const { data: logRes } = await supabase
              .from("point_logs")
              .insert({
                user_id: u.user_id,
                points: 1,
                redeemable_delta: 1,
                lifetime_delta: 1,
                type: "attendance",
                note: `Meeting attendance point (CIE Skip token applied)`,
                status: "pending",
                meeting_id,
                awarded_by: realAdminId
              })
              .select("id")
              .single();

            if (logRes) {
              await supabase
                .from("point_logs")
                .update({
                  status: "confirmed",
                  reviewed_by: realAdminId,
                  reviewed_at: new Date().toISOString()
                })
                .eq("id", logRes.id);
            }
          }
        } else if (wasUsingSkip && !isNowUsingSkip) {
          // Refund Skip Token
          const { data: userRecord } = await supabase
            .from("users")
            .select("skip_tokens")
            .eq("id", u.user_id)
            .single();

          await supabase
            .from("users")
            .update({ skip_tokens: (userRecord?.skip_tokens || 0) + 1 })
            .eq("id", u.user_id);

          await supabase
            .from("skip_tokens")
            .update({
              used: false,
              used_at: null,
              used_for_meeting: null
            })
            .eq("user_id", u.user_id)
            .eq("used_for_meeting", meeting_id);

          await supabase
            .from("point_logs")
            .delete()
            .eq("user_id", u.user_id)
            .eq("meeting_id", meeting_id)
            .eq("note", "Meeting attendance point (CIE Skip token applied)");
        }

        if (u.present === null) {
          toDeleteUserIds.push(u.user_id);
        } else {
          toUpsert.push({
            meeting_id,
            user_id: u.user_id,
            present: u.present,
            used_skip_token: u.used_skip_token ?? false,
            override_note: u.override_note || null,
            marked_by: realAdminId,
            marked_at: new Date().toISOString()
          });
        }
      }

      if (toUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from("attendance")
          .upsert(toUpsert, { onConflict: "meeting_id, user_id" });

        if (upsertError) {
          return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }
      }

      if (toDeleteUserIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("attendance")
          .delete()
          .eq("meeting_id", meeting_id)
          .in("user_id", toDeleteUserIds);

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
      }

      const { data: activeAttendance } = await supabase
        .from("attendance")
        .select("id")
        .eq("meeting_id", meeting_id)
        .eq("present", true);

      const presentCount = activeAttendance?.length || 0;
      await supabase
        .from("meetings")
        .update({ present_count: presentCount })
        .eq("id", meeting_id);

      return NextResponse.json({ success: true, count: toUpsert.length });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to process bulk save" }, { status: 500 });
    }
  }

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  // --- Single Skip Token Ledger Audit Transitions ---
  try {
    const { data: existingAtt } = await supabase
      .from("attendance")
      .select("present, used_skip_token")
      .eq("meeting_id", meeting_id)
      .eq("user_id", user_id)
      .maybeSingle();

    const wasUsingSkip = existingAtt?.used_skip_token ?? false;
    const isNowUsingSkip = used_skip_token === true;

    if (!wasUsingSkip && isNowUsingSkip) {
      const { data: userRecord } = await supabase
        .from("users")
        .select("skip_tokens, name")
        .eq("id", user_id)
        .single();

      if (!userRecord || userRecord.skip_tokens <= 0) {
        return NextResponse.json(
          { error: `${userRecord?.name || "Student"} has no skip tokens available.` },
          { status: 422 }
        );
      }

      await supabase
        .from("users")
        .update({ skip_tokens: userRecord.skip_tokens - 1 })
        .eq("id", user_id);

      const { data: token } = await supabase
        .from("skip_tokens")
        .select("id")
        .eq("user_id", user_id)
        .eq("used", false)
        .limit(1)
        .maybeSingle();

      if (token) {
        await supabase
          .from("skip_tokens")
          .update({
            used: true,
            used_at: new Date().toISOString(),
            used_for_meeting: meeting_id
          })
          .eq("id", token.id);
      }

      const { data: logRes } = await supabase
        .from("point_logs")
        .insert({
          user_id,
          points: 1,
          redeemable_delta: 1,
          lifetime_delta: 1,
          type: "attendance",
          note: `Meeting attendance point (CIE Skip token applied)`,
          status: "pending",
          meeting_id,
          awarded_by: realAdminId
        })
        .select("id")
        .single();

      if (logRes) {
        await supabase
          .from("point_logs")
          .update({
            status: "confirmed",
            reviewed_by: realAdminId,
            reviewed_at: new Date().toISOString()
          })
          .eq("id", logRes.id);
      }
    } else if (wasUsingSkip && !isNowUsingSkip) {
      const { data: userRecord } = await supabase
        .from("users")
        .select("skip_tokens")
        .eq("id", user_id)
        .single();

      await supabase
        .from("users")
        .update({ skip_tokens: (userRecord?.skip_tokens || 0) + 1 })
        .eq("id", user_id);

      await supabase
        .from("skip_tokens")
        .update({
          used: false,
          used_at: null,
          used_for_meeting: null
        })
        .eq("user_id", user_id)
        .eq("used_for_meeting", meeting_id);

      await supabase
        .from("point_logs")
        .delete()
        .eq("user_id", user_id)
        .eq("meeting_id", meeting_id)
        .eq("note", "Meeting attendance point (CIE Skip token applied)");
    }
  } catch (err: any) {
    console.error("Skip token transaction error:", err);
  }

  // Single member check-in / status update
  const { data: log, error: upsertError } = await supabase
    .from("attendance")
    .upsert({
      meeting_id,
      user_id,
      present: present ?? true,
      used_skip_token: used_skip_token ?? false,
      override_note: override_note || null,
      marked_by: realAdminId,
      marked_at: new Date().toISOString()
    }, { onConflict: "meeting_id, user_id" })
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Recalculate present count
  const { data: activeAttendance } = await supabase
    .from("attendance")
    .select("id")
    .eq("meeting_id", meeting_id)
    .eq("present", true);

  const presentCount = activeAttendance?.length || 0;
  await supabase
    .from("meetings")
    .update({ present_count: presentCount })
    .eq("id", meeting_id);

  return NextResponse.json({ data: log });
}
