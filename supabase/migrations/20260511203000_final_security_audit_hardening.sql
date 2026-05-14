-- ============================================================================
-- FINAL SECURITY AUDIT & RLS FORTIFICATION
-- ============================================================================
-- This migration unifies the security architecture for the Hostel Management System.
-- It ensures:
-- 1) Non-recursive RLS (using SECURITY DEFINER helpers)
-- 2) Strict student isolation (can only see own data + roommates)
-- 3) Full administrative oversight
-- 4) Cleanup of obsolete structures
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. SECURITY DEFINER HELPERS (The "Bypass" Layer)
-- ============================================================================

-- A) Safe Admin Check (Non-Recursive)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- B) Safe Roommate Check (Non-Recursive)
CREATE OR REPLACE FUNCTION public.is_roommate(p_target_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me public.profiles%ROWTYPE;
  v_them public.profiles%ROWTYPE;
BEGIN
  -- If checking self, obviously true (but handled by separate policy usually)
  IF auth.uid() = p_target_id THEN RETURN true; END IF;

  SELECT * INTO v_me FROM public.profiles WHERE id = auth.uid();
  SELECT * INTO v_them FROM public.profiles WHERE id = p_target_id;
  
  -- Basic validity check
  IF v_me.room_number IS NULL OR v_them.room_number IS NULL THEN
    RETURN false;
  END IF;
  
  -- Roommate match logic
  RETURN (
    v_me.block IS NOT DISTINCT FROM v_them.block AND 
    v_me.floor IS NOT DISTINCT FROM v_them.floor AND 
    v_me.room_number IS NOT DISTINCT FROM v_them.room_number
  );
END;
$$;

-- ============================================================================
-- 2. TABLE CLEANUP
-- ============================================================================

-- Drop the obsolete payments table (replaced by fee_payments)
DROP TABLE IF EXISTS public.payments CASCADE;

-- ============================================================================
-- 3. PROFILES RLS (HARDENING)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear all existing policies to ensure a clean slate
DO $$ 
DECLARE 
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Policies:
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_select_roommates" ON public.profiles FOR SELECT TO authenticated USING (public.is_roommate(id));
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 4. NOTIFICATIONS RLS (HARDENING)
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE 
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. COMPLAINTS RLS (HARDENING)
-- ============================================================================

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE 
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'complaints' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.complaints', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "complaints_select_own" ON public.complaints FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "complaints_insert_own" ON public.complaints FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "complaints_update_own_pending" ON public.complaints FOR UPDATE TO authenticated 
  USING (user_id = auth.uid() AND status = 'pending') 
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "complaints_admin_all" ON public.complaints FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 6. ROOM CHANGE REQUESTS RLS (HARDENING)
-- ============================================================================

ALTER TABLE public.room_change_requests ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE 
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'room_change_requests' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.room_change_requests', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "room_requests_select_own" ON public.room_change_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "room_requests_insert_own" ON public.room_change_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "room_requests_update_own_pending" ON public.room_change_requests FOR UPDATE TO authenticated 
  USING (user_id = auth.uid() AND status = 'pending') 
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "room_requests_admin_all" ON public.room_change_requests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 7. FEES & PAYMENTS RLS (HARDENING)
-- ============================================================================

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- Fees cleanup
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'fees' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.fees', pol.policyname); END LOOP;
END $$;

-- Payments cleanup
DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'fee_payments' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.fee_payments', pol.policyname); END LOOP;
END $$;

-- Fees Policies
CREATE POLICY "fees_select_own" ON public.fees FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "fees_admin_all" ON public.fees FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Fee Payments Policies
CREATE POLICY "fee_payments_select_own" ON public.fee_payments FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "fee_payments_admin_all" ON public.fee_payments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 8. REALTIME PUBLICATION VERIFICATION
-- ============================================================================

-- Ensure all tables are part of the realtime publication
DO $$
BEGIN
  -- Re-add tables to publication to ensure they are present
  -- Supabase might error if already added, so we check or just re-run safe syntax
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.room_change_requests; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.fees; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.fee_payments; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;

-- ============================================================================
-- FINAL VERIFICATION SQL (Run these to test)
-- ============================================================================
/*
-- 1. Check for infinite recursion (Should return rows if you are admin or self)
-- SELECT * FROM public.profiles LIMIT 5;

-- 2. Check is_admin helper
-- SELECT public.is_admin();

-- 3. Check is_roommate helper (Replace with a known ID)
-- SELECT public.is_roommate('SOME_STUDENT_ID');
*/
