-- ============================================================
-- MIGRATION 005: RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance          ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_periods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE skip_tokens         ENABLE ROW LEVEL SECURITY;

-- ── Helper functions (SECURITY DEFINER + STABLE for caching) ──

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM users WHERE auth_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT id FROM users WHERE auth_id = auth.uid();
$$;

-- ── users ─────────────────────────────────────────────────────

-- Everyone can read all users (leaderboard)
CREATE POLICY "users_read_all" ON users
  FOR SELECT USING (true);

-- Users can update only their own non-sensitive fields;
-- admins can update any row freely.
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth_id = auth.uid() OR get_my_role() = 'admin')
  WITH CHECK (
    get_my_role() = 'admin' OR (
      auth_id = auth.uid()
      -- Students cannot self-escalate sensitive fields
      AND role            = (SELECT role            FROM users WHERE auth_id = auth.uid())
      AND redeemable_pts  = (SELECT redeemable_pts  FROM users WHERE auth_id = auth.uid())
      AND lifetime_pts    = (SELECT lifetime_pts    FROM users WHERE auth_id = auth.uid())
      AND tier            = (SELECT tier            FROM users WHERE auth_id = auth.uid())
      AND status          = (SELECT status          FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "users_admin_insert" ON users
  FOR INSERT WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "users_admin_delete" ON users
  FOR DELETE USING (get_my_role() = 'admin');

-- ── point_logs ────────────────────────────────────────────────

CREATE POLICY "point_logs_read" ON point_logs
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'conveyor', 'nodal_officer')
  );

CREATE POLICY "point_logs_conveyor_insert" ON point_logs
  FOR INSERT WITH CHECK (
    get_my_role() IN ('conveyor', 'admin') AND
    status = 'pending'
  );

CREATE POLICY "point_logs_admin_update" ON point_logs
  FOR UPDATE USING (get_my_role() = 'admin');

-- Students can file an appeal on their own logs
CREATE POLICY "point_logs_student_appeal" ON point_logs
  FOR UPDATE
  USING (
    user_id = get_my_user_id() AND
    status  = 'confirmed' AND
    appeal_status IS NULL
  )
  WITH CHECK (
    -- Only appeal-related columns may change
    user_id       = get_my_user_id() AND
    appeal_status = 'pending'
  );

-- ── meetings ──────────────────────────────────────────────────

CREATE POLICY "meetings_read_all" ON meetings
  FOR SELECT USING (true);

CREATE POLICY "meetings_create" ON meetings
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'conveyor', 'nodal_officer')
  );

CREATE POLICY "meetings_update" ON meetings
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'conveyor')
  );

-- ── attendance ────────────────────────────────────────────────

CREATE POLICY "attendance_read_all" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "attendance_admin_insert" ON attendance
  FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'conveyor'));

CREATE POLICY "attendance_admin_delete" ON attendance
  FOR DELETE USING (get_my_role() = 'admin');

-- ── events ────────────────────────────────────────────────────

CREATE POLICY "events_read_all" ON events
  FOR SELECT USING (true);

CREATE POLICY "events_privileged_write" ON events
  FOR ALL USING (
    get_my_role() IN ('admin', 'nodal_officer')
  );

-- ── event_registrations ───────────────────────────────────────

CREATE POLICY "event_reg_read" ON event_registrations
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'nodal_officer', 'conveyor')
  );

CREATE POLICY "event_reg_self_insert" ON event_registrations
  FOR INSERT WITH CHECK (user_id = get_my_user_id());

CREATE POLICY "event_reg_admin_update" ON event_registrations
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'nodal_officer')
  );

-- ── projects ──────────────────────────────────────────────────

CREATE POLICY "projects_read_all" ON projects
  FOR SELECT USING (true);

CREATE POLICY "projects_write_own" ON projects
  FOR INSERT WITH CHECK (owner_id = get_my_user_id());

CREATE POLICY "projects_update_own_or_admin" ON projects
  FOR UPDATE USING (
    owner_id = get_my_user_id() OR get_my_role() = 'admin'
  );

-- ── project_updates ───────────────────────────────────────────

CREATE POLICY "project_updates_read" ON project_updates
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'conveyor')
  );

CREATE POLICY "project_updates_submit" ON project_updates
  FOR INSERT WITH CHECK (user_id = get_my_user_id());

CREATE POLICY "project_updates_review" ON project_updates
  FOR UPDATE USING (get_my_role() IN ('admin', 'conveyor'));

-- ── announcements ─────────────────────────────────────────────

CREATE POLICY "announcements_read_all" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements_write" ON announcements
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'conveyor', 'nodal_officer')
  );

CREATE POLICY "announcements_update_own_or_admin" ON announcements
  FOR UPDATE USING (
    author_id = get_my_user_id() OR get_my_role() = 'admin'
  );

-- ── grace_periods ─────────────────────────────────────────────

CREATE POLICY "grace_read_own_or_admin" ON grace_periods
  FOR SELECT USING (
    user_id = get_my_user_id() OR
    get_my_role() IN ('admin', 'nodal_officer')
  );

CREATE POLICY "grace_insert_own" ON grace_periods
  FOR INSERT WITH CHECK (user_id = get_my_user_id());

CREATE POLICY "grace_update_admin" ON grace_periods
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'nodal_officer')
  );

-- ── mentorships ───────────────────────────────────────────────

CREATE POLICY "mentorships_read_all" ON mentorships
  FOR SELECT USING (true);

CREATE POLICY "mentorships_admin_write" ON mentorships
  FOR ALL USING (get_my_role() = 'admin');

-- ── notifications ─────────────────────────────────────────────

CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = get_my_user_id());

-- ── user_badges ───────────────────────────────────────────────

CREATE POLICY "user_badges_read_all" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "user_badges_admin_write" ON user_badges
  FOR ALL USING (get_my_role() = 'admin');

-- ── skip_tokens ───────────────────────────────────────────────

CREATE POLICY "skip_tokens_own" ON skip_tokens
  FOR SELECT USING (user_id = get_my_user_id());

CREATE POLICY "skip_tokens_admin_write" ON skip_tokens
  FOR ALL USING (get_my_role() = 'admin');
