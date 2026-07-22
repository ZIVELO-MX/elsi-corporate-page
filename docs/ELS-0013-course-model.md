# ELS-0013 — Modelo de información y operación de cursos

Fuente de verdad para los wireframes (ELS-0019) y la implementación (ELS-0008,
backend ELS-0037). Define la **ficha canónica de curso** y las **decisiones
operativas** de inscripción, acceso y finalización.

Fuera de alcance: diseñar pantallas, implementar frontend/backend/pagos/LMS.

## 1. Estado actual (fuentes)

Hoy conviven **dos modelos desalineados** que este documento unifica:

| Modelo | Archivo | Campos clave | Estado |
| --- | --- | --- | --- |
| Catálogo público | `lib/courses.ts` · `data/courses.json` | `status:"Publicado"`, `duration:"6 módulos"`, `modules`, `moduleList[]`, `description`, `cat`/`catLabel` | mock |
| Admin | `lib/admin-data.tsx` (`AdminCourse`) | `status:"active"\|"inactive"`, `modality`, `duration:"8 horas"`, `synopsis`, `curriculum`, `targetAudience`, `externalUrl`, `presencial*` | mock |
| Inscripción | `lib/admin-data.tsx` (`Enrollment`) | `source:"interna"\|"externa"`, `status:"en-curso"\|"realizado"`, `certificateStatus:"pendiente"\|"disponible"` | mock |

**Desalineaciones a resolver:** el `status` del catálogo (`"Publicado"`) no coincide
con el del admin (`"active"/"inactive"`); `duration` mezcla "N módulos" y "N horas";
el catálogo usa `moduleList[]` y el admin `curriculum` (texto). La ficha canónica
de abajo es la única fuente; ambos modelos deben converger a ella.

## 2. Ficha canónica de curso

Obligatoriedad: **R** = requerido · **O** = opcional · **P(mod)** = requerido según modalidad.
Origen del dato: **✅ confirmado** (decisión de cliente / ya en producto) ·
**🟡 mock** (placeholder en código) · **🔵 pendiente** (a confirmar con ELSI).

| Campo | Tipo | Oblig. | Origen | Ejemplo | Notas |
| --- | --- | --- | --- | --- | --- |
| `id` | string | R | ✅ | `"c1"` | Identificador interno estable. |
| `slug` | string (kebab, único) | R | ✅ | `"fundamentos-de-educacion-ambiental"` | URL pública del detalle. |
| `title` | string | R | ✅ | `"Fundamentos de Educación Ambiental"` | |
| `category` | string | R | ✅ | `"Sostenibilidad"` | Catálogo de categorías: 🔵 definir lista cerrada. |
| `synopsis` | string (≤160) | R | ✅ | "Bases de la educación ambiental…" | Resumen para tarjeta/listado (unifica `description`+`synopsis`). |
| `objectives` | string[] | O | 🔵 | `["Diseñar mensajes que cambian comportamientos"]` | No existe hoy en datos; ¿los cursos tienen objetivos explícitos? |
| `targetAudience` | string | O | ✅ | `"Docentes y promotores comunitarios"` | En `AdminCourse`. |
| `requirements` | string[] | O | 🔵 | `["Sin requisitos previos"]` | No existe hoy; a confirmar. |
| `instructor` | { name, bio? } | O | 🔵 | `{ name: "…" }` | No existe hoy; a confirmar si se muestra. |
| `modality` | `"online" \| "presencial"` | R | ✅ | `"presencial"` | |
| `duration` | string | R | ✅ | `"6 módulos"` / `"8 horas"` | 🔵 unificar a una convención (p.ej. duración en horas + nº de módulos aparte). |
| `curriculum` | Topic[] (tema → subtemas[]) | R | ✅ | ver §2.1 | Unifica `moduleList[]` y `curriculum` texto. |
| `price` | number (entero menor) | R | ✅ | `0` | En centavos o unidad — 🔵 confirmar. Hoy todos `0`. |
| `currency` | `"MXN"` | R | 🔵 | `"MXN"` | No existe hoy; asumir MXN — confirmar. |
| `capacity` | number | O | 🔵 | `30` | Solo presencial; no existe hoy. |
| `place` | string | P(presencial) | ✅ | `"Campus Central ELSI, Auditorio B"` | `presencialLocation`. |
| `date` | string | P(presencial) | ✅ | `"2025-08-14"` / `"Por confirmar"` | `presencialDate`. |
| `time` | string | P(presencial) | ✅ | `"09:00 - 13:00"` | `presencialTime`. |
| `generalInfo` | string | O | ✅ | "Cupo, requisitos de acceso…" | `presencialInfo`. |
| `externalUrl` | string (url) | P(online) | ✅ | `"https://elsyacademy.me"` | **Nunca se muestra en catálogo/detalle/perfil**; solo se envía por correo (§4). |
| `publishState` | enum (§3) | R | ✅ | `"published"` | Reemplaza `"Publicado"` y `"active"/"inactive"`. |
| `includesCertificate` | boolean | O | 🔵 | `true` | ¿El detalle indica si el curso da constancia? A confirmar. |
| `students` | number | O | 🟡 | `184` | Contador mock; real cuando exista backend. |

