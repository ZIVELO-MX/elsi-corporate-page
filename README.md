# ELSI — Página Corporativa

Sitio web corporativo de ELSI Academy. Incluye landing, catálogo de cursos, blog y panel administrativo.

## TLOZ

- **Proyecto:** [Elsi](https://zipform.zivelo.dev) — Migración y evolución de Elsi Academy.
- **Misión:** ELS-0001 — Migrar página corporativa.

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Auth + DB)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Runtime local

El repositorio fija Node en `.node-version` y pnpm en `package.json`. Usa
Corepack antes de instalar dependencias para reproducir el entorno de CI:

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
```

Si el entorno reporta una versión distinta, cambia a Node 22.14.0 y pnpm
10.12.1 antes de diagnosticar errores de instalación o build.

## Publicación e indexación

La indexación falla de forma segura. `robots` y los datos estructurados solo se
habilitan cuando se cumplen las tres condiciones:

1. `NEXT_PUBLIC_PROTOTYPE_MODE=0`
2. `NEXT_PUBLIC_CONTENT_STATUS=verified`
3. `NEXT_PUBLIC_SITE_URL` contiene el dominio público aprobado de ELSI

Los cursos y soluciones conservan además un `contentStatus` individual. Solo
los recursos marcados como `verified` aparecen en sitemap, catálogos públicos
de producción y datos estructurados. Hasta recibir la información final del
cliente deben permanecer como `fixture`.

Después de `pnpm build`, `pnpm audit:seo` valida el HTML generado: títulos,
canonical, robots, encabezados y activos de descubrimiento.

## Preview de `main`

Cada push a `main` que aprueba el workflow `CI` se publica en un Worker dedicado de
Cloudflare mediante OpenNext. El pipeline sube una versión candidata, ejecuta smoke
tests, promueve su ID exacto y restaura la versión anterior si falla la verificación
estable.

- Worker: `elsi-main-preview`
- URL: `https://elsi-main-preview.<workers-subdomain>.workers.dev`
- GitHub secrets: `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN`
- Runtime: Cloudflare Workers; no usa Pages, Tunnel, dominio productivo ni R2
- Indexación: el build fuerza modo prototipo y contenido `fixture`

Para validar el adaptador localmente:

```bash
cp .dev.vars.example .dev.vars
pnpm cloudflare:build
pnpm cloudflare:preview
```

El token de CI debe usar `Workers Scripts: Edit` y estar limitado a la cuenta de
ELSI. `NEXT_PUBLIC_SITE_URL` se calcula desde el subdominio `workers.dev` de esa
cuenta y no se guarda como secreto.

## Capturas de pull requests

Cada PR debe indicar su misión en la descripción usando el campo `Misión: ELS-XXXX` (ver [`PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)). El workflow:
1. Detecta el campo `Misión:` en el body del PR — si no está presente, se salta.
2. Resuelve el display ID (ej. `ELS-0042`) al UUID interno vía la API de Zipform.
3. Toma un snapshot de 16 capturas y las publica en la misión correspondiente, reemplazando atómicamente el grupo `pr-<número>`.

Configuración de GitHub Actions:

- Secreto `ZIPFORM_TOKEN`: API key dedicada de Zibot para CI.
- Variable `TLOZ_MISSION_ID`: UUID de fallback (actualmente `f212d162-1b37-4790-a8fd-4da976332555` para ELS-0042).

Para generar las capturas localmente sin publicarlas:

```bash
pnpm exec playwright install chromium
pnpm run screenshots:capture
```

Los PNG se generan bajo `test-results/`. La publicación se reserva para el workflow y requiere además `PR_NUMBER` y `SOURCE_REVISION`.
