# ELS-0040 — Contenido administrable

Estado: `planned`  
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

1. Crear repositorios tipados para `page_sections`, `solutions`, `solution_items` y `testimonials`.
2. Conectar formularios admin a mutaciones server-side protegidas.
3. Validar claves, estructura, longitud, URLs y orden; impedir HTML no confiable.
4. Publicar sólo registros activos/verificados y mantener fixture bajo modo prototipo.
5. Revalidar Home, Nosotros, Soluciones, sitemap y metadatos afectados.
6. Implementar orden estable, optimistic UI recuperable y manejo de conflictos.
7. Migrar únicamente contenido aprobado; no inventar testimonios ni atribuciones.

## Validación automatizada

- [ ] Tests de permisos, validación, orden, toggle y revalidación.
- [ ] Tests públicos excluyen contenido inactivo/no verificado.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

## Validación manual y capturas finales

- [ ] Editar, reordenar, activar y desactivar cada tipo desde Admin.
- [ ] Verificar Home, Nosotros y Soluciones en desktop/mobile.
- [ ] Capturas `public` y `admin` sin testimonios no autorizados.

## Pendiente del propietario

- [ ] Aprobar copy, soluciones y testimonios que pueden publicarse.
- [ ] Proveer atribuciones/consentimientos de testimonios e imágenes finales.

## Terminado cuando

El contenido publicado tiene una sola fuente persistente, responde a toggles/orden y no incluye ningún dato no aprobado.

