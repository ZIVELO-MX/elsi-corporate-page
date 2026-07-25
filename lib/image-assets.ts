export type AvailableImageAsset = {
  status: "available";
  source: "fixture" | "client";
  src: string;
  alt: string;
};

export type PendingImageAsset = {
  status: "pending";
  alt: string;
};

export type ImageAsset = AvailableImageAsset | PendingImageAsset;

export const courseImages: Record<string, AvailableImageAsset> = {
  "fundamentos-de-educacion-ambiental": {
    status: "available",
    source: "fixture",
    src: "/images/course-1.webp",
    alt: "Estudiantes de la Universidad de Guanajuato armando filtros de agua caseros en un taller de educacion ambiental",
  },
  "cumplimiento-ambiental-para-empresas": {
    status: "available",
    source: "fixture",
    src: "/images/course-2.webp",
    alt: "Estudiantes en visita tecnica a una planta industrial de manufactura",
  },
  "liderazgo-ambiental-universitario": {
    status: "available",
    source: "fixture",
    src: "/images/course-3.webp",
    alt: "Discurso en evento academico de liderazgo ambiental en la Universidad de Guanajuato",
  },
  "gestion-de-residuos-industriales": {
    status: "available",
    source: "fixture",
    src: "/images/course-4.webp",
    alt: "Recorrido por instalaciones industriales con protocolo de sala limpia",
  },
  "impacto-ambiental-y-permisos": {
    status: "available",
    source: "fixture",
    src: "/images/course-5.webp",
    alt: "Grupo realizando trabajo de campo ambiental en zona forestal",
  },
  "comunicacion-de-sostenibilidad": {
    status: "available",
    source: "fixture",
    src: "/images/course-6.webp",
    alt: "Actividad de divulgacion y comunicacion ambiental con estudiantes",
  },
};

export const siteImages = {
  story: {
    status: "available",
    source: "fixture",
    src: "/images/story.webp",
    alt: "Equipo de Bee Blue celebrando con trofeo, el origen estudiantil de ELSI",
  },
} satisfies Record<string, AvailableImageAsset>;

export const solutionImages: Record<string, AvailableImageAsset> = {
  capacitacion: {
    status: "available",
    source: "fixture",
    src: "/images/solucion-capacitacion.webp",
    alt: "Voluntarios universitarios en una jornada de servicio comunitario",
  },
  "soluciones-ambientales": {
    status: "available",
    source: "fixture",
    src: "/images/solucion-ambientales.webp",
    alt: "Recorrido tecnico en instalaciones industriales con protocolo de sala limpia",
  },
  "educacion-universitaria": {
    status: "available",
    source: "fixture",
    src: "/images/solucion-educacion.webp",
    alt: "Estudiantes en ceremonia de juramentacion de un programa de liderazgo universitario",
  },
};

export function getCourseImage(slug: string, title: string): ImageAsset {
  return courseImages[slug] ?? {
    status: "pending",
    alt: `Imagen pendiente para el curso ${title}`,
  };
}
