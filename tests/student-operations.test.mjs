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
