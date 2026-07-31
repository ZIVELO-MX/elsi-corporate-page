create extension if not exists pgcrypto;

do $$ begin create type public.app_role as enum ('student', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.certificate_status as enum ('pending', 'available'); exception when duplicate_object then null; end $$;
do $$ begin create type public.content_status as enum ('fixture', 'verified'); exception when duplicate_object then null; end $$;
do $$ begin create type public.course_modality as enum ('online', 'in_person'); exception when duplicate_object then null; end $$;
do $$ begin create type public.enrollment_source as enum ('internal', 'external', 'stripe'); exception when duplicate_object then null; end $$;
do $$ begin create type public.enrollment_status as enum ('in_progress', 'completed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.lead_status as enum ('new', 'contacted', 'closed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.outbox_status as enum ('pending', 'processing', 'processed', 'failed'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 160),
  short_description text not null check (char_length(short_description) between 2 and 500),
  description text,
  duration_hours numeric(6,2) check (duration_hours is null or duration_hours > 0),
  audience text,
  syllabus jsonb not null default '[]'::jsonb,
  modality public.course_modality not null default 'online',
  location text,
  starts_at timestamptz,
  enrollment_link text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'MXN' check (currency = upper(currency) and char_length(currency) = 3),
  content_status public.content_status not null default 'fixture',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  source public.enrollment_source not null default 'internal',
  status public.enrollment_status not null default 'in_progress',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id),
  check ((status = 'completed' and completed_at is not null) or status = 'in_progress')
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments(id) on delete cascade,
  status public.certificate_status not null default 'pending',
  storage_path text,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique check (section_key ~ '^[a-z0-9_:-]+$'),
  title text not null,
  body jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.solutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  body jsonb not null default '{}'::jsonb,
  content_status public.content_status not null default 'fixture',
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.solution_items (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid not null references public.solutions(id) on delete cascade,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (solution_id, sort_order)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null,
  author_role text,
  image_path text,
  consent_reference text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null check (char_length(email) <= 320),
  phone text,
  company text,
  message text not null check (char_length(message) between 2 and 5000),
  source text not null default 'contact_form',
  status public.lead_status not null default 'new',
  turnstile_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_status not null default 'pending',
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (aggregate_type, aggregate_id, event_type)
);

create index if not exists courses_public_idx on public.courses (is_active, content_status, sort_order);
create index if not exists enrollments_user_idx on public.enrollments (user_id, status);
create index if not exists enrollments_course_idx on public.enrollments (course_id, status);
create index if not exists solution_items_solution_idx on public.solution_items (solution_id, sort_order);
create index if not exists leads_status_idx on public.contact_leads (status, created_at desc);
create index if not exists outbox_pending_idx on public.outbox_events (status, available_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','courses','enrollments','certificates','page_sections','solutions','solution_items','testimonials','contact_leads','outbox_events'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.certificates enable row level security;
alter table public.page_sections enable row level security;
alter table public.solutions enable row level security;
alter table public.solution_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_leads enable row level security;
alter table public.outbox_events enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists courses_select_published on public.courses;
create policy courses_select_published on public.courses for select using ((is_active and content_status = 'verified') or public.is_admin());
drop policy if exists courses_admin_write on public.courses;
create policy courses_admin_write on public.courses for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists enrollments_select_owner_or_admin on public.enrollments;
create policy enrollments_select_owner_or_admin on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists enrollments_admin_write on public.enrollments;
create policy enrollments_admin_write on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists certificates_select_owner_or_admin on public.certificates;
create policy certificates_select_owner_or_admin on public.certificates for select using (exists (select 1 from public.enrollments e where e.id = enrollment_id and (e.user_id = auth.uid() or public.is_admin())));
drop policy if exists certificates_admin_write on public.certificates;
create policy certificates_admin_write on public.certificates for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists page_sections_select_published on public.page_sections;
create policy page_sections_select_published on public.page_sections for select using (is_active or public.is_admin());
drop policy if exists page_sections_admin_write on public.page_sections;
create policy page_sections_admin_write on public.page_sections for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists solutions_select_published on public.solutions;
create policy solutions_select_published on public.solutions for select using ((is_active and content_status = 'verified') or public.is_admin());
drop policy if exists solutions_admin_write on public.solutions;
create policy solutions_admin_write on public.solutions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists solution_items_select_published on public.solution_items;
create policy solution_items_select_published on public.solution_items for select using (exists (select 1 from public.solutions s where s.id = solution_id and s.is_active and s.content_status = 'verified'));
drop policy if exists solution_items_admin_write on public.solution_items;
create policy solution_items_admin_write on public.solution_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists testimonials_select_published on public.testimonials;
create policy testimonials_select_published on public.testimonials for select using (is_active or public.is_admin());
drop policy if exists testimonials_admin_write on public.testimonials;
create policy testimonials_admin_write on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists contact_leads_admin_only on public.contact_leads;
create policy contact_leads_admin_only on public.contact_leads for all using (public.is_admin()) with check (public.is_admin());

-- No client policy is intentional: trusted server jobs use service role.
