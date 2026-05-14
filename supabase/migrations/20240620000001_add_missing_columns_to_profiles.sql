-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS block text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS floor text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS room_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS room_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS year text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture text;

-- Make sure the table is included in the realtime publication
alter publication supabase_realtime add table profiles;
