import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("the screenshot workflow exposes Zipform credentials only to publication", () => {
  const workflow = read(".github/workflows/publish-mission-screenshots.yml");
  const jobConfiguration = workflow.slice(workflow.indexOf("jobs:"), workflow.indexOf("    steps:"));
  const publishStep = workflow.slice(
    workflow.indexOf("- name: Capture and publish screenshots"),
    workflow.indexOf("- name: Comment mission URL on PR"),
  );

  assert.doesNotMatch(jobConfiguration, /ZIPFORM_TOKEN/);
  assert.match(publishStep, /ZIPFORM_TOKEN: \$\{\{ secrets\.ZIPFORM_TOKEN \}\}/);
  assert.ok(workflow.indexOf("pnpm install --frozen-lockfile") < workflow.indexOf("ZIPFORM_TOKEN"));
});

test("unauthenticated profile visits render a stable login action", () => {
  const profile = read("app/profile/page.tsx");

  assert.doesNotMatch(profile, /useRouter|router\.replace/);
  assert.match(profile, /href="\/login"/);
  assert.match(profile, /Inicia sesión para ver tu perfil/);
});

test("admin derived collections avoid handler-only state and chained iterations", () => {
  const courses = read("app/admin/cursos/page.tsx");
  const enrollments = read("app/admin/inscripciones/page.tsx");
  const sales = read("app/admin/ventas/page.tsx");

  assert.match(courses, /const initialFormRef = useRef/);
  assert.doesNotMatch(courses, /setInitialForm/);
  assert.match(enrollments, /const selectableUsers = useMemo/);
  assert.match(enrollments, /const activeCourses = useMemo/);
  assert.match(enrollments, /filtered\.flatMap/);
  assert.match(sales, /const selectableUsers = useMemo/);
  assert.match(sales, /const activeCourses = useMemo/);
});

test("admin metadata remains at least twelve pixels", () => {
  const adminSources = [
    "app/admin/contenido/page.tsx",
    "app/admin/cursos/page.tsx",
    "app/admin/inscripciones/page.tsx",
    "app/admin/page.tsx",
    "app/admin/usuarios/page.tsx",
  ].map(read).join("\n");

  assert.doesNotMatch(adminSources, /0\.6875rem/);
});

test("wireframes use Next links and module-scoped status styles", () => {
  const wireframes = read("app/profile/wireframes/page.tsx");

  assert.match(wireframes, /const STATUS_COLORS/);
  assert.doesNotMatch(wireframes, /const colors =/);
  assert.doesNotMatch(wireframes, /<a href="\/(profile|register)"/);
  assert.match(wireframes, /<Link href="\/profile"/);
  assert.match(wireframes, /<Link href="\/register"/);
});

test("PostCSS exports a named configuration", () => {
  const postcss = read("postcss.config.mjs");

  assert.match(postcss, /const postcssConfig =/);
  assert.match(postcss, /export default postcssConfig/);
});
