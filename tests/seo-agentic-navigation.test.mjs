import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";
import {
  buildAgentNavigationManifest,
  buildCatalogPath,
  buildContactPath,
  buildLlmsText,
  normalizeCatalogCategory,
  normalizeCatalogQuery,
} from "../lib/agentic-navigation.ts";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("catalog filters normalize into stable, shareable URLs", () => {
  assert.equal(normalizeCatalogCategory("norm"), "norm");
  assert.equal(normalizeCatalogCategory("invalid"), "todos");
  assert.equal(normalizeCatalogQuery("  permisos  "), "permisos");
  assert.equal(
    buildCatalogPath({ category: "norm", query: "impacto ambiental" }),
    "/cursos?categoria=norm&q=impacto+ambiental",
  );
  assert.equal(buildCatalogPath({}), "/cursos");
});

test("contact routes preserve one validated resource intent", () => {
  assert.equal(
    buildContactPath({ course: "manejo-integral-de-residuos" }),
    "/contacto?curso=manejo-integral-de-residuos",
  );
  assert.equal(
    buildContactPath({ solution: "capacitacion" }),
    "/contacto?solucion=capacitacion",
  );
  assert.equal(buildContactPath({}), "/contacto");
});

test("agent discovery is stable, read-only, and excludes private routes", () => {
  const manifest = buildAgentNavigationManifest({
    siteUrl: "https://elsi.example.com",
    name: "ELSI",
    description: "Educación y soluciones ambientales.",
    language: "es-MX",
    indexingReady: true,
    courses: [{ slug: "residuos", title: "Residuos", description: "Gestión responsable.", category: "Normatividad", modality: "online" }],
    solutions: [{ slug: "capacitacion", title: "Capacitación", description: "Formación para equipos.", audience: "Empresas" }],
  });

  assert.equal(manifest.schemaVersion, "1.0");
  assert.equal(manifest.contentStatus, "verified");
  assert.ok(manifest.navigation.every((route) => route.url.startsWith("https://elsi.example.com/")));
  assert.ok(manifest.actions.every((action) => action.method === "GET" && action.readOnly));
  assert.equal(manifest.actions.find((action) => action.id === "request_information")?.requiresHumanConfirmation, true);
  assert.equal(manifest.resources.courses[0].url, "https://elsi.example.com/cursos/residuos");
  assert.equal(manifest.resources.solutions[0].contactUrl, "https://elsi.example.com/contacto?solucion=capacitacion");
  assert.doesNotMatch(JSON.stringify(manifest), /\/admin|\/profile|\/checkout|\/login|\/register/);

  const preview = buildAgentNavigationManifest({
    siteUrl: "https://elsi.example.com",
    name: "ELSI",
    description: "Vista previa.",
    language: "es-MX",
    indexingReady: false,
    courses: [{ slug: "fixture", title: "Fixture", description: "No publicar" }],
    solutions: [{ slug: "fixture", title: "Fixture", description: "No publicar" }],
  });
  assert.equal(preview.contentStatus, "preview");
  assert.deepEqual(preview.resources, { courses: [], solutions: [] });
});

test("agent discovery excludes administratively hidden public sections", () => {
  const manifest = buildAgentNavigationManifest({
    siteUrl: "https://elsi.example.com",
    name: "ELSI",
    description: "Educación y soluciones ambientales.",
    language: "es-MX",
    indexingReady: true,
    courses: [],
    solutions: [{ slug: "capacitacion", title: "Capacitación", description: "Formación para equipos." }],
    sectionVisibility: { aboutEnabled: false, servicesEnabled: false },
  });

  assert.ok(manifest.navigation.every((route) => route.href !== "/nosotros" && route.href !== "/soluciones"));
  assert.ok(manifest.intents.every((intent) => !intent.href.startsWith("/soluciones/")));
  assert.deepEqual(manifest.resources.solutions, []);
});

