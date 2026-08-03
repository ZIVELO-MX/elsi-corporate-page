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
  for (const source of [collection, item]) {
    assert.match(source, /auth\.getUser/);
    assert.match(source, /profiles/);
    assert.match(source, /role.*admin/);
  }
  assert.match(collection, /23505/);
  assert.match(collection, /internal.*external/);
  assert.match(item, /in_progress.*completed/);
});

test("admin enrollment screen uses persistent endpoints with fixture fallback", async () => {
  const source = await read("app/admin/inscripciones/page.tsx");
  assert.match(source, /fetch\("\/api\/admin\/enrollments"\)/);
  assert.match(source, /method: "POST"/);
  assert.match(source, /method: "PATCH"/);
  assert.match(source, /persistedEnrollments \?\? enrollments/);
});

test("admin users endpoint and screen use Supabase data without exposing service role", async () => {
  const [route, screen] = await Promise.all([read("app/api/admin/users/route.ts"), read("app/admin/usuarios/page.tsx")]);
  assert.match(route, /createSupabaseAdminClient/);
  assert.match(route, /auth\.admin\.listUsers/);
  assert.match(route, /role/);
  assert.match(screen, /fetch\("\/api\/admin\/users"\)/);
  assert.match(screen, /persistedUsers \?\? users/);
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
  assert.doesNotMatch(migration, /email|message|full_name/);
});

test("RLS smoke test documents hosted student/admin isolation without secrets", async () => {
  const smoke = await read("supabase/tests/rls-smoke.sql");
  const readme = await read("supabase/README.md");
  assert.match(smoke, /set local role authenticated/);
  assert.match(smoke, /request\.jwt\.claim\.sub/);
  assert.match(smoke, /student_foreign_enrollments/);
  assert.match(smoke, /admin_audit_events_visible/);
  assert.match(smoke, /rollback/);
  assert.match(readme, /Smoke test de RLS/);
  assert.doesNotMatch(smoke, /service_role|SUPABASE_SERVICE_ROLE_KEY/);
});
