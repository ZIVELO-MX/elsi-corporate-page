# ELS-0070 — Runtime y dependencias reproducibles

Estado: `implemented — manual validation pending`
Prioridad: P0  
Rama: `chore/els-0070-runtime-baseline`  
Base auditada: `257bfc0`

## Resultado

Todo clon limpio instala, valida y construye la aplicación con versiones fijadas de Node, pnpm, Next, React y OpenNext. El pipeline y el entorno local ejecutan los mismos comandos y no dependen de paquetes globales ni de un `node_modules` previo.

## Estado actual

- `package.json` usaba varios rangos `latest`, por lo que una instalación futura podía cambiar el runtime sin revisión.
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
- [x] Actualizar Next a la versión estable más reciente publicada (`16.2.7`); `16.2.11` aún no está disponible en el registro configurado.
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

## Auditoría de seguridad

`pnpm audit --prod --audit-level high` sigue reportando vulnerabilidades altas en Next (<16.2.11), Sharp (<0.35.0), PostCSS transitivo y dependencias transitivas de OpenNext. Las versiones corregidas indicadas por los advisories todavía no están disponibles en el registro configurado; el detalle y la mitigación quedan documentados para la siguiente actualización coordinada de Next/OpenNext. No se marca este criterio como completo.

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
