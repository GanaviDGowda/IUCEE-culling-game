-- ============================================================
-- MIGRATION 003: Dependent Tables
-- (project_collaborators, attendance, point_logs, project_updates,
--  event_registrations, announcements, grace_periods, mentorships,
--  badges, user_badges, skip_tokens, notifications,
--  cie_bonus_log, agenda_requests)
-- ============================================================

-- ── 6. project_collaborators ─────────────────────────────────

CREATE TABLE project_collaborators (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  joined_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- FIX: missing index on user_id
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);


-- ── 7. attendance ─────────────────────────────────────────────

CREATE TABLE attendance (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  marked_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  used_skip  BOOLEAN NOT NULL DEFAULT false,
  marked_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

CREATE INDEX idx_attendance_meeting_id ON attendance(meeting_id);
CREATE INDEX idx_attendance_user_id    ON attendance(user_id);


-- ── 8. point_logs ────────────────────────────────────────────
-- FK references to meetings/events/projects added here (after those tables exist).

CREATE TABLE point_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id)     ON DELETE CASCADE,

  type          point_log_type   NOT NULL,
  points        INT              NOT NULL,
  status        point_log_status NOT NULL DEFAULT 'pending',
  awarded_by    UUID REFERENCES users(id)    ON DELETE SET NULL,

  meeting_id    UUID REFERENCES meetings(id) ON DELETE SET NULL,
  event_id      UUID REFERENCES events(id)   ON DELETE SET NULL,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,

  note          TEXT,
  appeal_note   TEXT,
  appeal_status VARCHAR(20),
  appealed_at   TIMESTAMP WITH TIME ZONE,
  reviewed_at   TIMESTAMP WITH TIME ZONE,
  reviewed_by   UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Denormalised quarter snapshot — stamped by trigger on confirm, never changes
  quarter       VARCHAR(10),

  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_point_logs_user_id    ON point_logs(user_id);
CREATE INDEX idx_point_logs_status     ON point_logs(status);
CREATE INDEX idx_point_logs_type       ON point_logs(type);
CREATE INDEX idx_point_logs_meeting_id ON point_logs(meeting_id);
CREATE INDEX idx_point_logs_event_id   ON point_logs(event_id);
CREATE INDEX idx_point_logs_quarter    ON point_logs(quarter);
CREATE INDEX idx_point_logs_created_at ON point_logs(created_at DESC);
CREATE INDEX idx_point_logs_appeal     ON point_logs(appeal_status)
  WHERE appeal_status IS NOT NULL;


-- ── 9. project_updates ────────────────────────────────────────

CREATE TABLE project_updates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id)  ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  meeting_id     UUID REFERENCES meetings(id)           ON DELETE SET NULL,

  content        TEXT NOT NULL,
  screenshot_url TEXT,

  status         point_log_status NOT NULL DEFAULT 'pending',
  reviewed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMP WITH TIME ZONE,

  submitted_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One submission per project per meeting
  UNIQUE(project_id, meeting_id)
);

CREATE INDEX idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX idx_project_updates_user_id    ON project_updates(user_id);
CREATE INDEX idx_project_updates_status     ON project_updates(status);


-- ── 10. event_registrations ───────────────────────────────────

CREATE TABLE event_registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,

  placement         VARCHAR(20),
  proof_url         TEXT,
  proof_uploaded_at TIMESTAMP WITH TIME ZONE,

  verified          BOOLEAN NOT NULL DEFAULT false,
  verified_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at       TIMESTAMP WITH TIME ZONE,
  pts_awarded       INT,

  registered_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_reg_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_reg_user_id  ON event_registrations(user_id);
CREATE INDEX idx_event_reg_verified ON event_registrations(verified);


-- ── 11. announcements ─────────────────────────────────────────

CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      VARCHAR(255) NOT NULL,
  body       TEXT NOT NULL,
  tag        announcement_tag NOT NULL DEFAULT 'general',
  pinned     BOOLEAN NOT NULL DEFAULT false,

  -- FIX: ON DELETE RESTRICT (NOT NULL + SET NULL contradiction)
  author_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_announcements_pinned     ON announcements(pinned) WHERE pinned = true;
CREATE INDEX idx_announcements_tag        ON announcements(tag);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);


-- ── 12. grace_periods ─────────────────────────────────────────

CREATE TABLE grace_periods (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quarter              VARCHAR(10) NOT NULL,
  reason               TEXT NOT NULL,

  status               grace_status NOT NULL DEFAULT 'pending',
  nodal_recommended_by UUID REFERENCES users(id) ON DELETE SET NULL,
  nodal_recommended_at TIMESTAMP WITH TIME ZONE,
  admin_approved_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_approved_at    TIMESTAMP WITH TIME ZONE,
  rejection_reason     TEXT,

  requested_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One grace per user per quarter
  UNIQUE(user_id, quarter)
);

