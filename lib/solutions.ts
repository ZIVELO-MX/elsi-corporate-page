export const solutions = [
  {
    slug: "capacitacion",
    title: "Capacitación",
    description: "Programas prácticos para equipos, comunidades y jóvenes.",
    items: [
      "Talleres presenciales y en línea",
      "Formación de facilitadores ambientales",
      "Programas para jóvenes y comunidades",
      "Certificaciones en educación ambiental",
    ],
    intro: "Diseñamos experiencias formativas claras, aplicables y cercanas para que cada participante pueda convertir el conocimiento ambiental en acciones concretas.",
  },
  {
    slug: "soluciones-ambientales",
    title: "Soluciones ambientales",
    description: "Acompañamiento para convertir retos ambientales en planes claros.",
    items: [
      "Diagnóstico y evaluación ambiental",
      "Planes de manejo de residuos",
      "Cumplimiento normativo y permisos",
      "Estrategias de sostenibilidad empresarial",
    ],
    intro: "Acompañamos a organizaciones que necesitan ordenar sus prioridades ambientales, documentar procesos y avanzar con una ruta técnica comprensible.",
  },
  {
    slug: "educacion-universitaria",
    title: "Educación universitaria",
    description: "Talleres y experiencias que despiertan una participación activa.",
    items: [
      "Conferencias y talleres en campus",
      "Programas de liderazgo ambiental",
      "Vinculación con organizaciones ambientales",
      "Proyectos de impacto comunitario",
    ],
    intro: "Creamos espacios de aprendizaje para comunidades universitarias que buscan participar, proponer y ejecutar proyectos con impacto ambiental.",
  },
] as const;

export type Solution = (typeof solutions)[number];

export function getSolutionBySlug(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}
