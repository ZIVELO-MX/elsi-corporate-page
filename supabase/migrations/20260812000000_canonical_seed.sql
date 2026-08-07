-- Canonical editorial content for the public site (ELS go-live).
-- Source of truth: data/courses.json, lib/solutions.ts, lib/about.ts and the
-- approved page-section copy. Every row is 'verified' and active so the public
-- RLS policies expose it immediately.
-- No testimonials: ELSI has not provided consent / attribution for quotes yet.
-- Idempotent: ON CONFLICT DO NOTHING keeps every deployment rerunnable.

insert into public.courses (
  slug,
  title,
  short_description,
  description,
  duration_hours,
  audience,
  syllabus,
  modality,
  price_cents,
  currency,
  content_status,
  is_active,
  created_at
)
values
(
  'manejo-integral-de-residuos',
  'Manejo Integral de Residuos',
  'Marco legal, clasificación, economía circular y elaboración de planes de manejo, con constancia oficial DC-3.',
  'Marco legal, clasificación, economía circular y elaboración de planes de manejo, con constancia oficial DC-3.',
  4,
  'Estudiantes de licenciatura y posgrado de ingeniería ambiental, química, civil y carreras afines.',
  jsonb_build_object(
    'category', 'Habilidades ambientales',
    'moduleList', jsonb_build_array(
      'Marco Legal',
      'Distribución de Competencias',
      'Clasificación de los Residuos',
      'Manejo Integral de los Residuos',
      'Plan de Manejo',
      'Economía Circular',
      'Sanciones'
    ),
    'curriculum', 'Marco Legal' || E'\n'
      || 'Distribución de Competencias' || E'\n'
      || 'Clasificación de los Residuos' || E'\n'
      || 'Manejo Integral de los Residuos' || E'\n'
      || 'Plan de Manejo' || E'\n'
      || 'Economía Circular' || E'\n'
      || 'Sanciones',
    'certificateType', 'DC-3',
    'publishState', 'published',
    'presencialInfo', ''
  ),
  'online',
  55000,
  'MXN',
  'verified',
  true,
  '2026-08-12T09:00:00Z'
),
(
  'fundamentos-de-educacion-ambiental',
  'Fundamentos de Educación Ambiental',
  'Bases de la educación y concientización ambiental: cómo diseñar mensajes y actividades que realmente cambian comportamientos.',
  'Bases de la educación y concientización ambiental: cómo diseñar mensajes y actividades que realmente cambian comportamientos.',
  null,
  'Docentes, promotores comunitarios y estudiantes.',
  jsonb_build_object(
    'category', 'Sostenibilidad',
    'moduleList', jsonb_build_array(
      'Por qué la mayoría de las campañas ambientales fallan',
      'Diseña un mensaje que sí cambie comportamientos',
      'Planea un taller que la gente termine',
      'Comunica el impacto para que se entienda en 10 segundos',
      'Mide si tu programa realmente funcionó',
      'Presenta tu proyecto final y recibe retroalimentación'
    ),
    'curriculum', 'Por qué la mayoría de las campañas ambientales fallan' || E'\n'
      || 'Diseña un mensaje que sí cambie comportamientos' || E'\n'
      || 'Planea un taller que la gente termine' || E'\n'
      || 'Comunica el impacto para que se entienda en 10 segundos' || E'\n'
      || 'Mide si tu programa realmente funcionó' || E'\n'
      || 'Presenta tu proyecto final y recibe retroalimentación',
    'certificateType', 'Constancia de participación',
    'publishState', 'published',
    'presencialInfo', ''
  ),
  'online',
  0,
  'MXN',
  'verified',
  true,
  '2026-08-12T08:00:00Z'
)
on conflict (slug) do nothing;

