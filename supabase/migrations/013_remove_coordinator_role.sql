-- ============================================================
-- Remove `coordinator` from user_role enum and RLS.
-- Reassigns any coordinator rows to nodal_officer.
-- ============================================================

-- 1. Data
UPDATE public.users SET role = 'nodal_officer'::user_role WHERE role = 'coordinator'::user_role;

-- 2. Detach column from enum
ALTER TABLE public.users
  ALTER COLUMN role TYPE text USING (role::text);

-- 3. Drop auth trigger + profile function (body references user_role)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 4. Drop RLS helpers (CASCADE clears policies that reference them)
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_user_id() CASCADE;

-- 5. Replace enum
DROP TYPE IF EXISTS public.user_role;
CREATE TYPE public.user_role AS ENUM (
  'student', 'conveyor', 'nodal_officer', 'admin'
);

ALTER TABLE public.users
  ALTER COLUMN role TYPE public.user_role USING (
    CASE lower(trim(role))
      WHEN 'student' THEN 'student'::public.user_role
      WHEN 'conveyor' THEN 'conveyor'::public.user_role
      WHEN 'nodal_officer' THEN 'nodal_officer'::public.user_role
      WHEN 'admin' THEN 'admin'::public.user_role
      ELSE 'nodal_officer'::public.user_role
    END
  );

ALTER TABLE public.users
  ALTER COLUMN role SET DEFAULT 'student'::public.user_role;

-- 6. RLS helpers
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid();
$$;

-- 7. Policies (same as 005, without coordinator)
CREATE POLICY "users_read_all" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth_id = auth.uid() OR get_my_role() = 'admin')
  WITH CHECK (
    get_my_role() = 'admin' OR (
      auth_id = auth.uid()
      AND role            = (SELECT role            FROM public.users WHERE auth_id = auth.uid())
      AND redeemable_pts  = (SELECT redeemable_pts  FROM public.users WHERE auth_id = auth.uid())
      AND lifetime_pts    = (SELECT lifetime_pts    FROM public.users WHERE auth_id = auth.uid())
      AND tier            = (SELECT tier            FROM public.users WHERE auth_id = auth.uid())
      AND status          = (SELECT status          FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "users_admin_insert" ON public.users
  FOR INSERT WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "users_admin_delete" ON public.users
  FOR DELETE USING (get_my_role() = 'admin');

CREATE POLICY "point_logs_read" ON public.point_logs
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'conveyor', 'nodal_officer')
  );

CREATE POLICY "point_logs_conveyor_insert" ON public.point_logs
  FOR INSERT WITH CHECK (
    get_my_role() IN ('conveyor', 'admin') AND
    status = 'pending'
  );

CREATE POLICY "point_logs_admin_update" ON public.point_logs
  FOR UPDATE USING (get_my_role() = 'admin');

CREATE POLICY "point_logs_student_appeal" ON public.point_logs
  FOR UPDATE
  USING (
    user_id = get_my_user_id() AND
    status  = 'confirmed' AND
    appeal_status IS NULL
  )
  WITH CHECK (
    user_id       = get_my_user_id() AND
    appeal_status = 'pending'
  );

CREATE POLICY "meetings_read_all" ON public.meetings
  FOR SELECT USING (true);

CREATE POLICY "meetings_create" ON public.meetings
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'conveyor', 'nodal_officer')
  );

CREATE POLICY "meetings_update" ON public.meetings
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'conveyor')
  );

CREATE POLICY "attendance_read_all" ON public.attendance
  FOR SELECT USING (true);

CREATE POLICY "attendance_admin_insert" ON public.attendance
  FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'conveyor'));

CREATE POLICY "attendance_admin_delete" ON public.attendance
  FOR DELETE USING (get_my_role() = 'admin');

CREATE POLICY "events_read_all" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_privileged_write" ON public.events
  FOR ALL USING (
    get_my_role() IN ('admin', 'nodal_officer')
  );

CREATE POLICY "event_reg_read" ON public.event_registrations
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'nodal_officer', 'conveyor')
  );

CREATE POLICY "event_reg_self_insert" ON public.event_registrations
  FOR INSERT WITH CHECK (user_id = get_my_user_id());

CREATE POLICY "event_reg_admin_update" ON public.event_registrations
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'nodal_officer')
  );

CREATE POLICY "projects_read_all" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "projects_write_own" ON public.projects
  FOR INSERT WITH CHECK (owner_id = get_my_user_id());

CREATE POLICY "projects_update_own_or_admin" ON public.projects
  FOR UPDATE USING (
    owner_id = get_my_user_id() OR get_my_role() = 'admin'
  );

CREATE POLICY "project_updates_read" ON public.project_updates
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'conveyor')
  );

CREATE POLICY "project_updates_submit" ON public.project_updates
  FOR INSERT WITH CHECK (user_id = get_my_user_id());

CREATE POLICY "project_updates_review" ON public.project_updates
  FOR UPDATE USING (get_my_role() IN ('admin', 'conveyor'));

CREATE POLICY "announcements_read_all" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements_write" ON public.announcements
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'conveyor', 'nodal_officer')
  );

CREATE POLICY "announcements_update_own_or_admin" ON public.announcements
  FOR UPDATE USING (
    author_id = get_my_user_id() OR get_my_role() = 'admin'
  );

CREATE POLICY "grace_read_own_or_admin" ON public.grace_periods
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'nodal_officer')
  );

CREATE POLICY "grace_insert_own" ON public.grace_periods
  FOR INSERT WITH CHECK (user_id = get_my_user_id());

CREATE POLICY "grace_update_admin" ON public.grace_periods
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'nodal_officer')
  );

CREATE POLICY "mentorships_read_all" ON public.mentorships
  FOR SELECT USING (true);

CREATE POLICY "mentorships_admin_write" ON public.mentorships
  FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = get_my_user_id());

CREATE POLICY "user_badges_read_all" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "user_badges_admin_write" ON public.user_badges
  FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "skip_tokens_own" ON public.skip_tokens
  FOR SELECT USING (user_id = get_my_user_id());

CREATE POLICY "skip_tokens_admin_write" ON public.skip_tokens
  FOR ALL USING (get_my_role() = 'admin');

-- 8. Auth profile trigger (safe role from metadata; unknown → student)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  mapped_role public.user_role;
BEGIN
  mapped_role := CASE lower(trim(COALESCE(NEW.raw_user_meta_data->>'role', 'student')))
    WHEN 'student' THEN 'student'::public.user_role
    WHEN 'conveyor' THEN 'conveyor'::public.user_role
    WHEN 'nodal_officer' THEN 'nodal_officer'::public.user_role
    WHEN 'admin' THEN 'admin'::public.user_role
    ELSE 'student'::public.user_role
  END;

  INSERT INTO public.users (auth_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Player'),
    mapped_role
  )
  ON CONFLICT (auth_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role
  RETURNING id INTO new_user_id;

  BEGIN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      new_user_id,
      'points_awarded',
      'Welcome to the Culling Game',
      'Your account has been created. May your cursed technique prevail.'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user welcome notification failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
