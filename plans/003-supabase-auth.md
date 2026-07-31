# ELS-0035 — Autenticación Supabase y Google

Estado: `implemented — credentials/manual OAuth pending`  
Prioridad: P0  
Rama: `feat/els-0035-supabase-auth`  
Misiones relacionadas: ELS-0023, ELS-0034  
Predecesora: ELS-0036

## Resultado

Login, registro, logout, recuperación y Google OAuth usan Supabase Auth con cookies SSR. Perfil y Admin se protegen en servidor y el rol efectivo siempre procede de la base de datos.

## Estado actual

- `components/auth-context.tsx` y rutas bajo `app/api/auth/` simulan sesión para el prototipo.
- Login, registro, perfil y shell administrativo ya tienen estados visuales que deben conservarse.
- No existe callback OAuth, refresh SSR ni autorización persistente por rol.

## Pasos

1. [x] Sincronizar con la fundación Supabase integrada (PR #58 como base).
2. [x] Reemplazar endpoints mock por rutas Supabase con contratos de error estables.
3. [x] Implementar cookies SSR, refresh de sesión y callback OAuth con redirecciones relativas allowlisted.
4. [x] Conectar registro, login, logout y recuperación sin filtrar si un correo existe.
5. [x] Proteger `/profile` y `/admin` en servidor mediante middleware; redirigir preservando un destino seguro.
6. [x] Leer `profiles.role` para admin; impedir que metadata del cliente eleve privilegios.
7. [x] Mantener un modo prototipo separado cuando faltan credenciales.
8. [ ] Añadir rate limiting externo antes de producción; no se inventa infraestructura sin credenciales/decisión del propietario.

## Validación automatizada

- [x] Tests de sesión ausente, logout, callback inválido y redirección abierta (contrato estático).
- [x] Tests de acceso alumno/admin y manipulación de metadata (contrato estático).
- [x] `pnpm lint` (0 errores; 3 warnings preexistentes)
- [x] `pnpm typecheck`
- [x] `pnpm test` (88/88)
- [x] `pnpm build`
- [x] `pnpm cloudflare:build`

## Validación manual y capturas finales

- [ ] Email/password: registro, confirmación, login, recuperación y logout.
- [ ] Google: consentimiento, callback y regreso al destino solicitado.
- [ ] Alumno no puede abrir Admin; admin sí puede.
- [ ] Capturas `account` y `admin` sin PII real (no se generan hasta disponer de una cuenta Supabase de prueba).

## Pendiente del propietario

- [ ] Proveer Client ID/Secret de Google en Supabase.
- [ ] Confirmar dominio final y URLs autorizadas de callback/desarrollo.
- [ ] Configurar plantillas y remitente de correos Auth.
- [ ] Designar qué cuentas iniciales tendrán rol `admin`.

## Terminado cuando

Las rutas protegidas no dependen de estado cliente, OAuth funciona en el dominio autorizado y las pruebas automatizadas pasan sin credenciales reales.

## Evidencia de implementación

- PR #59: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/59
- Rama apilada sobre `feat/els-0036-supabase-foundation`; no hacer merge todavía.
- Rutas añadidas: `/auth/callback`, `/api/auth/recover`; endpoints existentes usan Supabase Auth cuando hay configuración.
- Validación local: typecheck, 88/88 tests, lint, build Next y OpenNext Cloudflare exitosos.
- Pendiente del propietario: Google Client ID/Secret, dominio y callbacks, plantillas/remitente Auth, cuentas admin y rate limiting de producción.
