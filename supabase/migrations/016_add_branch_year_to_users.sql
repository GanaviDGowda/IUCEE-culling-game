-- Migration 016: Add branch and year to users table
ALTER TABLE public.users 
ADD COLUMN branch VARCHAR(50),
ADD COLUMN year VARCHAR(10);

-- Update handle_new_user to capture branch and year from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  mapped_role public.user_role;
BEGIN
  mapped_role := CASE lower(trim(COALESCE(NEW.raw_user_meta_data->>'role', 'student')))
    WHEN 'student' THEN 'student'::public.user_role
    WHEN 'conveyor' THEN 'conveyor'::public.user_role
    WHEN 'nodal_officer' THEN 'nodal_officer'::public.user_role
    WHEN 'admin' THEN 'admin'::public.user_role
    ELSE 'student'::public.user_role
  END;

  INSERT INTO public.users (auth_id, email, name, role, branch, year)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Player'),
    mapped_role,
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'year'
  )
  ON CONFLICT (auth_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    year = EXCLUDED.year
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
