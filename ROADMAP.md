# Roadmap ELSI Corporativo

## 1. Auditoria visual y contenido

- Revisar consistencia de tono corporativo, jerarquia visual y mensajes clave.
- Validar contraste, legibilidad, estados de foco y navegacion por teclado.
- Corregir sistema de botones: definir con claridad que variante es primaria, secundaria, outline e inverse.
- Corregir contraste de botones donde el fondo y la letra no se distinguen correctamente.
- Revisar especificamente el boton del header: actualmente se percibe con fondo azul oscuro y texto negro.
- Revisar especificamente el boton primario del hero: actualmente se percibe con fondo blanco y texto blanco.
- Confirmar que el boton primario real sea el de mayor jerarquia visual, no el secundario.
- Sustituir placeholders por imagenes libres o assets propios optimizados.
- Dar visto bueno a cada seccion antes de avanzar a ajustes finales.

## 2. Home

- Revisar hero, propuesta de valor, beneficios, cursos destacados, testimonios, FAQ y CTA.
- Ajustar botones del hero: mantener el secundario si funciona visualmente, pero corregir el primario para que tenga contraste claro.
- Revisar el CTA del formulario: actualmente se percibe bien, pero debe confirmarse si su variante visual corresponde a primario o secundario.
- Confirmar que el CTA use el mismo patron de formulario que Contacto.
- Verificar que Cursos destacados tenga buena jerarquia, imagenes correctas y CTA claro.
- Quitar el texto del carrusel "Servicio 1 de 6".
- Corregir botones del carrusel de servicios: deben tener hover visible y funcionar claramente como controles.
- Dar visto bueno seccion por seccion: Hero, Confianza, Beneficios, Cursos, Testimonios, FAQ y CTA.

## 3. Paginas internas

- Revisar Nosotros, Soluciones, Cursos, Detalle de curso, Contacto y Aviso de privacidad.
- Alinear estilos compartidos: encabezados, cards, formularios, botones, badges e imagenes.
- Confirmar que cada pagina mantenga una experiencia responsive correcta.
- Dar visto bueno a cada pagina antes de considerarla lista.

## 4. Accesibilidad y performance

- Validar contraste AA en texto, botones, badges y fondos.
- Validar contraste AA de todos los botones en estado normal, hover, active, focus y disabled.
- Revisar navegacion por teclado y foco visible en controles interactivos.
- Confirmar dimensiones, carga diferida y prioridad de imagenes segun posicion.
- Ejecutar build y revisar rutas principales.

## 5. Cierre

- Hacer una revision final en escritorio y movil.
- Resolver observaciones pendientes del visto bueno por seccion.
- Eliminar el acceso temporal por `?sections=1` / `?sections=0` antes de entregar el producto; las etiquetas de seccion deben quedar disponibles solo para builds/dev runs especificos como `dev:sections` mientras esten en fase de revision.
- Preparar commit inicial con el estado aprobado del sitio.
