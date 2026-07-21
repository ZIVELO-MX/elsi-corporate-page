# ELS-0032 — Inventario de animaciones del panel administrativo

Auditoría de cada animación del panel bajo el criterio Apple/Emil: frecuencia,
propósito, propiedad animada, tiempo, curva y condición de salida. Sirve para
justificar que cada movimiento existe por una razón y respeta los rangos definidos.

Tokens de movimiento: `--motion-fast 160ms`, `--motion-med 240ms`,
`--ease-out cubic-bezier(0.23, 1, 0.32, 1)`.

## Regla previa (Apple §1 / Emil "¿debería animar?")

El panel es una herramienta densa de uso frecuente. Se mantiene el movimiento
**sutil y con propósito**: feedback de entrada, cambio de estado y continuidad
espacial. No se anima ninguna acción de teclado ni se agregan springs/gestos donde
no aportan (§16 Simplicity). El feedback de presión vive en `pointer-down`
(`:active`), no en la liberación (§1 Response).

## Inventario

| # | Elemento | Disparador | Frecuencia | Propósito | Propiedad | Tiempo | Curva | Salida |
|---|----------|-----------|-----------|-----------|-----------|--------|-------|--------|
| 1 | `button/a/input/textarea` (global) | hover/focus | alta | feedback de estado | bg, border, color, opacity, box-shadow, transform | 160ms | ease | revierte al salir |
| 2 | `.admin-kpi-tile` | hover | media | afordancia de enlace | border-color, box-shadow, transform | 160ms | `--ease-out` | revierte al salir; gateado `@media (hover)` |
| 3 | `.admin-kpi-tile` / `.admin-user-row-btn` | `:active` (press) | media | feedback táctil | transform `scale(.98)` | 160ms | `--ease-out` | revierte al soltar |
| 4 | `.admin-nav-link` | hover | media | afordancia de navegación | background-color, color, icon opacity | 160ms | `--ease-out` | revierte al salir; gateado `@media (hover)` |
| 5 | `.admin-select` | focus | media | consistencia con inputs | border-color, box-shadow | 160ms | `--ease-out` | revierte al desenfocar |
| 6 | `.admin-sidebar` (drawer móvil) | tap hamburguesa / Escape / cambio de ruta | baja (móvil) | continuidad espacial | transform `translateX` | 240ms | ease | **misma trayectoria** (entra y sale por la izquierda) |
| 7 | `.admin-sidebar-backdrop` | apertura del drawer | baja (móvil) | atenuar para enfocar (§12) | opacity | 240ms | ease | se desvanece con el drawer |
| 8 | `.admin-toast` (entrada) | acción con toast | baja | aparición | translateY + scale + opacity | 240ms | `--ease-out` | — |
| 9 | `.admin-toast` (salida) | auto/cierre | baja | desaparición | translateY + scale + opacity | 160ms | `--ease-out` | **misma trayectoria, más rápida que la entrada** |
| 10 | `.admin-skeleton` | carga inicial (~650ms) | baja | indicar carga | background-position (shimmer) | 1.4s | ease | se elimina al cargar; sin layout shift (mimetiza dimensiones) |
| 11 | toggle de contenido (switch) | click | baja | cambio de estado | background + knob transform | 160ms | `--ease-out` | revierte al alternar |
| 12 | sección de contenido | activar/desactivar | baja | cambio de estado | opacity | 160ms | `--ease-out` | revierte al alternar |
| 13 | Radix `Dialog` (modal) | abrir/cerrar | baja | foco de tarea | opacity + scale (centrado) | ~200ms | ease-out (tw-animate-css) | atrapa foco; cierra con Escape |

## Cumplimiento de los criterios

- **Rangos de tiempo (§4 / Emil):** press 160 ✓ (100–160), select 160 ✓ (150–240),
  drawer/modal 200–240 ✓ (200–300), toast entra 240 / sale 160 ✓ (salida más rápida).
- **Sin `ease-in`, sin `transition: all`, sin `scale(0)`, sin hover no gateado, sin
  animación en teclado** en el panel. ✓
- **Continuidad espacial (§7):** drawer y toast entran y salen por la **misma
  trayectoria**; los popovers son nativos (select) y los modales permanecen centrados.
- **Preferencias de sistema (§14):** `prefers-reduced-motion` desactiva shimmer y
  animaciones de toast/diálogo; `prefers-reduced-transparency` solidifica el scrim;
  `prefers-contrast: more` refuerza tokens de borde/texto y añade contorno al ítem activo.
- **Suavidad por frame (§11):** solo se animan `transform`/`opacity` (compositor) más
  color/box-shadow puntuales; sin propiedades de layout.

## No aplicable (deliberado)

Springs, velocity handoff, momentum projection, rubber-banding e interruptibilidad
de gestos (§3–§9) **no** se implementan: el panel no tiene interacciones arrastrables
ni contenido reposicionable por gesto. Añadirlos sería movimiento sin propósito para
esta superficie (§16 Simplicity, Emil "¿debería animar?").
