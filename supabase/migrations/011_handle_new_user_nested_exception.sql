-- Welcome notification failures must not roll back public.users insert.
-- Previously a single EXCEPTION block could undo the profile row.

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

  BEGIN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      new_user_id,
      'points_awarded',
      'Welcome to the Culling Game',
      'Your account has been created. May your cursed technique prevail.'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user welcome notification failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;
