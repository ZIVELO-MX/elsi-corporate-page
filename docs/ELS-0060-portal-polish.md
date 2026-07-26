# ELS-0060 - Pulido del portal del alumno

## Design read

Portal de alumno para una plataforma educativa, con lenguaje trust-first y
dirección Apple + Emil. La composición conserva el layout aprobado de ELS-0059:
resumen arriba, actividad principal a la izquierda y cuenta/soporte a la
derecha en escritorio.

- `DESIGN_VARIANCE`: 3, estructura predecible y foco en orientación.
- `MOTION_INTENSITY`: 2, feedback corto y transiciones de estado discretas.
- `VISUAL_DENSITY`: 5, compacta para uso frecuente sin convertirla en un panel
  de datos.
- Sistema: tokens ELSI, Sora/Manrope, Lucide existente y CSS Module local.
- No se cambia la ruta, el orden del formulario, la identidad visual ni el
  contrato mock de `/api/profile`.

## Estados

- Carga: skeleton estático con `role="status"`, `aria-busy` y una descripción
  para lector de pantalla. No depende de un spinner.
- Vacío: mantiene la acción directa `Ver cursos` para descubrir oferta.
- Error: mensaje inline, `role="alert"` y `Reintentar` como salida recuperable.
- Constancia: `Descargar` aparece como acción visible cuando el fixture está
  disponible; las constancias pendientes explican por qué aún no hay archivo.

## Motion review

- Entrada: `opacity` y `translateY(4px)` en 180 ms.
- Stagger: 40, 80 y 120 ms entre grupos de contenido.
- Press: `transform: scale(.97)` durante 120 ms en controles reales.
- Hover: no se agrega hover global; los estados existentes usan el modificador
  de puntero preciso del proyecto.
- Reduced motion: elimina la entrada y la escala, y reduce las transiciones a
  una duración mínima.
- No se usan `transition: all`, `ease-in`, `scale(0)` ni bucles infinitos.

La revisión en slow-motion se realizó sobre la captura autenticada de
`profile-admin`: la entrada mantiene el orden de lectura, el feedback no
desplaza el layout y el CTA de constancia conserva contraste y jerarquía.

## Datos

Los nombres, cursos, fechas, ubicaciones, métricas y archivos siguen siendo
fixtures del prototipo. No representan registros reales de ELSI ni habilitan
descargas, inscripciones o correo.

## Verificación

- `pnpm test`: 57 pruebas aprobadas.
- `pnpm lint`: sin errores.
- `pnpm build`: compilación aprobada.
- `pnpm screenshots:capture`: 17 capturas aprobadas en modo captura local.
- Responsive: `/profile` y `/profile/wireframes` en 390, 768, 1024 y 1440 px
  sin overflow.
- Reflow equivalente a 200 % en los mismos cuatro anchos sin overflow.
- Revisión visual: captura autenticada del perfil aprobada en escritorio; el
  wireframe conserva una columna táctil en móvil.
