do $$ begin
  create type public.stripe_event_status as enum ('pending', 'processed', 'failed');
exception when duplicate_object then null;
end $$;

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  status public.stripe_event_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists stripe_events_status_idx
  on public.stripe_events (status, created_at desc);

drop trigger if exists set_updated_at on public.stripe_events;
create trigger set_updated_at before update on public.stripe_events
  for each row execute function public.set_updated_at();

alter table public.stripe_events enable row level security;

create or replace function public.fulfill_stripe_order(
  p_order_id uuid,
  p_event_id text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders;
  created_enrollment public.enrollments;
begin
  select * into current_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then raise exception 'order_not_found'; end if;

  if current_order.status = 'paid' then
    update public.stripe_events
    set status = 'processed', processed_at = now(), updated_at = now()
    where event_id = p_event_id;
    return jsonb_build_object('status', 'already_paid', 'order_id', p_order_id);
  end if;

  update public.orders
  set status = 'paid', updated_at = now()
  where id = p_order_id;

  insert into public.enrollments (user_id, course_id, source, status)
  values (current_order.user_id, current_order.course_id, 'stripe', 'in_progress')
  on conflict (user_id, course_id) do nothing;

  select * into created_enrollment
  from public.enrollments
  where user_id = current_order.user_id
    and course_id = current_order.course_id;

  insert into public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
  values (
    'enrollment',
    created_enrollment.id,
    'enrollment.created',
    jsonb_build_object('enrollmentId', created_enrollment.id, 'orderId', p_order_id, 'eventId', p_event_id)
  )
  on conflict (aggregate_type, aggregate_id, event_type) do nothing;

  update public.stripe_events
  set status = 'processed', processed_at = now(), updated_at = now()
  where event_id = p_event_id;

  return jsonb_build_object('status', 'fulfilled', 'order_id', p_order_id);
exception when others then
  update public.stripe_events
  set status = 'failed', error_message = sqlerrm, updated_at = now()
  where event_id = p_event_id;
  raise;
end;
$$;

revoke all on function public.fulfill_stripe_order(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.fulfill_stripe_order(uuid, text, jsonb) to service_role;
