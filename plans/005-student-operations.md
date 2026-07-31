# ELS-0038 — Usuarios, inscripciones y constancias

Estado: `implemented — UI/storage/manual validation pending`  
Prioridad: P1  
Rama: `feat/els-0038-student-operations`  
Misiones relacionadas: ELS-0039, ELS-0034  
Predecesora: ELS-0037

## Resultado

Admin consulta perfiles y administra inscripciones internas/externas sin duplicados; el alumno ve únicamente su perfil, cursos, progreso operativo y constancias.

## Estado actual

- `app/admin/usuarios/page.tsx`, `app/admin/inscripciones/page.tsx` y `app/profile/page.tsx` consumen estado en memoria.
- Los modelos visuales existen, pero no hay persistencia, autorización por fila ni concurrencia.

## Pasos

1. [x] Crear queries tipadas para perfiles, inscripciones y constancias.
2. [x] Implementar endpoints admin de listado/alta/actualización con errores seguros.
3. [x] Implementar alta interna/externa con constraint único y respuesta idempotente 409.
4. [x] Implementar transiciones `in_progress`/`completed` y publicación de constancia.
5. [x] Conectar `/api/profile` a la identidad autenticada; nunca acepta user ID del navegador.
6. [x] Mantener estados pendiente/disponible sin inventar archivos; Storage queda pendiente.
7. [ ] Añadir auditoría/revalidación de UI cuando se conecten las pantallas.

## Validación automatizada

- [x] Contratos de API cubren alumno propio/anónimo, admin y separación por user ID.
- [x] Tests estáticos cubren duplicado, origen y transición inválida.
- [x] Serialización de perfil sólo usa la sesión autenticada.
- [x] `pnpm typecheck`; lint/test/build quedan por completar antes del push final.

## Validación manual y capturas finales

- [ ] Alta de alumno, inscripción interna/externa, finalización y visualización en Perfil.
- [ ] Confirmar que alumno no puede enumerar otros perfiles.
- [ ] Capturas `account` y `admin` sin correos o nombres reales.

## Pendiente del propietario

- [ ] Definir proceso y archivo real para emitir constancias.
- [ ] Confirmar quién puede finalizar/reabrir inscripciones y política de soporte.
- [ ] Proveer datos de prueba anonimizados para la validación alojada.

## Terminado cuando

Las operaciones persisten, las restricciones evitan duplicados y ningún usuario puede leer o mutar registros ajenos.

## Evidencia de implementación

- PR #61: https://github.com/ZIVELO-MX/elsi-corporate-page/pull/61
- Endpoints: `/api/profile`, `/api/admin/enrollments`, `/api/admin/enrollments/[id]`, `/api/admin/certificates/[id]`.
- Validación inicial: typecheck correcto; tests específicos añadidos.
- Pendiente: conectar pantallas, aplicar RLS en Supabase alojado, Storage para archivos, auditoría y pruebas manuales con datos anonimizados.
