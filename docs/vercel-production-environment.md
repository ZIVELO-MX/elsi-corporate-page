# Variables para Vercel

Esta es la configuración del primer deploy alojado en Vercel. Los valores se
agregan en el proyecto de Vercel y no se guardan en Git. Las variables
`NEXT_PUBLIC_*` se incorporan al build y quedan visibles en el navegador; las
otras deben configurarse como secretos.

## Production temporal

Usar el dominio estable de Vercel del proyecto, no una URL generada para cada
commit:

```dotenv
NEXT_PUBLIC_PROTOTYPE_MODE=1
NEXT_PUBLIC_CONTENT_STATUS=verified
NEXT_PUBLIC_SITE_URL=https://<dominio-estable>.vercel.app
NEXT_PUBLIC_SECTION_LABELS=0
NEXT_PUBLIC_SUPPORT_EMAIL=instituteelsi@gmail.com

NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_CERTIFICATES_BUCKET=certificates

# Correo y pagos permanecen apagados.
NOTIFICATIONS_DELIVERY_ENABLED=false
PAYMENTS_ENABLED=0
NEXT_PUBLIC_PAYMENTS_ENABLED=0
```

No agregar todavía `STRIPE_*`, `RESEND_*`, `NOTIFICATIONS_WORKER_SECRET`,
`LEAD_NOTIFICATION_RECIPIENTS` ni `PAYMENTS_RECONCILE_SECRET`. Tampoco agregar
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` o `TURNSTILE_SECRET_KEY`: Turnstile queda
documentado para una fase futura.

`SUPABASE_SERVICE_ROLE_KEY` continúa aceptado como fallback legacy, pero las
nuevas instalaciones deben usar `SUPABASE_SECRET_KEY`. La clave secreta nunca
debe comenzar con `NEXT_PUBLIC_`.

## Indexación y dominio final

Mientras el sitio viva en Vercel, `NEXT_PUBLIC_PROTOTYPE_MODE=1` mantiene robots,
sitemap y metadatos fuera de buscadores. Cuando el cliente habilite
`elsyacademy.me`, cambiar y volver a desplegar:

```dotenv
NEXT_PUBLIC_PROTOTYPE_MODE=0
NEXT_PUBLIC_CONTENT_STATUS=verified
NEXT_PUBLIC_SITE_URL=https://elsyacademy.me
```

También deben actualizarse en Supabase Auth el Site URL y los redirect URLs.

## Preview de branches

Las previews de Vercel no deben reutilizar secretos de producción. Para pruebas
locales o de branch se puede dejar Supabase vacío y conservar el modo fixture,
o usar un proyecto Supabase separado. Las variables de Vercel se asignan por
entorno (`Production`, `Preview`, `Development`); cada cambio requiere un nuevo
deploy para surtir efecto.

## Fase futura: Turnstile

Cuando se apruebe el anti-bot, el trabajo requerido será:

1. Crear un widget con hostname autorizado para Vercel y después para
   `elsyacademy.me`.
2. Agregar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` como variable pública y
   `TURNSTILE_SECRET_KEY` como secreto.
3. Integrar el widget en `components/public-contact-form.tsx`.
4. Enviar y validar `turnstileToken` en `/api/contact` antes de persistir el lead.
5. Añadir pruebas de token válido, ausente, vencido y reutilizado.
