# Plan de Ejecución — Sitio Web ELSI
## ¿Qué sigue si el cliente aprueba el wireframe?

> **Estado:** Wireframe de alta fidelidad (Low Visual / High UX) aprobado.
> **Objetivo de este documento:** definir el camino completo desde la aprobación del wireframe hasta el sitio en producción, con fases, entregables, responsables y tiempos estimados.

---

## Hallazgos del sitio actual (elsiacademy.me)

Se revisó el sitio en producción antes de pulir el wireframe. Esto cambia el enfoque del proyecto: **ELSI no solo necesita un sitio institucional — ya opera (o está por operar) como una academia con venta de cursos en línea.**

- El sitio actual corre sobre WordPress + WooCommerce, con navegación real: **Inicio, Quiénes Somos, Cursos, Contacto, Carrito**, más **Regístrate** / **Ingresar** (cuenta de usuario).
- La página **Cursos** (`/tienda/`) hoy muestra un aviso de "próximamente" — la tienda de cursos está planeada pero no lanzada.
- Existen un **Carrito** y **Checkout** funcionales (WooCommerce) esperando productos/cursos.
- Cifras reales ya publicadas: **+2,200 estudiantes universitarios alcanzados** y **+100 espacios formativos con estudiantes** (no las cifras genéricas usadas en el primer borrador del wireframe).
- Contenido actual: Quiénes Somos (historia de Bee Blue / U. de Guanajuato), Misión, Visión, una galería de fotos del equipo/eventos, y un bloque de contacto simple.
- **No existen hoy:** catálogo de servicios de consultoría, casos de impacto, testimonios, FAQ, ni una sección de "cómo trabajamos" — es decir, todo el andamiaje B2B/institucional del wireframe es una capa nueva que se suma a lo que ya existe.

**Implicación para el wireframe:** se ajustó el wireframe para reflejar esto — el navbar y el hero ahora incluyen los accesos reales (Cursos, Carrito, Ingresar, Regístrate), se agregó una sección de **Catálogo de Cursos** (tienda) entre "Qué hacemos" y "Cómo trabajamos", y las estadísticas usan los datos reales donde existen, marcando como pendientes de validar las que no.

**Implicación para el plan:** el proyecto ya no es solo un sitio de marca — es un **sitio institucional + una tienda de cursos (e‑commerce/LMS)** que conviven. Esto agrega una fase técnica que no estaba en el alcance original.

---

## Resumen ejecutivo

El wireframe define **qué** dice el sitio, **en qué orden** y **cómo se mueve el usuario**. Con eso aprobado, el trabajo ahora se divide en tres grandes bloques:

1. **Identidad visual** → convertir las cajas grises en una marca real.
2. **Contenido real** → reemplazar los textos y fotos de ejemplo por material verdadero.
3. **Construcción y lanzamiento** → programar, probar y publicar.

Tiempo total estimado: **8 a 12 semanas**, dependiendo de la velocidad de entrega de contenido por parte de ELSI.

---

## Fase 0 — Cierre y congelamiento del wireframe (Semana 1)

Antes de avanzar, se cierra formalmente el alcance para evitar cambios estructurales costosos más adelante.

- [ ] Sesión de revisión final del wireframe con el cliente.
- [ ] Documentar cualquier ajuste de estructura pendiente.
- [ ] **Congelar la arquitectura de información** (las 13 secciones y el orden del recorrido).
- [ ] Definir qué secciones son "must-have" para el lanzamiento (MVP) y cuáles pueden ir en una segunda fase.

**Entregable:** wireframe firmado + acta de alcance.
**Regla clave:** a partir de aquí, cambiar la *estructura* cuesta tiempo y dinero. Cambiar *contenido y estilo* es normal y esperado.

---

## Fase 1 — Definición de identidad visual (Semanas 2–3)

Aquí es donde el wireframe deja de ser gris. Se responde: **¿cómo se ve y se siente ELSI?**

### 1.1 Dirección de arte
- Definir personalidad visual alineada a la marca: *profesional, humana, inspiradora, innovadora, cercana, confiable, visionaria*.
- Explorar 2–3 propuestas de "look & feel" (moodboards).
- El cliente elige una dirección.

