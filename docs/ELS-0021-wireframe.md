# ELS-0021 — Wireframe del panel administrativo

Rutas de referencia (requieren sesión con rol `admin`):

- `/admin` — Dashboard: KPIs enlazables y actividad reciente.
- `/admin/cursos` — Listado, búsqueda/filtro y formulario completo de curso.
- `/admin/usuarios` — Listado, búsqueda y detalle del alumno.
- `/admin/inscripciones` — Alta, filtros, constancias y finalización.
- `/admin/ventas` — Registro y listado de ventas.
- `/admin/contenido` — Edición y activación de secciones de la página pública.

Son wireframes funcionales de referencia sobre datos simulados (`lib/admin-data.tsx`):
no ejecutan autenticación real, persistencia, carga de archivos ni envío de correo.

## Sistema visual aplicado

Se reutilizan exclusivamente los tokens definidos en `app/globals.css`. No se
introducen colores, fuentes, radios ni sombras alternativos.

### Paleta

- **Marca:** `--primary #5E979B`, `--primary-hover #4A7A7E`, `--primary-light #EAF4F5`.
- **Acento:** `--accent #2B2D62`, `--accent-light #E8E9F3`.
- **Verdes de apoyo:** `--leaf #6F8D5D` (éxito, "Gratis"), `--moss`, `--earth`.
- **Neutros cálidos:** `--bg #F7F6F2`, `--paper`, `--card`, `--muted #F1EFE7`, `--border #E3DFD3`.
- **Texto:** `--text #1C231F`, `--text-muted #596157`, `--text-light`.
- **Destructivo:** `--destructive #9F2F32` (acciones de descarte).

El acento de éxito es `--leaf`; el de error es `--destructive`. El color nunca
es el único portador de estado: se acompaña de texto e icono (badges, toasts).

### Tipografía

- **Sora** para títulos y valores KPI (`h1`–`h2`, cifras).
- **Manrope** para cuerpo, etiquetas y campos (heredado del `body`).
- No se usa ninguna tercera familia; los `textarea` fijan `fontFamily: inherit`.

### Radios y forma

- `--radius 0.8rem` con derivados `--radius-sm/-md/-lg/-xl`.
- Tarjetas, tablas, campos y diálogos usan `--radius`/`--radius-sm`.
- Círculos (`50%`) para avatares y perillas; píldora (`1rem`) para el switch de sección.
- No hay tarjetas sobre-redondeadas ni radios arbitrarios en px.

### Profundidad

- `--shadow-sm` en hover de KPIs; `--shadow-card` en tarjetas elevadas, diálogos y toasts.
- Las tablas se apoyan en `--border`, no en sombra.

### Foco

- Foco visible global (`app/globals.css`): `outline: 3px solid var(--ring)`,
  `outline-offset: 3px` y halo `--focus-ring`. Se conserva sin overrides en el panel.

### Movimiento

- `--motion-fast 160ms` (hover, press, switch) y `--motion-med 240ms` (diálogos, toasts).
- Entradas con `ease-out`/`cubic-bezier(0.23,1,0.32,1)` desde `scale(0.96)`, nunca desde 0.
- El shimmer del esqueleto y las animaciones de toast/diálogo se desactivan con
  `prefers-reduced-motion: reduce`.
