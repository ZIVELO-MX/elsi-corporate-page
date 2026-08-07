create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values ('payments', '{"card_enabled": false}'::jsonb)
on conflict (key) do nothing;

drop trigger if exists set_updated_at on public.site_settings;
create trigger set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_payments on public.site_settings;
create policy site_settings_public_payments on public.site_settings
for select using (key = 'payments');

drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
for all using (public.is_admin()) with check (public.is_admin());
