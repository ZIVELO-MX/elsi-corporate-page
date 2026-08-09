-- Run against the hosted project only after replacing the UUIDs below.
-- Example: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls-smoke.sql
-- The session must use the database role `authenticated`; use a short-lived test connection.

\set student_id '00000000-0000-0000-0000-000000000001'
\set other_student_id '00000000-0000-0000-0000-000000000002'
\set admin_id '00000000-0000-0000-0000-000000000003'

begin;

set local role authenticated;

-- Student JWT context: only the student's own profile/enrollments/certificates must be visible.
select set_config('request.jwt.claim.sub', :'student_id', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select 'student_profile_count' as check_name, count(*) as observed, 1 as expected
from public.profiles where id = :'student_id';
select 'student_foreign_profiles' as check_name, count(*) as observed, 0 as expected
from public.profiles where id = :'other_student_id';
select 'student_foreign_enrollments' as check_name, count(*) as observed, 0 as expected
from public.enrollments where user_id = :'other_student_id';
select 'student_foreign_certificates' as check_name, count(*) as observed, 0 as expected
from public.certificates c
join public.enrollments e on e.id = c.enrollment_id
where e.user_id = :'other_student_id';

do $$
begin
  perform public.get_admin_summary();
  raise exception 'student_admin_summary_visible';
exception
  when others then
    if sqlerrm <> 'admin_required' then raise; end if;
end;
$$;

-- Admin JWT context: admin may inspect all operational rows and audit events.
select set_config('request.jwt.claim.sub', :'admin_id', true);
select 'admin_enrollments_visible' as check_name, count(*) as observed
from public.enrollments;
select 'admin_audit_events_visible' as check_name, count(*) as observed
from public.audit_events;
select 'admin_profile_emails_visible' as check_name, count(*) as observed
from public.profiles where email is not null;
select 'admin_summary_visible' as check_name, public.get_admin_summary() is not null as observed, true as expected;

rollback;
