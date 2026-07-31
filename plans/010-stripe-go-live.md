# ELS-0050 — Go-live Stripe en el entorno alojado

Estado: `blocked by owner credentials/manual gates`  
Prioridad: P2  
Rama: `chore/els-0050-stripe-go-live`  
Predecesora: ELS-0049

## Resultado

El único entorno alojado pasa de pagos desactivados a Stripe test y luego live mediante una lista de control verificable, secretos separados y rollback inmediato por feature flag.

## Pasos

1. [x] Sincronizar la secuencia de ramas y dejar PRs apilados sin merge automático.
2. [x] Versionar migraciones, RLS, constraints y contratos de datos en PRs precedentes.
3. [ ] Configurar Supabase, Google OAuth, Turnstile, Resend y Stripe test en secretos.
4. [ ] Validar dominio, redirects, webhook, CSP/headers, rate limits y alertas alojadas.
5. [ ] Ejecutar matriz E2E test: auth, permisos, catálogo, contacto, orden, 3DS, fallo, duplicado e inscripción.
6. [ ] Registrar claves/signing secret live separadas y ejecutar smoke controlado.
7. [ ] Verificar métodos/wallets y accesibilidad en hardware real.
8. [x] Documentar responsables, soporte, rotación, conciliación y rollback como checklist pendiente.
9. [ ] Activar `PAYMENTS_ENABLED` sólo tras aprobación explícita del propietario.

## Validación automatizada

- [x] Suite local de PRs precedentes: install reproducible, lint, typecheck, 100 tests y build verificados en PR #65.
- [x] Contratos de migración/RLS y Stripe añadidos y verificados estáticamente.
- [x] `pnpm cloudflare:build` final desde rama de go-live (OpenNext bundle completo).
- [ ] Migraciones/RLS contra Supabase alojado y pruebas Stripe contractuales.
- [ ] Escaneo final confirma ausencia de secretos en Git, bundle, logs y artefactos.

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

## Evidencia de implementación

- PR #66: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/66
- La rama contiene la secuencia técnica hasta ELS-0049; no activa pagos ni incorpora secretos.
- El propietario debe proporcionar credenciales, dominios y autorizaciones antes de cualquier smoke live.

## Regla de parada

Si falta una credencial, aprobación o evidencia manual, pagos quedan desactivados y el PR no se considera listo para merge. No se mezclan modos test/live ni se eliminan datos para “arreglar” un despliegue.
