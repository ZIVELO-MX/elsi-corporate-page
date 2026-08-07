import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("the screenshot workflow isolates credentials from install and build", () => {
  const workflow = read(".github/workflows/publish-mission-screenshots.yml");
  const credentialStep = workflow.slice(
    workflow.indexOf("- name: Check publication credentials"),
    workflow.indexOf("- name: Resolve screenshot request"),
  );
  const buildStep = workflow.slice(
    workflow.indexOf("- name: Build screenshot application"),
    workflow.indexOf("- name: Capture and publish screenshots"),
  );
  const publishStep = workflow.slice(
    workflow.indexOf("- name: Capture and publish screenshots"),
    workflow.indexOf("- name: Comment on pull request"),
  );

  assert.match(credentialStep, /ZIPFORM_TOKEN: \$\{\{ secrets\.ZIPFORM_TOKEN \}\}/);
  assert.doesNotMatch(buildStep, /ZIPFORM_TOKEN/);
  assert.match(publishStep, /ZIPFORM_TOKEN: \$\{\{ secrets\.ZIPFORM_TOKEN \}\}/);
  assert.ok(
    workflow.indexOf("pnpm install --frozen-lockfile") <
      workflow.indexOf("- name: Capture and publish screenshots"),
  );
});

test("the screenshot workflow uses structured PR metadata and idempotent comments", () => {
  const workflow = read(".github/workflows/publish-mission-screenshots.yml");

  assert.match(workflow, /types: \[opened, synchronize, reopened, edited\]/);
  assert.match(workflow, /node scripts\/screenshots\/resolve-pr\.mjs/);
  assert.match(workflow, /MISSION_DISPLAY_ID:/);
  assert.match(workflow, /SCREENSHOT_PROFILE:/);
  assert.match(workflow, /<!-- elsi-mission-screenshots -->/);
  assert.match(workflow, /issues\.updateComment/);
  assert.doesNotMatch(workflow, /TLOZ_MISSION_ID/);
});

test("screenshot storage uses the generic group and respects Zipform's file limit", () => {
  const spec = read("tests/mission-screenshots.spec.ts");
  const targets = read("tests/mission-screenshot-targets.ts");

  assert.match(spec, /SCREENSHOT_GROUP_KEY = "Screenshots"/);
  assert.match(spec, /const groupKey = SCREENSHOT_GROUP_KEY/);
  assert.match(targets, /MAX_CAPTURE_COUNT = 20/);
  assert.match(spec, /toBeLessThanOrEqual\(MAX_CAPTURE_COUNT\)/);
});

test("basic CI validates every pull request without forcing a screenshot build", () => {
  const workflow = read(".github/workflows/ci.yml");

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /pnpm lint/);
  assert.match(workflow, /pnpm typecheck/);
  assert.match(workflow, /pnpm test/);
  assert.doesNotMatch(workflow, /pnpm build|playwright/);
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
  assert.match(sales, /Stripe confirma un pago/);
  assert.doesNotMatch(sales, /Registrar venta/);
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
