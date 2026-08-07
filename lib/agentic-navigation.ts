export const CATALOG_CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "sost", label: "Sostenibilidad" },
  { key: "norm", label: "Normatividad" },
  { key: "hab", label: "Habilidades" },
] as const;

export type CatalogCategoryOption = { key: string; label: string };

export function buildCatalogCategories(
  courses: { cat?: string; category?: string; catLabel?: string }[],
): CatalogCategoryOption[] {
  const byKey = new Map<string, { label: string; sort: number }>();
  let nextSort = CATALOG_CATEGORIES.length;
  for (const course of courses) {
    const key = course.cat || course.category || course.catLabel;
    if (!key || byKey.has(key)) continue;
    const canonical = CATALOG_CATEGORIES.find(
      (item) => item.key !== "todos" && item.key === key,
    );
    byKey.set(key, {
      label: course.category || course.catLabel || key,
      sort: canonical ? CATALOG_CATEGORIES.indexOf(canonical) : nextSort++,
    });
  }
  return [
    { key: "todos", label: "Todos" },
    ...[...byKey.entries()]
      .map(([key, { label, sort }]) => ({ key, label, sort }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ key, label }) => ({ key, label })),
  ];
}

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
  knownKeys: readonly string[] = CATALOG_CATEGORIES.map((item) => item.key),
): string {
  return value && knownKeys.includes(value) ? value : "todos";
}

export function normalizeCatalogQuery(value: string | undefined) {
  return value?.trim().slice(0, 80) ?? "";
}

export function buildCatalogPath({
  category = "todos",
  query = "",
}: {
  category?: string;
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
