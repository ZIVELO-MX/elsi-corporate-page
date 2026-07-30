# ELS-0050 — Go-live Stripe en el entorno alojado

Estado: `planned`  
Prioridad: P2  
Rama: `chore/els-0050-stripe-go-live`  
Predecesora: ELS-0049

## Resultado

El único entorno alojado pasa de pagos desactivados a Stripe test y luego live mediante una lista de control verificable, secretos separados y rollback inmediato por feature flag.

## Pasos

1. Sincronizar todas las ramas integradas y ejecutar la suite completa desde un clon limpio.
2. Verificar backup, migraciones, RLS, constraints, datos test y plan de conciliación.
3. Configurar Supabase, Google OAuth, Turnstile, Resend y Stripe test en secretos del entorno.
4. Validar dominio, redirects, webhook, CSP/headers, rate limits, privacidad de logs y alertas.
5. Ejecutar matriz end-to-end test: auth, permisos, catálogo, contacto, orden, 3DS, fallo, duplicado e inscripción.
6. Registrar claves/signing secret live de forma separada y ejecutar un smoke controlado.
7. Verificar métodos/wallets realmente habilitados y accesibilidad en hardware real.
8. Documentar responsables, soporte, rotación, conciliación, rollback y evidencia.
9. Activar `PAYMENTS_ENABLED` sólo tras aprobación explícita del propietario.

## Validación automatizada

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm lint && pnpm typecheck && pnpm test`
- [ ] `pnpm build && pnpm cloudflare:build`
- [ ] Migraciones/RLS y pruebas Stripe contractuales en verde.
- [ ] Escaneo confirma que no hay secretos en Git, bundle, logs ni artefactos.

## Validación manual obligatoria

- [ ] Google OAuth en el dominio final.
- [ ] Contacto/Resend y Turnstile reales.
- [ ] Stripe test: aprobado, rechazo, 3DS, cancelación, expiración, duplicado y retraso.
- [ ] Stripe live: transacción autorizada, webhook, inscripción y conciliación.
- [ ] Safari/VoiceOver, teclado, mobile y reduced motion/contrast.
- [ ] Rollback a `PAYMENTS_ENABLED=0` ensayado.

## Pendiente del propietario

- [ ] Proyecto Supabase, dominio final y credenciales Google OAuth.
- [ ] Claves Stripe test/live y signing secrets test/live.
- [ ] Credenciales Turnstile/Resend y dominios/remitentes verificados.
- [ ] Métodos de pago, moneda, razón social, descriptor y soporte.
- [ ] Ventana de cambio y autorización de la transacción real.

## Regla de parada

Si falta una credencial, aprobación o evidencia manual, pagos quedan desactivados y el PR no se considera listo para merge. No se mezclan modos test/live ni se eliminan datos para “arreglar” un despliegue.

