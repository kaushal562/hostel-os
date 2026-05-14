-- Add INSERT policy for admins to create notifications
BEGIN;

-- Drop existing policy if it exists (safe if it doesn't)
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;

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
