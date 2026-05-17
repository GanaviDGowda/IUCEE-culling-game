-- Migration 021: Structured point award accounting
-- Keeps point_logs as the audit ledger while making balance deltas and
-- quarterly stats explicit whenever a pending log is confirmed.

ALTER TABLE public.point_logs
  ADD COLUMN IF NOT EXISTS redeemable_delta INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_delta INT NOT NULL DEFAULT 0 CHECK (lifetime_delta >= 0),
  ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL;

UPDATE public.point_logs
SET
  redeemable_delta = CASE WHEN redeemable_delta = 0 THEN points ELSE redeemable_delta END,
  lifetime_delta = CASE WHEN lifetime_delta = 0 THEN GREATEST(points, 0) ELSE lifetime_delta END
WHERE status = 'confirmed';

UPDATE public.point_logs pl
SET quarter_id = q.id
FROM public.quarters q
WHERE pl.quarter_id IS NULL
  AND pl.quarter = q.label;

CREATE INDEX IF NOT EXISTS idx_point_logs_quarter_id ON public.point_logs(quarter_id);
CREATE INDEX IF NOT EXISTS idx_point_logs_awarded_by ON public.point_logs(awarded_by);
CREATE INDEX IF NOT EXISTS idx_point_logs_confirmed_user_created
  ON public.point_logs(user_id, created_at DESC)
  WHERE status = 'confirmed';

CREATE OR REPLACE FUNCTION public.apply_confirmed_point_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quarter_id UUID;
  v_quarter_label VARCHAR(10);
  v_next_redeemable INT;
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
    SELECT id, label INTO v_quarter_id, v_quarter_label
    FROM public.quarters
    WHERE is_current = true OR is_active = true
    ORDER BY is_current DESC, is_active DESC, created_at DESC
    LIMIT 1;

    NEW.quarter_id := COALESCE(NEW.quarter_id, v_quarter_id);
    NEW.quarter := COALESCE(NEW.quarter, v_quarter_label);
    NEW.redeemable_delta := CASE
      WHEN NEW.redeemable_delta = 0 THEN NEW.points
      ELSE NEW.redeemable_delta
    END;
    NEW.lifetime_delta := CASE
      WHEN NEW.lifetime_delta = 0 THEN GREATEST(NEW.points, 0)
      ELSE NEW.lifetime_delta
    END;

    SELECT redeemable_pts + NEW.redeemable_delta INTO v_next_redeemable
    FROM public.users
    WHERE id = NEW.user_id
    FOR UPDATE;

    IF v_next_redeemable IS NULL THEN
      RAISE EXCEPTION 'Point target user % not found', NEW.user_id;
    END IF;

    IF v_next_redeemable < 0 THEN
      RAISE EXCEPTION 'Insufficient redeemable points for user %', NEW.user_id;
    END IF;

    UPDATE public.users
    SET
      redeemable_pts = v_next_redeemable,
      current_quarter_pts = current_quarter_pts + GREATEST(NEW.redeemable_delta, 0),
      lifetime_pts = lifetime_pts + NEW.lifetime_delta,
      last_active = NOW(),
      status = CASE
        WHEN status = 'removed' THEN status
        WHEN v_next_redeemable < 15 THEN 'danger_zone'::public.user_status
        ELSE 'active'::public.user_status
      END
    WHERE id = NEW.user_id;

    IF NEW.quarter_id IS NOT NULL THEN
      INSERT INTO public.member_quarter_stats (
        user_id,
        quarter_id,
        pts_earned,
        pts_spent,
        pts_net,
        meetings_attended,
        presentations
      )
      VALUES (
        NEW.user_id,
        NEW.quarter_id,
        GREATEST(NEW.redeemable_delta, 0),
        ABS(LEAST(NEW.redeemable_delta, 0)),
        NEW.redeemable_delta,
        CASE WHEN NEW.type = 'attendance' THEN 1 ELSE 0 END,
        CASE WHEN NEW.type = 'presentation' THEN 1 ELSE 0 END
      )
      ON CONFLICT (user_id, quarter_id) DO UPDATE
      SET
        pts_earned = public.member_quarter_stats.pts_earned + EXCLUDED.pts_earned,
        pts_spent = public.member_quarter_stats.pts_spent + EXCLUDED.pts_spent,
        pts_net = public.member_quarter_stats.pts_net + EXCLUDED.pts_net,
        meetings_attended = public.member_quarter_stats.meetings_attended + EXCLUDED.meetings_attended,
        presentations = public.member_quarter_stats.presentations + EXCLUDED.presentations;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_point_log ON public.point_logs;
CREATE TRIGGER trg_apply_point_log
  BEFORE UPDATE ON public.point_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_confirmed_point_log();
