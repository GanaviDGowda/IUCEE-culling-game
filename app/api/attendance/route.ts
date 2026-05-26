import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type AttendanceUpdate = {
  user_id: string;
  present: boolean | null;
  used_skip_token?: boolean;
  override_note?: string | null;
};

function formatMeetingStamp(meeting: any) {
  const dateText = meeting.date ? new Date(`${meeting.date}T00:00:00`).toLocaleDateString("en-IN") : "unscheduled date";
  const timeText = meeting.time ? String(meeting.time).slice(0, 5) : "time TBA";
  const venueText = meeting.location || "Remote";
  return `${meeting.title} on ${dateText} at ${timeText}, ${venueText}`;
}

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

  return { supabase, adminId: profile.id };
}

async function refreshPresentCount(supabase: any, meetingId: string) {
  const { count } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("meeting_id", meetingId)
    .eq("present", true);

  await supabase
    .from("meetings")
    .update({ present_count: count || 0 })
    .eq("id", meetingId);
}

async function confirmAttendancePointLog(supabase: any, payload: any) {
  const { data: log, error: insertError } = await supabase
    .from("point_logs")
    .insert({
      ...payload,
      points: 1,
      redeemable_delta: 1,
      lifetime_delta: 1,
      type: "attendance",
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !log) {
    throw new Error(insertError?.message || "Failed to create attendance point log");
  }

  const { error: confirmError } = await supabase
    .from("point_logs")
    .update({
      status: "confirmed",
      reviewed_by: payload.awarded_by,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", log.id);

  if (confirmError) {
    throw new Error(confirmError.message);
  }
}

async function consumeSkipToken(supabase: any, userId: string, meetingId: string) {
  const { data: userRecord } = await supabase
    .from("users")
    .select("skip_tokens, name")
    .eq("id", userId)
    .single();

  if (!userRecord || userRecord.skip_tokens <= 0) {
    throw new Error(`${userRecord?.name || "Student"} has no skip tokens available.`);
  }

  await supabase
    .from("users")
    .update({ skip_tokens: userRecord.skip_tokens - 1 })
    .eq("id", userId);

  const { data: token } = await supabase
    .from("skip_tokens")
    .select("id")
    .eq("user_id", userId)
    .eq("used", false)
    .limit(1)
    .maybeSingle();

  if (token) {
    await supabase
      .from("skip_tokens")
      .update({
        used: true,
        used_at: new Date().toISOString(),
        used_for_meeting: meetingId,
      })
      .eq("id", token.id);
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  let meetingId = searchParams.get("meetingId");

  if (!meetingId) {
    return NextResponse.json({ error: "Missing meetingId parameter" }, { status: 400 });
  }

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

  const { data: meeting, error: meetDetailsError } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", meetingId)
    .single();

  if (meetDetailsError || !meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const { data: students, error: studentsError } = await supabase
    .from("users")
    .select("id, name, email, avatar_url, branch, year, current_streak, skip_tokens")
    .eq("role", "student")
    .is("removed_at", null)
    .order("name", { ascending: true });

  if (studentsError) {
    return NextResponse.json({ error: studentsError.message }, { status: 500 });
  }

  const { data: attendanceLogs, error: attError } = await supabase
    .from("attendance")
    .select("*")
    .eq("meeting_id", meetingId);

  if (attError) {
    return NextResponse.json({ error: attError.message }, { status: 500 });
  }

  const { data: cieBonusLogs } = await supabase
    .from("point_logs")
    .select("user_id")
    .eq("meeting_id", meetingId)
    .eq("type", "cie_bonus")
    .eq("status", "confirmed");

  const members = (students || []).map((student) => {
    const log = (attendanceLogs || []).find((l) => l.user_id === student.id);
    const hasCieBonus = cieBonusLogs?.some((c) => c.user_id === student.id) ?? false;
    return {
      ...student,
      has_cie_bonus: hasCieBonus,
      attendance_locked: Boolean(log),
      attendance: log
        ? {
            id: log.id,
            present: log.present,
            used_skip_token: log.used_skip_token,
            override_note: log.present === false ? log.override_note : null,
          }
        : null,
    };
  });

  return NextResponse.json({ data: { meeting, members } });
}

export async function PATCH(request: Request) {
  const { supabase, adminId, error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { meeting_id, user_id, present, used_skip_token, override_note, bulk, updates } = body;

  if (!meeting_id) {
    return NextResponse.json({ error: "Missing meeting_id" }, { status: 400 });
  }

  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", meeting_id)
    .single();

  if (meetingError || !meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const saveUpdates: AttendanceUpdate[] = Array.isArray(updates)
    ? updates
    : bulk
      ? []
      : user_id
        ? [{ user_id, present: present ?? true, used_skip_token, override_note }]
        : [];

  if (bulk) {
    const { data: students, error: studentsError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "student")
      .is("removed_at", null);

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 });
    }

    saveUpdates.push(
      ...(students || []).map((student) => ({
        user_id: student.id,
        present: true,
        used_skip_token: false,
        override_note: null,
      })),
    );
  }

  if (saveUpdates.length === 0) {
    return NextResponse.json({ error: "No attendance updates supplied" }, { status: 400 });
  }

  const targetUserIds = [...new Set(saveUpdates.map((update) => update.user_id).filter(Boolean))];
  const { data: existingRows, error: existingError } = await supabase
    .from("attendance")
    .select("user_id, present, used_skip_token, override_note")
    .eq("meeting_id", meeting_id)
    .in("user_id", targetUserIds);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existingByUser = new Map((existingRows || []).map((row) => [row.user_id, row]));
  const rowsToInsert = [];
  const attendanceLogs = [];
  const conflicts = [];

  for (const update of saveUpdates) {
    if (!update.user_id || update.present === null) continue;

    const cleanNote =
      update.present === false && typeof update.override_note === "string" && update.override_note.trim().length > 0
        ? update.override_note.trim()
        : null;
    const nextRow = {
      present: update.present,
      used_skip_token: update.used_skip_token === true,
      override_note: cleanNote,
    };
    const existing = existingByUser.get(update.user_id);

    if (existing) {
      const existingNote = existing.present === false ? existing.override_note || null : null;
      const changed =
        existing.present !== nextRow.present ||
        existing.used_skip_token !== nextRow.used_skip_token ||
        existingNote !== nextRow.override_note;

      if (changed) conflicts.push(update.user_id);
      continue;
    }

    if (nextRow.used_skip_token) {
      try {
        await consumeSkipToken(supabase, update.user_id, meeting_id);
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 422 });
      }
    }

    rowsToInsert.push({
      meeting_id,
      user_id: update.user_id,
      ...nextRow,
      marked_by: adminId,
      marked_at: new Date().toISOString(),
    });

    if (nextRow.present === true || nextRow.used_skip_token) {
      attendanceLogs.push({
        user_id: update.user_id,
        awarded_by: adminId,
        meeting_id,
        note: nextRow.used_skip_token
          ? `Meeting attendance point (skip token): ${formatMeetingStamp(meeting)}`
          : `Meeting attendance: ${formatMeetingStamp(meeting)}`,
      });
    }
  }

  if (conflicts.length > 0) {
    return NextResponse.json(
      { error: "Attendance is locked after saving. Existing marked rows cannot be changed." },
      { status: 409 },
    );
  }

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("attendance").insert(rowsToInsert);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    try {
      for (const logPayload of attendanceLogs) {
        await confirmAttendancePointLog(supabase, logPayload);
      }
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to create attendance logs" }, { status: 500 });
    }
  }

  await refreshPresentCount(supabase, meeting_id);

  return NextResponse.json({
    success: true,
    count: rowsToInsert.length,
    locked: (existingRows || []).length,
  });
}
