-- ============================================================
-- MIGRATION 006: Scheduled Jobs, Realtime & Useful Queries
-- ============================================================

-- ── pg_cron schedules ────────────────────────────────────────
-- Requires pg_cron extension (enabled in migration 001).

-- Quarter end: recalculate tiers (last day of Mar/Jun/Sep/Dec at 23:00)
SELECT cron.schedule(
  'recalculate-tiers',
  '0 23 * 3,6,9,12 *',
  'SELECT recalculate_tiers();'
);

-- Monthly: award mentor bonuses (1st of each month at 01:00)
SELECT cron.schedule(
  'mentor-bonuses',
  '0 1 1 * *',
  'SELECT award_mentor_bonuses();'
);

-- Monthly: reset skip tokens (1st of each month at 00:00)
SELECT cron.schedule(
  'reset-skips',
  '0 0 1 * *',
  'SELECT reset_monthly_skip_tokens();'
);

-- Year-end decay (30 June at 23:00 IST = 17:30 UTC)
SELECT cron.schedule(
  'year-end-decay',
  '30 17 30 6 *',
  'SELECT apply_year_end_decay();'
);

-- Weekly danger-zone sync (every Sunday at 20:00)
SELECT cron.schedule(
  'danger-zone-check',
  '0 20 * * 0',
  $$
    UPDATE users
    SET status = 'danger_zone'
    WHERE current_quarter_pts < 15
      AND status = 'active';
  $$
);


-- ── Realtime publications ─────────────────────────────────────
-- Enable in Supabase dashboard OR via SQL below.

ALTER PUBLICATION supabase_realtime ADD TABLE point_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE users;


-- ── Storage buckets (run via Supabase dashboard / CLI) ────────
-- Documented here for reference; cannot be created via SQL.

-- 1. proof-uploads     | Public: false | Max: 10 MB | Types: image/*, application/pdf
-- 2. project-screenshots | Public: false | Max: 5 MB  | Types: image/*
-- 3. avatars           | Public: true  | Max: 2 MB  | Types: image/*


-- ── Useful queries for the frontend ──────────────────────────

-- Leaderboard: current quarter ranking
-- SELECT
--   u.id, u.name, u.tier, u.domain_badge,
--   u.current_quarter_pts, u.lifetime_pts,
--   u.streak, u.century_activated,
--   RANK() OVER (ORDER BY u.current_quarter_pts DESC) AS rank
-- FROM users u
-- WHERE u.status <> 'removed'
-- ORDER BY u.current_quarter_pts DESC;

-- Danger zone list (admin panel)
-- SELECT id, name, email, current_quarter_pts, streak, last_active
-- FROM users
-- WHERE status = 'danger_zone' AND role = 'student'
-- ORDER BY current_quarter_pts ASC;

-- Pending point log approvals (admin panel)
-- SELECT pl.*, u.name AS user_name, u.tier,
--        m.title AS meeting_title, e.name AS event_name
-- FROM point_logs pl
-- JOIN users u ON u.id = pl.user_id
-- LEFT JOIN meetings m ON m.id = pl.meeting_id
-- LEFT JOIN events   e ON e.id = pl.event_id
-- WHERE pl.status = 'pending'
-- ORDER BY pl.created_at ASC;

-- Member's full confirmed point history
-- SELECT pl.*, u2.name AS awarded_by_name
-- FROM point_logs pl
-- LEFT JOIN users u2 ON u2.id = pl.awarded_by
-- WHERE pl.user_id = $1 AND pl.status = 'confirmed'
-- ORDER BY pl.created_at DESC;

-- Best Outgoing Student ranking
-- SELECT
--   u.id, u.name, u.lifetime_pts,
--   COUNT(DISTINCT ms.id) FILTER (WHERE ms.active = false) AS mentees_elevated,
--   u.century_activated,
--   RANK() OVER (ORDER BY u.lifetime_pts DESC) AS rank
-- FROM users u
-- LEFT JOIN mentorships ms ON ms.mentor_id = u.id
-- WHERE u.role = 'student' AND u.status <> 'removed'
-- GROUP BY u.id
-- ORDER BY u.lifetime_pts DESC;
