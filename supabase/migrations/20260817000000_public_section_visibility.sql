-- Visibility for provisional public sections. Defaults preserve the current
-- public site until an administrator explicitly hides a section.
insert into public.site_settings (key, value)
values (
  'public_sections',
  '{"about_enabled": true, "services_enabled": true}'::jsonb
)
on conflict (key) do nothing;

drop policy if exists site_settings_public_sections on public.site_settings;
create policy site_settings_public_sections on public.site_settings
for select using (key = 'public_sections');
