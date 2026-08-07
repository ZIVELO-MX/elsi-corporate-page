export type AvailableImageAsset = {
  status: "available";
  source: "fixture" | "client";
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type PendingImageAsset = {
  status: "pending";
  alt: string;
};

export type ImageAsset = AvailableImageAsset | PendingImageAsset;

export const courseImages: Record<string, AvailableImageAsset> = {
  "manejo-integral-de-residuos": {
    status: "available",
    source: "fixture",
    src: "/images/course-7.webp",
    alt: "Taller de manejo de residuos: clasificacion, economia circular y plan de manejo",
    width: 900,
    height: 600,
  },
  "fundamentos-de-educacion-ambiental": {
    status: "available",
    source: "fixture",
    src: "/images/course-1.webp",
    alt: "Estudiantes de la Universidad de Guanajuato armando filtros de agua caseros en un taller de educacion ambiental",
    width: 900,
    height: 600,
  },
  "cumplimiento-ambiental-para-empresas": {
    status: "available",
    source: "fixture",
    src: "/images/course-2.webp",
    alt: "Estudiantes en visita tecnica a una planta industrial de manufactura",
    width: 900,
    height: 600,
  },
  "liderazgo-ambiental-universitario": {
    status: "available",
    source: "fixture",
    src: "/images/course-3.webp",
    alt: "Discurso en evento academico de liderazgo ambiental en la Universidad de Guanajuato",
    width: 900,
    height: 600,
  },
  "gestion-de-residuos-industriales": {
    status: "available",
    source: "fixture",
    src: "/images/course-4.webp",
    alt: "Recorrido por instalaciones industriales con protocolo de sala limpia",
    width: 900,
    height: 600,
  },
  "impacto-ambiental-y-permisos": {
    status: "available",
    source: "fixture",
    src: "/images/course-5.webp",
    alt: "Grupo realizando trabajo de campo ambiental en zona forestal",
    width: 900,
    height: 600,
  },
  "comunicacion-de-sostenibilidad": {
    status: "available",
    source: "fixture",
    src: "/images/course-6.webp",
    alt: "Actividad de divulgacion y comunicacion ambiental con estudiantes",
    width: 900,
    height: 600,
  },
};

export const siteImages = {
  hero: {
    status: "available",
    source: "fixture",
    src: "/hero-bg.jpg",
    alt: "Paisaje boscoso junto a un lago, territorio natural que enmarca el trabajo ambiental de ELSI",
    width: 3840,
    height: 2160,
  },
  story: {
    status: "available",
    source: "fixture",
    src: "/images/story.webp",
    alt: "Equipo de Bee Blue celebrando con trofeo, el origen estudiantil de ELSI",
    width: 800,
    height: 600,
  },
} satisfies Record<string, AvailableImageAsset>;

export const solutionImages: Record<string, AvailableImageAsset> = {
  capacitacion: {
    status: "available",
    source: "fixture",
    src: "/images/solucion-capacitacion.webp",
    alt: "Voluntarios universitarios en una jornada de servicio comunitario",
    width: 1200,
    height: 700,
  },
  "soluciones-ambientales": {
    status: "available",
    source: "fixture",
    src: "/images/solucion-ambientales.webp",
    alt: "Recorrido tecnico en instalaciones industriales con protocolo de sala limpia",
    width: 1200,
    height: 700,
  },
  "educacion-universitaria": {
    status: "available",
    source: "fixture",
    src: "/images/solucion-educacion.webp",
    alt: "Estudiantes en ceremonia de juramentacion de un programa de liderazgo universitario",
    width: 1200,
    height: 700,
  },
};

export function getCourseImage(slug: string, title: string): ImageAsset {
  return courseImages[slug] ?? {
    status: "pending",
    alt: `Imagen pendiente para el curso ${title}`,
  };
}
