-- Production-ready RLS fix for room_change_requests
-- Goals:
-- 1) Authenticated users can INSERT only their own rows
-- 2) Logged-in users can SELECT only their own rows
-- 3) Logged-in users can UPDATE only their own pending requests (optional)
-- 4) Keep RLS enabled

BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.room_change_requests ENABLE ROW LEVEL SECURITY;

-- Ensure a secure default so frontend never needs to send user_id.
-- user_id will be derived from the authenticated session.
ALTER TABLE public.room_change_requests
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Helper: remove existing policies to avoid duplicates / conflicts.
DROP POLICY IF EXISTS "Users can insert their own room change requests" ON public.room_change_requests;
DROP POLICY IF EXISTS "Users can view their own room change requests" ON public.room_change_requests;
DROP POLICY IF EXISTS "Users can update their own pending room change requests" ON public.room_change_requests;
DROP POLICY IF EXISTS "Admins can view all room change requests" ON public.room_change_requests;
DROP POLICY IF EXISTS "Admins can update all room change requests" ON public.room_change_requests;

-- (1) Users: INSERT only their own rows
-- Best practice: derive ownership from auth.uid() and enforce with WITH CHECK.
CREATE POLICY "room_change_requests_insert_own"
  ON public.room_change_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- (2) Users: SELECT only their own rows
CREATE POLICY "room_change_requests_select_own"
  ON public.room_change_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- (3) Users: UPDATE only their own pending requests
CREATE POLICY "room_change_requests_update_own_pending"
  ON public.room_change_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- (4) Admins: allow SELECT/UPDATE for all rows.
-- Admin role is stored in profiles.role.
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

