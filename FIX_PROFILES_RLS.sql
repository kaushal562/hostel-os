-- ============================================================================
-- FIX PROFILES RLS (NON-RECURSIVE ARCHITECTURE)
-- ============================================================================
-- This script replaces all recursive RLS policies with a safe, non-recursive
-- pattern using a SECURITY DEFINER function.
--
-- WHY THIS WORKS:
-- SECURITY DEFINER functions run with the privileges of the user who created 
-- them (postgres). By explicitly setting `search_path = public`, it safely 
-- queries the profiles table BYPASSING Row Level Security. 
-- Since RLS is bypassed within the function, it NEVER loops infinitely.
-- ============================================================================

BEGIN;

-- 1. Create a non-recursive SECURITY DEFINER helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT (role = 'admin') INTO is_admin_user
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_admin_user, false);
END;
$$;

-- Ensure RLS is active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop all previous potentially problematic recursive policies
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_students" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- 3. Base policy: Users can always read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 4. Base policy: Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 5. Admin policy: Admins can select ALL profiles using the safe helper
CREATE POLICY "profiles_admin_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 6. Admin policy: Admins can update ALL profiles using the safe helper
CREATE POLICY "profiles_admin_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- 7. Admin policy: Admins can insert profiles using the safe helper
CREATE POLICY "profiles_admin_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

COMMIT;
