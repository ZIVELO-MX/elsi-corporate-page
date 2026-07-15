# ELS-0020 — Wireframes del portal del alumno

Ruta de referencia: `/profile/wireframes`.

## Estados cubiertos

1. Resumen con próximos cursos, realizados y constancias.
2. Próximo curso presencial.
3. Próximo curso en línea.
4. Información de acceso pendiente.
5. Historial de realizados.
6. Constancia disponible para descarga.
7. Constancia pendiente de publicación.
8. Descubrimiento de cursos.
9. Alumno sin cursos.
10. Contacto con soporte.
11. Inicio de sesión.
12. Header autenticado y menú de usuario.
13. Carga y error recuperable.

Cada estado se presenta en una mesa de trabajo desktop de 1440 px y una mobile de 390 px.

## Comportamiento

- Las inscripciones internas y externas usan la misma tarjeta y los únicos estados visibles son `No pagado` y `Pagado`.
- Un curso pasa de próximo a realizado cuando administración carga la constancia o lo marca manualmente como realizado.
- La constancia se distingue como `Disponible` o `Constancia pendiente de publicación`; sólo la primera habilita descarga.
- Para cursos en línea nunca se renderiza la liga: la información de acceso se comunica por correo.
- Para cursos presenciales se priorizan fecha, hora, modalidad, lugar e información general. No se incluyen mapas ni recomendaciones de llegada.
- El CTA `Cursos` abre el catálogo público. El contacto toma `NEXT_PUBLIC_SUPPORT_EMAIL`; si no está configurada, usa el correo ya publicado en el sitio actual como respaldo.
- Las muestras son wireframes de referencia: no ejecutan autenticación, envío de correo, descarga, cancelaciones ni operaciones administrativas.

## Accesibilidad

- Los controles son elementos nativos y tienen nombre visible o `aria-label` cuando sólo contienen iconos.
- El foco visible global conserva el contorno de 3 px, separación de 3 px y halo de los tokens existentes.
- Los estados se comunican con texto e icono, además del color; la carga anuncia el progreso visual y el error tiene acción `Reintentar`.
- La jerarquía usa encabezados y listas/descripciones semánticas. Las acciones cumplen el mínimo de 24 × 24 px.
- La animación del indicador de carga se desactiva con `prefers-reduced-motion`.

## Responsive

- Desktop muestra navegación de estados, mesa amplia y vista mobile lado a lado.
- Por debajo de `lg`, el selector se convierte en una fila desplazable y los artboards se apilan.
- En la interfaz futura, la navegación autenticada se condensa en botón de menú; las tarjetas se mantienen a una columna y no dependen de hover.
- Se conservan tipografías Sora/Manrope, `--primary`, `--accent`, radios y sombras definidos en `app/globals.css`; no se introducen tokens alternativos.