### 2.1 Estructura académica (`curriculum`)

```ts
type Topic = { title: string; subtopics?: string[] };
```

Ejemplo (unifica el `moduleList[]` del catálogo):

```json
"curriculum": [
  { "title": "Por qué la mayoría de las campañas ambientales fallan" },
  { "title": "Diseña un mensaje que sí cambie comportamientos", "subtopics": ["Objetivos", "Alcance"] }
]
```

Convención de captura en admin (ya implementada en ELS-0021): un tema por línea;
subtemas anteceden con `- `.

## 3. Estados de publicación y CTA

Enum canónico `publishState` (reemplaza `"Publicado"` y `"active"/"inactive"`):

| Estado | Significado | Visible en catálogo | CTA principal |
| --- | --- | --- | --- |
| `draft` | Borrador, no publicado | No | — (solo admin) |
| `published` | Publicado y disponible | Sí | **Inscribirme** (o **Explorar** si gratuito) |
| `upcoming` | Publicado, fecha futura (presencial) | Sí | **Reservar lugar** / **Inscribirme** |
| `closed` | Cupo lleno o fecha pasada | Sí (marcado) | **Curso cerrado** (deshabilitado) + "Avísame" 🔵 |
| `pending_info` | Publicado con datos por confirmar (p.ej. fecha "Por confirmar") | Sí | **Más información** |

- **Gratuito** no es un estado, es `price === 0` → la tarjeta/CTA muestran "Gratis".
- El estado nunca depende solo del color: se acompaña de etiqueta e icono.

## 4. Inscripción, pago y acceso — **decisiones confirmadas**

- **Estados de inscripción (pago):** solo **No pagado** y **Pagado**. No existen
  Pendiente de pago, Cancelada, Reembolsada ni Finalizada.
- **Sin reembolsos automáticos** por cancelación tras el pago; casos excepcionales
  → el alumno contacta directamente al instituto.
- **Liga de acceso al curso:** se envía **únicamente por correo**. No aparece en
  catálogo, detalle ni perfil del alumno.
- **Plataforma externa:** los cursos en línea se imparten fuera de ELSI
  (hoy `elsyacademy.me`). ELSI es portal de gestión y acceso, no LMS.
- **Origen de inscripción:** `interna` (Sitio ELSI) o `externa` (plataforma externa),
  y deben presentarse de forma consistente.

> Nota: "No pagado/Pagado" es el estado de **pago**; "en curso/realizado" (código
> actual) es el ciclo de **finalización** (§5). Son ejes distintos y deben modelarse
> por separado.

## 5. Finalización, progreso y certificados — **decisiones confirmadas**

- La **carga de constancia** (individual o masiva) marca el curso como **realizado**
  para los alumnos correspondientes.
- Un **botón manual** permite marcar realizado para casos excepcionales.
- **No hay "marcar asistencia";** la evidencia de finalización es la constancia.
- **Constancia:** estados `pendiente` (cargada, sin publicar) y `disponible`
  (publicada y descargable).
- **Progreso académico:** 🔵 **Recomendación** — NO mostrar avance porcentual ni
  unidades internas (el contenido vive en la plataforma externa). El "progreso"
  visible es el ciclo de inscripción: *Próximo → Realizado*. (Consistente con el
  wireframe del perfil, ELS-0020: "no mostrar avances académicos".)

## 6. Datos confirmados vs mock vs pendiente

- **✅ Confirmados (decisión de cliente):** estados de inscripción (No pagado/Pagado),
  liga solo por correo, finalización mediante constancia, sin marcar asistencia.
- **🟡 Mock (placeholder en código):** los 6 cursos de ejemplo, `students`, `price: 0`,
  fechas, `externalUrl`. Se reemplazan cuando exista backend (ELS-0037).
- **🔵 Pendiente de confirmar con ELSI:** ver §7.

## 7. Preguntas abiertas para validación con ELSI (gatea ELS-0019)

1. **Categorías:** ¿lista cerrada de categorías? ¿cuáles?
2. **Precio y moneda:** ¿MXN? ¿entero/centavos? ¿habrá cursos de pago o todos gratuitos por ahora?
3. **Campos opcionales:** ¿los cursos exponen **objetivos**, **requisitos**, **instructor**, **capacidad**? ¿se muestran en el detalle?
4. **Duración:** ¿unificamos a horas + nº de módulos por separado?
5. **Certificado:** ¿el detalle indica si el curso incluye constancia?
6. **Estado "cerrado":** ¿ofrecemos "avísame cuando reabra"?
7. **Progreso:** ¿se confirma NO mostrar avance académico (solo ciclo de inscripción)?

Estas respuestas deben confirmarse antes de iniciar los wireframes dependientes
(ELS-0019).
