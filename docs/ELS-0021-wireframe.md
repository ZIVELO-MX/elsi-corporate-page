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

- El panel es un shell propio a toda altura: el header y el footer de marketing se
  ocultan en `/admin`, y la navegación vive solo en la barra lateral.
- Navegación: en escritorio la barra lateral es fija a pantalla completa y el contenido
  se desplaza a su derecha; por debajo de 800 px se condensa en un cajón con barra
  superior (hamburguesa), backdrop y cierre con `Escape` o al cambiar de ruta.
- Tablas: cada una vive en un contenedor con `overflow-x` y ancho mínimo, de modo que
  la página nunca desborda horizontalmente en 390 px.
- Formularios: las barras de alta/filtros se apilan con `flex-wrap`; los campos pareados
  del formulario de curso pasan de dos columnas a una en pantallas angostas
  (`auto-fit minmax`), con objetivos de toque a ancho completo.

## Alcance del MVP y límites

El wireframe cubre la operación manual mínima para alimentar el perfil del alumno.
Dos módulos se mantienen deliberadamente básicos porque su ampliación pertenece a
misiones de *farming* posteriores, dependientes de este panel y de acumular volumen.

### Usuarios — frente a ELS-0009 (Ampliar la gestión de usuarios)

- **En el MVP:** listado de usuarios, búsqueda por nombre/correo y detalle del alumno
  con sus inscripciones y origen.
- **Fuera del MVP → ELS-0009:** filtros avanzados de usuario, historial de accesos,
  historial de compras y exportación de información. Se justifican cuando exista un
  volumen de usuarios que lo amerite.

### Contenido — frente a ELS-0010 (Ampliar la administración de contenido)

- **En el MVP:** edición del texto y activación/desactivación de las secciones ya
  definidas de la página corporativa.
- **Fuera del MVP → ELS-0010:** editar más secciones, administrar imágenes y recursos,
  reordenar secciones y crear secciones nuevas desde el panel.

### Fuera de alcance del panel (todas las misiones de wireframe)

- Implementación real, backend y persistencia.
- Envío automático de correos y descarga/almacenamiento de constancias.
- Reproducción o consumo de cursos dentro de la plataforma.
- Cancelaciones o modificaciones de inscripción desde el perfil del alumno.
- Estados de inscripción más allá de `No pagado`/`Pagado` y de constancia
  `pendiente`/`disponible`.

## Modo oscuro — evaluación (ELS-0032)

**Decisión: diferir el modo oscuro; no se requiere en esta fase.**

- El producto público de ELSI es *light-only* (paleta cálida sobre `--bg #F7F6F2`);
  no existe una identidad oscura definida ni una necesidad de usuarios que la exija.
- El panel es una herramienta interna sobre datos simulados (aún sin backend); un
  tema oscuro no aporta valor al MVP y agregaría una identidad paralela sin dirección
  de producto.

**Preparación ya existente (si se adopta más adelante):**

- El panel usa exclusivamente tokens semánticos (`--card`, `--bg`, `--text`,
  `--border`, `--primary-light`, `--secondary-foreground`, …) y `color-mix`, no
  colores fijos: un tema oscuro encajaría redefiniendo ~20 tokens, sin tocar los
  componentes.
- `app/globals.css` ya declara el hook `@custom-variant dark (&:is(.dark *))`,
  listo para un bloque de overrides.

**Si se adopta (tarea acotada, fuera de ELS-0032):**

1. Definir valores oscuros de los tokens bajo `@media (prefers-color-scheme: dark)`
   y/o la clase `.dark`.
2. Auditar contraste AA de cada par en oscuro (mismo método usado en ELS-0032).
3. Añadir `prefers-reduced-transparency` y `prefers-contrast: more` en la misma pasada.
