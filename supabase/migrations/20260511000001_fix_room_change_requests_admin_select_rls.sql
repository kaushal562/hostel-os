-- Fix RLS for room_change_requests admin SELECT so admins can see ALL rows.
-- Also preserve student isolation (students see only rows where user_id = auth.uid()).
-- This migration is safe to run multiple times (drops old policies first).

BEGIN;

-- Ensure RLS enabled
ALTER TABLE public.room_change_requests ENABLE ROW LEVEL SECURITY;

-- Keep user_id default derived from auth.uid()
ALTER TABLE public.room_change_requests
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "room_change_requests_select_own" ON public.room_change_requests;
DROP POLICY IF EXISTS "room_change_requests_admin_select" ON public.room_change_requests;
DROP POLICY IF EXISTS "room_change_requests_insert_own" ON public.room_change_requests;
DROP POLICY IF EXISTS "room_change_requests_update_own_pending" ON public.room_change_requests;
DROP POLICY IF EXISTS "room_change_requests_admin_update" ON public.room_change_requests;

-- Students: SELECT only their own rows
CREATE POLICY "room_change_requests_select_own"
  ON public.room_change_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins: SELECT ALL rows
CREATE POLICY "room_change_requests_admin_select"
  ON public.room_change_requests
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

-- Users: INSERT only their own rows
CREATE POLICY "room_change_requests_insert_own"
  ON public.room_change_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users: UPDATE only their own pending requests
CREATE POLICY "room_change_requests_update_own_pending"
  ON public.room_change_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admins: UPDATE ALL rows
CREATE POLICY "room_change_requests_admin_update"
  ON public.room_change_requests
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

COMMIT;

