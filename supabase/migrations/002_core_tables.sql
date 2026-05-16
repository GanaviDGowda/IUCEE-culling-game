-- ============================================================
-- MIGRATION 002: Core Tables (quarters → users → meetings → events → projects)
-- ============================================================

-- ── 1. quarters ──────────────────────────────────────────────
-- Must be created before users because point triggers reference it.

CREATE TABLE quarters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       VARCHAR(10) UNIQUE NOT NULL,   -- e.g. '2026-Q2'
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_current  BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one current quarter allowed at a time
CREATE UNIQUE INDEX idx_quarters_one_current
  ON quarters(is_current) WHERE is_current = true;


-- ── 2. users ─────────────────────────────────────────────────

CREATE TABLE users (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Auth
  auth_id                     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email                       VARCHAR(255) UNIQUE NOT NULL,
  name                        VARCHAR(255) NOT NULL,

  -- Role & Status
  role                        user_role   NOT NULL DEFAULT 'student',
  status                      user_status NOT NULL DEFAULT 'active',
  tier                        user_tier   NOT NULL DEFAULT 'active',

  -- Points
  redeemable_pts              INT NOT NULL DEFAULT 0 CHECK (redeemable_pts >= 0),
  lifetime_pts                INT NOT NULL DEFAULT 0 CHECK (lifetime_pts >= 0),
  current_quarter_pts         INT NOT NULL DEFAULT 0,

  -- Gamification
  streak                      INT NOT NULL DEFAULT 0,
  century_activated           BOOLEAN NOT NULL DEFAULT false,
  century_activated_at        TIMESTAMP WITH TIME ZONE,

  -- Skip tokens (counter cache; ledger is authoritative)
  skip_tokens                 INT NOT NULL DEFAULT 0 CHECK (skip_tokens >= 0),
  skip_tokens_used_this_month INT NOT NULL DEFAULT 0,

  -- Accountability
  warnings                    INT NOT NULL DEFAULT 0 CHECK (warnings >= 0),
  warning_level               warning_level NOT NULL DEFAULT 'none',
  grace_used                  BOOLEAN NOT NULL DEFAULT false,

  -- Post-century override
  monthly_minimum_override    INT,
  minimum_override_expires_at TIMESTAMP WITH TIME ZONE,

  -- Domain badge (Tier 3+, set by admin)
  domain_badge                VARCHAR(50),

  -- Referral
  referral_code               VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
  referred_by                 UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Metadata
  avatar_url                  TEXT,
  last_active                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_role               ON users(role);
CREATE INDEX idx_users_status             ON users(status);
CREATE INDEX idx_users_tier               ON users(tier);
CREATE INDEX idx_users_redeemable_pts     ON users(redeemable_pts DESC);
CREATE INDEX idx_users_lifetime_pts       ON users(lifetime_pts DESC);
CREATE INDEX idx_users_current_quarter_pts ON users(current_quarter_pts DESC);
CREATE INDEX idx_users_referral_code      ON users(referral_code);


-- ── 3. meetings ───────────────────────────────────────────────

CREATE TABLE meetings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  location    VARCHAR(255),
  agenda      TEXT,
  minutes     TEXT,
  is_holiday  BOOLEAN NOT NULL DEFAULT false,

  -- FIX: NOT NULL + ON DELETE SET NULL is contradictory → use RESTRICT
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meetings_date       ON meetings(date DESC);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);


-- ── 4. events ────────────────────────────────────────────────

CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  type              event_type NOT NULL,

  pts_1st           INT,
  pts_2nd           INT,
  pts_special       INT,
  pts_participation INT,
  pts_offered       INT,
  pts_applied       INT,

  apply_deadline    TIMESTAMP WITH TIME ZONE,
  proof_required    BOOLEAN NOT NULL DEFAULT true,
  max_participants  INT,
  event_date        TIMESTAMP WITH TIME ZONE,
  location          VARCHAR(255),
  external_link     TEXT,

  -- FIX: ON DELETE RESTRICT (NOT NULL cannot coexist with ON DELETE SET NULL)
  created_by        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_type           ON events(type);
CREATE INDEX idx_events_apply_deadline ON events(apply_deadline);
CREATE INDEX idx_events_event_date     ON events(event_date);


-- ── 5. projects ───────────────────────────────────────────────

CREATE TABLE projects (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(255) NOT NULL,
  description        TEXT,
  github_url         TEXT,
  external_url       TEXT,

  owner_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  funded             BOOLEAN NOT NULL DEFAULT false,
  funded_pts_claimed BOOLEAN NOT NULL DEFAULT false,
  funded_proof_url   TEXT,
  funded_at          TIMESTAMP WITH TIME ZONE,

  active             BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_active   ON projects(active);
