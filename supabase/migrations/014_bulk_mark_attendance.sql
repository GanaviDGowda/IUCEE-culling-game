-- Bulk attendance marking: attendance rows + confirmed point logs (admin) or pending (conveyor)

CREATE OR REPLACE FUNCTION bulk_mark_attendance(
  p_meeting_id UUID,
  p_user_ids UUID[],
  p_late_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_marker UUID;
  v_meeting RECORD;
  v_uid UUID;
  v_inserted INT := 0;
  v_skipped INT := 0;
  v_log_id UUID;
  v_days_old INT;
  v_note TEXT;
BEGIN
  v_role := get_my_role()::text;
  IF v_role IS NULL OR v_role NOT IN ('admin', 'conveyor') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Forbidden');
  END IF;

  v_marker := get_my_user_id();
  IF v_marker IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  IF p_user_ids IS NULL OR array_length(p_user_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Select at least one member');
  END IF;

  SELECT id, title, date, is_holiday INTO v_meeting
  FROM meetings
  WHERE id = p_meeting_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Meeting not found');
  END IF;

  IF v_meeting.is_holiday THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Holiday meetings do not accept attendance');
  END IF;

  v_days_old := (CURRENT_DATE - v_meeting.date);
  IF v_days_old > 7 AND (p_late_note IS NULL OR length(trim(p_late_note)) < 3) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Attendance older than 7 days requires an admin note (min 3 characters)'
    );
  END IF;

  v_note := COALESCE(
    NULLIF(trim(p_late_note), ''),
    'Meeting attendance: ' || v_meeting.title
  );

  FOREACH v_uid IN ARRAY p_user_ids
  LOOP
    IF EXISTS (
      SELECT 1 FROM attendance
      WHERE meeting_id = p_meeting_id AND user_id = v_uid
    ) THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    INSERT INTO attendance (meeting_id, user_id, marked_by, used_skip)
    VALUES (p_meeting_id, v_uid, v_marker, false);

    INSERT INTO point_logs (
      user_id, type, points, status, awarded_by, meeting_id, note
    ) VALUES (
      v_uid,
      'attendance',
      1,
      'pending',
      v_marker,
      p_meeting_id,
      v_note
    )
    RETURNING id INTO v_log_id;

    IF v_role = 'admin' THEN
      UPDATE point_logs SET status = 'confirmed' WHERE id = v_log_id;
    END IF;

    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'marked', v_inserted,
    'skipped', v_skipped,
    'points_pending', (v_role <> 'admin')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION bulk_mark_attendance(UUID, UUID[], TEXT) TO authenticated;
