# ELS-0036 — Fundación Supabase

Estado: `planned`  
Prioridad: P0  
Rama: `feat/els-0036-supabase-foundation`  
Misiones relacionadas: ELS-0051, ELS-0034  
Predecesora: ELS-0070

## Resultado

La aplicación dispone de clientes Supabase tipados para servidor y navegador, migraciones versionadas, RLS explícita, datos semilla no sensibles y un modo seguro que no rompe el prototipo cuando faltan credenciales.

## Estado actual

- `lib/admin-data.tsx`, `lib/courses.ts` y otros módulos contienen datos/estado de prototipo en memoria o fixtures.
- No existe directorio `supabase/`, cliente SSR, tipos generados ni política de migraciones.
- `.env.example` sólo documenta flags públicos y el dominio del sitio.

## Modelo inicial

- Identidad: `profiles`, roles `student|admin` vinculados a `auth.users`.
- Catálogo: `courses` y campos públicos/operativos canónicos de ELS-0051.
- Operación: `enrollments`, `certificates`, `contact_leads`, `outbox_events`.
- Contenido: `page_sections`, `solutions`, `solution_items`, `testimonials`.
- Pagos se reservan para migraciones de ELS-0048/49; no se crea lógica Stripe aquí.

## Pasos

1. Sincronizar esta rama con la entrega ELS-0070 ya integrada.
2. Añadir SDK Supabase SSR, clientes browser/server/admin y validación central de entorno.
3. Crear configuración local, migraciones, enums, claves únicas, índices y timestamps.
4. Aplicar RLS deny-by-default: público sólo lee contenido activo; alumnos sólo sus filas; admin por rol verificado.
5. Crear trigger de perfil para usuarios nuevos sin confiar en metadatos de rol del cliente.
6. Añadir seed mínimo marcado como fixture y generación reproducible de tipos TypeScript.
7. Crear adaptadores de lectura con fallback explícito al prototipo cuando Supabase no esté configurado.
8. Documentar migración, reset local, rollback y promoción al entorno alojado.

## Validación automatizada

- [ ] Migraciones aplican desde cero y son idempotentes en el flujo soportado.
- [ ] Tests SQL validan acceso anónimo, alumno, otro alumno y admin.
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Ningún secreto server-side aparece en el bundle cliente.

## Validación manual

- [ ] Crear proyecto local, aplicar seed y consultar sólo filas permitidas por cada rol.
- [ ] Confirmar que el sitio sigue mostrando fixtures con Supabase ausente.
- [ ] Revisar tablas, índices, constraints y políticas desde Supabase Studio.

## Pendiente del propietario

- [ ] Crear/proveer el proyecto Supabase alojado.
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` a secretos administrados.
- [ ] Confirmar región, política de backups y responsables de acceso.

## Terminado cuando

Un entorno local limpio se levanta sólo con migraciones/seed, RLS impide escalamiento horizontal/vertical y las credenciales alojadas siguen pendientes sin bloquear CI.

