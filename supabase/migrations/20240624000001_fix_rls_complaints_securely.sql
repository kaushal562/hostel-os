-- Production-ready RLS fix for complaints table
-- Goals:
-- 1) Authenticated users can INSERT only their own rows
-- 2) Logged-in users can SELECT only their own rows
-- 3) Logged-in users can UPDATE only their own pending requests (optional)
-- 4) Keep RLS enabled

BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Secure default: user_id always comes from the authenticated session
ALTER TABLE public.complaints
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Remove any previous conflicting policies (if they exist)
DROP POLICY IF EXISTS "Users can insert their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can update their own pending complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can update all complaints" ON public.complaints;

DROP POLICY IF EXISTS "complaints_insert_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_select_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_own_pending" ON public.complaints;
DROP POLICY IF EXISTS "complaints_admin_select" ON public.complaints;
DROP POLICY IF EXISTS "complaints_admin_update" ON public.complaints;

-- Users: INSERT own
CREATE POLICY "complaints_insert_own"
  ON public.complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users: SELECT own
CREATE POLICY "complaints_select_own"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users: UPDATE own pending
CREATE POLICY "complaints_update_own_pending"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admins: SELECT/UPDATE all (admin role stored in profiles.role)
CREATE POLICY "complaints_admin_select"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

CREATE POLICY "complaints_admin_update"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

COMMIT;

