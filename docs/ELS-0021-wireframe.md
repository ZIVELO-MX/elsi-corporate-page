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

## Comportamiento

- Las inscripciones internas y externas comparten la misma tabla; el estado es
  `En curso` o `Realizado` y el origen se marca con badge (`Sitio ELSI` / `Plataforma externa`).
- Un curso pasa a `Realizado` cuando administración carga la constancia (individual
  o masiva) o lo marca manualmente. El marcado manual es respaldo para casos
  excepcionales y **exige confirmación** por no dejar constancia.
- La constancia se distingue como `Constancia pendiente de publicación` o
  `disponible`. `Marcar disponible` la publica; `Reemplazar` sube un archivo nuevo y
  la regresa a pendiente.
- Cursos en línea: se registra la liga de acceso (no se muestra en el perfil del
  alumno; se envía por correo — ver ELS-0020). Presenciales: lugar, fecha, hora e
  información general.
- Búsqueda y filtros operan en cliente; el subtítulo `N de M` refleja el subconjunto
  visible y hay estado vacío diferenciado (sin datos vs. sin coincidencias).
- Los formularios validan antes de mutar (slug de curso único, inscripción no
  duplicada, campos requeridos) y comunican el resultado con toast de éxito o error.
- El formulario de curso rastrea cambios y, al intentar cerrarse sucio, ofrece
  descartar; conserva su estado para `Seguir editando`.
- Los toggles de estado de curso y de activación de sección son reversibles e
  inmediatos.
- Son wireframes sobre datos simulados: no hay persistencia, carga de archivos real
  ni envío de correo.

## Accesibilidad

- Controles nativos (`button`, `a`, `input`, `select`, `textarea`) con nombre visible
  o `aria-label` cuando son solo-icono: menú hamburguesa, cerrar toast, buscar,
  cambiar estado del curso.
- Foco visible global conservado (contorno de 3 px, separación de 3 px y halo del token).
- El estado se comunica con texto e icono además del color (badges, toasts
  `success`/`error`).
- El switch de sección usa `role="switch"` + `aria-checked`; el estado del curso es un
  `button` cuyo `aria-label` indica el estado actual.
- Regiones dinámicas anunciadas: esqueleto y viewport de toasts con `role="status"`
  / `region`; los diálogos (Radix) atrapan foco, cierran con `Escape` y exponen
  título/descripción.
- Sólo un modal a la vez: la confirmación de descarte reemplaza al formulario para no
  romper el manejo de foco de diálogos anidados.
- Objetivos táctiles: casillas de 24 px; los controles móviles cumplen ≥ 44 px según
  `app/globals.css`.
- `prefers-reduced-motion: reduce` desactiva el shimmer del esqueleto y las
  animaciones de toast y diálogo.

## Responsive

- Navegación: en escritorio la barra lateral es fija; por debajo de 800 px se condensa
  en un cajón con botón hamburguesa, backdrop, cierre con `Escape` y al cambiar de ruta.
- Tablas: cada una vive en un contenedor con `overflow-x` y ancho mínimo, de modo que
  la página nunca desborda horizontalmente en 390 px.
- Formularios: las barras de alta/filtros se apilan con `flex-wrap`; los campos pareados
  del formulario de curso pasan de dos columnas a una en pantallas angostas
  (`auto-fit minmax`), con objetivos de toque a ancho completo.
