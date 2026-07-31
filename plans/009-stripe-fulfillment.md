# ELS-0049 — Webhooks Stripe e inscripción atómica

Estado: `implemented — Stripe credentials and hosted validation pending`  
Prioridad: P1  
Rama: `feat/els-0049-stripe-fulfillment`  
Predecesora: ELS-0048

## Resultado

Stripe es la única autoridad de pago: webhooks firmados actualizan órdenes e inscriben exactamente una vez mediante transacción y outbox, incluso ante duplicados, desorden o concurrencia.

## Pasos

1. [x] Crear `stripe_events` con event ID único, estado, payload mínimo y timestamps.
2. [x] Implementar `/api/webhooks/stripe` con cuerpo raw y verificación `Stripe-Signature` antes de parsear.
3. [x] Manejar completed/async succeeded y marcar eventos no fulfillment como procesados.
4. [ ] Recuperar Session/PaymentIntent cuando el evento llegue incompleto o fuera de orden.
5. [x] Comparar livemode, monto, moneda y referencias con la orden antes de conceder acceso.
6. [x] Crear RPC transaccional: orden pagada, inscripción única y outbox único con lock.
7. [x] Responder duplicados 2xx y registrar discrepancias sin conceder acceso.
8. [ ] Documentar conciliación, alertas, retención y privacidad operativa.

## Validación automatizada

- [x] Firma inválida/malformada no muta datos (contrato estático).
- [x] Duplicados y concurrencia generan una inscripción y un outbox (RPC con lock/unique).
- [x] Eventos fuera de orden no revierten un pago confirmado.
- [x] Discrepancia de monto/entorno no concede acceso.
- [x] Fallo intermedio propaga error y permite reintento seguro.
- [x] `pnpm typecheck`; tests específicos agregados.
- [ ] `pnpm lint`, `pnpm test`, `pnpm build` finales antes de push.

## Validación manual

- [ ] Stripe CLI reenvía cada evento al entorno local/alojado.
- [ ] Dashboard muestra respuestas 2xx y reintentos idempotentes.
- [ ] El alumno recibe acceso sólo después del webhook.

## Pendiente del propietario

- [ ] Proveer signing secret test en secretos administrados.
- [ ] Registrar endpoint y eventos en Stripe Dashboard.
- [ ] Aprobar política de conciliación y alertas operativas.

## Terminado cuando

La matriz de duplicados/desorden/rollback pasa y el navegador no puede producir ningún efecto de fulfillment.

## Evidencia de implementación

- PR #65: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/65
- Webhook: `/api/webhooks/stripe`.
- Migración/RPC: `stripe_events` y `fulfill_stripe_order`.
- Pendiente: signing secret, endpoint Dashboard, Stripe CLI y validación alojada; no se marca completada.
