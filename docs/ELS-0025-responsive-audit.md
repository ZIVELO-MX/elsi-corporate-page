# ELS-0025 — Cierre responsive del prototipo

## Resultado

La revisión cubre 12 superficies públicas a 390, 768, 1024 y 1440 px. Las 48 combinaciones terminaron con `documentWidth === viewportWidth`, sin overflow horizontal global.

Rutas verificadas:

- `/`
- `/soluciones`
- `/soluciones/capacitacion`
- `/cursos`
- `/cursos/fundamentos-de-educacion-ambiental`
- `/nosotros`
- `/contacto`
- `/login`
- `/register`
- `/profile`
- `/profile/wireframes`
- `/aviso-de-privacidad`

## Revisión Apple + Emil

| Before | After | Why |
| --- | --- | --- |
| El detalle de curso medía 441 px dentro de un viewport de 390 px | Columnas con `minmax(0, …)`, hijos con `min-width: 0` y título con wrapping explícito | Conserva todo el contenido y la acción sin scroll lateral |
| El aviso legal anulaba el padding de `.shell` con un estilo inline | Espaciado de bloque separado en `.privacy-shell`; el padding lateral vuelve a pertenecer al contenedor | Mantiene lectura, jerarquía y adaptación mobile-first |
| Mobile mostraba primero el artboard desktop y después el mobile | A 800 px o menos se materializa sólo el artboard mobile | La referencia responde al contexto actual y reduce ruido |
| El footer apilaba logo y tres columnas completas | Logo y contacto ocupan el ancho; Instituto y Academia comparten una fila compacta | El chrome deja de dominar páginas cortas |
| Header translúcido sin alternativas de plataforma | Superficie sólida con reduced transparency y borde reforzado con increased contrast | Respeta preferencias sin perder wayfinding |
| La comprobación de overflow era manual y parcial | Auditoría reproducible por ruta y viewport mediante Chrome DevTools Protocol | Convierte un criterio visual crítico en evidencia repetible |

## Reproducción

Con el servidor local en `http://127.0.0.1:3011`:

```bash
npm run audit:responsive
```

Para generar capturas a un ancho concreto:

```bash
AUDIT_WIDTHS=390 \
AUDIT_ROUTES=/cursos/fundamentos-de-educacion-ambiental,/profile/wireframes,/aviso-de-privacidad \
AUDIT_SCREENSHOT_DIR=/tmp/elsi-0025 \
node scripts/audit-responsive.mjs
```

## Riesgos y pendientes

- Las fotografías optimizadas continúan fuera de Git por la política actual de `public/images/`; la estrategia de entrega de esos binarios pertenece al pendiente documentado en ELS-0024.
- La aprobación final del prototipo permanece a cargo del cliente.
- La auditoría automatizada detecta overflow global; carouseles y barras de navegación con scroll contenido se consideran regiones intencionales.

## Cierre de criterios pendientes — 2026-07-20

### Reflow y zoom al 200 %

El auditor acepta `AUDIT_ZOOM`. Un valor de `2` conserva los anchos físicos solicitados y reduce a la mitad el viewport CSS, equivalente al reflow que provoca el zoom de página al 200 %:

| Ancho solicitado | Viewport CSS al 200 % |
| ---: | ---: |
| 390 px | 195 px |
| 768 px | 384 px |
| 1024 px | 512 px |
| 1440 px | 720 px |

Las 12 superficies terminaron 48/48 sin overflow a escala normal y 48/48 sin overflow con `AUDIT_ZOOM=2`. El diagnóstico adicional enumera contenedores con scroll interno para distinguir reflow global de regiones contenidas.

```bash
AUDIT_ZOOM=2 npm run audit:responsive
```

Los ajustes de mínimo efectivo permiten wrapping de títulos, metadatos y CTAs, reducen el ancho intrínseco de cards y contienen el viewport del carrusel sin aplicar clipping global al documento.

### Reordenamiento mobile intencional

- Contacto conserva `contexto → formulario → canales`: el canal principal aparece después de la acción, no antes de ella.
- El detalle de curso conserva `resumen → solicitud de información → temario`: la siguiente acción ya no queda después de todos los módulos.
- En desktop las mismas piezas recuperan su composición de dos columnas mediante áreas de grid explícitas; no se mantiene un orden único basado sólo en apilar columnas.

### Formularios y estados

Home y Contacto comparten el mismo formulario accesible con labels persistentes, validación por campo, `aria-invalid`, mensajes asociados y foco en el primer control inválido. Registro adopta el mismo contrato para nombre, correo, teléfono y contraseña. La comprobación interactiva en Chrome confirmó:

- Contacto: tres errores asociados y foco en `name`.
- Registro: cuatro errores asociados y foco en `name`.
- `prefers-reduced-motion: reduce` y `prefers-contrast: more` activos sin pérdida de estado.

### Wayfinding

Header, navegación móvil y footer consumen una lista canónica en este orden: Inicio, Soluciones, Cursos, Nosotros y Contacto. La ruta activa usa `aria-current="page"`. Los detalles de Soluciones y Cursos exponen breadcrumbs mediante `nav`, lista ordenada y elemento actual semántico.

### Escala Sora / Manrope

| Rol | Familia | Tamaño | Peso | Tracking | Leading |
| --- | --- | --- | ---: | ---: | ---: |
| Display de sección | Sora | `clamp(1.75rem, 1.42rem + 1.1vw, 2.45rem)` | 700 | `-0.018em` | `1.14` |
| Título de componente | Sora | `1.25rem` | 600–700 | específico del componente | `1.25` |
| Cuerpo | Manrope | `1rem` | 400–600 | normal | `1.65` |
| Metadata / kicker | Manrope | `0.75rem` | 800 | `0.08em` | `1.4` |

Los roles viven como tokens `--type-*` en `app/globals.css`; Sora y Manrope habilitan `font-optical-sizing`. Los mínimos usan `rem`/`em`, wrapping deliberado y áreas fluidas para conservar la jerarquía con cadenas largas y zoom.

### Contenido provisional

Los diez recursos curados son locales, versionados y tienen texto alternativo. No quedan placeholders visuales presentados como evidencia; si un recurso falla, `SafeImage` comunica de forma accesible “Imagen no disponible”. El aviso centralizado identifica el prototipo y las operaciones desactivadas.

### Pendiente externo

La aprobación final del prototipo continúa siendo una decisión del cliente; no afecta la evidencia técnica de los 20 criterios verificables de esta misión.
