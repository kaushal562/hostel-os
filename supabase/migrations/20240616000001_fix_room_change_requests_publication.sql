-- Check if the table exists in the publication before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'room_change_requests'
  ) THEN
    -- Only add to publication if it's not already there
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_change_requests;
  END IF;
END
$$;