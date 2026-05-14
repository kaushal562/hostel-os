-- This migration fixes the error with profiles table already being a member of supabase_realtime publication
-- First check if the table is already in the publication before trying to add it

DO $$
BEGIN
  -- Add missing columns to profiles table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'student_id') THEN
    ALTER TABLE profiles ADD COLUMN student_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'course') THEN
    ALTER TABLE profiles ADD COLUMN course TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'year') THEN
    ALTER TABLE profiles ADD COLUMN year TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'room_number') THEN
    ALTER TABLE profiles ADD COLUMN room_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'room_type') THEN
    ALTER TABLE profiles ADD COLUMN room_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'block') THEN
    ALTER TABLE profiles ADD COLUMN block TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'floor') THEN
    ALTER TABLE profiles ADD COLUMN floor TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'contact_number') THEN
    ALTER TABLE profiles ADD COLUMN contact_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'emergency_contact') THEN
    ALTER TABLE profiles ADD COLUMN emergency_contact TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_picture') THEN
    ALTER TABLE profiles ADD COLUMN profile_picture TEXT;
  END IF;
  
  -- No need to add the table to the publication again as it's already there
  -- This was causing the error: "relation 'profiles' is already member of publication 'supabase_realtime'"  
END;
$$;