### 1.2 Sistema de diseño (Design System)
- **Paleta de color:** primario, secundarios, neutros y estados. (Al ser marca ambiental, probablemente tonos naturales, pero sin caer en "ONG tradicional".)
- **Tipografía:** pareja tipográfica para títulos y cuerpo.
- **Componentes:** botones, tarjetas, formularios, navbar, footer, acordeón, carrusel.
- **Iconografía:** estilo de íconos (reemplazan los placeholders "ico").
- **Espaciados y grid:** confirmar el sistema de rejilla ya insinuado en el wireframe.

**Entregable:** guía de estilo + biblioteca de componentes base.

---

## Fase 2 — Diseño UI de alta fidelidad (Semanas 3–5)

Se aplica la identidad visual sobre cada pantalla del wireframe aprobado.

- [ ] Diseño de la **página de inicio completa** (desktop + móvil).
- [ ] Diseño de páginas internas derivadas de la navegación:
  - Nosotros / Nuestra historia
  - Servicios (índice + detalle de cada servicio)
  - Proyectos / Casos de impacto (índice + caso completo)
  - Capacitación
  - Contacto
- [ ] Estados de interacción: hover, activo, foco, error de formulario, estados vacíos.
- [ ] Diseño responsive verificado en breakpoints (móvil, tablet, desktop).
- [ ] Microinteracciones y animaciones definidas (scroll-reveal del timeline, contador de estadísticas, carruseles).

**Entregable:** diseño UI navegable y aprobado, listo para desarrollo.

---

## Fase 3 — Producción de contenido real (Semanas 3–6, en paralelo)

Esta fase corre **en paralelo** al diseño para no frenar el proyecto. **Depende directamente de ELSI.**

### Responsabilidad del cliente (ELSI)
- **Textos finales** de cada sección (copywriting o validación del propuesto).
- **Fotografías reales:** hero, equipo, talleres, proyectos, testimonios.
- **Logos** de empresas/instituciones para la barra de confianza (con permiso de uso).
- **Datos verificados** de las estadísticas (+10,000 personas, +100 talleres, etc.).
- **Casos de impacto reales:** problema, solución, resultado y métricas.
- **Testimonios reales** con nombre, cargo, organización y foto (con autorización).
- **Contenido de FAQ:** preguntas y respuestas definitivas.
- Datos de contacto, redes sociales y textos legales (aviso de privacidad, términos).

### Apoyo del equipo de diseño
- Guía de qué foto va en cada lugar y en qué proporción.
- Sesión de fotografía recomendada si no hay material de calidad.
- Revisión y edición de textos para tono y jerarquía.

**Entregable:** carpeta de contenido final organizada por sección.
**Riesgo #1 del proyecto:** el contenido tarda. Se recomienda arrancar esta fase el día 1.

---

## Fase 4 — Desarrollo / Construcción (Semanas 5–9)

Se programa el sitio con el diseño y el contenido reales. Al ya existir un sitio en WordPress + WooCommerce, la decisión de plataforma está prácticamente tomada: se **evoluciona el sitio actual**, no se empieza de cero.

- [ ] Confirmar que se mantiene WordPress + WooCommerce como base (ya aloja cuentas, carrito y checkout).
- [ ] Maquetación responsive fiel al diseño sobre el tema/constructor elegido.
- [ ] Integración de contenido real (institucional + comercial).
- [ ] Formularios funcionales ("Solicitar información", "Contactar", Newsletter) conectados a correo/CRM.
- [ ] Animaciones e interacciones.
- [ ] **SEO técnico:** metadatos, estructura de encabezados, velocidad, imágenes optimizadas.
- [ ] **Analítica:** Google Analytics / píxeles de conversión.
- [ ] Optimización de rendimiento (carga rápida, especialmente en móvil).

### 4.1 Tienda de cursos (bloque nuevo, no estaba en el sitio institucional original)
- [ ] Publicar el catálogo de cursos en WooCommerce (hoy en "próximamente").
- [ ] Definir si los cursos se entregan por WooCommerce simple (descarga/acceso) o se integra un **LMS** (LearnDash, Tutor LMS, LifterLMS) para lecciones, progreso y certificados.
- [ ] Flujo de cuenta: Registro → Ingreso → Mi cuenta → Mis cursos / progreso.
- [ ] Flujo de compra: Catálogo → Detalle de curso → Carrito → Checkout → Confirmación → Acceso al curso.
- [ ] Métodos de pago (tarjeta, y si aplica, transferencia/facturación para empresas).
- [ ] Certificados descargables al completar un curso (si aplica).

