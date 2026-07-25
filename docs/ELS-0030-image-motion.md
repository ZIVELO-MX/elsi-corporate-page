# ELS-0030 · Imágenes y movimiento

## Resultado

La interfaz pública usa un contrato de imágenes con dimensiones intrínsecas,
`sizes` por superficie y una sola candidata LCP precargada. El movimiento queda
reservado para controles y superficies accionables; los datos y recursos
actuales siguen identificados como fixtures sustituibles.

## Handoff de contenido

- `AvailableImageAsset` conserva `status`, `source`, `src`, `alt`, `width` y
  `height`.
- `source: "fixture"` permanece activo para todos los recursos actuales.
- El cliente puede sustituir `src`, texto alternativo y dimensiones sin cambiar
  los componentes de Home, Soluciones, Nosotros o Cursos.
- `SafeImage` exige dimensiones y mantiene un fallback accesible ante error.
- No se añadieron imágenes, métricas, testimonios, precios ni datos reales.

## Estrategia de carga

- Home define una sola imagen LCP: `siteImages.hero`.
- Next 16 recibe `preload` únicamente para ese recurso; no se combina con
  `loading` ni `fetchPriority`.
- Imágenes editoriales y cursos declaran `sizes` según su contenedor.
- Los assets WebP existentes conservan sus dimensiones reales; el hero JPEG se
  entrega mediante el optimizador de `next/image` y negociación de formato.
- Imágenes fuera del primer viewport mantienen carga diferida.

## Revisión de movimiento

| Before | After | Why | Evidencia |
| --- | --- | --- | --- |
| Una regla global escalaba cualquier enlace, incluido logo y navegación | Press se declara sólo en botones y superficies accionables | Evita feedback falso y conserva estabilidad del chrome | `app/globals.css` |
| Timeline, estadísticas, investigación, beneficios y equipo se elevaban en hover | Superficies estáticas permanecen inmóviles | La respuesta visual comunica interacción real | `app/globals.css` |
| Algunos hovers Tailwind y CSS se activaban también en táctil | Todos los hovers quedan bajo puntero preciso | Evita hover pegajoso y responde al dispositivo | `app/globals.css`, `components/ui/*` |
| Entradas y salidas de paneles compartían duración | Entrada usa 200–240 ms y salida 140 ms | La respuesta del sistema sale más rápido que la acción deliberada | `app/globals.css` |
| El checkout aparecía sólo con opacidad | Estado entra con opacidad y 4 px de desplazamiento en 180 ms | Mantiene continuidad sin movimiento dominante | `components/checkout/checkout.module.css` |
| Skeleton administrativo usaba sheen infinito | Placeholder estático con estado accesible | La carga no queda suspendida en movimiento permanente | `app/globals.css`, `components/ui/skeleton.tsx` |

## Sistema

- Superficies: base, editorial, sutil, interactiva y borde.
- Sombras: separación y elevación.
- Timings: press 120–160 ms, entrada 200–240 ms y salida 140 ms.
- Curvas: `--ease-out`, `--ease-in-out` y `--ease-drawer`.
- Preferencias: reduced motion, reduced transparency e increased contrast.
- No existen gestos de arrastre o swipe en las rutas auditadas; por lo tanto no
  hay interacción gestual que requiera captura de puntero o momentum.

## Verificación local

- Suite Node: 43/43 pruebas.
- Lint: sin hallazgos.
- Build Next.js 16: 36 rutas generadas.
- Playwright visual: 17/17 capturas.
- Responsive: 24/24 combinaciones sin overflow en 390, 768, 1024 y
  1440 px.
- Rendimiento local de Home: CLS 0; LCP identificado como `IMG` a 36 ms,
  servido por `/_next/image` a 828 px; un solo preload.

La medición temporal proviene del servidor de producción local y demuestra el
contrato técnico, no representa una métrica de usuarios reales. ELSI podrá
validar Core Web Vitals de campo cuando exista tráfico y contenido definitivo.

## Veredicto

**Approve.** No quedan regresiones de movimiento que alteren la comprensión,
superficies estáticas que sugieran interacción ni loaders con movimiento
infinito. El resultado respeta puntero preciso, preferencias del sistema y
timings compactos. La sustitución posterior de fixtures conserva el mismo
contrato de dimensiones, `sizes` y procedencia.
