-- Allow authenticated users to read student profiles for roommate matching.
-- Keeps admin profiles private (still self-only via existing policy).

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view student profiles" ON public.profiles;
CREATE POLICY "Authenticated can view student profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (role = 'student');

