import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("profile endpoint scopes Supabase data to the authenticated user", async () => {
  const source = await read("app/api/profile/route.ts");
  assert.match(source, /auth\.getUser/);
  assert.match(source, /eq\("user_id", auth\.user\.id\)/);
  assert.match(source, /certificates/);
  assert.match(source, /No autenticado/);
});

test("enrollment mutations require admin and enforce idempotent source/status contracts", async () => {
  const [collection, item] = await Promise.all([read("app/api/admin/enrollments/route.ts"), read("app/api/admin/enrollments/[id]/route.ts")]);
  assert.match(collection, /requireAdminClient/);
  assert.match(await read("lib/admin-auth.ts"), /auth\.getUser[\s\S]*profiles[\s\S]*role.*admin/);
  assert.match(item, /auth\.getUser[\s\S]*profiles[\s\S]*role.*admin/);
  assert.match(collection, /23505/);
  assert.match(collection, /internal.*external/);
  assert.match(item, /in_progress.*completed/);
});

test("admin enrollment screen uses persistent endpoints without mutation fallbacks", async () => {
  const source = await read("app/admin/inscripciones/page.tsx");
  assert.match(source, /useAdminCollection<PersistedEnrollment>/);
  assert.match(source, /useAdminCollection<AdminUser>/);
  assert.match(source, /useAdminCollection<PersistedCourse>/);
  assert.match(source, /method: "POST"/);
  assert.match(source, /method: "PATCH"/);
  assert.match(source, /enrollmentCollection\.items\.map/);
  assert.match(source, /Array\.isArray\(row\.certificates\)/);
  assert.doesNotMatch(source, /addEnrollment|completeEnrollment|markCertificateAvailable/);
});

test("admin users endpoint and screen use Supabase data without exposing service role", async () => {
  const [route, screen] = await Promise.all([read("app/api/admin/users/route.ts"), read("app/admin/usuarios/page.tsx")]);
  assert.match(route, /createSupabaseAdminClient/);
  assert.match(route, /auth\.admin\.listUsers/);
  assert.match(route, /role/);
  assert.match(route, /profile\.role === "admin" \? "admin" as const : "user" as const/);
  assert.match(screen, /\/api\/admin\/users\?/);
  assert.match(screen, /useAdminCollection<AdminUser>/);
});

test("certificate storage stays private and owner-scoped", async () => {
  const [upload, download, publish, migration, screen] = await Promise.all([
    read("app/api/admin/enrollments/[id]/certificate/route.ts"),
    read("app/api/certificates/[id]/download/route.ts"),
    read("app/api/admin/certificates/[id]/route.ts"),
    read("supabase/migrations/20260804000000_certificates_storage.sql"),
    read("app/admin/inscripciones/page.tsx"),
  ]);
  assert.match(upload, /createSupabaseAdminClient/);
  assert.match(upload, /application\/pdf/);
  assert.match(upload, /MAX_BYTES/);
  assert.match(upload, /storage\.from/);
  assert.match(upload, /status: "pending"/);
  assert.match(download, /enrollment\.user_id !== auth\.user\.id/);
  assert.match(download, /createSignedUrl/);
  assert.match(download, /NextResponse\.redirect/);
  assert.match(publish, /Primero carga el archivo/);
  assert.match(migration, /public = false/);
  assert.match(screen, /\/api\/admin\/enrollments\/\$\{e\.id\}\/certificate/);
});

test("Supabase audit events record actor and resource changes without payload PII", async () => {
  const migration = await read("supabase/migrations/20260805000000_audit_events.sql");
  assert.match(migration, /create table if not exists public\.audit_events/);
  assert.match(migration, /actor_id uuid/);
  assert.match(migration, /resource_type text/);
  assert.match(migration, /security definer/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /audit_row_change/);
  assert.match(migration, /to_regclass/);
  assert.doesNotMatch(migration, /email|message|full_name/);
});

test("RLS smoke test documents hosted student/admin isolation without secrets", async () => {
  const smoke = await read("supabase/tests/rls-smoke.sql");
  const readme = await read("supabase/README.md");
  assert.match(smoke, /set local role authenticated/);
  assert.match(smoke, /request\.jwt\.claim\.sub/);
  assert.match(smoke, /student_foreign_enrollments/);
  assert.match(smoke, /student_foreign_profiles/);
  assert.match(smoke, /admin_audit_events_visible/);
  assert.match(smoke, /admin_summary_visible/);
  assert.match(smoke, /rollback/);
  assert.match(readme, /Smoke test de RLS/);
  assert.doesNotMatch(smoke, /service_role|SUPABASE_SERVICE_ROLE_KEY/);
});

test("hosted student operations smoke creates isolated records and cleans them up", async () => {
  const smoke = await read("scripts/smoke-student-operations.mjs");
  assert.match(smoke, /SUPABASE_RLS_ALLOW_REMOTE=true/);
  assert.match(smoke, /createUser\("student-a"/);
  assert.match(smoke, /createUser\("student-b"/);
  assert.match(smoke, /update\(\{ role: "admin" \}\)/);
  assert.match(smoke, /from\("enrollments"\)/);
  assert.match(smoke, /student-b ve la inscripción/);
  assert.match(smoke, /status: "completed"/);
  assert.match(smoke, /status: "available"/);
  assert.match(smoke, /finally/);
  assert.match(smoke, /deleteUser\(user\.id\)/);
});
