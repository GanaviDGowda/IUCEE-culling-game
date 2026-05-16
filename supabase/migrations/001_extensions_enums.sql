-- ============================================================
-- MIGRATION 001: Extensions & Enums
-- ============================================================

-- Enable required extensions
-- NOTE: gen_random_uuid() is native in PG 13+; uuid-ossp is NOT needed.
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ── ENUMS ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'student', 'conveyor', 'nodal_officer', 'admin'
);

CREATE TYPE user_tier AS ENUM (
  'active', 'contributor', 'elite', 'domain_master', 'century'
);

CREATE TYPE user_status AS ENUM (
  'active', 'danger_zone', 'removed'
);

CREATE TYPE point_log_type AS ENUM (
  'attendance', 'presentation', 'project_update', 'project_funded',
  'event_1st', 'event_2nd', 'event_special', 'event_participation',
  'industry_offered', 'industry_applied', 'cie_bonus', 'streak_bonus',
  'mentor_bonus', 'referral_bonus', 'century_spend', 'deduction', 'manual_award'
);

CREATE TYPE point_log_status AS ENUM (
  'pending', 'confirmed', 'rejected'
);

CREATE TYPE event_type AS ENUM (
  'hackathon', 'cultural', 'nss', 'industry_visit', 'other'
);

CREATE TYPE announcement_tag AS ENUM (
  'general', 'urgent', 'event', 'info'
);

CREATE TYPE grace_status AS ENUM (
  'pending', 'approved', 'rejected'
);

CREATE TYPE warning_level AS ENUM (
  'none', 'first', 'second'
);
