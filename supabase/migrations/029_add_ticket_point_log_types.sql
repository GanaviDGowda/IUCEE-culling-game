-- Migration 029: Point log types used by ticket purchases.
-- Kept separate so later migrations can safely reference these enum values.

ALTER TYPE public.point_log_type ADD VALUE IF NOT EXISTS 'ticket_golden';
ALTER TYPE public.point_log_type ADD VALUE IF NOT EXISTS 'ticket_silver';
