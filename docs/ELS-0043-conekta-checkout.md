# ELS-0043 — Checkout integrable con Conekta

## Alcance de esta entrega

`/checkout` implementa el shell visual, la captura de comprador y todos
los estados del flujo con un adaptador mock determinista. No crea órdenes, no
carga el script de Conekta y no acepta datos reales de tarjeta.

El curso mostrado es el ejemplo real validado en ELS-0013:
**Manejo Integral de Residuos**, recuperación de **$550 MXN**, duración de
4 horas y constancia DC-3. Vive en el contrato de checkout sin modificar el
modelo público de cursos que sigue evolucionando en ELS-0019/ELS-0008.

## Frontera de integración

El frontend consume `PaymentGateway`:

```ts
type PaymentGateway = {
  createSession(request: {
    courseId: string;
    buyer: PaymentBuyer;
  }): Promise<CheckoutSession>;
  loadProvider(session: CheckoutSession): Promise<void>;
  confirmPayment(
    session: CheckoutSession,
    scenario: PaymentScenario,
  ): Promise<PaymentResult>;
};
```

La solicitud no contiene importe. Backend debe resolver precio y moneda por
`courseId`, crear la orden con la llave privada y devolver `orderId`,
`checkoutRequestId`, importe y moneda canónicos.

## Decisión sobre el submit

La UI usa una sola acción primaria externa. Al conectar Conekta, backend y
frontend deben confirmar que la versión activa de Checkout Component soporta
`useExternalSubmit` con el método elegido. Si no lo soporta, se retira el botón
externo y se conserva únicamente el submit interno del iframe; nunca se
presentan dos acciones primarias.

## Montaje futuro de Conekta

1. `POST /api/payments/conekta/checkout` con `courseId` y comprador.
2. Backend crea la orden con llave privada y devuelve la sesión canónica.
3. Frontend carga el script sólo en `/checkout`.
4. Frontend monta Checkout Component dentro de `providerArea` usando la llave
   pública y `checkoutRequestId`.
5. Callbacks del componente actualizan feedback inmediato.
6. `GET /api/payments/orders/{orderId}` muestra el estado persistido.
7. Sólo un webhook firmado e idempotente habilita inscripción y acceso.

Opciones visuales que deben mapearse a los tokens ELSI:

| Conekta | Token ELSI |
| --- | --- |
| `backgroundMode` | claro |
| `colorPrimary` | `--accent` |
| `colorText` | `--text` |
| `colorLabel` | `--text-muted` |
| `inputType` | `line` o equivalente validado |
| `autoResize` | habilitado |

## Apple Pay

No se dibuja un botón de Apple Pay. Conekta/Apple debe generar el botón oficial
y ocultarlo cuando el dispositivo no sea compatible. Backend debe confirmar el
enum exacto para la versión activa del API; la documentación consultada usa
variantes `apple_pay` y `apple`.

Antes de habilitarlo:

- servir el checkout por HTTPS;
- verificar el dominio ante Apple/Conekta;
- completar merchant validation del lado servidor;
- mantener tarjeta como fallback;
- probar en Safari y en un dispositivo compatible.

## Estados del prototipo

`collecting` → `creating-session` → `loading-provider` → `ready` →
`processing` → `succeeded | pending | declined | unavailable`.

El selector de escenario permanece dentro de disclosure y está rotulado como
prototipo. Ningún resultado mock se persiste como venta o inscripción real.

## Seguridad y accesibilidad

- ELSI captura sólo nombre, correo y teléfono.
- PAN, CVC y vigencia pertenecen al iframe de Conekta.
- Los errores se asocian al campo y el foco vuelve al primer dato inválido.
- Los cambios de estado usan `aria-live`; resultados y errores reciben foco.
- La interfaz conserva teclado, contraste, targets de 44 px y 200 % de texto.
- `prefers-reduced-motion` elimina la aparición y la escala de presión.
- No se usan llaves, webhooks, secretos ni credenciales en el cliente.

## Referencias

- [Conekta Checkout Component](https://developers.conekta.com/docs/componente-de-pago)
- [Customización del componente](https://developers.conekta.com/docs/customizaci%C3%B3n-del-component)
- [Apple Pay en checkout embebido](https://developers.conekta.com/v2.3.0/docs/aceptar-pagos-con-apple-pay-en-checkout-embebido)
- [Apple HIG — Apple Pay](https://developer.apple.com/design/human-interface-guidelines/apple-pay)
- [Apple Pay on the Web](https://developer.apple.com/documentation/applepayontheweb)

## Verificación local

- `pnpm lint`: 0 errores.
- `pnpm test`: 32 pruebas aprobadas.
- Playwright: flujo aprobado y rechazo recuperable, 2 pruebas aprobadas.
- `pnpm build`: compilación y generación estática aprobadas.
- React Doctor 0.8.1 sobre el diff: 100/100, sin hallazgos.
- Responsive: 390, 768, 1024 y 1440 px sin overflow.
- Reflow equivalente a 200 % en los cuatro anchos: sin overflow.
