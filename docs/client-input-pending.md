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

## Política de datos durante validaciones

- Los smokes y recorridos Playwright solo pueden crear registros con prefijos temporales identificables de la misión.
- La limpieza solo puede eliminar registros creados por el mismo smoke durante esa ejecución.
- Ningún script debe modificar o eliminar registros existentes del cliente para preparar un escenario de prueba.
