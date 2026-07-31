-- Fixture-only rows. They are visible to admins but remain hidden from the
-- public policies until editorial verification changes content_status.
insert into public.courses (slug, title, short_description, description, modality, price_cents, currency, content_status, is_active)
values ('fixture-fundamentos-ambientales', 'Fundamentos ambientales (fixture)', 'Curso de prueba para desarrollo local.', 'Contenido provisional no publicable.', 'online', 0, 'MXN', 'fixture', true)
on conflict (slug) do nothing;

insert into public.page_sections (section_key, title, body, is_active, sort_order)
values ('hero', 'Hero (fixture)', '{"eyebrow":"Fixture"}'::jsonb, true, 0)
on conflict (section_key) do nothing;

insert into public.solutions (slug, title, summary, body, content_status, is_active, sort_order)
values ('fixture-solucion', 'Solución (fixture)', 'Contenido provisional para desarrollo local.', '{}'::jsonb, 'fixture', true, 0)
on conflict (slug) do nothing;
