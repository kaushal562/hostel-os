-- Enable RLS on room_change_requests table
ALTER TABLE public.room_change_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own room change requests
CREATE POLICY "Users can insert their own room change requests"
  ON public.room_change_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can view their own room change requests
CREATE POLICY "Users can view their own room change requests"
  ON public.room_change_requests
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Users can update their own pending room change requests
CREATE POLICY "Users can update their own pending room change requests"
  ON public.room_change_requests
  FOR UPDATE
  USING (
    auth.uid() = user_id AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Admin can view all room change requests
CREATE POLICY "Admins can view all room change requests"
  ON public.room_change_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin can update all room change requests
CREATE POLICY "Admins can update all room change requests"
  ON public.room_change_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
