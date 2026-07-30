# ELS-0041 — Leads, Turnstile, Resend y outbox

Estado: `planned`  
Prioridad: P1  
Rama: `feat/els-0041-notifications-leads`  
Misiones relacionadas: ELS-0052, ELS-0034  
Predecesora: ELS-0038

## Resultado

Contacto persiste leads de forma segura, valida Turnstile en servidor y envía notificaciones por Resend mediante un outbox reintentable. Los fallos del proveedor no pierden el lead ni duplican correos.

## Estado actual

- `components/public-contact-form.tsx` y `app/contacto/page.tsx` validan experiencia de prototipo.
- `app/admin/contacto/page.tsx` no consume persistencia real.
- No hay anti-spam server-side, proveedor de correo ni worker/outbox.

## Pasos

1. Implementar endpoint/acción de contacto con schema estricto, límites de tamaño y rate limit.
2. Verificar token Turnstile server-side y definir bypass exclusivamente para tests.
3. Persistir lead antes de enviar; sanitizar campos y minimizar PII.
4. Insertar outbox en la misma transacción y procesarlo con idempotencia/reintentos.
5. Integrar Resend server-side con plantillas versionadas para contacto e inscripción.
6. Conectar listado/estado admin con autorización, paginación y acciones auditadas.
7. Añadir observabilidad sin contenido sensible y política de retención.

## Validación automatizada

- [ ] Tests de validación, honeypot/rate limit, Turnstile inválido y proveedor caído.
- [ ] Tests de retry/idempotencia del outbox y acceso admin.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

## Validación manual y capturas finales

- [ ] Enviar contacto válido e inválido en el dominio alojado.
- [ ] Confirmar recepción, remitente, reply-to y una sola entrega.
- [ ] Revisar lead en Admin y estados de fallo/reintento.
- [ ] Capturas `public` y `admin` con datos ficticios.

## Pendiente del propietario

- [ ] Proveer claves Turnstile y dominios permitidos.
- [ ] Proveer API key de Resend, dominio/remitente verificado y destinatarios.
- [ ] Aprobar plantillas, política de retención y correo operativo.

## Terminado cuando

Un lead válido se conserva aunque Resend falle, spam básico se bloquea y toda entrega es idempotente y observable.

