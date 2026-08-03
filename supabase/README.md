# Supabase local

La migración inicial define identidad, catálogo, operación, contenido y
outbox. No crea órdenes ni integra Stripe; esas tablas pertenecen a ELS-0048 y
ELS-0049.

## Requisitos

Instala la Supabase CLI siguiendo su documentación oficial. No guardes el
`service_role` en Git ni en variables `NEXT_PUBLIC_*`.

```bash
supabase start
supabase db reset
supabase gen types typescript --local > lib/supabase/types.ts
```

## Smoke test de RLS

Con Supabase local iniciado, exporta las claves que muestra `supabase status`
(`SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`) y ejecuta:

```bash
pnpm smoke:supabase-rls
```

El script rechaza URLs remotas, crea tres usuarios temporales, valida acceso
anónimo/alumno/admin y escrituras protegidas, y elimina los datos al terminar.
No lo ejecutes contra un proyecto alojado.

Para detener el entorno local usa `supabase stop`. La migración se aplica en
orden desde `supabase/migrations/`; `supabase/seed.sql` contiene únicamente
fixtures sin PII.

## Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-local>
SUPABASE_SERVICE_ROLE_KEY=<service-role-local>
```

En el entorno alojado, aplica migraciones con un pipeline aprobado, revisa RLS
en Studio y configura backups antes de ejecutar cualquier seed.
