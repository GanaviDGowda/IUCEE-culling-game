-- Migration 019: Align schema with the registration-approval v2 data model.
-- Keeps the app's existing users.id + users.auth_id contract while adding the
-- missing audit tables, stats table, compatibility views, and target indexes.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appeal_status') THEN
    CREATE TYPE public.appeal_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM ('active', 'dormant', 'completed', 'funded');
  END IF;
END $$;

ALTER TYPE public.point_log_type ADD VALUE IF NOT EXISTS 'hackathon_first';
ALTER TYPE public.point_log_type ADD VALUE IF NOT EXISTS 'hackathon_second';
ALTER TYPE public.point_log_type ADD VALUE IF NOT EXISTS 'hackathon_special';
ALTER TYPE public.point_log_type ADD VALUE IF NOT EXISTS 'hackathon_participation';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'workshop';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS current_streak SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS century_active_until DATE,
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS removal_reason TEXT,
  ADD COLUMN IF NOT EXISTS nodal_strike public.warning_level NOT NULL DEFAULT 'none';

UPDATE public.users
SET current_streak = COALESCE(NULLIF(current_streak, 0), streak::smallint)
WHERE current_streak = 0 AND streak <> 0;

CREATE INDEX IF NOT EXISTS idx_users_branch ON public.users(branch);
CREATE INDEX IF NOT EXISTS idx_users_year ON public.users(year);

ALTER TABLE public.quarters
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

UPDATE public.quarters
SET
  is_active = is_current,
  archived = is_archived
WHERE is_active IS DISTINCT FROM is_current
   OR archived IS DISTINCT FROM is_archived;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_quarter
  ON public.quarters(is_active) WHERE is_active = true;

ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS present_count INT;

UPDATE public.meetings m
SET quarter_id = q.id
FROM public.quarters q
WHERE m.quarter_id IS NULL
  AND m.date BETWEEN q.start_date AND q.end_date;

CREATE INDEX IF NOT EXISTS idx_meetings_quarter_id ON public.meetings(quarter_id);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS registration_link TEXT;

UPDATE public.events e
SET
  quarter_id = q.id,
  registration_link = COALESCE(e.registration_link, e.external_link)
FROM public.quarters q
WHERE e.quarter_id IS NULL
  AND e.event_date::date BETWEEN q.start_date AND q.end_date;

CREATE INDEX IF NOT EXISTS idx_events_quarter_id ON public.events(quarter_id);

ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS present BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS used_skip_token BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS override_note TEXT;

UPDATE public.attendance
SET used_skip_token = used_skip
WHERE used_skip_token IS DISTINCT FROM used_skip;

ALTER TABLE public.point_logs
  ADD COLUMN IF NOT EXISTS redeemable_delta INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_delta INT NOT NULL DEFAULT 0 CHECK (lifetime_delta >= 0),
  ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL;

UPDATE public.point_logs pl
SET
  redeemable_delta = CASE WHEN redeemable_delta = 0 THEN points ELSE redeemable_delta END,
  lifetime_delta = CASE WHEN lifetime_delta = 0 THEN GREATEST(points, 0) ELSE lifetime_delta END,
  quarter_id = q.id
FROM public.quarters q
WHERE pl.quarter_id IS NULL
  AND pl.quarter = q.label;

CREATE INDEX IF NOT EXISTS idx_point_logs_quarter_id ON public.point_logs(quarter_id);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status public.project_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL;

UPDATE public.projects
SET status = CASE
  WHEN funded THEN 'funded'::public.project_status
  WHEN active THEN 'active'::public.project_status
  ELSE 'dormant'::public.project_status
END;

UPDATE public.projects p
SET quarter_id = q.id
FROM public.quarters q
WHERE p.quarter_id IS NULL
  AND q.is_active = true;

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_quarter_id ON public.projects(quarter_id);

ALTER TABLE public.project_updates
  ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS public.presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  presenter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic VARCHAR(200),
  flagged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  flagged_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  status public.point_log_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, presenter_id)
);

