# Información pendiente del cliente

Este documento concentra decisiones y datos de negocio que no bloquean la implementación técnica. Se actualiza por misión y no contiene credenciales ni secretos.

## ELS-0073 — Consultas y esquema operativo

- [ ] Confirmar el catálogo definitivo de categorías de cursos. El sistema admite categorías consultables y conserva `General` como valor compatible hasta recibir el catálogo.
- [ ] Definir los valores operativos aceptados para método y referencia de pago. Por ahora son campos de texto opcionales y no alteran el flujo de Stripe.
- [ ] Confirmar si los contactos deben asignarse a administradores concretos y qué estados/SLA utiliza el equipo. El esquema deja preparada la asignación, notas y fecha de resolución.
- [ ] Proporcionar una cuenta temporal de alumno si se requiere evidencia manual de permisos desde UI. Las pruebas automatizadas de RLS siguen cubriendo aislamiento alumno/admin sin usar datos reales.
- [ ] Coordinar la aplicación de `20260814000000_admin_query_foundation.sql` en Supabase antes de exigir filtros por correo/categoría o visualizar los nuevos metadatos en producción.

## ELS-0074 — Workspace de inscripciones y constancias

- [ ] Confirmar quién autoriza la publicación final de una constancia después de cargar el PDF. El workspace mantiene carga y publicación como pasos separados.
- [ ] Definir la política de reemplazo y conservación histórica de PDFs. El comportamiento vigente sustituye la referencia activa y retira el archivo anterior solo después de guardar el nuevo.
- [ ] Confirmar si “Marcar realizado” sin constancia debe seguir disponible como excepción operativa o requerir una nota/segunda aprobación.

## ELS-0075 — Exportaciones CSV

- [ ] Confirmar el periodo de retención y los responsables autorizados para conservar archivos CSV descargados con datos personales.
- [ ] Definir si futuras exportaciones deben ocultar teléfono, correo, mensajes o referencias de pago según el rol administrativo. En esta etapa existe un único rol `admin`, por lo que la confirmación es obligatoria antes de exportar datos personales.

## ELS-0076 — Operación administrativa

- [ ] Definir qué personas pueden conceder o retirar el rol administrador. El sistema exige confirmación, bloquea la auto-degradación y nunca permite retirar al último administrador.
- [ ] Definir responsables nominales, SLA y protocolo de reasignación para mensajes de Contacto. El panel ya permite responsable, notas y estados Nuevo, En seguimiento y Cerrado.
- [ ] Definir el protocolo comercial para pagos fallidos o cancelados (contacto, reintento, devolución o cierre). El panel los muestra como incidencias sin ejecutar acciones financieras automáticas.

## SEO y descubrimiento agéntico

- [ ] Confirmar el dominio canónico definitivo y autorizar el go-live coordinado de `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PROTOTYPE_MODE=0` y `NEXT_PUBLIC_CONTENT_STATUS=verified`. La indexación permanece cerrada si falta cualquiera de estas señales.
- [ ] Validar nombre legal, domicilio, teléfono, correo institucional, perfiles sociales y Google Business Profile antes de ampliar `sameAs` o datos locales en JSON-LD.
- [ ] Entregar acceso o verificaciones de Google Search Console y Bing Webmaster Tools para registrar el sitemap y medir cobertura, consultas y Core Web Vitals.
- [ ] Priorizar temas, regiones, competidores y consultas objetivo. La implementación técnica evita canibalización, pero no inventa una estrategia de palabras clave sin evidencia del negocio.
- [ ] Definir si los crawlers de entrenamiento de IA deben permitirse o bloquearse por separado. La configuración vigente permite rastreo público al pasar el gate, pero nunca expone rutas privadas ni autoriza compras o envíos automáticos.

## Política de datos durante validaciones

- Los smokes y recorridos Playwright solo pueden crear registros con prefijos temporales identificables de la misión.
- La limpieza solo puede eliminar registros creados por el mismo smoke durante esa ejecución.
- Ningún script debe modificar o eliminar registros existentes del cliente para preparar un escenario de prueba.
