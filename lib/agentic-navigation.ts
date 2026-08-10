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

export const AGENT_NAVIGATION_SCHEMA_VERSION = "1.0";

export const agentPublicRoutes = [
  { href: "/", label: "Inicio", description: "Presentación, rutas por intención y contacto inicial." },
  { href: "/soluciones", label: "Soluciones", description: "Capacitación, acompañamiento ambiental y educación universitaria." },
  { href: "/cursos", label: "Cursos", description: "Catálogo filtrable por texto y categoría." },
  { href: "/nosotros", label: "Nosotros", description: "Trayectoria, enfoque y forma de trabajo de ELSI." },
  { href: "/contacto", label: "Contacto", description: "Formulario para solicitar orientación con revisión humana." },
  { href: "/aviso-de-privacidad", label: "Privacidad", description: "Tratamiento y protección de datos personales." },
] as const;

export const agentActions = [
  {
    id: "search_courses",
    label: "Buscar cursos",
    method: "GET",
    href: "/cursos",
    readOnly: true,
    requiresHumanConfirmation: false,
    parameters: [
      { name: "q", description: "Texto libre de hasta 80 caracteres.", required: false },
      { name: "categoria", description: "Clave publicada en navigation.filters.categories.", required: false },
    ],
  },
  {
    id: "request_information",
    label: "Preparar una solicitud de información",
    method: "GET",
    href: "/contacto",
    readOnly: true,
    requiresHumanConfirmation: true,
    parameters: [
      { name: "curso", description: "Slug de un curso publicado.", required: false },
      { name: "solucion", description: "Slug de una solución publicada.", required: false },
    ],
  },
] as const;

type AgentCourse = {
  slug: string;
  title: string;
  description: string;
  category?: string;
  modality?: string;
};

type AgentSolution = {
  slug: string;
  title: string;
  description: string;
  audience?: string;
};

function absoluteAgentUrl(siteUrl: string, path: string) {
  return new URL(path, siteUrl).toString();
}

export function buildAgentNavigationManifest({
  siteUrl,
  name,
  description,
  language,
  indexingReady,
  courses,
  solutions,
  sectionVisibility = { aboutEnabled: true, servicesEnabled: true },
}: {
  siteUrl: string;
  name: string;
  description: string;
  language: string;
  indexingReady: boolean;
  courses: readonly AgentCourse[];
  solutions: readonly AgentSolution[];
  sectionVisibility?: {
    aboutEnabled: boolean;
    servicesEnabled: boolean;
  };
}) {
  const publishedCourses = indexingReady ? courses : [];
  const publishedSolutions = indexingReady && sectionVisibility.servicesEnabled ? solutions : [];
  const routeIsVisible = (href: string) => {
    if (href === "/nosotros") return sectionVisibility.aboutEnabled;
    if (href === "/soluciones" || href.startsWith("/soluciones/")) {
      return sectionVisibility.servicesEnabled;
    }
    return true;
  };

  return {
    schemaVersion: AGENT_NAVIGATION_SCHEMA_VERSION,
    name,
    description,
    baseUrl: absoluteAgentUrl(siteUrl, "/"),
    language,
    contentStatus: indexingReady ? "verified" : "preview",
    discovery: {
      llms: absoluteAgentUrl(siteUrl, "/llms.txt"),
      sitemap: absoluteAgentUrl(siteUrl, "/sitemap.xml"),
      robots: absoluteAgentUrl(siteUrl, "/robots.txt"),
    },
    policies: {
      readOnlyDiscovery: true,
      automaticContactSubmission: false,
      automaticPurchase: false,
      privateRoutesExcluded: true,
    },
    navigation: agentPublicRoutes.flatMap((route) =>
      routeIsVisible(route.href)
        ? [{ ...route, url: absoluteAgentUrl(siteUrl, route.href) }]
        : [],
    ),
    intents: intentRoutes.flatMap((intent) =>
      routeIsVisible(intent.href)
        ? [{ ...intent, url: absoluteAgentUrl(siteUrl, intent.href) }]
        : [],
    ),
    actions: agentActions.map((action) => ({
      ...action,
      url: absoluteAgentUrl(siteUrl, action.href),
    })),
    filters: {
      categories: CATALOG_CATEGORIES.map(({ key, label }) => ({ key, label })),
      query: { name: "q", maxLength: 80 },
    },
    resources: {
      courses: publishedCourses.map((course) => ({
        type: "course",
        ...course,
        url: absoluteAgentUrl(siteUrl, `/cursos/${course.slug}`),
        contactUrl: absoluteAgentUrl(siteUrl, buildContactPath({ course: course.slug })),
      })),
      solutions: publishedSolutions.map((solution) => ({
        type: "service",
        ...solution,
        url: absoluteAgentUrl(siteUrl, `/soluciones/${solution.slug}`),
        contactUrl: absoluteAgentUrl(siteUrl, buildContactPath({ solution: solution.slug })),
      })),
    },
  } as const;
}

export type AgentNavigationManifest = ReturnType<typeof buildAgentNavigationManifest>;

export function buildLlmsText(manifest: AgentNavigationManifest) {
  const lines = [
    `# ${manifest.name}`,
    `> ${manifest.description}`,
    "",
    `Idioma: ${manifest.language}`,
    `Estado editorial: ${manifest.contentStatus}`,
    "",
    "## Navegación principal",
    ...manifest.navigation.map((route) => `- [${route.label}](${route.url}): ${route.description}`),
    "",
    "## Rutas por intención",
    ...manifest.intents.map((intent) => `- [${intent.label}](${intent.url}): ${intent.description}`),
    "",
    "## Operaciones seguras",
    ...manifest.actions.map((action) =>
      `- ${action.label}: \`${action.method} ${action.url}\`${action.requiresHumanConfirmation ? "; requiere confirmación humana antes de enviar datos" : "; solo lectura"}.`,
    ),
  ];

  if (manifest.resources.courses.length > 0) {
    lines.push(
      "",
      "## Cursos verificados",
      ...manifest.resources.courses.map((course) => `- [${course.title}](${course.url}): ${course.description}`),
    );
  }
  if (manifest.resources.solutions.length > 0) {
    lines.push(
      "",
      "## Soluciones verificadas",
      ...manifest.resources.solutions.map((solution) => `- [${solution.title}](${solution.url}): ${solution.description}`),
    );
  }

  lines.push(
    "",
    "## Descubrimiento",
    `- [Sitemap XML](${manifest.discovery.sitemap})`,
    `- [Robots](${manifest.discovery.robots})`,
    `- [Manifiesto JSON](${new URL("/api/navigation", manifest.baseUrl).toString()})`,
    "",
    "## Límites",
    "- No incluye administración, cuenta, autenticación, checkout ni datos privados.",
    "- No autoriza compras ni envíos automáticos de formularios.",
    "- Los recursos dinámicos solo aparecen cuando el contenido y el dominio están verificados.",
  );

  return `${lines.join("\n")}\n`;
}

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
