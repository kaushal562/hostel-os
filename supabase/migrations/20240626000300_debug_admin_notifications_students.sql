-- Debug helper: verify role distribution and admin select capability
-- Run in Supabase SQL editor while connected as an admin user.

-- 1) Role distribution
select role, count(*) as cnt
from public.profiles
group by role
order by cnt desc;

-- 2) Verify current auth uid profile
select id, full_name, role
from public.profiles
where id = auth.uid();

-- 3) Verify admin can read student profiles
select id, full_name, role
from public.profiles
where role = 'student'
order by full_name asc;

