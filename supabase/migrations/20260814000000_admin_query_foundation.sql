-- ELS-0073: additive administrative query model. The migration keeps current
-- public contracts valid while moving identity and operational metadata into
-- queryable columns protected by the existing profile/admin RLS policies.

alter table public.profiles
  add column if not exists email text;

update public.profiles as profiles
set email = lower(users.email)
from auth.users as users
where profiles.id = users.id
  and users.email is not null
  and profiles.email is distinct from lower(users.email);

create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email))
  where email is not null;

create index if not exists profiles_role_created_idx
  on public.profiles (role, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    lower(new.email),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_profile_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = lower(new.email),
    full_name = coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', full_name),
    phone = coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), phone),
    avatar_url = coalesce(new.raw_user_meta_data ->> 'avatar_url', avatar_url),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_identity_updated on auth.users;
create trigger on_auth_user_identity_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_identity();

alter table public.courses
  add column if not exists category text not null default 'General';

update public.courses
set category = syllabus ->> 'category'
where nullif(syllabus ->> 'category', '') is not null;

create or replace function public.sync_course_category()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.category := coalesce(nullif(new.syllabus ->> 'category', ''), nullif(new.category, ''), 'General');
  return new;
end;
$$;

drop trigger if exists sync_course_category_from_syllabus on public.courses;
create trigger sync_course_category_from_syllabus
  before insert or update of syllabus, category on public.courses
  for each row execute function public.sync_course_category();

create index if not exists courses_admin_category_idx
  on public.courses (category, content_status, is_active, created_at desc);
create index if not exists courses_admin_title_idx
  on public.courses (lower(title));

alter table public.orders
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.certificates
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint check (size_bytes is null or size_bytes >= 0);

alter table public.contact_leads
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists resolved_at timestamptz,
  add column if not exists admin_notes text;

create or replace function public.approve_pending_order(p_order_id uuid, p_admin_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders;
  created_enrollment public.enrollments;
begin
  select * into current_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if current_order.status <> 'pending' then
    return jsonb_build_object('status', current_order.status, 'order_id', p_order_id);
  end if;

  update public.orders
  set status = 'paid', reviewed_at = now(), reviewed_by = p_admin_id, updated_at = now()
  where id = p_order_id;

  insert into public.enrollments (user_id, course_id, source, status)
  values (current_order.user_id, current_order.course_id, 'internal', 'in_progress')
  on conflict (user_id, course_id) do nothing;

  select * into created_enrollment
  from public.enrollments
  where user_id = current_order.user_id and course_id = current_order.course_id;

  insert into public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
  values ('enrollment', created_enrollment.id, 'enrollment.created', jsonb_build_object(
    'enrollmentId', created_enrollment.id,
    'orderId', p_order_id,
    'source', 'admin_approval',
    'approvedBy', p_admin_id
  ))
  on conflict (aggregate_type, aggregate_id, event_type) do nothing;

  return jsonb_build_object('status', 'approved', 'order_id', p_order_id, 'enrollment_id', created_enrollment.id);
end;
$$;

revoke all on function public.approve_pending_order(uuid, uuid) from public, anon, authenticated;
grant execute on function public.approve_pending_order(uuid, uuid) to service_role;

create index if not exists enrollments_admin_recent_idx
  on public.enrollments (enrolled_at desc, id);
create index if not exists certificates_admin_status_idx
  on public.certificates (status, created_at desc);
create index if not exists contact_leads_admin_queue_idx
  on public.contact_leads (status, assigned_to, created_at desc);
create index if not exists orders_admin_queue_idx
  on public.orders (status, reviewed_at, created_at desc);

-- Aggregates stay inside PostgreSQL, avoiding full collection hydration for
-- the dashboard. SECURITY INVOKER keeps the caller's RLS context.
create or replace function public.get_admin_summary()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  select jsonb_build_object(
    'courses', count(*)::integer,
    'activeCourses', count(*) filter (where is_active)::integer,
    'draftCourses', count(*) filter (where not is_active or content_status = 'fixture')::integer
  ) into result
  from public.courses;

  result := result || jsonb_build_object(
    'users', (select count(*)::integer from public.profiles),
    'admins', (select count(*)::integer from public.profiles where role = 'admin'),
    'enrollments', (select count(*)::integer from public.enrollments),
    'usersWithCourses', (select count(distinct user_id)::integer from public.enrollments),
    'sales', (select count(*)::integer from public.orders where status = 'paid'),
    'revenueCents', (select coalesce(sum(amount_cents), 0)::bigint from public.orders where status = 'paid'),
    'newLeads', (select count(*)::integer from public.contact_leads where status = 'new'),
    'pendingCertificates', (
      select count(*)::integer
      from public.enrollments as enrollment
      left join public.certificates as certificate on certificate.enrollment_id = enrollment.id
      where enrollment.status = 'completed'
        and coalesce(certificate.status, 'pending') = 'pending'
    )
  );

  return result;
end;
$$;

create or replace function public.get_admin_course_enrollment_counts(p_course_ids uuid[])
returns table(course_id uuid, enrollment_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select enrollment.course_id, count(*)
  from public.enrollments as enrollment
  where public.is_admin()
    and enrollment.course_id = any(p_course_ids)
  group by enrollment.course_id;
$$;
