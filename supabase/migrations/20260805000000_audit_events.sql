create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('insert', 'update', 'delete')),
  resource_type text not null check (resource_type ~ '^[a-z_]+$'),
  resource_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_resource_idx on public.audit_events (resource_type, resource_id, created_at desc);
create index if not exists audit_events_actor_idx on public.audit_events (actor_id, created_at desc);

alter table public.audit_events enable row level security;
drop policy if exists audit_events_admin_select on public.audit_events;
create policy audit_events_admin_select on public.audit_events for select using (public.is_admin());

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  resource uuid;
begin
  if actor is null then
    return coalesce(new, old);
  end if;
  resource := nullif(coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id'), '')::uuid;
  insert into public.audit_events (actor_id, action, resource_type, resource_id)
    values (actor, lower(tg_op), tg_table_name, resource);
  return coalesce(new, old);
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['courses','enrollments','certificates','page_sections','solutions','testimonials','contact_leads','orders'] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('drop trigger if exists audit_row_change on public.%I', table_name);
      execute format('create trigger audit_row_change after insert or update or delete on public.%I for each row execute function public.audit_row_change()', table_name);
    end if;
  end loop;
end $$;
