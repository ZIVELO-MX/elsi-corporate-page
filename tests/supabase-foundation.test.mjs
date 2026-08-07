import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("Supabase foundation keeps schema, RLS, and secrets separated", async () => {
  const [migration, seed, browser, admin, env, packageJson, canonicalSeed] = await Promise.all([
    read("supabase/migrations/20260731000000_initial_schema.sql"),
    read("supabase/seed.sql"),
    read("lib/supabase/browser.ts"),
    read("lib/supabase/admin.ts"),
    read("lib/supabase/env.ts"),
    read("package.json").then(JSON.parse),
    read("supabase/migrations/20260812000000_canonical_seed.sql"),
  ]);

  for (const table of [
    "profiles",
    "courses",
    "enrollments",
    "certificates",
    "page_sections",
    "solutions",
    "solution_items",
    "testimonials",
    "contact_leads",
    "outbox_events",
    "orders",
  ]) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }

  assert.match(migration, /create or replace function public\.handle_new_user/);
  assert.match(migration, /role public\.app_role not null default 'student'/);
  assert.match(migration, /create policy courses_select_published/);
  assert.match(migration, /create policy enrollments_select_owner_or_admin/);
  assert.match(migration, /create policy contact_leads_admin_only/);
  assert.match(migration, /create table if not exists public\.orders/);
  assert.match(migration, /orders_select_owner_or_admin/);
  assert.doesNotMatch(seed, /insert into/i);
  assert.doesNotMatch(seed, /@|service_role/i);
  assert.match(canonicalSeed, /'verified'/);
  assert.match(canonicalSeed, /on conflict \(slug\) do nothing/);
  assert.doesNotMatch(canonicalSeed, /insert into public\.testimonials/i);

  assert.doesNotMatch(browser, /SERVICE_ROLE/);
  assert.match(admin, /getSupabaseServiceRoleKey/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(env, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.equal(packageJson.dependencies["@supabase/ssr"], "0.12.3");
  assert.equal(packageJson.dependencies["@supabase/supabase-js"], "2.110.8");
});
