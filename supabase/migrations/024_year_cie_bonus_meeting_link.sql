-- Migration 024: Link year-wise CIE bonus with meeting_id
CREATE OR REPLACE FUNCTION public.grant_year_cie_bonus(p_year VARCHAR, p_admin_id UUID, p_meeting_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date TIMESTAMP WITH TIME ZONE;
  v_days_diff INT;
  v_user RECORD;
  v_log_id UUID;
  v_count INT := 0;
BEGIN
  -- 1. Check last award date
  SELECT pl.created_at INTO v_last_date
  FROM public.point_logs pl
  JOIN public.users u ON pl.user_id = u.id
  WHERE pl.type = 'cie_bonus'
    AND pl.status = 'confirmed'
    AND u.year = p_year
  ORDER BY pl.created_at DESC
  LIMIT 1;

  IF v_last_date IS NOT NULL THEN
    v_days_diff := EXTRACT(DAY FROM (NOW() - v_last_date))::INT;
    IF v_days_diff < 20 THEN
      RETURN json_build_object(
        'success', false,
        'error', 'CIE Bonus was already granted to Year ' || p_year || ' group ' || v_days_diff || ' days ago. You must wait ' || (20 - v_days_diff) || ' more days.'
      );
    END IF;
  END IF;

  -- 2. Award +10 CIE bonus skip to all active students in that year
  FOR v_user IN 
    SELECT id 
    FROM public.users 
    WHERE year = p_year 
      AND role = 'student' 
      AND status IN ('active', 'danger_zone')
  LOOP
    -- Insert pending log linked with meeting_id
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
      'CIE Attendance Bonus - Year ' || p_year,
      'pending',
      p_admin_id,
      p_meeting_id
    )
    RETURNING id INTO v_log_id;

    -- Update to confirmed to invoke apply_confirmed_point_log trigger
    UPDATE public.point_logs 
    SET status = 'confirmed',
        reviewed_by = p_admin_id,
        reviewed_at = NOW()
    WHERE id = v_log_id;

    -- Create notification
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
      'CIE Attendance Bonus - Year ' || p_year,
      'point_log',
      v_log_id
    );

    -- Ensure attendance record is marked as skipped with token automatically!
    INSERT INTO public.attendance (
      meeting_id,
      user_id,
      present,
      used_skip_token,
      marked_by,
      marked_at
    )
    VALUES (
      p_meeting_id,
      v_user.id,
      false,
      true,
      p_admin_id,
      NOW()
    )
    ON CONFLICT (meeting_id, user_id) DO UPDATE
    SET present = false,
        used_skip_token = true,
        marked_by = p_admin_id,
        marked_at = NOW();

    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'count', v_count
  );
END;
$$;
