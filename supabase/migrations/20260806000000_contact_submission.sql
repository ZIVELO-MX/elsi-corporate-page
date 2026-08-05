create or replace function public.submit_contact_lead(
  p_full_name text,
  p_email text,
  p_message text,
  p_phone text default null,
  p_company text default null,
  p_source text default 'contact',
  p_turnstile_verified boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead_id uuid;
begin
  insert into public.contact_leads (
    full_name,
    email,
    phone,
    company,
    message,
    source,
    turnstile_verified
  )
  values (
    p_full_name,
    p_email,
    p_phone,
    p_company,
    p_message,
    p_source,
    p_turnstile_verified
  )
  returning id into v_lead_id;

  insert into public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
  values (
    'contact_lead',
    v_lead_id,
    'lead.created',
    jsonb_build_object('leadId', v_lead_id)
  );

  return v_lead_id;
end;
$$;

revoke all on function public.submit_contact_lead(text, text, text, text, text, text, boolean) from public;
grant execute on function public.submit_contact_lead(text, text, text, text, text, text, boolean) to anon, authenticated;
