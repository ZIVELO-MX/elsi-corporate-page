do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'failed', 'canceled');
exception when duplicate_object then null;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  course_title text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'MXN' check (currency = 'MXN'),
  status public.order_status not null default 'pending',
  idempotency_key text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  livemode boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists orders_select_owner_or_admin on public.orders;
create policy orders_select_owner_or_admin on public.orders
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_insert_owner on public.orders;
create policy orders_insert_owner on public.orders
for insert with check (user_id = auth.uid());

drop policy if exists orders_admin_write on public.orders;
create policy orders_admin_write on public.orders
for update using (public.is_admin()) with check (public.is_admin());
