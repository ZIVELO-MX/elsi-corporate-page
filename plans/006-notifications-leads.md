# ELS-0041 — Leads, anti-spam, Resend y outbox

Estado: `implemented — provider credentials and hosted validation pending`  
Prioridad: P1  
Rama: `feat/els-0041-notifications-leads`  
Misiones relacionadas: ELS-0052, ELS-0034  
Predecesora: ELS-0038

## Resultado

Contacto persiste leads de forma segura con validación y rate limit básico, y deja notificaciones preparadas en un outbox reintentable. Turnstile y la entrega por Resend quedan diferidos hasta que ELSI provea y valide los proveedores.

## Estado actual

- `components/public-contact-form.tsx` y `app/contacto/page.tsx` validan experiencia de prototipo.
- `app/admin/contacto/page.tsx` no consume persistencia real.
- No hay Turnstile habilitado, proveedor de correo ni worker programado; el endpoint conserva validación y rate limit básico.

## Pasos

1. [x] Implementar endpoint de contacto con schema estricto, límites y rate limit básico.
2. [x] Mantener anti-spam base con validación y rate limit; Turnstile queda diferido.
3. [x] Persistir lead con campos acotados y mínimo de PII antes de notificar.
4. [x] Insertar evento `lead.created` en outbox y devolver 202 si la notificación queda pendiente.
5. [ ] Integrar Resend/worker idempotente cuando el propietario provea proveedor y remitente.
6. [x] Conectar endpoints admin de listado y estado con autorización por rol.
7. [ ] Añadir auditoría durable y política de retención aprobada.

## Entrega diferida

La implementación de Resend, sus plantillas y el worker permanecen en el repositorio
como código preparado para una fase posterior, pero la entrega está protegida por
`NOTIFICATIONS_DELIVERY_ENABLED=false` y por la variable de repositorio equivalente
del workflow. Mientras la bandera esté apagada, el worker no consulta ni modifica el
outbox y GitHub Actions omite el job programado. Los leads y eventos siguen siendo
persistidos para atención manual y para una futura integración de correo.

## Validación automatizada

- [x] Tests de validación, rate limit y persistencia/outbox (contrato estático).
- [x] Tests de acceso admin y estados de lead.
- [x] `pnpm typecheck`; lint/test/build ejecutados antes del push.

## Validación manual y capturas finales

- [ ] Enviar contacto válido e inválido en el dominio alojado.
- [ ] Confirmar recepción, remitente, reply-to y una sola entrega.
- [ ] Revisar lead en Admin y estados de fallo/reintento.
- [ ] Capturas `public` y `admin` con datos ficticios.

## Pendiente del propietario

- [ ] Fase futura: proveer claves Turnstile, dominios permitidos e integrar el widget cliente con validación server-side.
- [ ] Proveer API key de Resend, dominio/remitente verificado y destinatarios.
- [ ] Aprobar plantillas, política de retención y correo operativo.

## Terminado cuando

Un lead válido se conserva aunque Resend falle, spam básico se bloquea y toda entrega es idempotente y observable.

## Evidencia de implementación

- PR #62: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/62
- Endpoints: `/api/contact`, `/api/admin/leads`, `/api/admin/leads/[id]`.
- El formulario público ya envía al endpoint y muestra errores recuperables.
- Pendiente: Resend, worker/reintentos idempotentes, Turnstile real, auditoría/retención y validación manual alojada.
