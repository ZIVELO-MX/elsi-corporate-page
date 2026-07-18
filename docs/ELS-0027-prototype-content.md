# ELS-0027 · Prototipo y contenido público

## Resultado

La experiencia pública usa una sola banda global de prototipo, elimina señales de confianza simuladas y conserva únicamente imágenes locales de ELSI. El modo se controla con `NEXT_PUBLIC_PROTOTYPE_MODE=1|0`; las etiquetas internas permanecen separadas mediante `NEXT_PUBLIC_SECTION_LABELS`.

## Revisión Apple + Emil

| Before | After | Why |
| --- | --- | --- |
| Aviso de prototipo mezclado con el crédito del footer | Banda global compacta, configurable y ausente en `/admin` | El estado se comunica una vez, antes del contenido, sin competir con la navegación |
| Avatares remotos, logos nominales, métricas y testimonios de muestra | Secciones retiradas hasta contar con procedencia verificable | La confianza depende de evidencia y no de decoración |
| Lorem ipsum en cada detalle de solución | Texto específico por solución con enfoque y alcance | El contenido explica el servicio y evita aparentar una versión terminada |
| Notas `Validar…` y lista de investigación visibles en Nosotros | Narrativa pública breve sin instrucciones internas | Progressive disclosure separa el trabajo editorial de la lectura pública |
| Fallback vacío ante un error de imagen | Estado visible y accesible `Imagen no disponible` | El fallo no se oculta ni se confunde con una superficie decorativa |
| Alias heredados sin una experiencia canónica | Redirects explícitos hacia catálogo, cuenta y checkout no disponible | Una ruta por intención mejora predictibilidad y mantenimiento |

## Recursos locales reutilizados

Los diez WebP proceden del inventario existente y de `scripts/image-config.json`. No se generaron ni descargaron imágenes nuevas.

| Uso | Archivos |
| --- | --- |
| Historia | `story.webp` |
| Catálogo | `course-1.webp` a `course-6.webp` |
| Soluciones | `solucion-capacitacion.webp`, `solucion-ambientales.webp`, `solucion-educacion.webp` |

Los archivos fuente de `raw_images/` permanecen ignorados. Sólo los derivados WebP utilizados por la aplicación se versionan en `public/images/`.

## Mapa de rutas

| Alias | Canónica | Comportamiento |
| --- | --- | --- |
| `/shop`, `/tienda` | `/cursos` | Redirect permanente |
| `/checkout` | `/finalizar-compra` | Redirect permanente a un estado honesto y recuperable |
| `/account`, `/mi-cuenta` | `/profile` | Redirect permanente |
| `/login` | `/login` | Acceso canónico |

## Verificación

- `npm test`: 5/5 pruebas aprobadas.
- `npm run lint`: 0 errores; 3 warnings preexistentes.
- `npm run build -- --webpack`: compilación y 33 rutas generadas.
- Auditoría responsive: 7 rutas × 4 anchos, 28/28 sin overflow horizontal.
- Revisión visual de Home, Soluciones, Nosotros, Cursos y estado de compra a 390, 768, 1024 y 1440 px.
- `NEXT_PUBLIC_PROTOTYPE_MODE=0`: la Home se renderiza sin la banda global.
