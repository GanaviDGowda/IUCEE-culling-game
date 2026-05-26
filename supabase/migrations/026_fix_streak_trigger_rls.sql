-- Migration 025: Fix streak trigger RLS violation and align with schema v2

CREATE OR REPLACE FUNCTION public.update_streak_on_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Check either used_skip or used_skip_token to account for both v1 and v2 insertions
    IF NEW.used_skip OR NEW.used_skip_token THEN
      -- Skip consumed: reset streak
      UPDATE public.users 
      SET streak = 0, current_streak = 0 
      WHERE id = NEW.user_id;
    ELSE
      -- Increment streak and capture new value
      UPDATE public.users 
      SET streak = streak + 1, current_streak = current_streak + 1
      WHERE id = NEW.user_id
      RETURNING current_streak INTO v_streak;

      -- Award +1 streak bonus every 4th consecutive attendance
      IF COALESCE(v_streak, 0) > 0 AND v_streak % 4 = 0 THEN
        INSERT INTO public.point_logs (user_id, type, points, status, note)
        VALUES (
          NEW.user_id,
          'streak_bonus',
          1,
          'confirmed',
          'Streak bonus: ' || v_streak || ' consecutive meetings'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
