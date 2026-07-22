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
| `category` | string (ref a categoría) | R | ✅ | `"Sostenibilidad"` | **No es lista fija:** el admin gestiona las categorías (agregar / editar / eliminar). Implica un CRUD de categorías (ver §8). |
| `synopsis` | string (≤160) | R | ✅ | "Bases de la educación ambiental…" | Resumen para tarjeta/listado (unifica `description`+`synopsis`). |
| `objectives` | string[] | O | ✅ | `["Diseñar mensajes que cambian comportamientos"]` | **El detalle muestra todo lo que incluye el curso** → se exponen cuando existan. |
| `targetAudience` | **string[]** | O | ✅ | `["Ingeniería Ambiental", "Carreras afines"]` | **Es un arreglo** (curso real DC-3, §9). Se muestra en el detalle. |
| `requirements` | string[] | O | ✅ | `["Sin requisitos previos"]` | Se muestran en el detalle. |
| `instructor` | { name, bio? } | O | ✅ | `{ name: "…" }` | Se muestra en el detalle. |
| `modality` | `"online" \| "presencial"` | R | ✅ | `"presencial"` | |
| `durationType` | `"time" \| "modules"` | R | ✅ | `"modules"` | **Lo decide el admin por curso.** Determina si se muestra avance (§5). |
| `duration` | string | R | ✅ | `"8 horas"` / `"6 módulos"` | Cadena de despliegue coherente con `durationType`. |
| `curriculum` | Topic[] (tema → subtemas[]) | R | ✅ | ver §2.1 | Unifica `moduleList[]` y `curriculum` texto. En cursos `durationType:"modules"`, cada tema = un módulo. |
| `price.amount` | number (MXN, entero) | R | ✅ | `0` / `550` | **Habrá cursos gratuitos y de pago.** `0` = gratis. |
| `price.currency` | `"MXN"` | R | ✅ | `"MXN"` | Confirmado MXN. |
| `price.label` | string | O | ✅ | `"Recuperación"` | Etiqueta del costo (curso real DC-3, §9). |
| `capacity` | number | O | ✅ | `30` | Sobre todo presencial. Al llenarse → estado `closed` + captura de interés (§3). |
| `schedule.date` | string | O | ✅ | `"29 de julio"` | **Aplica a online en vivo Y presencial** (curso real DC-3 es Online con horario). |
| `schedule.time` | string | O | ✅ | `"12:00 - 16:00"` | Horario de la sesión. |
| `place` | string | P(presencial) | ✅ | `"Campus Central ELSI, Auditorio B"` | Solo presencial (`presencialLocation`). |
| `generalInfo` | string | O | ✅ | "Cupo, requisitos de acceso…" | `presencialInfo`. |
| `externalUrl` | string (url) | P(online) | ✅ | `"https://elsyacademy.me"` | **Nunca se muestra en catálogo/detalle/perfil**; solo se envía por correo (§4). |
| `publishState` | enum (§3) | R | ✅ | `"published"` | Reemplaza `"Publicado"` y `"active"/"inactive"`. |
| `includesCertificate` | boolean | R | ✅ | `true` | **Constante = `true`: todos incluyen constancia.** |
| `certificateType` | string | R | ✅ | `"DC-3"` | **Tipo oficial de la constancia** (p.ej. DC-3 de STPS). El detalle lo indica. |
| `registration.hasQrCode` | boolean | O | ✅ | `true` | La inscripción puede incluir **código QR** (curso real DC-3, §9). Ver §8. |
| `registration.cta` | string | O | ✅ | `"¡Inscríbete ya!"` | Texto del CTA de inscripción. |
| `organization` | string (const) | R | ✅ | `"ELSI"` | Constante institucional. |
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
| `closed` | Cupo lleno o fecha pasada | Sí (marcado) | **Curso cerrado** + **"Avísame si reabre"** (captura de interés, §5.1) |
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

- La **carga de constancia** (individual o masiva) marca el curso como **realizado**.
- Un **botón manual** permite marcar realizado para casos excepcionales.
- **No hay "marcar asistencia";** la evidencia de finalización es la constancia.
- **Constancia:** estados `pendiente` (cargada, sin publicar) y `disponible`.
  **Todos los cursos incluyen constancia**, y tiene un **tipo oficial**
  (`certificateType`, p.ej. **DC-3** — Constancia de Habilidades DC-3 de STPS).
  El detalle indica el tipo.
- **Progreso:** se muestra **solo en cursos por módulos** (`durationType:"modules"`)
  → avance = módulos completados. En cursos por **tiempo** no se muestra avance; solo
  el ciclo *Próximo → Realizado*. 🔵 **Fuente por definir con backend:** el contenido
  es externo, así que el avance por módulo debe alimentarse desde la plataforma externa
  o marcarse en el admin (definir en ELS-0037).

