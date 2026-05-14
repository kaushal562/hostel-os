-- Ensure admins can fetch student profiles for Admin Notifications UI
-- This policy keeps RLS enabled and grants SELECT to admins only.

BEGIN;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_students" ON public.profiles;

-- Admin can view all profiles (already required for admin UI)
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

-- Optional: explicitly allow admins to view only students too
CREATE POLICY "profiles_admin_select_students"
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
    AND role = 'student'
  );

COMMIT;

