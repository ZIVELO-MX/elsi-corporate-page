alter table public.audit_events
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.audit_events
  drop constraint if exists audit_events_metadata_object;

alter table public.audit_events
  add constraint audit_events_metadata_object
  check (jsonb_typeof(metadata) = 'object');

