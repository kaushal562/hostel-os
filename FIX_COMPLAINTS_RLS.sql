-- ============================================================================
-- FIX COMPLAINTS RLS (NON-RECURSIVE)
-- ============================================================================
-- Redesign complaints RLS to use the safe public.is_admin() helper.
-- This ensures admins can see all complaints without infinite recursion.
-- ============================================================================

BEGIN;

-- Ensure RLS is active
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "complaints_insert_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_select_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_own_pending" ON public.complaints;
DROP POLICY IF EXISTS "complaints_admin_select" ON public.complaints;
DROP POLICY IF EXISTS "complaints_admin_update" ON public.complaints;

-- 1. Student Policies
-- Students can only insert their own complaints
CREATE POLICY "complaints_insert_own"
  ON public.complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Students can only view their own complaints
CREATE POLICY "complaints_select_own"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Students can only update their own complaints if they are still pending
CREATE POLICY "complaints_update_own_pending"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- 2. Admin Policies (Non-Recursive)
-- Admins can view all complaints
CREATE POLICY "complaints_admin_select"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update all complaints (e.g., change status)
CREATE POLICY "complaints_admin_update"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMIT;