### 5.1 Captura de interés (cupo lleno)

Al llegar a `closed`, se ofrece **"Avísame si reabre"** para registrar interés y decidir
si se reabre. Requiere almacenar contactos interesados por curso (feature nueva, §8).

## 6. Datos confirmados vs mock vs pendiente

- **✅ Confirmados:** estados de inscripción (No pagado/Pagado), liga solo por correo,
  finalización mediante constancia (con tipo), sin marcar asistencia, precio en MXN
  (gratis y de pago), categorías gestionadas por el admin, progreso solo por módulos,
  y la **estructura real de ficha** (ver §9, curso oficial DC-3).
- **🟡 Mock (placeholder en código):** los 6 cursos de `data/courses.json`, `students`,
  `price: 0`, `externalUrl`. Se reemplazan con datos reales + backend (ELS-0037).
- **🔵 Pendiente:** la **fuente del avance por módulo** (§5), a definir con el backend.

## 7. Validación con ELSI — **resuelto** (2026-07-21)

| # | Pregunta | Decisión |
| --- | --- | --- |
| 1 | Categorías | El admin las gestiona (agregar/editar/eliminar); no es lista fija. |
| 2 | Precio/moneda | **MXN**; habrá cursos **gratuitos y de pago** (`price.amount` + `price.label`). |
| 3 | Objetivos/requisitos/instructor/capacidad | El detalle **muestra todo** lo que incluye el curso. |
| 4 | Duración | Por **tiempo o módulos**, a criterio del admin (`durationType`). |
| 5 | Constancia | **Todos** incluyen constancia, con **tipo** (p.ej. DC-3). |
| 6 | Estado cerrado | Sí: capturar interés ("avísame si reabre"). |
| 7 | Progreso | Solo en cursos por **módulos**. |

Modelo validado → **ELS-0019 (wireframes) queda desbloqueado.**

## 8. Features derivadas (nuevas, fuera de ELS-0013)

Las decisiones implican trabajo nuevo a agendar como misiones aparte:

- **CRUD de categorías** en el admin (hoy la categoría es texto libre en el formulario).
- **Registro con QR** (`registration.hasQrCode`) para la inscripción.
- **Captura de interés** para cursos cerrados (§5.1).
- **Fuente de avance por módulo** para cursos `durationType:"modules"` (§5, con backend).

## 9. Ejemplo real — curso oficial ELSI (validado por el cliente)

Curso real usado para validar la estructura de la ficha. `durationType: "time"`
(4 horas), online **con horario en vivo**, de pago (MXN, etiqueta "Recuperación"),
constancia oficial **DC-3**, inscripción con **QR**.

```json
{
  "title": "Manejo Integral de Residuos",
  "organization": "ELSI",
  "synopsis": "Manejo integral de residuos, marco legal, clasificación, economía circular y planes de manejo, con constancia DC-3.",
  "modality": "online",
  "durationType": "time",
  "duration": "4 Horas",
  "schedule": { "date": "29 de julio", "time": "12:00 - 16:00" },
  "price": { "amount": 550, "currency": "MXN", "label": "Recuperación" },
  "certificateType": "DC-3",
  "includesCertificate": true,
  "curriculum": [
    { "title": "Marco Legal" }, { "title": "Distribución de Competencias" },
    { "title": "Clasificación de los Residuos" }, { "title": "Manejo Integral de los Residuos" },
    { "title": "Plan de Manejo" }, { "title": "Economía Circular" }, { "title": "Sanciones" }
  ],
  "targetAudience": [
    "Estudiantes de licenciatura", "Estudiantes de posgrado", "Ingeniería Ambiental",
    "Ingeniería Hidráulica", "Ingeniería Química", "Ingeniería Civil", "Carreras afines"
  ],
  "instructor": {
    "name": "Q.F.B. Gabriela Núñez Torres",
    "bio": "Egresada de la Facultad de Ciencias Químicas; inspectora y subdelegada de auditoría ambiental en PROFEPA; asesora y consultora ambiental; agente capacitador por STPS; jefa de impuestos ecológicos en SATEG."
  },
  "registration": { "hasQrCode": true, "cta": "¡Inscríbete ya!" }
}
```

Diferencias notables vs los cursos mock de `data/courses.json`: `targetAudience` es
arreglo; el costo trae etiqueta; hay horario aunque sea online; la constancia tiene tipo
oficial (DC-3); y la inscripción incluye QR. La ficha canónica (§2) ya refleja esto.
