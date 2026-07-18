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
- Esta iteración no acredita todavía la prueba con texto al 200 % ni la aprobación del prototipo por parte del cliente.
- La auditoría automatizada detecta overflow global; carouseles y barras de navegación con scroll contenido se consideran regiones intencionales.