**Entregable:** sitio funcional en ambiente de pruebas (staging), incluyendo tienda de cursos operativa.

---

## Fase 5 — Pruebas y control de calidad (Semana 9–10)

- [ ] Pruebas en navegadores (Chrome, Safari, Firefox, Edge).
- [ ] Pruebas en dispositivos reales (iOS, Android, distintos tamaños).
- [ ] Revisión de accesibilidad (contraste, navegación por teclado, textos alternativos).
- [ ] Prueba de todos los formularios y llamadas a la acción.
- [ ] Revisión ortográfica y de enlaces.
- [ ] Validación de velocidad y SEO.
- [ ] Revisión final del cliente y lista de ajustes menores.

**Entregable:** sitio aprobado para producción + checklist de QA firmado.

---

## Fase 6 — Lanzamiento (Semana 10–11)

- [ ] Configuración de dominio y certificado de seguridad (HTTPS).
- [ ] Publicación en producción.
- [ ] Alta en Google Search Console y envío de sitemap.
- [ ] Verificación post-lanzamiento (todo funciona en vivo).
- [ ] Redirecciones desde el sitio anterior si aplica.

**Entregable:** sitio ELSI en línea. 🎉

---

## Fase 7 — Post-lanzamiento y evolución (continuo)

- Capacitación a ELSI para editar contenido (si es CMS).
- Monitoreo de analítica: ¿el usuario entiende qué hace ELSI en 5 segundos?, ¿llega al CTA?
- Iteración basada en datos reales (mapas de calor, tasa de conversión de formularios).
- Fase 2 de contenido: blog, más casos de impacto, sección de recursos.
- Mantenimiento técnico y actualizaciones.

---

## Cronograma general (referencia)

| Fase | Semanas | Responsable principal |
|---|---|---|
| 0 · Cierre de wireframe | 1 | Diseño + Cliente |
| 1 · Identidad visual | 2–3 | Diseño |
| 2 · UI alta fidelidad | 3–5 | Diseño |
| 3 · Contenido real | 3–6 (paralelo) | **Cliente (ELSI)** |
| 4 · Desarrollo | 5–9 | Desarrollo |
| 5 · Pruebas / QA | 9–10 | Desarrollo + Cliente |
| 6 · Lanzamiento | 10–11 | Desarrollo |
| 7 · Post-lanzamiento | Continuo | Todos |

---

## Lo que necesitamos de ELSI para no frenar el proyecto

Ordenado por urgencia:

1. **Aprobación formal del wireframe** (destraba todo).
2. **Acceso al sitio y hosting actual** (elsiacademy.me / WordPress admin) para evaluar qué se conserva.
3. **Referencias de marca** existentes: logo, colores, tipografías, guía si la hay.
4. **Catálogo real de cursos**: nombres, descripciones, precios, módulos, y si requieren LMS con lecciones/certificados o solo venta de acceso.
5. **Textos y datos verificados** (estadísticas — confirmar o actualizar +2,200 / +100 —, casos, testimonios).
6. **Material fotográfico** de calidad o luz verde para producir uno.
7. **Logos autorizados** de organizaciones aliadas.
8. **Contenido legal** (aviso de privacidad, términos, políticas de compra/reembolso de cursos).
9. **Accesos:** dominio, hosting, redes sociales, correos, pasarela de pago.

---

## Riesgos y cómo los manejamos

- **El contenido llega tarde** → arrancar Fase 3 desde el día 1 y trabajar en paralelo al diseño.
- **Cambios de estructura tardíos** → se congela la arquitectura en Fase 0; cambios estructurales se cotizan aparte.
- **Fotografía de baja calidad** → recomendar sesión fotográfica temprano; usar placeholders solo en diseño.
- **Expectativa de "verlo terminado ya"** → este plan deja claro que el wireframe es el esqueleto; la piel visual llega en Fases 1–2.

---

## Nota importante

El wireframe **no es el diseño final**: es el mapa. Aprobarlo significa que estamos de acuerdo en **la estructura, el recorrido del usuario y el mensaje**. A partir de aquí, todo lo que cambia es la *apariencia* y el *contenido real* — no la lógica. Ese es exactamente el objetivo de haber hecho el wireframe primero: tomar las decisiones difíciles de UX antes de invertir en diseño visual y programación.
