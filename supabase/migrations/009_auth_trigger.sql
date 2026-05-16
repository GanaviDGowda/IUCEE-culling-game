-- ============================================================
-- MIGRATION 009: Auth Trigger for automatic profile creation
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Player'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  
  -- Send a welcome notification (fire-and-forget)
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (
    (SELECT id FROM public.users WHERE auth_id = NEW.id),
    'points_awarded',
    'Welcome to the Culling Game',
    'Your account has been created. May your cursed technique prevail.'
  );

  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
