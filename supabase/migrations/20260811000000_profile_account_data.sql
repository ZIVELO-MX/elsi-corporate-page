alter table public.profiles
  add column if not exists phone text;

update public.profiles as profiles
set phone = users.raw_user_meta_data ->> 'phone'
from auth.users as users
where profiles.id = users.id
  and profiles.phone is null
  and nullif(users.raw_user_meta_data ->> 'phone', '') is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());
