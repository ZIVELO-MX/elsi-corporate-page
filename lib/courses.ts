export type CourseModality = "online" | "presencial";
export type PublishState = "draft" | "published" | "upcoming" | "closed" | "pending";
// ELS-0013 §2.1: curriculum = tema → subtemas[]. Optional; falls back to moduleList[].
export type CurriculumTopic = { tema: string; subtemas?: string[] };

export type Course = {
  id: string;
  slug: string;
  title: string;
  category: string;
  cat: string;
  catLabel: string;
  duration: string;
  modules: number;
  status: string;
  students: number;
  price: number;
  description: string;
  moduleList: string[];
  curriculum?: CurriculumTopic[];
  // Canonical model fields (ELS-0013). Optional so legacy entries still type-check.
  durationType?: "time" | "modules";
  publishState?: PublishState;
  modality?: CourseModality;
  schedule?: { date: string; time: string };
  place?: string;
  priceLabel?: string;
  certificateType?: string;
  featured?: boolean;
  instructor?: { name: string; bio?: string };
  targetAudience?: string[];
  objectives?: string[];
  requirements?: string[];
};

import coursesData from "@/data/courses.json";

export function getAllCourses(): Course[] {
  return coursesData as Course[];
}

export function getCourseBySlug(slug: string): Course | undefined {
  return (coursesData as Course[]).find((c) => c.slug === slug);
}

export function money(n: number): string {
  return n === 0 ? "Gratis" : `$${n.toLocaleString("es-MX")} MXN`;
}

export function publishState(course: Course): PublishState {
  return course.publishState ?? (course.status === "Publicado" ? "published" : "draft");
}

// Badge label + primary CTA text per state (aligned to the approved wireframe).
export function stateMeta(course: Course): { label: string; cta: string; tone: "teal" | "purple" | "muted" } {
  const state = publishState(course);
  const free = course.price === 0;
  switch (state) {
    case "published": return { label: "Disponible", cta: free ? "Inscribirme gratis" : "Inscribirme", tone: "teal" };
    case "upcoming": return { label: "Próximo", cta: "Reservar lugar", tone: "purple" };
    case "closed": return { label: "Cupo lleno", cta: "Avísame si reabre", tone: "muted" };
    case "pending": return { label: "Fecha por confirmar", cta: "Más información", tone: "purple" };
    default: return { label: "Borrador", cta: "No disponible", tone: "muted" };
  }
}

export function modalityLabel(course: Course): string {
  return course.modality === "presencial" ? "Presencial" : "En línea";
}

// Certificate descriptor with any redundant leading "Constancia " stripped, so
// "Constancia {certType()}" / "Incluye constancia {certType()}" never double the word.
// Data is inconsistent: some entries store "DC-3", others "Constancia de participación".
export function certType(course: Course): string {
  return (course.certificateType ?? "").replace(/^constancia\s+/i, "");
}
