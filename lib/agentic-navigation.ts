export const CATALOG_CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "sost", label: "Sostenibilidad" },
  { key: "norm", label: "Normatividad" },
  { key: "hab", label: "Habilidades" },
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number]["key"];

export const intentRoutes = [
  {
    href: "/soluciones/capacitacion",
    label: "Capacitar a mi equipo",
    description: "Talleres y programas para aplicar conocimiento ambiental.",
  },
  {
    href: "/soluciones/soluciones-ambientales",
    label: "Ordenar un reto ambiental",
    description: "Acompañamiento para definir prioridades y entregables.",
  },
  {
    href: "/soluciones/educacion-universitaria",
    label: "Activar una comunidad universitaria",
    description: "Experiencias para campus, grupos y proyectos comunitarios.",
  },
  {
    href: "/cursos",
    label: "Encontrar un curso",
    description: "Consulta temas, modalidad y disponibilidad.",
  },
] as const;

export function normalizeCatalogCategory(
  value: string | undefined,
): CatalogCategory {
  return CATALOG_CATEGORIES.some((category) => category.key === value)
    ? (value as CatalogCategory)
    : "todos";
}

export function normalizeCatalogQuery(value: string | undefined) {
  return value?.trim().slice(0, 80) ?? "";
}

export function buildCatalogPath({
  category = "todos",
  query = "",
}: {
  category?: CatalogCategory;
  query?: string;
}) {
  const params = new URLSearchParams();
  if (category !== "todos") params.set("categoria", category);
  if (query.trim()) params.set("q", query.trim());
  const suffix = params.toString();
  return suffix ? `/cursos?${suffix}` : "/cursos";
}

export function buildContactPath({
  course,
  solution,
}: {
  course?: string;
  solution?: string;
}) {
  const params = new URLSearchParams();
  if (course) params.set("curso", course);
  if (solution) params.set("solucion", solution);
  const suffix = params.toString();
  return suffix ? `/contacto?${suffix}` : "/contacto";
}
