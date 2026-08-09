-- ELS-0072: a testimonial may reference a course, but remains valid without
-- one. The FK prevents stale admin selections from becoming public metadata.
alter table public.testimonials
  add column if not exists course_id uuid references public.courses(id) on delete set null;

create index if not exists testimonials_course_idx
  on public.testimonials (course_id, sort_order);

-- Existing provisional quotes without proof stay stored but cannot remain
-- public. The database then enforces the same rule as the admin API.
update public.testimonials
set is_active = false
where is_active and nullif(btrim(consent_reference), '') is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'testimonials_active_consent_check'
      and conrelid = 'public.testimonials'::regclass
  ) then
    alter table public.testimonials
      add constraint testimonials_active_consent_check
      check (not is_active or nullif(btrim(consent_reference), '') is not null);
  end if;
end $$;