CREATE INDEX idx_grace_periods_user_id ON grace_periods(user_id);
CREATE INDEX idx_grace_periods_status  ON grace_periods(status);


-- ── 13. mentorships ───────────────────────────────────────────
-- FIX: UNIQUE(mentee_id, active) fails for multiple ended relationships
-- (false, false … all conflict). Use partial unique indexes instead.

CREATE TABLE mentorships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentee_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active     BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at   TIMESTAMP WITH TIME ZONE,
  CHECK (mentor_id != mentee_id)
);

-- Enforce: only ONE active mentorship per mentee / per mentor at a time
CREATE UNIQUE INDEX idx_mentorships_one_active_mentee
  ON mentorships(mentee_id) WHERE active = true;

CREATE UNIQUE INDEX idx_mentorships_one_active_mentor
  ON mentorships(mentor_id) WHERE active = true;

CREATE INDEX idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee_id ON mentorships(mentee_id);
CREATE INDEX idx_mentorships_active    ON mentorships(active) WHERE active = true;


-- ── 14. badges (catalogue) ────────────────────────────────────

CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(50)  UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  type        VARCHAR(20)  NOT NULL,
  icon_url    TEXT
);

INSERT INTO badges (slug, name, description, type) VALUES
  ('first_step',     'First Step',           'Earn your first point',                         'milestone'),
  ('streak_starter', 'Streak Starter',        'Complete first 4-meeting streak',               'streak'),
  ('streak_master',  'Streak Master',         'Complete an 8-meeting streak without any skip', 'streak'),
  ('speaker',        'Speaker',               'Give your first presentation',                  'milestone'),
  ('regular',        'Regular',               'Attend 10 meetings total',                      'milestone'),
  ('hackathon_hero', 'Hackathon Hero',         'Win 1st place in any hackathon',               'achievement'),
  ('builder',        'Builder',               'Submit 4 consecutive project updates',          'project'),
  ('funded',         'Funded!',               'Project receives external funding',             'project'),
  ('mentor',         'Mentor',                'Active mentorship for 1+ month',                'social'),
  ('contributor',    'Contributor',           'Reach Tier 1 for the first time',              'tier'),
  ('elite',          'Elite',                 'Reach Tier 2 for the first time',              'tier'),
  ('domain_master',  'Domain Master',         'Reach Tier 3 for the first time',              'tier'),
  ('centurion',      'Centurion',             'Activate Century status',                       'tier'),
  ('best_outgoing',  'Best Outgoing Student', 'Highest lifetime pts at graduation',            'award');


-- ── 15. user_badges ───────────────────────────────────────────

CREATE TABLE user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);


-- ── 16. skip_tokens (ledger) ──────────────────────────────────
-- Authoritative source of truth; users.skip_tokens is a cache.

CREATE TABLE skip_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  earned_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at       TIMESTAMP WITH TIME ZONE,
  used             BOOLEAN NOT NULL DEFAULT false,
  used_at          TIMESTAMP WITH TIME ZONE,
  used_for_meeting UUID REFERENCES meetings(id) ON DELETE SET NULL
);

CREATE INDEX idx_skip_tokens_user_id ON skip_tokens(user_id);
CREATE INDEX idx_skip_tokens_unused  ON skip_tokens(used) WHERE used = false;


-- ── 17. notifications ─────────────────────────────────────────

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 'points_awarded'|'danger_zone'|'removal'|'announcement'
  -- |'grace_approved'|'streak_bonus'|'century_activated'
  -- |'event_deadline'|'nodal_strike'|'best_outgoing_nominated'
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT,

  ref_type   VARCHAR(50),   -- 'point_log'|'meeting'|'event'|'announcement'
  ref_id     UUID,

  read       BOOLEAN NOT NULL DEFAULT false,
  read_at    TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_unread     ON notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);


-- ── 18. cie_bonus_log ─────────────────────────────────────────

CREATE TABLE cie_bonus_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applied_by    UUID NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
  meeting_id    UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  month         VARCHAR(7) NOT NULL,   -- e.g. '2026-06'
  members_count INT NOT NULL,
  applied_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Enforces once-per-month lock
  UNIQUE(month)
);


-- ── 19. agenda_requests ───────────────────────────────────────
-- Tier 1+ members can submit agenda topics before meeting day.

CREATE TABLE agenda_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id   UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,

  topic        VARCHAR(255) NOT NULL,
  description  TEXT,

  -- 'pending'|'approved'|'rejected'
  status       VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewed_by  UUID REFERENCES users(id) ON DELETE SET NULL,

  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agenda_requests_meeting_id ON agenda_requests(meeting_id);
CREATE INDEX idx_agenda_requests_user_id    ON agenda_requests(user_id);
