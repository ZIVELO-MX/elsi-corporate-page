# ELS-0035 — Autenticación Supabase y Google

Estado: `planned`  
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

1. Sincronizar con la fundación Supabase integrada.
2. Reemplazar endpoints mock por acciones/rutas Supabase con contratos de error estables.
3. Implementar cookies SSR, refresh de sesión y callback OAuth con redirecciones relativas allowlisted.
4. Conectar registro, login, logout y recuperación sin filtrar si un correo existe.
5. Proteger `/profile` y `/admin` en servidor; redirigir preservando un destino seguro.
6. Leer `profiles.role` para admin; impedir que metadata del cliente eleve privilegios.
7. Mantener un modo prototipo claramente separado para pruebas sin credenciales.
8. Añadir rate limiting/errores recuperables y logs sin tokens, correos completos ni cookies.

## Validación automatizada

- [ ] Tests de sesión ausente, expirada, logout, callback inválido y redirección abierta.
- [ ] Tests de acceso alumno/admin y manipulación de metadata.
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`

## Validación manual y capturas finales

- [ ] Email/password: registro, confirmación, login, recuperación y logout.
- [ ] Google: consentimiento, callback y regreso al destino solicitado.
- [ ] Alumno no puede abrir Admin; admin sí puede.
- [ ] Capturas `account` y `admin` sin PII real.

## Pendiente del propietario

- [ ] Proveer Client ID/Secret de Google en Supabase.
- [ ] Confirmar dominio final y URLs autorizadas de callback/desarrollo.
- [ ] Configurar plantillas y remitente de correos Auth.
- [ ] Designar qué cuentas iniciales tendrán rol `admin`.

## Terminado cuando

Las rutas protegidas no dependen de estado cliente, OAuth funciona en el dominio autorizado y las pruebas automatizadas pasan sin credenciales reales.

