# Quick RLS Fix Checklist

Run these commands in Supabase SQL Editor (one at a time):

## 1️⃣ Check Admin Profile (MOST IMPORTANT)
```sql
SELECT id, full_name, role 
FROM public.profiles 
WHERE role = 'admin';
```
- ✅ If result shows admin with role='admin' → GO TO STEP 2
- ❌ If empty → GO TO STEP 1A

## 1A️⃣ FIX: Set User as Admin
```sql
-- Get your user ID from Supabase Auth Dashboard first!
-- Replace 'YOUR_USER_ID' below
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

Then verify:
```sql
SELECT id, full_name, role 
FROM public.profiles 
WHERE id = 'YOUR_USER_ID';
```

## 2️⃣ Check RLS Policies
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'notifications' 
ORDER BY policyname;
```

Expected output:
```
notifications_admin_insert
notifications_admin_select
notifications_admin_update
notifications_select_own
notifications_update_own
```

- ✅ If all 5 appear → RLS is correct, test sending notification
- ❌ If `notifications_admin_insert` missing → GO TO STEP 2A
- ❌ If multiple missing → GO TO STEP 2B

## 2A️⃣ FIX: Add INSERT Policy Only
```sql
BEGIN;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );
COMMIT;
```

## 2B️⃣ FIX: Recreate All Policies
```sql
BEGIN;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ALTER COLUMN user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_admin_select"
  ON public.notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "notifications_admin_update"
  ON public.notifications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "notifications_admin_insert"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

COMMIT;
```

## 3️⃣ TEST: Try Sending a Notification
1. Go to Admin Notifications page
2. Fill in title and message
3. Click "Send Notification"
4. ✅ Success toast should appear
5. ✅ Notification appears in "Recent Notifications"

If still getting RLS error:
- Verify admin profile role is 'admin' (Step 1)
- Logout and login again (session cache issue)
- Check browser console for actual error message

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Still getting RLS error | Admin profile role ≠ 'admin'. Run Step 1A with correct user ID |
| Policies show but still error | Logout/login to refresh session |
| INSERT policy missing | Run Step 2A |
| Multiple policies missing | Run Step 2B (complete rebuild) |
| No students in broadcast | Check profiles table has students with role='student' |
| Notification not appearing | Check realtime subscription in browser console |

---

## 🔑 Key Points

✓ **Broadcast creates ONE row per student** (not one row with null user_id)
✓ **Each student only sees their own notifications** (RLS protected)
✓ **Admin must have role='admin'** in profiles table
✓ **INSERT policy checks role='admin'** before allowing insert
✓ **Real-time updates** via Supabase Realtime subscription
