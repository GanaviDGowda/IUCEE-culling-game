-- Migration 030: Unified active/lifetime points, semester quarters, and tickets.
--
-- Canonical rules:
-- - users.redeemable_pts is the active semester balance used by main ranking,
--   danger zone, Century activation, and ticket purchases.
-- - users.lifetime_pts is cumulative and is used only for BOS / graduation awards.
-- - quarters represent semesters and are set by admins.
-- - active points reset to 0 when a semester ends; lifetime points never reset.
-- - ticket definitions are configurable only by the nodal officer.

ALTER TABLE public.quarters
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

UPDATE public.quarters
SET
  is_active = is_current,
  archived = is_archived
WHERE is_active IS DISTINCT FROM is_current
   OR archived IS DISTINCT FROM is_archived;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quarters_one_active_semester
  ON public.quarters(is_active)
  WHERE is_active = true;

ALTER TABLE public.quarters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quarters_read_all" ON public.quarters;
DROP POLICY IF EXISTS "quarters_admin_write" ON public.quarters;

CREATE POLICY "quarters_read_all" ON public.quarters
  FOR SELECT
  USING (true);

CREATE POLICY "quarters_admin_write" ON public.quarters
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code IN ('golden', 'silver')),
  name TEXT NOT NULL,
  active_point_cost INT NOT NULL CHECK (active_point_cost > 0),
  description TEXT,
  approval_mode TEXT NOT NULL CHECK (approval_mode IN ('nodal_or_25_percent_vote', 'event_entry')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.ticket_types (code, name, active_point_cost, description, approval_mode)
VALUES
  (
    'golden',
    'Golden Ticket',
    100,
    'Propose a semester rule. The proposal needs nodal officer approval or 25 percent voting-right support.',
    'nodal_or_25_percent_vote'
  ),
  (
    'silver',
    'Silver Ticket',
    60,
    'Ticket to an event.',
    'event_entry'
  )
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  active_point_cost = EXCLUDED.active_point_cost,
  description = EXCLUDED.description,
  approval_mode = EXCLUDED.approval_mode;

CREATE TABLE IF NOT EXISTS public.ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
  quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL,
  cost_active_pts INT NOT NULL CHECK (cost_active_pts > 0),
  status TEXT NOT NULL DEFAULT 'issued'
    CHECK (status IN ('issued', 'pending_review', 'approved', 'rejected', 'used', 'void')),
  proposal_text TEXT,
  event_title TEXT,
  spent_point_log_id UUID UNIQUE REFERENCES public.point_logs(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT ticket_payload_matches_type CHECK (
    proposal_text IS NOT NULL OR event_title IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_ticket_purchases_user ON public.ticket_purchases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_quarter ON public.ticket_purchases(quarter_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_status ON public.ticket_purchases(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ticket_one_type_per_student_semester
  ON public.ticket_purchases(user_id, ticket_type_id, quarter_id)
  WHERE status <> 'void' AND quarter_id IS NOT NULL;

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket_types_read_all" ON public.ticket_types;
DROP POLICY IF EXISTS "ticket_types_nodal_write" ON public.ticket_types;
DROP POLICY IF EXISTS "ticket_purchases_read" ON public.ticket_purchases;
DROP POLICY IF EXISTS "ticket_purchases_student_insert" ON public.ticket_purchases;
DROP POLICY IF EXISTS "ticket_purchases_nodal_review" ON public.ticket_purchases;

CREATE POLICY "ticket_types_read_all" ON public.ticket_types
  FOR SELECT
  USING (true);

CREATE POLICY "ticket_types_nodal_write" ON public.ticket_types
  FOR ALL
  USING (public.get_my_role() = 'nodal_officer')
  WITH CHECK (public.get_my_role() = 'nodal_officer');

CREATE POLICY "ticket_purchases_read" ON public.ticket_purchases
  FOR SELECT
  USING (
    user_id = public.get_my_user_id()
    OR public.get_my_role() IN ('admin', 'nodal_officer')
  );

CREATE POLICY "ticket_purchases_student_insert" ON public.ticket_purchases
  FOR INSERT
  WITH CHECK (user_id = public.get_my_user_id());

CREATE POLICY "ticket_purchases_nodal_review" ON public.ticket_purchases
  FOR UPDATE
  USING (public.get_my_role() = 'nodal_officer')
  WITH CHECK (public.get_my_role() = 'nodal_officer');

CREATE OR REPLACE FUNCTION public.current_semester_quarter()
RETURNS public.quarters
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT q
  FROM public.quarters q
  WHERE q.is_active = true OR q.is_current = true
  ORDER BY q.is_active DESC, q.is_current DESC, q.created_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.apply_confirmed_point_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quarter public.quarters%ROWTYPE;
  v_next_active INT;
  v_should_apply BOOLEAN;
BEGIN
  v_should_apply :=
    (TG_OP = 'INSERT' AND NEW.status = 'confirmed')
    OR (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status <> 'confirmed');

  IF NOT v_should_apply THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_quarter
  FROM public.current_semester_quarter();

  NEW.quarter_id := COALESCE(NEW.quarter_id, v_quarter.id);
  NEW.quarter := COALESCE(NEW.quarter, v_quarter.label);
  NEW.redeemable_delta := CASE
    WHEN NEW.redeemable_delta = 0 THEN NEW.points
    ELSE NEW.redeemable_delta
  END;
  NEW.lifetime_delta := CASE
    WHEN NEW.lifetime_delta = 0 THEN GREATEST(NEW.points, 0)
    ELSE NEW.lifetime_delta
  END;

  SELECT redeemable_pts + NEW.redeemable_delta INTO v_next_active
  FROM public.users
  WHERE id = NEW.user_id
  FOR UPDATE;

  IF v_next_active IS NULL THEN
    RAISE EXCEPTION 'Point target user % not found', NEW.user_id;
  END IF;

  IF v_next_active < 0 THEN
    RAISE EXCEPTION 'Insufficient active points for user %', NEW.user_id;
  END IF;

  UPDATE public.users
  SET
    redeemable_pts = v_next_active,
    current_quarter_pts = GREATEST(0, current_quarter_pts + NEW.redeemable_delta),
    lifetime_pts = lifetime_pts + NEW.lifetime_delta,
    last_active = now(),
    status = CASE
      WHEN status = 'removed' THEN status
      WHEN v_next_active < 15 THEN 'danger_zone'::public.user_status
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_point_log ON public.point_logs;
CREATE TRIGGER trg_apply_point_log
  BEFORE INSERT OR UPDATE ON public.point_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_confirmed_point_log();

CREATE OR REPLACE FUNCTION public.increment_user_points(
  user_id UUID,
  redeemable_pts_delta INT,
  lifetime_pts_delta INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET
    redeemable_pts = GREATEST(0, redeemable_pts + redeemable_pts_delta),
    current_quarter_pts = GREATEST(0, current_quarter_pts + redeemable_pts_delta),
    lifetime_pts = lifetime_pts + GREATEST(lifetime_pts_delta, 0),
    status = CASE
      WHEN status = 'removed' THEN status
      WHEN GREATEST(0, redeemable_pts + redeemable_pts_delta) < 15 THEN 'danger_zone'::public.user_status
      ELSE 'active'::public.user_status
    END,
    last_active = now()
  WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_tiers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET tier = CASE
    WHEN century_activated OR redeemable_pts >= 100 THEN 'century'::public.user_tier
    WHEN redeemable_pts >= 60 THEN 'domain_master'::public.user_tier
    WHEN redeemable_pts >= 30 THEN 'elite'::public.user_tier
    WHEN redeemable_pts >= 15 THEN 'contributor'::public.user_tier
    ELSE 'active'::public.user_tier
  END
  WHERE role = 'student'
    AND status <> 'removed';
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_century(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_pts INT;
  v_next_month DATE;
BEGIN
  SELECT redeemable_pts INTO v_active_pts
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_active_pts IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_active_pts < 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient active points');
  END IF;

  v_next_month := DATE_TRUNC('month', now()) + INTERVAL '2 months';

  INSERT INTO public.point_logs (
    user_id,
    type,
    points,
    redeemable_delta,
    lifetime_delta,
    status,
    note
  )
  VALUES (
    p_user_id,
    'century_spend',
    -v_active_pts,
    -v_active_pts,
    0,
    'confirmed',
    'Century activation - ' || v_active_pts || ' active points sacrificed'
  );

  UPDATE public.users
  SET
    century_activated = true,
    century_activated_at = now(),
    tier = 'century',
    monthly_minimum_override = 30,
    minimum_override_expires_at = v_next_month
  WHERE id = p_user_id;

  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT p_user_id, id
  FROM public.badges
  WHERE slug = 'centurion'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT
    id,
    'century_activated',
    'CENTURY ACTIVATED',
    (SELECT name FROM public.users WHERE id = p_user_id) || ' has activated Century status.'
  FROM public.users
  WHERE status <> 'removed';

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.buy_ticket(
  p_ticket_code TEXT,
  p_proposal_text TEXT DEFAULT NULL,
  p_event_title TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_ticket public.ticket_types%ROWTYPE;
  v_quarter public.quarters%ROWTYPE;
  v_log_id UUID;
  v_purchase_id UUID;
  v_status TEXT;
BEGIN
  SELECT public.get_my_user_id() INTO v_user_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT * INTO v_ticket
  FROM public.ticket_types
  WHERE code = p_ticket_code
    AND enabled = true;

  IF v_ticket.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ticket type is not available');
  END IF;

  IF v_ticket.code = 'golden' AND COALESCE(BTRIM(p_proposal_text), '') = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Golden tickets require a rule proposal');
  END IF;

  IF v_ticket.code = 'silver' AND COALESCE(BTRIM(p_event_title), '') = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Silver tickets require an event title');
  END IF;

  SELECT * INTO v_quarter
  FROM public.current_semester_quarter();

  INSERT INTO public.point_logs (
    user_id,
    type,
    points,
    redeemable_delta,
    lifetime_delta,
    status,
    quarter_id,
    quarter,
    note
  )
  VALUES (
    v_user_id,
    CASE WHEN v_ticket.code = 'golden' THEN 'ticket_golden' ELSE 'ticket_silver' END::public.point_log_type,
    -v_ticket.active_point_cost,
    -v_ticket.active_point_cost,
    0,
    'confirmed',
    v_quarter.id,
    v_quarter.label,
    v_ticket.name || ' purchase'
  )
  RETURNING id INTO v_log_id;

  v_status := CASE WHEN v_ticket.code = 'golden' THEN 'pending_review' ELSE 'issued' END;

  INSERT INTO public.ticket_purchases (
    user_id,
    ticket_type_id,
    quarter_id,
    cost_active_pts,
    status,
    proposal_text,
    event_title,
    spent_point_log_id
  )
  VALUES (
    v_user_id,
    v_ticket.id,
    v_quarter.id,
    v_ticket.active_point_cost,
    v_status,
    NULLIF(BTRIM(p_proposal_text), ''),
    NULLIF(BTRIM(p_event_title), ''),
    v_log_id
  )
  RETURNING id INTO v_purchase_id;

  RETURN jsonb_build_object(
    'success', true,
    'ticket_purchase_id', v_purchase_id,
    'point_log_id', v_log_id,
    'status', v_status
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

DROP VIEW IF EXISTS public.leaderboard_current;
DROP VIEW IF EXISTS public.bos_leaderboard;
DROP VIEW IF EXISTS public.danger_zone_members;

CREATE VIEW public.leaderboard_current AS
SELECT
  u.id,
  u.name,
  u.branch,
  u.year,
  u.tier,
  u.redeemable_pts,
  u.redeemable_pts AS active_pts,
  u.lifetime_pts,
  COALESCE(NULLIF(u.current_streak, 0), u.streak::smallint) AS current_streak,
  u.century_activated,
  u.domain_badge,
  u.current_quarter_pts AS semester_pts,
  RANK() OVER (ORDER BY u.redeemable_pts DESC, u.name ASC) AS rank,
  RANK() OVER (ORDER BY u.lifetime_pts DESC, u.name ASC) AS lifetime_rank
FROM public.users u
WHERE u.status <> 'removed'
  AND u.role = 'student';

CREATE VIEW public.bos_leaderboard AS
SELECT
  u.id,
  u.name,
  u.branch,
  u.year,
  u.domain_badge,
  u.lifetime_pts,
  RANK() OVER (ORDER BY u.lifetime_pts DESC, u.name ASC) AS rank
FROM public.users u
WHERE u.status <> 'removed'
  AND u.role = 'student';

CREATE VIEW public.danger_zone_members AS
SELECT
  u.id,
  u.name,
  u.branch,
  u.year,
  u.warnings,
  u.status,
  u.redeemable_pts AS active_pts,
  q.end_date,
  (q.end_date - CURRENT_DATE) AS days_remaining
FROM public.users u
LEFT JOIN public.quarters q ON q.is_active = true
WHERE u.status <> 'removed'
  AND u.role = 'student'
  AND u.redeemable_pts < 15;
