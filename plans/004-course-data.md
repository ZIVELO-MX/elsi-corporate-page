# ELS-0037 — Cursos públicos y CRUD administrativo

Estado: `implemented — public wiring and hosted validation pending`  
Prioridad: P1  
Rama: `feat/els-0037-course-data`  
Misiones relacionadas: ELS-0044, ELS-0045, ELS-0034  
Predecesora: ELS-0035

## Resultado

El catálogo y detalle público leen cursos activos desde Supabase; Admin crea, edita, publica y desactiva cursos con validación server-side y revalidación de rutas.

## Estado actual

- `data/courses.json` y `lib/courses.ts` son la fuente pública.
- `app/admin/cursos/page.tsx` muta el store de `lib/admin-data.tsx`.
- Los campos y estados visuales ya están definidos y no deben rediseñarse.

## Pasos

1. [x] Definir repositorio tipado, mapeo de filas y validación server-side.
2. [x] Mantener fixtures sólo bajo modo prototipo; las rutas Supabase no hacen fallback silencioso ante errores.
3. [x] Implementar lecturas públicas Supabase que filtran `is_active` y `content_status=verified`.
4. [x] Implementar GET/POST/PATCH/soft-delete server-side con autorización admin por `profiles.role`.
5. [x] Validar slug único, precio en centavos, modalidad y campos básicos del curso.
6. [ ] Revalidar catálogo, detalle, sitemap y datos estructurados tras cada mutación (requiere conectar las páginas async).
7. [ ] Conectar estados de UI y conflictos al formulario existente.

## Validación automatizada

- [x] Repositorio y validadores cubren slug, precio, modalidad y contenido inválido.
- [x] Rutas públicas excluyen cursos inactivos/no verificados; admin puede consultarlos.
- [x] Mutaciones rechazan anónimo y alumno mediante comprobación de sesión/rol.
- [x] `pnpm typecheck`; tests específicos agregados.
- [ ] `pnpm lint && pnpm test && pnpm build` en esta rama.

## Validación manual y capturas finales

- [ ] Crear, editar, publicar y desactivar un curso; verificar Home, catálogo y detalle.
- [ ] Confirmar 404 para slug inexistente/inactivo.
- [ ] Capturas `public` y `admin` en desktop y mobile con datos no sensibles.

## Pendiente del propietario

- [ ] Aprobar el contenido/estado inicial que se migrará desde `data/courses.json`.
- [ ] Proveer acceso al proyecto Supabase alojado para aplicar migraciones.

## Terminado cuando

No hay doble fuente activa de verdad, el flujo admin persiste y la publicación pública queda coherente con sitemap/SEO.

## Evidencia de implementación

- PR #60: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/60
- Repositorio: `lib/courses-repository.ts`.
- API: `/api/admin/courses` y `/api/admin/courses/[id]`.
- Validación inicial: typecheck correcto; pruebas específicas pendientes de ejecutar junto al pipeline.
- Pendiente: cablear las páginas públicas/admin a las funciones async, revalidación y proyecto Supabase alojado.
