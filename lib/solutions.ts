type SolutionDefinition = {
  slug: "capacitacion" | "soluciones-ambientales" | "educacion-universitaria";
  title: string;
  eyebrow: string;
  description: string;
  audience: string;
  imageCaption: string;
  layout: "learning" | "technical" | "campus";
  items: readonly string[];
  intro: string;
  approach: string;
  delivery: string;
};

export const solutions = [
  {
    slug: "capacitacion",
    title: "Capacitación",
    eyebrow: "Aprender para actuar",
    description: "Programas prácticos para equipos, comunidades y jóvenes.",
    audience: "Equipos, comunidades y jóvenes",
    imageCaption: "Jornada de aprendizaje práctico con voluntariado universitario.",
    layout: "learning",
    items: [
      "Talleres presenciales y en línea",
      "Formación de facilitadores ambientales",
      "Programas para jóvenes y comunidades",
      "Certificaciones en educación ambiental",
    ],
    intro: "Diseñamos experiencias formativas claras, aplicables y cercanas para que cada participante pueda convertir el conocimiento ambiental en acciones concretas.",
    approach: "Partimos del contexto, el perfil de las personas y el resultado de aprendizaje esperado. Con esa información definimos una ruta breve, materiales de apoyo y una forma clara de revisar lo aprendido.",
    delivery: "El alcance, la modalidad y el calendario se acuerdan antes de iniciar. Cada propuesta distingue lo incluido de cualquier servicio adicional.",
  },
  {
    slug: "soluciones-ambientales",
    title: "Soluciones ambientales",
    eyebrow: "Ordenar el reto",
    description: "Acompañamiento para convertir retos ambientales en planes claros.",
    audience: "Organizaciones e instituciones",
    imageCaption: "Recorrido técnico en instalaciones industriales.",
    layout: "technical",
    items: [
      "Diagnóstico y evaluación ambiental",
      "Planes de manejo de residuos",
      "Cumplimiento normativo y permisos",
      "Estrategias de sostenibilidad empresarial",
    ],
    intro: "Acompañamos a organizaciones que necesitan ordenar sus prioridades ambientales, documentar procesos y avanzar con una ruta técnica comprensible.",
    approach: "Comenzamos por delimitar el reto y reunir la información disponible. Después organizamos prioridades y entregables para que el equipo pueda tomar decisiones con una secuencia comprensible.",
    delivery: "La propuesta define responsables, documentos y puntos de revisión. No se presentan resultados ni certificaciones antes de contar con evidencia del proyecto.",
  },
  {
    slug: "educacion-universitaria",
    title: "Educación universitaria",
    eyebrow: "Activar la comunidad",
    description: "Talleres y experiencias que despiertan una participación activa.",
    audience: "Instituciones y comunidades universitarias",
    imageCaption: "Comunidad universitaria durante un programa de liderazgo.",
    layout: "campus",
    items: [
      "Conferencias y talleres en campus",
      "Programas de liderazgo ambiental",
      "Vinculación con organizaciones ambientales",
      "Proyectos de impacto comunitario",
    ],
    intro: "Creamos espacios de aprendizaje para comunidades universitarias que buscan participar, proponer y ejecutar proyectos con impacto ambiental.",
    approach: "Diseñamos la experiencia con la institución y el grupo participante, conectando el tema ambiental con actividades que puedan llevarse al campus o a la comunidad.",
    delivery: "El formato puede adaptarse a conferencia, taller o programa. La disponibilidad y los resultados esperados se confirman con cada institución.",
  },
] as const satisfies readonly SolutionDefinition[];

export type Solution = (typeof solutions)[number];

export function getSolutionBySlug(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}
