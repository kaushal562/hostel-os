-- ============================================================================
-- CLEANUP INVALID STUDENT PROFILES
-- ============================================================================
-- This script safely removes stale/invalid profile rows from the database.
-- It targets profiles with the role 'student' that have no valid full_name,
-- resolving the "Unnamed Student" ghost entries in the UI.
-- ============================================================================

BEGIN;

-- Safely delete student profiles with missing or whitespace-only names
DELETE FROM public.profiles 
WHERE role = 'student' 
  AND (full_name IS NULL OR trim(full_name) = '');

COMMIT;
