# ELS-0070 — Runtime y dependencias reproducibles

Estado: `implemented — manual validation pending`
Prioridad: P0  
Rama: `chore/els-0070-runtime-baseline`  
Base auditada: `257bfc0`

## Resultado

Todo clon limpio instala, valida y construye la aplicación con versiones fijadas de Node, pnpm, Next, React y OpenNext. El pipeline y el entorno local ejecutan los mismos comandos y no dependen de paquetes globales ni de un `node_modules` previo.

## Estado actual

- `package.json` usa varios rangos `latest`, por lo que una instalación futura puede cambiar el runtime sin revisión.
- Cloudflare/OpenNext, TypeScript, ESLint y Playwright requieren una matriz de versiones explícita.
- El árbol local puede pasar pruebas aunque le falten dependencias instaladas; un clon limpio debe ser la referencia.
- `next-env.d.ts` tiene un cambio local ajeno a esta rama y no debe incorporarse.

## Alcance de implementación

- `package.json`, `pnpm-lock.yaml` y archivos de versión del runtime.
- Workflows en `.github/workflows/`, scripts de Cloudflare y documentación de arranque.
- Sin cambios de producto, UI, autenticación, base de datos o secretos.

## Pasos

- [x] Auditar versiones soportadas por Next, React, OpenNext, Wrangler, TypeScript y Node.
- [x] Sustituir `latest` por versiones exactas y declarar `packageManager`/`engines`.
- [x] Regenerar el lockfile desde una instalación limpia y comprobar que no cambia en una segunda instalación.
- [x] Alinear CI con versión de Node fijada, `pnpm install --frozen-lockfile` y caché segura.
- [x] Ejecutar lint, tipos, unitarias, build Next y build Cloudflare.
- [x] Documentar los comandos, la política de actualización y el diagnóstico de dependencias faltantes.

## Validación automatizada

- [x] `pnpm install --frozen-lockfile` funciona desde un clon limpio.
- [x] `pnpm lint` (3 warnings preexistentes, 0 errores).
- [x] `pnpm typecheck`
- [x] `pnpm test` (84/84).
- [x] `pnpm build`
- [x] `pnpm cloudflare:build`
- [x] Una segunda instalación no modifica `pnpm-lock.yaml`.

## Validación manual

- [ ] Arrancar `pnpm dev` y abrir Home, Cursos, Login, Perfil y Admin sin errores de runtime.
- [ ] Confirmar que Cloudflare Preview arranca con el artefacto generado.

## Evidencia automatizada

- PR #57: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/57
- El pipeline debe repetir `quality`, `rendered-seo` y `screenshots` sobre el commit de implementación.

## Pendiente del propietario

No requiere credenciales nuevas. Si el repositorio debe usar una versión corporativa específica de Node o pnpm, el propietario debe confirmarla antes del merge.

## Terminado cuando

CI está verde en un entorno limpio, la documentación reproduce el resultado y no se incluyó `next-env.d.ts` ni cambios funcionales. La misión conserva pendientes las dos validaciones manuales para la futura sesión de QA.
