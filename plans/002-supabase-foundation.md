# ELS-0036 — Fundación Supabase

Estado: `implemented — local container validation pending`  
Prioridad: P0  
Rama: `feat/els-0036-supabase-foundation`  
Misiones relacionadas: ELS-0051, ELS-0034  
Predecesora: ELS-0070

## Resultado

La aplicación dispone de clientes Supabase tipados para servidor y navegador, migraciones versionadas, RLS explícita, datos semilla no sensibles y un modo seguro que no rompe el prototipo cuando faltan credenciales.

## Estado actual

- `lib/admin-data.tsx`, `lib/courses.ts` y otros módulos contienen datos/estado de prototipo en memoria o fixtures.
- La fundación vive en `supabase/` y `lib/supabase/`; los adaptadores de dominio siguen en las misiones de cursos/contenido.
- `.env.example` y `.dev.vars.example` documentan las tres variables, separando la clave service-role de los valores públicos.

## Modelo inicial

- Identidad: `profiles`, roles `student|admin` vinculados a `auth.users`.
- Catálogo: `courses` y campos públicos/operativos canónicos de ELS-0051.
- Operación: `enrollments`, `certificates`, `contact_leads`, `outbox_events`.
- Contenido: `page_sections`, `solutions`, `solution_items`, `testimonials`.
- Pagos se reservan para migraciones de ELS-0048/49; no se crea lógica Stripe aquí.

## Pasos

1. [x] Sincronizar esta rama con la entrega ELS-0070 ya integrada (base del PR #58 apilada sobre su rama).
2. [x] Añadir SDK Supabase SSR, clientes browser/server/admin y validación central de entorno.
3. [x] Crear configuración local, migraciones, enums, claves únicas, índices y timestamps.
4. [x] Aplicar RLS deny-by-default: público sólo lee contenido activo; alumnos sólo sus filas; admin por rol verificado.
5. [x] Crear trigger de perfil para usuarios nuevos sin confiar en metadatos de rol del cliente.
6. [x] Añadir seed mínimo marcado como fixture y contrato reproducible de tipos TypeScript.
7. [x] Dejar clientes seguros cuando faltan credenciales; los adaptadores de lectura de dominio quedan para ELS-0051/0040.
8. [x] Documentar migración, reset local, rollback y promoción al entorno alojado.

## Validación automatizada

- [ ] Migraciones aplican desde cero y son idempotentes en el flujo soportado (bloqueado localmente porque el puerto 54322 ya lo usa otro proyecto Supabase).
- [ ] Tests SQL validan acceso anónimo, alumno, otro alumno y admin.
- [x] `pnpm lint` (0 errores; 3 warnings preexistentes)
- [x] `pnpm typecheck`
- [x] `pnpm test` (85/85)
- [x] `pnpm build`
- [x] Ningún secreto server-side aparece en el bundle cliente (contrato estático y separación de módulos).

## Validación manual

- [ ] Crear proyecto local, aplicar seed y consultar sólo filas permitidas por cada rol (requiere liberar/configurar puertos locales).
- [x] Confirmar que el sitio sigue mostrando fixtures con Supabase ausente mediante build/tests sin variables.
- [ ] Revisar tablas, índices, constraints y políticas desde Supabase Studio.

## Pendiente del propietario

- [ ] Crear/proveer el proyecto Supabase alojado.
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` a secretos administrados; conservar `anon`/`service_role` sólo como fallback legacy.
- [ ] Confirmar región, política de backups y responsables de acceso.

## Terminado cuando

Un entorno local limpio se levanta sólo con migraciones/seed, RLS impide escalamiento horizontal/vertical y las credenciales alojadas siguen pendientes sin bloquear CI.

## Evidencia de implementación

- PR #58: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/58
- Commit de implementación: `c7d7d24`.
- Dependencias fijadas: `@supabase/ssr@0.12.3`, `@supabase/supabase-js@2.110.8`.
- Migración inicial: `supabase/migrations/20260731000000_initial_schema.sql`.
- Validación: 85/85 tests, typecheck, lint, build Next y build OpenNext Cloudflare exitosos.
- Pendientes manuales/propietario: proyecto alojado, credenciales, OAuth Google, revisión de RLS en Studio y validación SQL por roles.
