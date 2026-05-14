-- ============================================================================
-- RLS SECURITY AUDIT & VERIFICATION SCRIPT
-- ============================================================================
-- This script contains scenarios to verify that the RLS fortification 
-- is correctly isolating student data while maintaining admin access.
-- Run these checks in the Supabase SQL Editor.
-- ============================================================================

-- 1. UNAUTHENTICATED ACCESS CHECK
-- Should return 0 rows for all tables (unless public access is explicitly allowed)
SELECT count(*) FROM public.profiles;
SELECT count(*) FROM public.fees;
SELECT count(*) FROM public.complaints;
SELECT count(*) FROM public.notifications;

-- 2. ADMIN FULL ACCESS CHECK
-- (Requires running as a user where public.is_admin() returns TRUE)
-- Should return all records in the system.
SELECT 'Admin Access' as test, count(*) FROM public.profiles;
SELECT 'Admin Access' as test, count(*) FROM public.fees;
SELECT 'Admin Access' as test, count(*) FROM public.fee_payments;
SELECT 'Admin Access' as test, count(*) FROM public.complaints;

-- 3. STUDENT ISOLATION: FEES & PAYMENTS
-- (Run this while logged in as a student)
-- Should ONLY return records where student_id = auth.uid()
SELECT * FROM public.fees;
SELECT * FROM public.fee_payments;

-- 4. STUDENT ISOLATION: COMPLAINTS & ROOM REQUESTS
-- Should ONLY return records where user_id = auth.uid()
SELECT * FROM public.complaints;
SELECT * FROM public.room_change_requests;

-- 5. STUDENT ISOLATION: NOTIFICATIONS
-- Should ONLY return records where user_id = auth.uid()
SELECT * FROM public.notifications;

-- 6. ROOMMATE VISIBILITY RULES
-- Students should see profiles of others in the same:
-- Room Number + Block + Floor
SELECT 
    id, 
    full_name, 
    room_number, 
    block, 
    floor 
FROM public.profiles 
WHERE id != auth.uid(); 
-- Note: If this returns students from DIFFERENT rooms, RLS is leaking.

-- 7. RECURSION & PERFORMANCE CHECK
-- If this returns a result quickly without an error, recursion is solved.
EXPLAIN ANALYZE SELECT * FROM public.profiles LIMIT 10;

-- 8. OBSOLETE TABLE VERIFICATION
-- Should return NULL (confirming the table is successfully removed)
SELECT 
    'Obsolete Payments Table Status' as check_type,
    CASE 
        WHEN to_regclass('public.payments') IS NULL THEN '✅ Successfully Removed' 
        ELSE '❌ STILL EXISTS' 
    END as status;

-- 9. REALTIME PUBLICATION CHECK
-- Verify that all hardened tables are receiving real-time updates.
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
