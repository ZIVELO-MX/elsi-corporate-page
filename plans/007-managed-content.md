# ELS-0040 — Contenido administrable

Estado: `implemented — UI wiring and approved content pending`  
Prioridad: P1  
Rama: `feat/els-0040-managed-content`  
Misiones relacionadas: ELS-0053, ELS-0034  
Predecesora: ELS-0041

## Resultado

Admin edita, ordena y activa secciones corporativas, soluciones y testimonios; las páginas públicas sólo muestran contenido activo y aprobado. Pagos y ventas no forman parte de esta rama.

## Estado actual

- `lib/solutions.ts`, `lib/about.ts` y `lib/admin-data.tsx` contienen la fuente de prototipo.
- `app/admin/contenido/page.tsx` y `app/admin/testimonios/page.tsx` ya definen la experiencia esperada.
- Home, Nosotros y Soluciones necesitan una fuente persistente con fallback deliberado.

## Pasos

1. [x] Crear repositorios tipados para `page_sections`, `solutions` y `testimonials`.
2. [x] Exponer mutaciones admin server-side protegidas por `profiles.role=admin`.
3. [x] Validar claves, longitud, orden y eliminar HTML no confiable de campos textuales.
4. [x] Consultas públicas filtran contenido activo/verificado; fixtures no se publican fuera del prototipo.
5. [ ] Revalidar Home, Nosotros, Soluciones, sitemap y metadatos afectados al conectar UI.
6. [ ] Conectar formularios existentes, optimistic UI y conflictos recuperables.
7. [ ] Migrar sólo contenido aprobado; no se inventan testimonios ni atribuciones.

## Validación automatizada

- [x] Tests de permisos, validación, orden y mutaciones (contrato estático).
- [x] Tests públicos excluyen contenido inactivo/no verificado.
- [x] `pnpm typecheck`, `pnpm test` (94/94) y `pnpm lint` sin errores.
- [ ] Build final tras conectar UI.

## Validación manual y capturas finales

- [ ] Editar, reordenar, activar y desactivar cada tipo desde Admin.
- [ ] Verificar Home, Nosotros y Soluciones en desktop/mobile.
- [ ] Capturas `public` y `admin` sin testimonios no autorizados.

## Pendiente del propietario

- [ ] Aprobar copy, soluciones y testimonios que pueden publicarse.
- [ ] Proveer atribuciones/consentimientos de testimonios e imágenes finales.

## Terminado cuando

El contenido publicado tiene una sola fuente persistente, responde a toggles/orden y no incluye ningún dato no aprobado.

## Evidencia de implementación

- PR #63: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/63
- Repositorio: `lib/content-repository.ts`.
- APIs: `/api/admin/content`, `/api/admin/content/[id]`, `/api/admin/testimonials`.
- Pendiente: conectar Admin/Home/Nosotros/Soluciones, revalidación y aprobaciones/consentimientos del propietario.
