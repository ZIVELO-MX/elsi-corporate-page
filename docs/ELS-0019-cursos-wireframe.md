# ELS-0019 — Wireframe de la experiencia pública de cursos

Wireframes de referencia de **catálogo** y **detalle** de curso, escritorio y móvil,
sobre el modelo canónico (ELS-0013). Ruta demostrativa: **`/cursos/wireframes`**
(no conecta backend, pagos ni correo; no toca las páginas live `/cursos`).

## 1. Inventario de datos (confirmado / mock / faltante)

- **✅ Confirmado (ELS-0013 + curso real DC-3):** título, categoría, sinopsis,
  modalidad, `durationType` (tiempo/módulos), horario (`date`/`time`, también en
  online en vivo), precio `{amount, currency:MXN, label}`, temario, `targetAudience[]`,
  instructor `{name, bio}`, `certificateType` (p.ej. DC-3), inscripción con QR,
  estados de inscripción No pagado/Pagado, liga solo por correo.
- **🟡 Mock:** los cursos compactos del catálogo, imágenes (placeholders de gradiente),
  contadores. Se reemplazan con datos reales + backend (ELS-0037).
- **🔵 Faltante / a definir con backend:** fuente del avance por módulo; catálogo real
  de categorías (admin CRUD, §ELS-0013 §8).

## 2. Jerarquía y navegación

- **Catálogo:** búsqueda arriba (acción común), luego **filtros frecuentes** visibles
  (categorías) + **"Más filtros"** en divulgación progresiva. Después un **curso
  destacado** (2 col en escritorio) y una **lista compacta** para el resto — se evita
  la cuadrícula uniforme de igual peso.
- **Detalle:** columna de contenido (identidad, datos clave, temario, público,
  instructor) + **tarjeta de compra** sticky (precio, CTA, QR, constancia). Migas de
  pan "Cursos / Categoría" para ubicación y retorno.
- Ningún estado es callejón sin salida: vacío → "Limpiar filtros"; error → "Reintentar";
  cerrado → "Avísame si reabre".

## 3. CTA y tratamiento por estado (§03 del wireframe)

Alineado a los estados de publicación (ELS-0013 §3) y de inscripción (No pagado/Pagado):

| Estado | Badge | CTA | Tratamiento |
| --- | --- | --- | --- |
| `published` | Disponible | **Inscribirme** | primario sólido |
| `upcoming` | Próximo | **Reservar lugar** | primario sólido |
| `closed` | Cupo lleno | **Avísame si reabre** | contorno (captura de interés) |
| `free` | Gratis | **Inscribirme gratis** | primario; precio = "Gratis" |
| `pending` | Fecha por confirmar | **Más información** | contorno |

Etiquetas específicas (nunca "Ver más" genérico). El estado se comunica con badge +
texto + icono, **no solo color**.

## 4. Estados de carga, vacío, error e incompletos (§04)

- **Carga:** spinner accesible (`role="status"`) que respeta `prefers-reduced-motion`
  (`motion-reduce:animate-none`). No skeleton infinito.
- **Vacío (sin coincidencias):** icono + copy + acción "Limpiar filtros".
- **Error:** `role="alert"` + "Reintentar".
- **Contenido incompleto:** estado `pending` (fecha "por confirmar") se marca como tal;
  los provisionales no simulan reseñas ni cifras (confianza con datos verificables).

## 5. Responsive

Los artboards usan **container queries** (`@container` + `@md`/`@sm`) para responder al
ancho del artboard, no del viewport → el preview de escritorio muestra 2 columnas y el
de móvil apila realmente. Reglas:

- Catálogo: destacado 2 col (`@md`) → apilado en móvil. Filtros con `flex-wrap`.
- Detalle: contenido + tarjeta 2 col (`@md`) → tarjeta al final en móvil. Info y temario
  2 col (`@sm`) → 1 col en angosto.
- Verificar en **390 / 768 / 1024 / 1440 px**. Tipografía y espacios en unidades
  relativas para soportar ampliación de texto sin recortes; `min-w-0` en columnas
  flexibles para evitar overflow con títulos largos.

## 6. Tipografía (tracking / leading por tamaño)

- **Display (h1 detalle, título destacado):** Sora, leading cerrado (`leading-[1.1]`),
  tracking ligeramente negativo; tope ≤ ~26px en detalle (no gritar).
- **Cuerpo:** Manrope, tracking neutro, leading cómodo (1.5–1.6).
- **Texto pequeño (badges, metadatos):** ligeramente más abierto (`tracking-[.06em]`)
  y en mayúsculas para etiquetas de estado.
- Números tabulares en precio/fechas cuando ayuden a comparar.
- Escalar con `rem`/unidades relativas → soporta ampliación de texto.

## 7. Interacción y movimiento

- **Press:** controles reales con `:active { scale(.97–.98) }`, transform 100–160 ms.
- **Hover:** solo `@media (hover: hover) and (pointer: fine)`; en touch el press no se pega.
- **Filtros / selects / menús:** 150–240 ms; **tooltips / popovers:** 125–200 ms.
  Salidas más rápidas que entradas. Sin `ease-in`, sin `scale(0)`, sin `transition: all`.
- **Popovers** ("Más filtros", menús): nacen de su disparador, entran y salen por la
  misma trayectoria.
- **Teclado:** acciones iniciadas por teclado responden sin animación; el foco visible
  no depende del movimiento (contorno global de 3px).
- Movimiento predeterminado: solo `transform`/`opacity`. Springs críticamente
  amortiguados solo para gestos realmente interrumpibles (ninguno en catálogo/detalle).

## 8. Accesibilidad

- Controles nativos con nombre visible o `aria-label`; iconos decorativos `aria-hidden`.
- Estado por badge + texto + icono (no solo color); contraste AA (mismos tokens que el
  resto del panel; teal oscuro `--secondary-foreground` sobre superficies teñidas).
- Foco visible global; objetivos táctiles ≥ 44px en móvil.
- `role="status"`/`role="alert"` en carga/error.

## 9. Preferencias reducidas

- `prefers-reduced-motion`: sin spinner giratorio (crossfade / estático), sin parallax.
- `prefers-reduced-transparency`: superficies sólidas (el wireframe no usa vidrio).
- `prefers-contrast: more`: reforzar bordes y contraste (mismo enfoque que el admin,
  redefiniendo tokens en el contenedor).

## 10. Sistema visual

Solo tokens de `app/globals.css`: marca `--primary #5E979B` / `--primary-hover` /
`--primary-light`; acento `--accent #2B2D62`; verdes `--leaf`/`--moss`; neutros cálidos
(`--bg`, `--paper`, `--card`, `--muted`, `--border`); texto `--text`/`--text-muted`;
destructivo `--destructive`. Tipografía Sora/Manrope; radios `--radius*`; profundidad
`--shadow-sm`/`--shadow-card`; foco 3px. **Sin valores visuales alternativos.**

## 11. Fuera de alcance / pendiente

- Implementación real de `/cursos` y `/cursos/[slug]` → **ELS-0008**.
- Contenido comercial definitivo (los cursos compactos son mock).
- **Aprobación explícita del wireframe** por ELSI antes de implementar.