CREATE INDEX IF NOT EXISTS idx_presentations_meeting ON public.presentations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_presentations_presenter ON public.presentations(presenter_id);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON public.presentations(status);

CREATE TABLE IF NOT EXISTS public.point_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  point_log_id UUID NOT NULL REFERENCES public.point_logs(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status public.appeal_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  review_note TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (point_log_id)
);

CREATE INDEX IF NOT EXISTS idx_appeals_user ON public.point_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON public.point_appeals(status);

CREATE TABLE IF NOT EXISTS public.member_quarter_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quarter_id UUID NOT NULL REFERENCES public.quarters(id) ON DELETE CASCADE,
  pts_earned INT NOT NULL DEFAULT 0,
  pts_spent INT NOT NULL DEFAULT 0,
  pts_net INT NOT NULL DEFAULT 0,
  meetings_attended SMALLINT NOT NULL DEFAULT 0,
  presentations SMALLINT NOT NULL DEFAULT 0,
  tier_at_end public.user_tier,
  UNIQUE (user_id, quarter_id)
);

CREATE INDEX IF NOT EXISTS idx_mqs_quarter ON public.member_quarter_stats(quarter_id);
CREATE INDEX IF NOT EXISTS idx_mqs_user ON public.member_quarter_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_mqs_pts ON public.member_quarter_stats(quarter_id, pts_net DESC);

CREATE TABLE IF NOT EXISTS public.warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  issued_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warnings_user ON public.warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_warnings_quarter ON public.warnings(quarter_id);

CREATE TABLE IF NOT EXISTS public.removal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  removed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  quarter_id UUID REFERENCES public.quarters(id) ON DELETE SET NULL,
  quarterly_pts INT NOT NULL,
  lifetime_pts INT NOT NULL,
  removed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reinstated_at TIMESTAMP WITH TIME ZONE,
  reinstatement_reason TEXT,
  reinstated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calendar_rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  rsvp_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT rsvp_one_target CHECK (
    (event_id IS NOT NULL AND meeting_id IS NULL) OR
    (event_id IS NULL AND meeting_id IS NOT NULL)
  ),
  UNIQUE (user_id, event_id),
  UNIQUE (user_id, meeting_id)
);

CREATE TABLE IF NOT EXISTS public.college_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date DATE NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skip_token_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('earned', 'used', 'expired')),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  year_month CHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skip_token_log_user ON public.skip_token_log(user_id);

CREATE OR REPLACE VIEW public.project_members AS
SELECT project_id, user_id, joined_at
FROM public.project_collaborators;

CREATE OR REPLACE VIEW public.member_badges AS
SELECT id, user_id, badge_id, earned_at AS awarded_at, NULL::uuid AS awarded_by
FROM public.user_badges;

CREATE OR REPLACE VIEW public.leaderboard_current AS
SELECT
  u.id,
  u.name,
  u.branch,
  u.year,
  u.tier,
  u.redeemable_pts,
  u.lifetime_pts,
  COALESCE(NULLIF(u.current_streak, 0), u.streak::smallint) AS current_streak,
  u.century_activated,
  u.domain_badge,
  COALESCE(mqs.pts_net, u.current_quarter_pts, 0) AS quarter_pts,
  COALESCE(mqs.meetings_attended, 0) AS meetings_attended,
  RANK() OVER (ORDER BY COALESCE(mqs.pts_net, u.current_quarter_pts, 0) DESC) AS rank,
  RANK() OVER (ORDER BY u.lifetime_pts DESC) AS lifetime_rank
FROM public.users u
JOIN public.quarters q ON q.is_active = true
LEFT JOIN public.member_quarter_stats mqs
  ON mqs.user_id = u.id AND mqs.quarter_id = q.id
WHERE u.status = 'active'
  AND u.role = 'student';

CREATE OR REPLACE VIEW public.danger_zone_members AS
SELECT
  u.id,
  u.name,
  u.branch,
  u.year,
  u.warnings,
  u.status,
  COALESCE(mqs.pts_net, u.current_quarter_pts, 0) AS quarter_pts,
  COALESCE(mqs.meetings_attended, 0) AS meetings_attended,
  q.end_date,
  (q.end_date - CURRENT_DATE) AS days_remaining
