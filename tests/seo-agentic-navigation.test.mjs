import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";
import {
  buildCatalogPath,
  buildContactPath,
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

  assert.ok(courses.every((course) => course.contentStatus === "fixture"));
  assert.equal(
    [...solutions.matchAll(/contentStatus: "fixture",/g)].length,
    3,
  );
  assert.match(sitemap, /getVerifiedCourses/);
  assert.match(sitemap, /getVerifiedSolutions/);
  assert.doesNotMatch(sitemap, /new Date\(\)/);
  assert.match(courseDetail, /isCourseVerified/);
  assert.match(solutionDetail, /isSolutionVerified/);
});

test("contact and catalog remain useful without client-side navigation", () => {
  const contact = read("app/contacto/page.tsx");
  const form = read("components/public-contact-form.tsx");
  const catalog = read("app/cursos/page.tsx");

  assert.doesNotMatch(contact, /"use client"/);
  assert.doesNotMatch(contact, /useSearchParams|Suspense/);
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
  assert.match(read("app/layout.tsx"), /manifest: "\/manifest\.webmanifest"/);
  assert.match(read("package.json"), /"audit:seo"/);
  assert.match(read(".github/workflows/seo.yml"), /pnpm audit:seo/);
  assert.match(read(".env.example"), /NEXT_PUBLIC_CONTENT_STATUS=fixture/);
  assert.match(read(".env.example"), /NEXT_PUBLIC_SITE_URL=/);
});
