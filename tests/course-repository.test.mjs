import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("course repository validates canonical inputs and protects publication", async () => {
  const repo = await read("lib/courses-repository.ts");
  assert.match(repo, /Slug inválido/);
  assert.match(repo, /Precio inválido/);
  assert.match(repo, /content_status.*verified/);
  assert.match(repo, /is_active.*true/);
});

test("course admin routes require an authenticated admin and soft-delete", async () => {
  const [collection, item] = await Promise.all([read("app/api/admin/courses/route.ts"), read("app/api/admin/courses/[id]/route.ts")]);
  for (const source of [collection, item]) {
    assert.match(source, /auth\.getUser/);
    assert.match(source, /profiles/);
    assert.match(source, /role.*admin/);
  }
  assert.match(item, /is_active: false/);
  assert.match(collection, /revalidatePath\("\/sitemap\.xml"\)/);
  assert.match(item, /revalidatePath\("\/cursos"\)/);
});

test("public catalog and detail use fixtures only when Supabase is unavailable", async () => {
  const [catalog, detail] = await Promise.all([read("app/cursos/page.tsx"), read("app/cursos/[slug]/page.tsx")]);
  assert.match(catalog, /listPublicCourses/);
  assert.match(catalog, /persisted === null \? getPublicCourses\(\) : persisted/);
  assert.match(detail, /getPublicCourse\(slug\)/);
  assert.match(detail, /persisted === null \? getPublicCourseBySlug\(slug\) : persisted/);
  assert.match(detail, /persisted === null \? getPublicCourses\(\) : persisted/);
});
