-- Recurring + custom meeting scheduling (admin / conveyor / nodal_officer)

CREATE OR REPLACE FUNCTION schedule_recurring_meetings(
  p_title_template TEXT,
  p_weekday INT,
  p_start_date DATE,
  p_end_date DATE,
  p_time TIME,
  p_location TEXT DEFAULT NULL,
  p_agenda TEXT DEFAULT NULL,
  p_is_holiday BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_creator UUID;
  v_cur DATE;
  v_idx INT := 0;
  v_created INT := 0;
  v_skipped INT := 0;
  v_title TEXT;
  v_dates INT;
BEGIN
  v_role := get_my_role()::text;
  IF v_role IS NULL OR v_role NOT IN ('admin', 'conveyor', 'nodal_officer') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Forbidden');
  END IF;

  v_creator := get_my_user_id();
  IF v_creator IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  IF p_weekday IS NULL OR p_weekday < 0 OR p_weekday > 6 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Weekday must be 0 (Sunday) through 6 (Saturday)');
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date < p_start_date THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid date range');
  END IF;

  IF p_title_template IS NULL OR length(trim(p_title_template)) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Title template is required');
  END IF;

  v_dates := (p_end_date - p_start_date) + 1;
  IF v_dates > 366 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Date range cannot exceed 366 days');
  END IF;

  v_cur := p_start_date;
  WHILE v_cur <= p_end_date LOOP
    IF EXTRACT(DOW FROM v_cur)::INT = p_weekday THEN
      v_idx := v_idx + 1;

      IF EXISTS (
        SELECT 1 FROM meetings
        WHERE date = v_cur AND time = p_time
      ) THEN
        v_skipped := v_skipped + 1;
      ELSE
        v_title := trim(p_title_template);
        v_title := replace(v_title, '{date}', to_char(v_cur, 'Mon DD, YYYY'));
        v_title := replace(v_title, '{weekday}', trim(to_char(v_cur, 'Day')));
        v_title := replace(v_title, '{n}', v_idx::text);

        INSERT INTO meetings (
          title, date, time, location, agenda, is_holiday, created_by
        ) VALUES (
          v_title,
          v_cur,
          p_time,
          NULLIF(trim(p_location), ''),
          NULLIF(trim(p_agenda), ''),
          COALESCE(p_is_holiday, false),
          v_creator
        );
        v_created := v_created + 1;
      END IF;
    END IF;
    v_cur := v_cur + 1;
  END LOOP;

  IF v_idx = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No matching weekdays in this range');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'created', v_created,
    'skipped', v_skipped,
    'occurrences', v_idx
  );
END;
$$;

CREATE OR REPLACE FUNCTION schedule_custom_meeting(
  p_title TEXT,
  p_date DATE,
  p_time TIME,
  p_location TEXT DEFAULT NULL,
  p_agenda TEXT DEFAULT NULL,
  p_is_holiday BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_creator UUID;
  v_id UUID;
BEGIN
  v_role := get_my_role()::text;
  IF v_role IS NULL OR v_role NOT IN ('admin', 'conveyor', 'nodal_officer') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Forbidden');
  END IF;

  v_creator := get_my_user_id();
  IF v_creator IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  IF p_title IS NULL OR length(trim(p_title)) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Title is required');
  END IF;

  IF p_date IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Date is required');
  END IF;

  IF EXISTS (SELECT 1 FROM meetings WHERE date = p_date AND time = p_time) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'A meeting already exists at this date and time');
  END IF;

  INSERT INTO meetings (
    title, date, time, location, agenda, is_holiday, created_by
  ) VALUES (
    trim(p_title),
    p_date,
    p_time,
    NULLIF(trim(p_location), ''),
    NULLIF(trim(p_agenda), ''),
    COALESCE(p_is_holiday, false),
    v_creator
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION schedule_recurring_meetings(TEXT, INT, DATE, DATE, TIME, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_custom_meeting(TEXT, DATE, TIME, TEXT, TEXT, BOOLEAN) TO authenticated;
