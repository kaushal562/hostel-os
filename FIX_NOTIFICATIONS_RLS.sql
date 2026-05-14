-- ============================================================================
-- FIX NOTIFICATIONS RLS (NON-RECURSIVE ARCHITECTURE)
-- ============================================================================
-- This script fixes the 42501 INSERT error for the notifications table.
-- It ensures admins can broadcast and send direct notifications.
-- It leverages the safe `public.is_admin()` SECURITY DEFINER function 
-- we created earlier to avoid any recursive lookups on the profiles table.
-- ============================================================================

BEGIN;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;

-- 2. Student policies
-- Students can read their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Students can update their own notifications (e.g., mark as read)
CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Admin policies using the non-recursive helper
-- Admins can read all notifications
CREATE POLICY "notifications_admin_select"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update all notifications
CREATE POLICY "notifications_admin_update"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can INSERT notifications (Fixes the 42501 error)
-- WITH CHECK ensures the insert is only allowed if they are an admin
CREATE POLICY "notifications_admin_insert"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

COMMIT;
