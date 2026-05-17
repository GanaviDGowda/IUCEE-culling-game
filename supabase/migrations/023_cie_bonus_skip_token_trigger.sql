-- Migration 023: Automatically grant skip token when a point log of type 'cie_bonus' is confirmed
CREATE OR REPLACE FUNCTION public.handle_cie_bonus_skip_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (TG_OP = 'INSERT' OR OLD.status <> 'confirmed') AND NEW.type = 'cie_bonus' THEN
    -- 1. Insert a skip token into skip_tokens table
    INSERT INTO public.skip_tokens (user_id, used)
    VALUES (NEW.user_id, false);

    -- 2. Increment user's skip_tokens counter cache in users table
    UPDATE public.users
    SET skip_tokens = skip_tokens + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cie_bonus_skip_token ON public.point_logs;
CREATE TRIGGER trg_cie_bonus_skip_token
  AFTER INSERT OR UPDATE ON public.point_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_cie_bonus_skip_token();
