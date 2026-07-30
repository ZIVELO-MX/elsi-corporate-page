# ELS-0048 — Órdenes y Stripe Payment Element

Estado: `planned`  
Prioridad: P1  
Rama: `feat/els-0048-stripe-checkout`  
Referencia histórica: ELS-0043  
Predecesora: ELS-0040

## Resultado

Un alumno autenticado inicia una orden con precio canónico y completa un Stripe Payment Element embebido. El servidor crea Checkout Sessions idempotentes; la UI no concede acceso y permanece desactivada sin configuración.

## Estado actual

- `app/checkout/page.tsx`, `components/checkout/checkout-experience.tsx` y `lib/payments.ts` implementan un flujo visual Conekta simulado.
- No existe tabla de órdenes, SDK Stripe ni endpoints de checkout/consulta.

## Pasos

1. Crear migración `orders` con snapshots, centavos MXN, estados, idempotencia, referencias Stripe, índices y RLS.
2. Añadir Stripe server/client con validación de entorno y carga diferida.
3. Implementar `POST /api/payments/checkout`: autenticar, resolver curso/precio en DB y crear Checkout Session custom.
4. Persistir de forma idempotente y devolver sólo `orderId`, `clientSecret`, monto, moneda, estado y expiración.
5. Implementar `GET /api/orders/{orderId}` owner-safe.
6. Adaptar el checkout existente a Payment Element; eliminar Conekta y selectores mock.
7. Tratar retorno/cancelación como UX no autoritativa y mantener `PAYMENTS_ENABLED=0`.
8. Añadir errores recuperables, estados pending/failed y telemetría sin secretos.

## Validación automatizada

- [ ] Tests de auth, precio manipulado, curso inactivo, idempotencia y propiedad de orden.
- [ ] Tests del adaptador Stripe con fixtures firmes, sin red real.
- [ ] Tests de UI para carga, error, cancelación y retorno pendiente.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

## Validación manual y capturas finales

- [ ] Probar tarjeta aprobada, rechazada y 3DS en Stripe test.
- [ ] Confirmar que recargar/reintentar no duplica orden o cobro.
- [ ] Captura `account` con tarjeta de prueba y sin client secrets visibles.

## Pendiente del propietario

- [ ] Proveer publishable/secret key Stripe test mediante secretos administrados.
- [ ] Confirmar métodos de pago, moneda MXN y texto comercial.

## Terminado cuando

La orden usa datos canónicos, Payment Element funciona en test y ninguna acción del cliente marca el pago ni inscribe.

