create or replace function public.approve_pending_order(
  p_order_id uuid,
  p_admin_id uuid
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
  if current_order.status <> 'pending' then
    return jsonb_build_object('status', current_order.status, 'order_id', p_order_id);
  end if;

  update public.orders
  set status = 'paid', updated_at = now()
  where id = p_order_id;

  insert into public.enrollments (user_id, course_id, source, status)
  values (current_order.user_id, current_order.course_id, 'internal', 'in_progress')
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
    jsonb_build_object(
      'enrollmentId', created_enrollment.id,
      'orderId', p_order_id,
      'source', 'admin_approval',
      'approvedBy', p_admin_id
    )
  )
  on conflict (aggregate_type, aggregate_id, event_type) do nothing;

  return jsonb_build_object('status', 'approved', 'order_id', p_order_id, 'enrollment_id', created_enrollment.id);
end;
$$;

revoke all on function public.approve_pending_order(uuid, uuid) from public, anon, authenticated;
grant execute on function public.approve_pending_order(uuid, uuid) to service_role;
