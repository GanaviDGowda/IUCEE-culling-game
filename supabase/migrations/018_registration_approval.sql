-- Migration 018: Student registration approval flow
-- Self-signups create registration_requests only. Admin-created auth users still
-- get an immediate public.users profile through the existing trigger.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS usn VARCHAR(20),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(15),
  ADD COLUMN IF NOT EXISTS registration_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_usn_unique
  ON public.users(usn)
  WHERE usn IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.registration_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  usn           VARCHAR(20) NOT NULL,
  phone         VARCHAR(15),
  branch        VARCHAR(50) NOT NULL,
  year          VARCHAR(10) NOT NULL,
  referral_code VARCHAR(20),
  auth_uid      UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status        public.registration_status NOT NULL DEFAULT 'pending',
  reviewed_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  review_note   TEXT,
  submitted_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at   TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_requests_email_unique
  ON public.registration_requests(lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_requests_usn_unique
  ON public.registration_requests(upper(usn));

CREATE INDEX IF NOT EXISTS idx_registration_requests_status
  ON public.registration_requests(status, submitted_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_registration_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_registration_id_fkey
      FOREIGN KEY (registration_id)
      REFERENCES public.registration_requests(id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registration_insert_self" ON public.registration_requests;
DROP POLICY IF EXISTS "registration_read_own_or_admin" ON public.registration_requests;
DROP POLICY IF EXISTS "registration_admin_update" ON public.registration_requests;

CREATE POLICY "registration_insert_self" ON public.registration_requests
  FOR INSERT
  WITH CHECK (auth.uid() = auth_uid);

CREATE POLICY "registration_read_own_or_admin" ON public.registration_requests
  FOR SELECT
  USING (auth.uid() = auth_uid OR public.get_my_role() = 'admin');

CREATE POLICY "registration_admin_update" ON public.registration_requests
  FOR UPDATE
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

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
  submitted_at
FROM public.registration_requests
WHERE status = 'pending'
ORDER BY submitted_at ASC;

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
      referral_code
    )
    VALUES (
      NEW.id,
      lower(NEW.email),
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), 'Unknown Student'),
      upper(COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'usn'), ''), 'UNKNOWN')),
      NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'branch'), ''), 'CSE'),
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'year'), ''), '1'),
      NULLIF(trim(NEW.raw_user_meta_data->>'referral_code'), '')
    )
    ON CONFLICT (auth_uid) DO UPDATE
    SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      usn = EXCLUDED.usn,
      phone = EXCLUDED.phone,
      branch = EXCLUDED.branch,
      year = EXCLUDED.year,
      referral_code = EXCLUDED.referral_code;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
