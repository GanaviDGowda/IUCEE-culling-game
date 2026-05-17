-- Migration 025: Drop old grant_year_cie_bonus signature
DROP FUNCTION IF EXISTS public.grant_year_cie_bonus(VARCHAR, UUID);
