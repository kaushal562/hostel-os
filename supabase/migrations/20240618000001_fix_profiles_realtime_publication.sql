-- This migration safely checks if the profiles table is already in the publication
-- before attempting to add it, avoiding the "already a member" error

DO $$
BEGIN
  -- Check if profiles table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    -- Only add it if it's not already there
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END
$$;