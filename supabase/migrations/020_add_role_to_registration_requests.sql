-- Migration 020: Add requested role to registration requests
ALTER TABLE public.registration_requests
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';

-- Update handle_new_user trigger to capture selected role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  mapped_role public.user_role;
  is_student_signup BOOLEAN;
BEGIN
  is_student_signup := COALESCE(NEW.raw_user_meta_data->>'registration_flow', '') = 'student_signup';

  IF is_student_signup THEN
    INSERT INTO public.registration_requests (
      auth_uid,
      email,
      name,
      usn,
      phone,
      branch,
      year,
      referral_code,
      role
    )
    VALUES (
      NEW.id,
      lower(NEW.email),
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), 'Unknown Student'),
      upper(COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'usn'), ''), 'UNKNOWN')),
      NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'branch'), ''), 'CSE'),
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'year'), ''), '1'),
      NULLIF(trim(NEW.raw_user_meta_data->>'referral_code'), ''),
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'role'), ''), 'student')
    )
    ON CONFLICT (auth_uid) DO UPDATE
    SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      usn = EXCLUDED.usn,
      phone = EXCLUDED.phone,
      branch = EXCLUDED.branch,
      year = EXCLUDED.year,
      referral_code = EXCLUDED.referral_code,
      role = EXCLUDED.role;

    RETURN NEW;
  END IF;

  mapped_role := CASE lower(trim(COALESCE(NEW.raw_user_meta_data->>'role', 'student')))
    WHEN 'student' THEN 'student'::public.user_role
    WHEN 'nodal_officer' THEN 'nodal_officer'::public.user_role
    WHEN 'admin' THEN 'admin'::public.user_role
    ELSE 'student'::public.user_role
  END;

  INSERT INTO public.users (auth_id, email, name, role, branch, year, usn, phone)
  VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown Player'),
    mapped_role,
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'usn',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (auth_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    year = EXCLUDED.year,
    usn = EXCLUDED.usn,
    phone = EXCLUDED.phone
  RETURNING id INTO new_user_id;

  BEGIN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      new_user_id,
      'points_awarded',
      'Welcome to the Culling Game',
      'Your account has been approved. May your cursed technique prevail.'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user welcome notification failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Recreate pending registrations view to include role
CREATE OR REPLACE VIEW public.pending_registrations AS
SELECT
  id,
  name,
  email,
  usn,
  phone,
  branch,
  year,
  referral_code,
  auth_uid,
  submitted_at,
  role
FROM public.registration_requests
WHERE status = 'pending'
ORDER BY submitted_at ASC;
