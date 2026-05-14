-- Fix FK relationship for room_change_requests to support Supabase relational queries
-- The room_change_requests.user_id needs to reference profiles(id), not just auth.users(id)
-- This enables PostgREST relational joins like: profiles:user_id(...)

BEGIN;

-- First, ensure the table exists and has the user_id column
ALTER TABLE public.room_change_requests
ADD CONSTRAINT room_change_requests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Refresh schema cache in case it's cached
-- Note: Supabase automatically refreshes this, but forcing it ensures immediate availability
NOTIFY pgrst, 'reload schema';

COMMIT;
