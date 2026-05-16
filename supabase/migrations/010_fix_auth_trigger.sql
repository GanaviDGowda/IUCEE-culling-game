-- ============================================================
-- MIGRATION 010: Fix Auth Trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO public.users (auth_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Player'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  )
  RETURNING id INTO new_user_id;

  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (
    new_user_id,
    'points_awarded',
    'Welcome to the Culling Game',
    'Your account has been created. May your cursed technique prevail.'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If something fails, log it and ignore so auth signup isn't blocked completely.
    -- (Though ideally we want atomic failure, for seed debugging this is safer)
    RAISE LOG 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;