test("llms text follows the proposed format without claiming privileged actions", () => {
  const manifest = buildAgentNavigationManifest({
    siteUrl: "https://elsi.example.com",
    name: "ELSI",
    description: "Educación y soluciones ambientales.",
    language: "es-MX",
    indexingReady: false,
    courses: [],
    solutions: [],
  });
  const llms = buildLlmsText(manifest);
  assert.match(llms, /^# ELSI\n> /);
  assert.match(llms, /## Navegación principal/);
  assert.match(llms, /## Operaciones seguras/);
  assert.match(llms, /\/api\/navigation/);
  assert.match(llms, /No autoriza compras ni envíos automáticos/);
});

test("go-live indexing fails closed until every readiness signal exists", () => {
  const config = read("lib/site-config.ts");
  const seo = read("lib/seo.ts");

  assert.match(config, /contentStatus === "verified"/);
  assert.match(config, /hasVerifiedSiteUrl/);
  assert.match(config, /!prototypeMode/);
  assert.match(config, /indexingReady/);
  assert.match(seo, /export const indexable = siteConfig\.indexingReady/);
  assert.doesNotMatch(read("app/layout.tsx"), /alternates:\s*\{\s*canonical/);
});

test("fixture resources never enter production discovery surfaces", () => {
  const courses = JSON.parse(read("data/courses.json"));
  const solutions = read("lib/solutions.ts");
  const sitemap = read("app/sitemap.ts");
  const courseDetail = read("app/cursos/[slug]/page.tsx");
  const solutionDetail = read("app/soluciones/[slug]/page.tsx");
  const contentRepository = read("lib/content-repository.ts");

  assert.ok(courses.every((course) => course.contentStatus === "fixture"));
  assert.equal(
    [...solutions.matchAll(/contentStatus: "fixture",/g)].length,
    3,
  );
  assert.match(sitemap, /getVerifiedCourses/);
  assert.match(sitemap, /listPublicSolutions/);
  assert.match(sitemap, /Promise\.all/);
  assert.doesNotMatch(sitemap, /new Date\(\)/);
  assert.match(courseDetail, /isCourseVerified/);
  assert.match(solutionDetail, /isSolutionVerified/);
  assert.match(solutionDetail, /getPublicSolution/);
  assert.match(solutionDetail, /buildServiceJsonLd/);
  assert.match(contentRepository, /createSupabasePublicClient/);
});

test("contact and catalog remain useful without client-side navigation", () => {
  const contact = read("app/contacto/page.tsx");
  const form = read("components/public-contact-form.tsx");
  const catalog = read("app/cursos/page.tsx");

  assert.doesNotMatch(contact, /"use client"/);
  assert.doesNotMatch(contact, /useSearchParams|Suspense/);
  assert.match(contact, /getPublicCourse/);
  assert.match(contact, /getPublicSolution/);
  assert.match(contact, /Promise\.all/);
  assert.match(contact, /getPublicCourseBySlug/);
  assert.match(contact, /getPublicSolutionBySlug/);
  assert.match(form, /name="resourceType"/);
  assert.match(form, /name="resourceId"/);
  assert.match(catalog, /action="\/cursos"/);
  assert.match(catalog, /method="get"/);
  assert.match(catalog, /name="q"/);
  assert.match(catalog, /name="categoria"/);
});

test("private routes own explicit noindex metadata", () => {
  for (const path of [
    "app/admin/layout.tsx",
    "app/profile/layout.tsx",
    "app/login/layout.tsx",
    "app/register/layout.tsx",
    "app/checkout/page.tsx",
  ]) {
    assert.match(read(path), /buildPrivateMetadata/);
  }

  assert.doesNotMatch(read("app/robots.ts"), /INTERNAL_ROUTES/);
});

test("brand discovery assets and rendered audit are wired", () => {
  assert.ok(existsSync(resolve(process.cwd(), "app/manifest.ts")));
  assert.ok(existsSync(resolve(process.cwd(), "app/opengraph-image.tsx")));
  assert.ok(existsSync(resolve(process.cwd(), "app/not-found.tsx")));
  assert.ok(existsSync(resolve(process.cwd(), "app/error.tsx")));
  assert.ok(existsSync(resolve(process.cwd(), "app/llms.txt/route.ts")));
  assert.ok(existsSync(resolve(process.cwd(), "app/api/navigation/route.ts")));
  assert.match(read("app/layout.tsx"), /manifest: "\/manifest\.webmanifest"/);
  assert.match(read("app/layout.tsx"), /lang=\{SITE\.language\}/);
  assert.match(read("package.json"), /"audit:seo"/);
  assert.match(read(".github/workflows/seo.yml"), /pnpm audit:seo/);
  assert.match(read(".env.example"), /NEXT_PUBLIC_CONTENT_STATUS=fixture/);
  assert.match(read(".env.example"), /NEXT_PUBLIC_SITE_URL=/);
});

test("structured data covers search, FAQs, services, and canonical resources", () => {
  const seo = read("lib/seo.ts");
  const home = read("app/page.tsx");
  const solutions = read("app/soluciones/page.tsx");
  const layout = read("app/layout.tsx");
  const robots = read("app/robots.ts");

  assert.match(seo, /"@type": "SearchAction"/);
  assert.match(seo, /"@type": "FAQPage"/);
  assert.match(seo, /"@type": "Service"/);
  assert.match(seo, /"@type": "SiteNavigationElement"/);
  assert.match(seo, /"text\/plain": "\/llms\.txt"/);
  assert.match(seo, /"application\/json": "\/api\/navigation"/);
  assert.match(home, /buildFaqJsonLd\(homeFaqs\)/);
  assert.match(home, /buildSiteNavigationJsonLd\(visibleNavigation\)/);
  assert.match(solutions, /buildServiceListJsonLd\(publicSolutions\)/);
  assert.match(layout, /DISCOVERY_ALTERNATES/);
  assert.match(robots, /host: SITE\.url/);
});
