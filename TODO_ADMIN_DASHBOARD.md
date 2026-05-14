# TODO_ADMIN_DASHBOARD.md

## Step 1: Subscription lifecycle fixes
- [ ] Refactor AdminDashboard real-time subscriptions to store channel handles and clean up correctly.
- [x] Prevent duplicate fetch/render storms where possible.

## Step 2: Room request mapping correctness
- [ ] Normalize `requestedType` to values that match capacity logic (single/double/triple/quad).
- [ ] Ensure `preferred_room_type` -> `requestedType` mapping aligns with `profiles.room_type`.

## Step 3: Type safety + null hardening
- [ ] Remove `any` usage for selected complaint/room request and recentRoomChangeRequests.
- [ ] Harden lookup merges (missing profile/user_id) so UI never crashes.

## Step 4: Unused imports/vars cleanup
- [ ] Remove unused imports from AdminDashboard to prevent TS/lint build failures.

## Step 5: Verification
- [ ] Run typecheck/build.
- [ ] Manual sanity checks: load dashboard, open room request dialog, approve/reject flows.

