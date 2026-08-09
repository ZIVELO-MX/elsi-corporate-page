create or replace function public.change_admin_user_role(p_user_id uuid, p_role public.app_role)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.profiles;
  admin_count integer;
begin
  if not public.is_admin() then raise exception 'admin_required'; end if;
  perform pg_advisory_xact_lock(hashtext('change_admin_user_role'));
  select * into target from public.profiles where id = p_user_id for update;
  if not found then raise exception 'user_not_found'; end if;
  if target.role = p_role then return target; end if;
  if target.id = auth.uid() and p_role <> 'admin' then raise exception 'self_role_change'; end if;
  if target.role = 'admin' and p_role <> 'admin' then
    select count(*) into admin_count from public.profiles where role = 'admin';
    if admin_count <= 1 then raise exception 'last_admin'; end if;
  end if;
  update public.profiles set role = p_role, updated_at = now() where id = p_user_id returning * into target;
  return target;
end;
$$;

revoke all on function public.change_admin_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.change_admin_user_role(uuid, public.app_role) to authenticated;
