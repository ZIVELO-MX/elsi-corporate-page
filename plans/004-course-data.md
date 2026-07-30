# ELS-0037 — Cursos públicos y CRUD administrativo

Estado: `planned`  
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

1. Definir repositorio tipado de cursos y mapeo entre filas, modelo público y formulario admin.
2. Mantener fixtures sólo bajo modo prototipo; Supabase configurado no hace fallback silencioso ante errores.
3. Implementar lecturas públicas de lista/slug mostrando exclusivamente cursos activos.
4. Implementar create/update/toggle como mutaciones server-side autorizadas para admin.
5. Validar slug único, precio en centavos, modalidad y campos presenciales/en línea.
6. Revalidar catálogo, detalle, sitemap y datos estructurados tras cada mutación.
7. Incorporar estados loading/empty/error y conflictos de edición recuperables.

## Validación automatizada

- [ ] Repositorio y validadores cubren slug, precio, modalidad y contenido inválido.
- [ ] Rutas públicas excluyen cursos inactivos; admin puede consultarlos.
- [ ] Mutaciones rechazan anónimo y alumno.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

## Validación manual y capturas finales

- [ ] Crear, editar, publicar y desactivar un curso; verificar Home, catálogo y detalle.
- [ ] Confirmar 404 para slug inexistente/inactivo.
- [ ] Capturas `public` y `admin` en desktop y mobile con datos no sensibles.

## Pendiente del propietario

- [ ] Aprobar el contenido/estado inicial que se migrará desde `data/courses.json`.
- [ ] Proveer acceso al proyecto Supabase alojado para aplicar migraciones.

## Terminado cuando

No hay doble fuente activa de verdad, el flujo admin persiste y la publicación pública queda coherente con sitemap/SEO.

