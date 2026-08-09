# Plan de implementación ELSI

Planificado desde `origin/main` en `257bfc0` el 2026-07-30.

Los PR se abren desde el inicio con un manifiesto autocontenido y se implementan en orden. Cada rama se sincroniza con `main` después de que se integre su predecesora. Los secretos y comprobaciones que requieren cuentas externas permanecen sin marcar hasta que el propietario los proporcione o valide.

| Orden | Rama | Misión principal | Entrega |
| --- | --- | --- | --- |
| 1 | `chore/els-0070-runtime-baseline` | ELS-0070 | Runtime, dependencias y CI reproducibles |
| 2 | `feat/els-0036-supabase-foundation` | ELS-0036 | Supabase, migraciones, RLS y tipos |
| 3 | `feat/els-0035-supabase-auth` | ELS-0035 | Sesiones, Google Auth y roles |
| 4 | `feat/els-0037-course-data` | ELS-0037 | Cursos públicos y CRUD administrativo |
| 5 | `feat/els-0038-student-operations` | ELS-0038 | Usuarios, inscripciones y constancias |
| 6 | `feat/els-0041-notifications-leads` | ELS-0041 | Leads, anti-spam base, Resend y outbox; Turnstile diferido |
| 7 | `feat/els-0040-managed-content` | ELS-0040 | Contenido, soluciones y testimonios |
| 8 | `feat/els-0048-stripe-checkout` | ELS-0048 | Órdenes y Payment Element |
| 9 | `feat/els-0049-stripe-fulfillment` | ELS-0049 | Webhooks e inscripción atómica |
| 10 | `chore/els-0050-stripe-go-live` | ELS-0050 | Validación alojada y activación gradual |

## Política de entrega

- Un PR normal por rama; el propietario conserva el merge.
- CI primero: lint, tipos, pruebas, build y validaciones específicas.
- Los PR de interfaz cambian a capturas `public`, `account` o `admin` cuando exista UI implementada.
- Ninguna credencial se guarda en Git, logs, fixtures, capturas o descripciones.
- Los pagos permanecen desactivados hasta completar ELS-0050.
