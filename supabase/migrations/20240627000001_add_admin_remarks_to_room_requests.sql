-- Add admin_remarks and other missing columns to room_change_requests table
ALTER TABLE room_change_requests ADD COLUMN IF NOT EXISTS admin_remarks TEXT;
ALTER TABLE room_change_requests ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id);

-- Update existing records to have admin_remarks as NULL if not present
-- (This is automatically handled by ADD COLUMN IF NOT EXISTS with NULL default)

-- Make sure the table is still included in the realtime publication
alter publication supabase_realtime add table room_change_requests;
