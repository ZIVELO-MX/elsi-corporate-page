# ELS-0029 — Integración de contenido provisional

## Resultado

Las superficies de cursos y checkout conservan una experiencia completa aun
cuando ELSI todavía no ha entregado el contenido final. Los datos actuales se
identifican como demostrativos y ningún recurso ausente se presenta como una
imagen terminada o rota.

## Contratos preparados

### Imágenes de cursos

- `getCourseImage(slug, title)` devuelve un estado discriminado `available` o
  `pending`.
- Los recursos disponibles declaran `source: fixture | client`; los actuales
  permanecen identificados como fixtures.
- `CourseMedia` comparte el mismo tratamiento en Home, catálogo y detalle.
- Una ruta ausente o un error de carga muestran el placeholder accesible
  `Imagen pendiente`.
- Los assets finales se incorporan agregando su `src` y `alt` al registro
  `courseImages`; las páginas consumidoras no requieren cambios.

### Checkout

- `/checkout` muestra un estado vacío recuperable cuando no recibe un curso.
- `/checkout?curso=<slug>` resuelve el fixture mediante
  `getCheckoutCourseBySlug`.
- `CheckoutCourse.contentStatus` identifica que el contenido actual es un
  fixture.
- El flujo mantiene estados de carga, proveedor listo, procesamiento,
  pendiente, éxito, rechazo y proveedor no disponible.
- La futura integración puede reemplazar el resolver y el gateway sin cambiar
  la composición ni los estados de experiencia.

## Sustitución cuando ELSI entregue contenido

1. Reemplazar fichas de ejemplo en `data/courses.json` por datos aprobados.
2. Agregar imágenes optimizadas y sus textos alternativos a
   `lib/image-assets.ts`.
3. Sustituir `getCheckoutCourseBySlug` por la consulta de catálogo o sesión.
4. Mantener los estados vacío, carga, error y éxito como parte del contrato.
5. Desactivar el modo prototipo sólo después de validar contenido, precios,
   fechas, contacto y operación real.

## Verificación local

- `pnpm test`: 35/35 pruebas.
- `pnpm lint`: sin errores.
- `pnpm build`: 36 páginas generadas.
- Playwright checkout: 3/3 flujos.
- Auditoría responsive: 4 rutas × 4 anchos, 16/16 sin overflow horizontal.
- Revisión visual: catálogo y checkout a 1440 px; detalle y checkout vacío a
  390 px.
