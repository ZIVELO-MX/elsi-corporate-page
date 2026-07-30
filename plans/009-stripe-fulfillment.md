# ELS-0049 — Webhooks Stripe e inscripción atómica

Estado: `planned`  
Prioridad: P1  
Rama: `feat/els-0049-stripe-fulfillment`  
Predecesora: ELS-0048

## Resultado

Stripe es la única autoridad de pago: webhooks firmados actualizan órdenes e inscriben exactamente una vez mediante transacción y outbox, incluso ante duplicados, desorden o concurrencia.

## Pasos

1. Crear `stripe_events` con event ID único, estado de proceso, hash/payload mínimo y timestamps.
2. Implementar `/api/webhooks/stripe` sobre cuerpo raw y verificar `Stripe-Signature` antes de parsear.
3. Manejar completed, async succeeded/failed y expired con transiciones monotónicas.
4. Recuperar Session/PaymentIntent cuando el evento llegue incompleto o fuera de orden.
5. Comparar livemode, monto, moneda, curso, comprador y referencias con la orden.
6. Crear RPC transaccional: orden pagada, inscripción única y outbox único.
7. Responder duplicados 2xx, registrar discrepancias y habilitar reproceso seguro.
8. Documentar conciliación, alertas, retención y privacidad de logs.

## Validación automatizada

- [ ] Firma inválida/malformada no muta datos.
- [ ] Duplicados y concurrencia generan una inscripción y un outbox.
- [ ] Eventos fuera de orden nunca revierten un pago confirmado.
- [ ] Discrepancia de monto/entorno no concede acceso.
- [ ] Fallo intermedio hace rollback completo y puede reintentarse.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

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

