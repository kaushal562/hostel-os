-- Ensure admins can SELECT profiles (required for admin UI)
-- This migration keeps RLS enabled and adds an admin SELECT policy.

BEGIN;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove any prior conflicting admin select policies if present
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;

-- Admins can view all profiles
CREATE POLICY "profiles_admin_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

COMMIT;