FROM public.users u
JOIN public.quarters q ON q.is_active = true
LEFT JOIN public.member_quarter_stats mqs
  ON mqs.user_id = u.id AND mqs.quarter_id = q.id
WHERE u.status IN ('active', 'danger_zone')
  AND u.role = 'student'
  AND COALESCE(mqs.pts_net, u.current_quarter_pts, 0) < 15;

CREATE OR REPLACE VIEW public.admin_pending_actions AS
SELECT 'presentation' AS action_type, id, created_at FROM public.presentations WHERE status = 'pending'
UNION ALL
SELECT 'project_update' AS action_type, id, submitted_at AS created_at FROM public.project_updates WHERE status = 'pending'
UNION ALL
SELECT 'point_appeal' AS action_type, id, submitted_at AS created_at FROM public.point_appeals WHERE status = 'pending'
UNION ALL
SELECT 'grace_period' AS action_type, id, requested_at AS created_at FROM public.grace_periods WHERE status = 'pending'
UNION ALL
SELECT 'registration' AS action_type, id, submitted_at AS created_at FROM public.registration_requests WHERE status = 'pending'
ORDER BY created_at DESC;

ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_quarter_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skip_token_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "presentations_read" ON public.presentations;
DROP POLICY IF EXISTS "presentations_admin_write" ON public.presentations;
CREATE POLICY "presentations_read" ON public.presentations
  FOR SELECT USING (true);
CREATE POLICY "presentations_admin_write" ON public.presentations
  FOR ALL USING (public.get_my_role() IN ('admin', 'nodal_officer'))
  WITH CHECK (public.get_my_role() IN ('admin', 'nodal_officer'));

DROP POLICY IF EXISTS "appeals_own" ON public.point_appeals;
DROP POLICY IF EXISTS "appeals_insert" ON public.point_appeals;
DROP POLICY IF EXISTS "appeals_admin_update" ON public.point_appeals;
CREATE POLICY "appeals_own" ON public.point_appeals
  FOR SELECT USING (user_id = public.get_my_user_id() OR public.get_my_role() = 'admin');
CREATE POLICY "appeals_insert" ON public.point_appeals
  FOR INSERT WITH CHECK (user_id = public.get_my_user_id());
CREATE POLICY "appeals_admin_update" ON public.point_appeals
  FOR UPDATE USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "mqs_select" ON public.member_quarter_stats;
CREATE POLICY "mqs_select" ON public.member_quarter_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "warnings_admin_read" ON public.warnings;
DROP POLICY IF EXISTS "warnings_admin_write" ON public.warnings;
CREATE POLICY "warnings_admin_read" ON public.warnings
  FOR SELECT USING (user_id = public.get_my_user_id() OR public.get_my_role() IN ('admin', 'nodal_officer'));
CREATE POLICY "warnings_admin_write" ON public.warnings
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "system_config_admin" ON public.system_config;
CREATE POLICY "system_config_admin" ON public.system_config
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "calendar_rsvp_own" ON public.calendar_rsvp;
CREATE POLICY "calendar_rsvp_own" ON public.calendar_rsvp
  FOR ALL USING (user_id = public.get_my_user_id())
  WITH CHECK (user_id = public.get_my_user_id());

DROP POLICY IF EXISTS "holidays_read" ON public.college_holidays;
DROP POLICY IF EXISTS "holidays_admin_write" ON public.college_holidays;
CREATE POLICY "holidays_read" ON public.college_holidays
  FOR SELECT USING (true);
CREATE POLICY "holidays_admin_write" ON public.college_holidays
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "skip_token_log_own" ON public.skip_token_log;
DROP POLICY IF EXISTS "skip_token_log_admin" ON public.skip_token_log;
CREATE POLICY "skip_token_log_own" ON public.skip_token_log
  FOR SELECT USING (user_id = public.get_my_user_id() OR public.get_my_role() = 'admin');
CREATE POLICY "skip_token_log_admin" ON public.skip_token_log
  FOR ALL USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');
