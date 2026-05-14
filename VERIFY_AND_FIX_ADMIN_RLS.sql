-- ============================================================================
-- VERIFY AND FIX ADMIN RLS ISSUE
-- ============================================================================
-- This script checks and fixes the admin notification RLS policy issues.
-- Run this in your Supabase SQL editor to verify and fix the setup.
-- ============================================================================

-- ============================================================================
-- 1. VERIFY ADMIN PROFILES
-- ============================================================================
-- Check if admin profile exists with correct role
SELECT 
  id,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- If no admins found, you'll need to update an existing user profile.
-- Get current authenticated user's ID (you need to know this from your session)
-- Then run the UPDATE below.

-- ============================================================================
-- 2. IF NEEDED: SET A USER AS ADMIN
-- ============================================================================
-- Replace 'YOUR_USER_ID_HERE' with the actual admin user UUID
-- (Find this from your auth.users table or Supabase Auth dashboard)
-- 
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- ============================================================================
-- 3. VERIFY RLS IS ENABLED
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'notifications' OR tablename = 'profiles'
ORDER BY tablename;

-- Expected result: rowsecurity = true for both tables

-- ============================================================================
-- 4. VERIFY RLS POLICIES EXIST
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Expected policies for notifications table:
-- - notifications_select_own (SELECT)
-- - notifications_update_own (UPDATE)
-- - notifications_admin_select (SELECT for admins)
-- - notifications_admin_update (UPDATE for admins)
-- - notifications_admin_insert (INSERT for admins)

-- ============================================================================
-- 5. IF INSERT POLICY IS MISSING, RUN THIS
-- ============================================================================
-- Only run if "notifications_admin_insert" doesn't appear in query above

BEGIN;

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;

CREATE POLICY "notifications_admin_insert"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

COMMIT;

-- ============================================================================
-- 6. IF ALL POLICIES ARE MISSING, RUN COMPLETE SETUP
-- ============================================================================
-- Only run if multiple policies are missing

BEGIN;

-- Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Set user_id default
ALTER TABLE public.notifications
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Drop all existing policies
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;

-- Create all policies

-- Users can SELECT only their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can UPDATE only their own notifications (e.g., mark as read)
CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can SELECT all notifications
CREATE POLICY "notifications_admin_select"
  ON public.notifications
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

-- Admins can UPDATE all notifications
CREATE POLICY "notifications_admin_update"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Admins can INSERT notifications
CREATE POLICY "notifications_admin_insert"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

COMMIT;

-- ============================================================================
-- 7. TEST THE INSERT
-- ============================================================================
-- After running the above, test an insert like this:
-- (Make sure you're logged in as admin user)
--
-- INSERT INTO public.notifications (
--   title,
--   message,
--   type,
--   is_read,
--   user_id
-- ) VALUES (
--   'Test Notification',
--   'This is a test to verify RLS is working',
--   'info',
--   false,
--   'TARGET_USER_ID'
-- );
--
-- If successful, RLS is configured correctly!
-- If you get "row violates row level security policy", the admin profile
-- doesn't have role='admin' or the policies weren't created properly.

-- ============================================================================
-- TROUBLESHOOTING STEPS
-- ============================================================================
-- 1. Verify admin profile exists: Run query from step 1
-- 2. Check RLS is enabled: Run query from step 3
-- 3. Check policies exist: Run query from step 4
-- 4. If INSERT policy is missing: Run step 5
-- 5. If multiple policies are missing: Run step 6
-- 6. Test with step 7
--
-- Common issues:
-- - Admin profile has role != 'admin': Update profile manually
-- - RLS not enabled: ALTER TABLE notifications ENABLE ROW LEVEL SECURITY
-- - Policies deleted by mistake: Recreate them with step 6
-- - User not authenticated: Ensure you're logged in when running tests
