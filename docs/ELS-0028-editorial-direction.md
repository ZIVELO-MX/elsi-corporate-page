# ELS-0028 · Dirección editorial de Home y Soluciones

## Resultado

Home y Soluciones ya cumplen funciones distintas. Home conduce de la promesa general a tres rutas, aporta contexto documental, muestra una selección breve de cursos y termina en preguntas frecuentes y contacto. Soluciones funciona como índice y desarrollo de tres capítulos de servicio.

| Área | Antes | Ahora | Motivo |
| --- | --- | --- | --- |
| Hero de Home | Mensaje y composición promocional de ancho completo | Composición editorial dividida, una acción principal y una imagen narrativa | Fijar jerarquía y reducir decisiones simultáneas |
| Oferta en Home | Seis tarjetas equivalentes dentro de un carrusel | Índice asimétrico de tres rutas | Comparar enfoques sin repetir el catálogo de Soluciones |
| Historia | Contenido secundario sin una pausa visual propia | Bloque documental con imagen, pie y procedencia | Dar contexto verificable sin fabricar métricas |
| Cursos | Retícula uniforme | Un curso destacado y dos accesos compactos | Mantener Home como puerta de entrada; el catálogo sigue fuera de alcance |
| Soluciones | Tres tarjetas con la misma composición | Tres capítulos con estructuras `learning`, `technical` y `campus` | Hacer reconocible el contexto de cada servicio |

## Arquitectura de contenido

- Home: hero → índice de soluciones → historia documental → cursos destacados → preguntas frecuentes → contacto.
- Soluciones: introducción → índice anclado → capacitación → soluciones ambientales → educación universitaria → contacto.
- `lib/solutions.ts` es la fuente tipada compartida para títulos, audiencias, alcance, forma de trabajo, entrega y variante editorial.
- La experiencia pública de cursos no se modifica; ELS-0013 y ELS-0019 permanecen bajo coordinación de Claude.

## Imágenes y procedencia

No se agregaron activos ni se sustituyeron imágenes aprobadas. La implementación reutiliza archivos locales versionados en `public/images`:

- `story.webp`: archivo ELSI / Bee Blue para el origen estudiantil.
- `solucion-capacitacion.webp`: jornada de aprendizaje práctico.
- `solucion-ambientales.webp`: recorrido técnico en instalaciones.
- `solucion-educacion.webp`: comunidad universitaria en programa de liderazgo.
- `course-1.webp`, `course-2.webp` y `course-3.webp`: selección existente de cursos.

Los pies describen únicamente el contexto visible. No se añaden resultados, acreditaciones ni cifras sin evidencia.

## Criterios Apple / Emil

- Una acción dominante por bloque; las secundarias conservan menor peso visual.
- Las tres composiciones de Soluciones expresan su función mediante orden, ritmo y contraste, no mediante ornamento.
- Los estados hover sólo se habilitan con puntero fino.
- Las transiciones usan propiedades específicas y movimiento breve; no hay `transition: all` ni movimiento decorativo continuo.
- `prefers-reduced-motion`, `prefers-reduced-transparency` y `prefers-contrast` conservan una experiencia completa sin depender del efecto visual.
- El contenido mantiene orden semántico y reflow sin desplazamiento horizontal, incluido el equivalente a 390 px con zoom al 200%.

## Contratos de verificación

Los objetivos de captura se identifican con `data-section-label` estable y cubren los bloques editoriales de Home y Soluciones. Las pruebas automatizadas verifican la secuencia de Home, las tres variantes tipadas, las preferencias del sistema, la ausencia del carrusel retirado y la sincronización de los objetivos de captura.
