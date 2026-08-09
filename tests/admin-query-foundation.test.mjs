import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { adminPage, parseAdminQuery } from "../lib/admin-query.ts";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("admin pagination remains bounded and addresses records beyond the first 100", () => {
  const request = new Request("https://elsi.test/api/admin/users?page=5&pageSize=25&sort=created_at&direction=desc&q=ana");
  const query = parseAdminQuery(request, ["created_at", "full_name"], "created_at");
  assert.equal(query.from, 100);
  assert.equal(query.to, 124);
  assert.equal(query.search, "ana");
  assert.equal(query.ascending, false);
  assert.deepEqual(adminPage(Array.from({ length: 25 }, (_, index) => index + 101), 137, query).pagination, {
    page: 5,
    pageSize: 25,
    total: 137,
    totalPages: 6,
  });

  const capped = parseAdminQuery(new Request("https://elsi.test/api/admin/users?pageSize=1000"), ["created_at"], "created_at");
  assert.equal(capped.pageSize, 100);
});

test("admin list routes share exact counts, server filters, stable order, and ranges", async () => {
  const routes = await Promise.all([
    "courses", "users", "enrollments", "orders", "leads", "testimonials",
  ].map((resource) => read(`app/api/admin/${resource}/route.ts`)));
  for (const route of routes) {
    assert.match(route, /parseAdminQuery/);
    assert.match(route, /count: "exact"/);
    assert.match(route, /\.order\(/);
    assert.match(route, /\.order\("id"/);
    assert.match(route, /\.range\(/);
    assert.match(route, /adminPage/);
  }
  assert.match(routes[0], /visibility/);
  assert.match(routes[1], /role/);
  assert.match(routes[2], /status[\s\S]*source[\s\S]*courseId/);
  assert.match(routes[3], /paid[\s\S]*pending/);
  assert.match(routes[4], /new[\s\S]*contacted[\s\S]*closed/);
});

test("dashboard consumes database aggregates instead of hydrating every collection", async () => {
  const [route, screen, shell] = await Promise.all([
    read("app/api/admin/summary/route.ts"),
    read("app/admin/page.tsx"),
    read("components/admin-shell.tsx"),
  ]);
  assert.match(route, /get_admin_summary/);
  assert.match(route, /limit\(4\)/);
  assert.match(screen, /\/api\/admin\/summary/);
  assert.doesNotMatch(shell, /AdminDataProvider/);
});

test("admin query migration synchronizes identity and adds indexed operational metadata", async () => {
  const [migration, types] = await Promise.all([
    read("supabase/migrations/20260814000000_admin_query_foundation.sql"),
    read("lib/supabase/types.ts"),
  ]);
  assert.match(migration, /add column if not exists email text/);
  assert.match(migration, /on_auth_user_identity_updated/);
  assert.match(migration, /profiles_email_unique_idx/);
  assert.match(migration, /category text not null default 'General'/);
  assert.match(migration, /payment_method[\s\S]*payment_reference[\s\S]*reviewed_at/);
  assert.match(migration, /original_filename[\s\S]*mime_type[\s\S]*size_bytes/);
  assert.match(migration, /assigned_to[\s\S]*resolved_at[\s\S]*admin_notes/);
  assert.match(migration, /get_admin_summary[\s\S]*security invoker/);
  assert.match(types, /email: string \| null/);
  assert.match(types, /get_admin_summary/);
});

test("enrollment responses resolve user and course data on the server without synthetic names", async () => {
  const [route, screen] = await Promise.all([
    read("app/api/admin/enrollments/route.ts"),
    read("app/admin/inscripciones/page.tsx"),
  ]);
  assert.match(route, /profileById/);
  assert.match(route, /courseById/);
  assert.match(route, /user: profileById/);
  assert.match(route, /course: courseById/);
  assert.doesNotMatch(route, /Alumno \$\{|Curso \$\{/);
  assert.doesNotMatch(screen, /Alumno \$\{|Curso \$\{/);
});
