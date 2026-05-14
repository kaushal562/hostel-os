# Admin Rooms Fix - Verification Checklist

## 🔧 Pre-Deployment Checklist

### Database Migration
- [ ] Migration file created: `supabase/migrations/20240628000001_fix_room_requests_fk_to_profiles.sql`
- [ ] Migration applied to Supabase database
- [ ] Foreign key constraint verified in SQL Editor

### Code Updates
- [ ] AdminDashboard.tsx updated with fallback query strategy
- [ ] Comprehensive logging added
- [ ] Error handling implemented
- [ ] All console.log statements prefixed with `[AdminDashboard]`

### Data Cleanup
- [ ] No mock data like "John Doe", "Jane Smith"
- [ ] No hardcoded room numbers or dates
- [ ] All data sourced from Supabase

## 🚀 Post-Deployment Testing

### Admin Dashboard Access
- [ ] Admin can log in successfully
- [ ] Can navigate to Admin Dashboard
- [ ] Rooms tab loads without errors
- [ ] No PGRST200 errors in console

### Room Change Requests Display
- [ ] Room change requests table appears
- [ ] Requests show real student names (not "Unknown Student")
- [ ] Requests show real room numbers
- [ ] Requests show real room types
- [ ] Requests show proper dates formatted
- [ ] Status badges show correct colors:
  - [ ] Pending = Amber/Yellow
  - [ ] Approved = Green
  - [ ] Rejected = Red

### View Details Modal
- [ ] "View Details" button appears for each request
- [ ] Clicking "View Details" opens modal without error
- [ ] Modal displays:
  - [ ] Student name
  - [ ] Student ID
  - [ ] Current room
  - [ ] Requested room type
  - [ ] Preferred floor
  - [ ] Reason for request
  - [ ] Roommate preference
  - [ ] Request date
  - [ ] Status badge

### Approve/Reject Workflow
- [ ] "Approve" button visible for pending requests
- [ ] "Reject" button visible for pending requests
- [ ] Clicking "Approve":
  - [ ] Request status changes to "approved"
  - [ ] Toast notification appears
  - [ ] Student receives notification
  - [ ] Data refreshes automatically
- [ ] Clicking "Reject":
  - [ ] Request status changes to "rejected"
  - [ ] Toast notification appears
  - [ ] Student receives notification
  - [ ] Data refreshes automatically

### Occupancy Cards
- [ ] Single Rooms card shows real number (not 0)
- [ ] Double Rooms card shows real number (not 0)
- [ ] Triple Rooms card shows real number (not 0)
- [ ] Quad Rooms card shows real number (not 0)
- [ ] Progress bars display and update
- [ ] Cards show "occupied / total" format

### Real-Time Synchronization
- [ ] Student submits new request
- [ ] Admin instantly sees new request (no page refresh needed)
- [ ] Admin approves request
- [ ] Student receives notification instantly
- [ ] Occupancy cards update in real-time

### Console Logs (F12 → Console)
- [ ] When loading Rooms tab, see logs like:
  ```
  [AdminDashboard] Starting fetchRoomChangeRequests...
  [AdminDashboard] Fetched room_change_requests: [...]
  [AdminDashboard] Extracted user IDs: [...]
  [AdminDashboard] Final merged room requests: [...]
  ```
- [ ] When approving request, see logs like:
  ```
  [AdminDashboard] Approving request: <id>
  [AdminDashboard] Updated request status to approved
  [AdminDashboard] Created notification for user: <id>
  [AdminDashboard] Refreshing data after approval...
  ```
- [ ] NO PGRST200 errors
- [ ] NO "Unknown Student" for real requests

## 🧪 Edge Case Testing

### Empty State
- [ ] When no requests exist, show "No room change requests" message
- [ ] Message is user-friendly
- [ ] Table doesn't show errors

### Error Handling
- [ ] If fetch fails, show error message with retry button
- [ ] Clicking "Retry" attempts to fetch again
- [ ] Error doesn't crash the page
- [ ] Other dashboard functions still work

### Profile Mismatch
- [ ] If student has no profile, show "Unknown Student"
- [ ] If room_number is missing, show "Not Assigned"
- [ ] App continues to work normally

## 📊 Performance Checks

- [ ] Initial load completes in < 2 seconds
- [ ] Approve/Reject actions complete in < 1 second
- [ ] No excessive console logs (only necessary ones)
- [ ] No memory leaks (DevTools → Memory tab)
- [ ] Realtime subscriptions continue working

## 🎯 Final Verification

- [ ] All checkboxes above are checked ✓
- [ ] No console errors or warnings
- [ ] Admin can perform complete workflow:
  1. View room change requests
  2. Click View Details
  3. Approve/Reject with remarks
  4. See updated data instantly
- [ ] Student sees all notifications
- [ ] Occupancy cards reflect actual student room assignments

## 🚨 If Any Test Fails

1. **Check console logs first** (F12 → Console)
   - Look for `[AdminDashboard]` logs
   - Check for any errors prefixed with `[AdminDashboard] Error`

2. **Verify database migration**
   - Run in Supabase SQL Editor:
   ```sql
   SELECT constraint_name FROM information_schema.table_constraints
   WHERE table_name = 'room_change_requests';
   ```
   - Should show: `room_change_requests_user_id_fkey`

3. **Check browser cache**
   - Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
   - Clear cookies: `Ctrl+Shift+Del`

4. **Verify Supabase connection**
   - Check `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Test API endpoint in browser console:
   ```javascript
   supabase.from('room_change_requests').select('*').limit(1)
   ```

5. **If still failing**
   - Check Supabase logs for any SQL errors
   - Verify RLS policies allow admin access
   - Check that admin user has role='admin' in profiles table
