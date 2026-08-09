import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("managed content validates keys, strips untrusted markup and filters public data", async () => {
  const source = await read("lib/content-repository.ts");
  assert.match(source, /replace\(\/<\[\^>\]\*\>\/g/);
  assert.match(source, /is_active.*true/);
  assert.match(source, /content_status.*verified/);
  assert.match(source, /sort_order/);
});

test("content mutations require admin role and protect duplicate sections", async () => {
  const [content, item, testimonial, testimonialItem, solutionItem] = await Promise.all([
    read("app/api/admin/content/route.ts"),
    read("app/api/admin/content/[id]/route.ts"),
    read("app/api/admin/testimonials/route.ts"),
    read("app/api/admin/testimonials/[id]/route.ts"),
    read("app/api/admin/solutions/[id]/route.ts"),
  ]);
  for (const source of [content, item, testimonial, testimonialItem, solutionItem]) assert.match(source, /requireAdminContentClient/);
  assert.match(content, /23505/);
  assert.match(item, /update/);
  assert.match(testimonial, /validateTestimonial/);
  assert.match(testimonialItem, /export async function PATCH/);
  assert.match(testimonialItem, /export async function DELETE/);
  assert.match(solutionItem, /validateSolution/);
  assert.match(solutionItem, /revalidatePublicContent\(data\.slug\)/);
});

test("admin content screen hydrates from Supabase and persists section and solution edits", async () => {
  const source = await read("app/admin/contenido/page.tsx");
  assert.match(source, /fetch\("\/api\/admin\/content"/);
  assert.match(source, /\/api\/admin\/content\/\$\{section\.id\}/);
  assert.match(source, /persistedSections \?\? sections/);
  assert.match(source, /\/api\/admin\/solutions\/\$\{id\}/);
  assert.match(source, /Soluciones/);
  assert.match(source, /Guardar/);
  assert.match(source, /Cancelar/);
  assert.match(source, /role="alert"/);
});

test("testimonials require consent, may reference a course, and persist every CRUD action", async () => {
  const [repository, provider, screen, migration] = await Promise.all([
    read("lib/content-repository.ts"),
    read("lib/admin-data.tsx"),
    read("app/admin/testimonios/page.tsx"),
    read("supabase/migrations/20260813000000_admin_content_integrity.sql"),
  ]);
  assert.match(repository, /consentReference/);
  assert.match(repository, /course_id/);
  assert.match(repository, /obligatoria para publicar/);
  assert.match(provider, /method: "POST"/);
  assert.match(provider, /method: "PATCH"/);
  assert.match(provider, /method: "DELETE"/);
  assert.match(screen, /Referencia de consentimiento/);
  assert.match(screen, /Curso relacionado \(opcional\)/);
  assert.match(migration, /course_id uuid references public\.courses/);
  assert.match(migration, /testimonials_active_consent_check/);
});

test("public editorial pages prefer persisted content and invalidate public routes", async () => {
  const [repository, home, about, solutions, sitemap, api] = await Promise.all([
    read("lib/content-repository.ts"),
    read("app/page.tsx"),
    read("app/nosotros/page.tsx"),
    read("app/soluciones/page.tsx"),
    read("app/sitemap.ts"),
    read("app/api/admin/content/[id]/route.ts"),
  ]);
  assert.match(repository, /sectionText/);
  assert.match(repository, /mapPublicSolutions/);
  assert.match(repository, /revalidatePath\("\/soluciones"\)/);
  assert.match(home, /listPublicContent/);
  assert.match(home, /sectionText/);
  assert.match(about, /listPublicContent/);
  assert.match(solutions, /mapPublicSolutions/);
  assert.match(sitemap, /listPublicContent/);
  assert.match(api, /revalidatePublicContent/);
});
