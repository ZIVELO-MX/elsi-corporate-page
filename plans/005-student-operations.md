# ELS-0038 — Usuarios, inscripciones y constancias

Estado: `planned`  
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

1. Crear repositorios/queries tipadas para perfiles, inscripciones y constancias.
2. Implementar listados y detalle admin con paginación, filtros y errores seguros.
3. Implementar alta interna/externa con constraint único alumno-curso y manejo idempotente de conflictos.
4. Implementar transiciones permitidas de inscripción y finalización manual auditada.
5. Conectar Perfil a la identidad autenticada; nunca aceptar un user ID del navegador para autorización.
6. Preparar la interfaz de constancia para estado pendiente/disponible sin inventar archivos.
7. Añadir auditoría mínima y revalidación de vistas afectadas.

## Validación automatizada

- [ ] Tests de RLS: alumno propio/ajeno, admin y anónimo.
- [ ] Tests de duplicado, concurrencia y transición inválida.
- [ ] Tests de serialización sin campos privados de otros usuarios.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

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

