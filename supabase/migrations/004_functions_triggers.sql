-- ============================================================
-- MIGRATION 004: Functions & Triggers
-- ============================================================

-- ── updated_at auto-stamp ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── Auto-generate referral code on user insert ────────────────

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.referral_code = UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text), 1, 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();


-- ── Confirm point log → update user balances ─────────────────
-- FIX: merged danger-zone update into the same CTE to avoid
--      reading a stale redeemable_pts value in a second UPDATE.

CREATE OR REPLACE FUNCTION apply_confirmed_point_log()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_quarter VARCHAR(10);
BEGIN
  -- Only fires when status transitions TO confirmed
  IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN

    -- Stamp the current quarter label (immutable after this point)
    SELECT label INTO v_quarter
    FROM quarters WHERE is_current = true
    LIMIT 1;

    NEW.quarter = v_quarter;

    -- Single UPDATE: adjust balances and derive status in one pass
    UPDATE users SET
      redeemable_pts      = redeemable_pts + NEW.points,
      current_quarter_pts = current_quarter_pts + GREATEST(NEW.points, 0),
      lifetime_pts        = lifetime_pts        + GREATEST(NEW.points, 0),
      last_active         = NOW(),
      status = CASE
        -- Never pull a 'removed' user back to active/danger_zone
        WHEN status = 'removed' THEN status
        WHEN (redeemable_pts + NEW.points) < 15 THEN 'danger_zone'::user_status
        ELSE 'active'::user_status
      END
    WHERE id = NEW.user_id;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_point_log
  BEFORE UPDATE ON point_logs
  FOR EACH ROW EXECUTE FUNCTION apply_confirmed_point_log();


-- ── Streak update on attendance insert ───────────────────────
-- FIX: was doing a redundant SELECT to read used_skip;
--      NEW.used_skip is already available in an AFTER INSERT trigger.

CREATE OR REPLACE FUNCTION update_streak_on_attendance()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_streak INT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.used_skip THEN
      -- Skip consumed: reset streak
      UPDATE users SET streak = 0 WHERE id = NEW.user_id;
    ELSE
      -- Increment streak and capture new value
      UPDATE users SET streak = streak + 1
      WHERE id = NEW.user_id
      RETURNING streak INTO v_streak;

      -- Award +1 streak bonus every 4th consecutive attendance
      IF v_streak % 4 = 0 THEN
        INSERT INTO point_logs (user_id, type, points, status, note)
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

CREATE TRIGGER trg_streak_on_attendance
  AFTER INSERT ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_attendance();


-- ── Century activation (callable function) ───────────────────

CREATE OR REPLACE FUNCTION activate_century(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current_pts INT;
  v_next_month  DATE;
BEGIN
  -- Row-level lock to prevent concurrent activations
  SELECT redeemable_pts INTO v_current_pts
  FROM users WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_pts IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_current_pts < 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;

  -- Override expires at the start of the month after next
  v_next_month := DATE_TRUNC('month', NOW()) + INTERVAL '2 months';

  UPDATE users SET
    redeemable_pts              = 0,
    century_activated           = true,
    century_activated_at        = NOW(),
    tier                        = 'century',
    monthly_minimum_override    = 30,
    minimum_override_expires_at = v_next_month
  WHERE id = p_user_id;

  -- Log the spend (confirmed immediately — no approval needed)
  INSERT INTO point_logs (user_id, type, points, status, note)
  VALUES (
    p_user_id,
    'century_spend',
    -v_current_pts,
    'confirmed',
    'Century activation — ' || v_current_pts || ' points sacrificed'
  );

  -- Award Centurion badge (idempotent)
  INSERT INTO user_badges (user_id, badge_id)
  SELECT p_user_id, id FROM badges WHERE slug = 'centurion'
  ON CONFLICT DO NOTHING;

  -- Notify all non-removed users
  INSERT INTO notifications (user_id, type, title, body)
  SELECT
    id,
    'century_activated',
    'CENTURY ACTIVATED',
    (SELECT name FROM users WHERE id = p_user_id)
      || ' has activated Century status.'
  FROM users
  WHERE status <> 'removed';

  RETURN jsonb_build_object('success', true);
END;
$$;


-- ── Quarter tier recalculation (run at quarter end) ───────────

CREATE OR REPLACE FUNCTION recalculate_tiers()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users SET tier = CASE
    WHEN century_activated           THEN 'century'::user_tier
    WHEN current_quarter_pts >= 60   THEN 'domain_master'::user_tier
    WHEN current_quarter_pts >= 30   THEN 'elite'::user_tier
    WHEN current_quarter_pts >= 15   THEN 'contributor'::user_tier
    ELSE                                  'active'::user_tier
  END
  WHERE status <> 'removed';
END;
$$;


-- ── Year-end point decay ──────────────────────────────────────

CREATE OR REPLACE FUNCTION apply_year_end_decay()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Cap redeemable_pts at 50 for anyone above 80
  UPDATE users
  SET redeemable_pts = 50
  WHERE redeemable_pts > 80 AND status <> 'removed';

  -- Reset flags for new academic year
  UPDATE users SET
    grace_used          = false,
    current_quarter_pts = 0;
END;
$$;


-- ── Monthly mentor bonus auto-award ──────────────────────────

CREATE OR REPLACE FUNCTION award_mentor_bonuses()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_record    RECORD;
  v_month     VARCHAR(7);
  v_mentee_pts INT;
BEGIN
  v_month := TO_CHAR(NOW() - INTERVAL '1 month', 'YYYY-MM');

  FOR v_record IN
    SELECT mentor_id, mentee_id FROM mentorships WHERE active = true
  LOOP
    SELECT COALESCE(SUM(points), 0) INTO v_mentee_pts
    FROM point_logs
    WHERE user_id = v_record.mentee_id
      AND status  = 'confirmed'
      AND points  > 0
      AND TO_CHAR(created_at, 'YYYY-MM') = v_month;

    IF v_mentee_pts >= 5 THEN
      INSERT INTO point_logs (user_id, type, points, status, note)
      VALUES (
        v_record.mentor_id,
        'mentor_bonus',
        1,
        'confirmed',
        'Mentor bonus: mentee earned ' || v_mentee_pts || ' pts in ' || v_month
      );
    END IF;
  END LOOP;
END;
$$;


-- ── Monthly skip token reset ──────────────────────────────────

CREATE OR REPLACE FUNCTION reset_monthly_skip_tokens()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Expire unused tokens from previous month
  UPDATE skip_tokens
  SET used = true, used_at = NOW()
  WHERE used = false
    AND expires_at < DATE_TRUNC('month', NOW());

  -- Reset per-user monthly counter cache
  UPDATE users SET skip_tokens_used_this_month = 0;
END;
$$;
