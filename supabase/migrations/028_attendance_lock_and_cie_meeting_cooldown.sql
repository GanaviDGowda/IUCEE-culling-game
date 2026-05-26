-- Migration 028: Lock saved attendance and rate-limit CIE skip by meeting date.

CREATE OR REPLACE FUNCTION public.get_last_cie_bonus_date(p_year VARCHAR)
RETURNS TABLE (last_date TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(m.date::timestamp with time zone, pl.created_at)
  FROM public.point_logs pl
  JOIN public.users u ON pl.user_id = u.id
  LEFT JOIN public.meetings m ON m.id = pl.meeting_id
  WHERE pl.type = 'cie_bonus'
    AND pl.status = 'confirmed'
    AND u.year = p_year
  ORDER BY COALESCE(m.date::timestamp with time zone, pl.created_at) DESC
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_year_cie_bonus(p_year VARCHAR, p_admin_id UUID, p_meeting_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_meeting RECORD;
  v_last_meeting_date DATE;
  v_days_diff INT;
  v_user RECORD;
  v_log_id UUID;
  v_count INT := 0;
BEGIN
  SELECT id, title, date INTO v_target_meeting
  FROM public.meetings
  WHERE id = p_meeting_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Meeting not found.');
  END IF;

  SELECT COALESCE(m.date, pl.created_at::date) INTO v_last_meeting_date
  FROM public.point_logs pl
  JOIN public.users u ON pl.user_id = u.id
  LEFT JOIN public.meetings m ON m.id = pl.meeting_id
  WHERE pl.type = 'cie_bonus'
    AND pl.status = 'confirmed'
    AND u.year = p_year
  ORDER BY COALESCE(m.date, pl.created_at::date) DESC
  LIMIT 1;

  IF v_last_meeting_date IS NOT NULL THEN
    v_days_diff := v_target_meeting.date - v_last_meeting_date;
    IF v_days_diff < 20 THEN
      RETURN json_build_object(
        'success', false,
        'error', 'CIE Skip for Year ' || p_year || ' is locked for this meet. Select a meet at least ' || (20 - v_days_diff) || ' more day(s) after the last CIE skip meet.'
      );
    END IF;
  END IF;

  FOR v_user IN
    SELECT id
    FROM public.users
    WHERE year = p_year
      AND role = 'student'
      AND status IN ('active', 'danger_zone')
      AND removed_at IS NULL
  LOOP
    INSERT INTO public.point_logs (
      user_id,
      points,
      redeemable_delta,
      lifetime_delta,
      type,
      note,
      status,
      awarded_by,
      meeting_id
    )
    VALUES (
      v_user.id,
      10,
      10,
      10,
      'cie_bonus'::public.point_log_type,
      'CIE Attendance Bonus - Year ' || p_year || ' for ' || v_target_meeting.title,
      'pending',
      p_admin_id,
      p_meeting_id
    )
    RETURNING id INTO v_log_id;

    UPDATE public.point_logs
    SET status = 'confirmed',
        reviewed_by = p_admin_id,
        reviewed_at = NOW()
    WHERE id = v_log_id;

    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      ref_type,
      ref_id
    )
    VALUES (
      v_user.id,
      'points_awarded',
      'CIE Bonus Awarded: +10',
      'CIE Attendance Bonus - Year ' || p_year || ' for ' || v_target_meeting.title,
      'point_log',
      v_log_id
    );

    INSERT INTO public.attendance (
      meeting_id,
      user_id,
      present,
      used_skip_token,
      override_note,
      marked_by,
      marked_at
    )
    VALUES (
      p_meeting_id,
      v_user.id,
      false,
      true,
      'CIE skip applied',
      p_admin_id,
      NOW()
    )
    ON CONFLICT (meeting_id, user_id) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  UPDATE public.meetings m
  SET present_count = COALESCE((
    SELECT COUNT(*)::int
    FROM public.attendance a
    WHERE a.meeting_id = p_meeting_id
      AND a.present = true
  ), 0)
  WHERE m.id = p_meeting_id;

  RETURN json_build_object('success', true, 'count', v_count);
END;
$$;

INSERT INTO public.point_logs (
  user_id,
  type,
  points,
  redeemable_delta,
  lifetime_delta,
  status,
  awarded_by,
  reviewed_by,
  reviewed_at,
  meeting_id,
  note,
  created_at
)
SELECT
  a.user_id,
  'attendance'::public.point_log_type,
  1,
  1,
  1,
  'confirmed'::public.point_log_status,
  a.marked_by,
  a.marked_by,
  COALESCE(a.marked_at, NOW()),
  a.meeting_id,
  'Meeting attendance: ' || m.title || ' on ' || m.date || ' at ' || m.time || ', ' || COALESCE(m.location, 'Remote'),
  COALESCE(a.marked_at, NOW())
FROM public.attendance a
JOIN public.meetings m ON m.id = a.meeting_id
WHERE a.present = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.point_logs pl
    WHERE pl.user_id = a.user_id
      AND pl.meeting_id = a.meeting_id
      AND pl.type = 'attendance'
      AND pl.status = 'confirmed'
  );