insert into public.page_sections (section_key, title, body, is_active, sort_order)
values
  (
    'hero',
    'Portada',
    '{"text":"ELSI crea rutas de formación y acompañamiento para organizaciones, comunidades e instituciones educativas."}'::jsonb,
    true,
    10
  ),
  (
    'value-prop',
    'Propuesta de valor',
    '{"text":"Bee Blue reunió educación ambiental, participación universitaria y trabajo de campo. ELSI continúa esa trayectoria mediante experiencias que conectan conocimiento y contexto."}'::jsonb,
    true,
    20
  ),
  (
    'faq',
    'Preguntas frecuentes',
    '{"text":"Estas respuestas describen el proceso general. El alcance específico se confirma en cada propuesta."}'::jsonb,
    true,
    30
  ),
  (
    'cta',
    'Llamado a la acción',
    '{"text":"Comparte tus datos y el contexto general. ELSI podrá orientar la solución, curso o programa adecuado."}'::jsonb,
    true,
    40
  ),
  (
    'solutions-intro',
    'Introducción a soluciones',
    '{"text":"Cada capítulo responde a un contexto distinto. Elige entre formación, acompañamiento técnico o experiencias para comunidades universitarias."}'::jsonb,
    true,
    50
  ),
  (
    'about-title',
    'Título institucional',
    '{"text":"De Bee Blue a ELSI."}'::jsonb,
    true,
    60
  ),
  (
    'about-intro',
    'Introducción institucional',
    '{"text":"ELSI nace de un movimiento universitario que conectó educación ambiental, comunidad y acción."}'::jsonb,
    true,
    70
  ),
  (
    'about-journey',
    'Título de la trayectoria',
    '{"text":"Una iniciativa que amplió su alcance"}'::jsonb,
    true,
    80
  ),
  (
    'about-principles',
    'Título de principios',
    '{"text":"Principios para orientar cada proyecto"}'::jsonb,
    true,
    90
  )
on conflict (section_key) do nothing;

insert into public.solutions (slug, title, summary, body, content_status, is_active, sort_order)
values
  (
    'capacitacion',
    'Capacitación',
    'Programas prácticos para equipos, comunidades y jóvenes.',
    jsonb_build_object(
      'eyebrow', 'Aprender para actuar',
      'audience', 'Equipos, comunidades y jóvenes',
      'imageCaption', 'Jornada de aprendizaje práctico con voluntariado universitario.',
      'intro', 'Diseñamos experiencias formativas claras, aplicables y cercanas para que cada participante pueda convertir el conocimiento ambiental en acciones concretas.',
      'approach', 'Partimos del contexto, el perfil de las personas y el resultado de aprendizaje esperado. Con esa información definimos una ruta breve, materiales de apoyo y una forma clara de revisar lo aprendido.',
      'delivery', 'El alcance, la modalidad y el calendario se acuerdan antes de iniciar. Cada propuesta distingue lo incluido de cualquier servicio adicional.',
      'items', jsonb_build_array(
        'Talleres presenciales y en línea',
        'Formación de facilitadores ambientales',
        'Programas para jóvenes y comunidades',
        'Certificaciones en educación ambiental'
      )
    ),
    'verified',
    true,
    1
  ),
  (
    'soluciones-ambientales',
    'Soluciones ambientales',
    'Acompañamiento para convertir retos ambientales en planes claros.',
    jsonb_build_object(
      'eyebrow', 'Ordenar el reto',
      'audience', 'Organizaciones e instituciones',
      'imageCaption', 'Recorrido técnico en instalaciones industriales.',
      'intro', 'Acompañamos a organizaciones que necesitan ordenar sus prioridades ambientales, documentar procesos y avanzar con una ruta técnica comprensible.',
      'approach', 'Comenzamos por delimitar el reto y reunir la información disponible. Después organizamos prioridades y entregables para que el equipo pueda tomar decisiones con una secuencia comprensible.',
      'delivery', 'La propuesta define responsables, documentos y puntos de revisión. No se presentan resultados ni certificaciones antes de contar con evidencia del proyecto.',
      'items', jsonb_build_array(
        'Diagnóstico y evaluación ambiental',
        'Planes de manejo de residuos',
        'Cumplimiento normativo y permisos',
        'Estrategias de sostenibilidad empresarial'
      )
    ),
    'verified',
    true,
    2
  ),
  (
    'educacion-universitaria',
    'Educación universitaria',
    'Talleres y experiencias que despiertan una participación activa.',
    jsonb_build_object(
      'eyebrow', 'Activar la comunidad',
      'audience', 'Instituciones y comunidades universitarias',
      'imageCaption', 'Comunidad universitaria durante un programa de liderazgo.',
      'intro', 'Creamos espacios de aprendizaje para comunidades universitarias que buscan participar, proponer y ejecutar proyectos con impacto ambiental.',
      'approach', 'Diseñamos la experiencia con la institución y el grupo participante, conectando el tema ambiental con actividades que puedan llevarse al campus o a la comunidad.',
      'delivery', 'El formato puede adaptarse a conferencia, taller o programa. La disponibilidad y los resultados esperados se confirman con cada institución.',
      'items', jsonb_build_array(
        'Conferencias y talleres en campus',
        'Programas de liderazgo ambiental',
        'Vinculación con organizaciones ambientales',
        'Proyectos de impacto comunitario'
      )
    ),
    'verified',
    true,
    3
  )
on conflict (slug) do nothing;
