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

La misión [ELS-0042](https://zipform.zivelo.dev) recibe un snapshot de 16 capturas por cada revisión de un pull request abierto. El workflow construye el commit del PR, levanta Next.js localmente y reemplaza atómicamente el grupo `pr-<número>`.

Configuración de GitHub Actions:

- Secreto `ZIPFORM_TOKEN`: API key dedicada de Zibot para CI.
- Variable `TLOZ_MISSION_ID`: `f212d162-1b37-4790-a8fd-4da976332555`.

Para generar las capturas localmente sin publicarlas:

```bash
pnpm exec playwright install chromium
pnpm run screenshots:capture
```

Los PNG se generan bajo `test-results/`. La publicación se reserva para el workflow y requiere además `PR_NUMBER` y `SOURCE_REVISION`.
