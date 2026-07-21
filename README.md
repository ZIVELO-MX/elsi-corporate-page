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
