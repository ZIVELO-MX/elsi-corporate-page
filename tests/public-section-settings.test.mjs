import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getVisiblePrimaryNavigation,
  primaryNavigation,
} from "../lib/navigation.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public navigation filters only the configured sections", () => {
  const visible = getVisiblePrimaryNavigation({
    aboutEnabled: false,
    servicesEnabled: false,
  });
  assert.deepEqual(
    visible.map(({ href }) => href),
    ["/", "/cursos", "/contacto"],
  );
  assert.equal(primaryNavigation.length, 5);
});

test("public section setting is additive, visible by default, and admin-managed", async () => {
  const [migration, reader, route] = await Promise.all([
    read("supabase/migrations/20260817000000_public_section_visibility.sql"),
    read("lib/public-section-settings.ts"),
    read("app/api/admin/settings/public-sections/route.ts"),
  ]);

  assert.match(migration, /public_sections/);
  assert.match(migration, /about_enabled.*true/);
  assert.match(migration, /services_enabled.*true/);
  assert.match(migration, /on conflict \(key\) do nothing/);
  assert.match(migration, /for select using \(key = 'public_sections'\)/);
  assert.doesNotMatch(migration, /delete from|truncate/i);

  assert.match(reader, /DEFAULT_PUBLIC_SECTION_VISIBILITY/);
  assert.match(reader, /return DEFAULT_PUBLIC_SECTION_VISIBILITY/);
  assert.match(route, /requireAdminClient/);
  assert.match(route, /typeof body\.aboutEnabled !== "boolean"/);
  assert.match(route, /typeof body\.servicesEnabled !== "boolean"/);
  assert.match(route, /revalidatePath\("\/", "layout"\)/);
});

test("admin controls persist both public section switches", async () => {
  const page = await read("app/admin/configuracion/page.tsx");
  assert.match(page, /\/api\/admin\/settings\/public-sections/);
  assert.match(page, /title="Nosotros"/);
  assert.match(page, /title="Servicios y soluciones"/);
  assert.match(page, /role="switch"/);
  assert.match(page, /JSON\.stringify\(nextSections\)/);
  assert.match(page, /Ocultar no elimina el contenido/);
});

test("hidden sections return not found and leave discovery surfaces", async () => {
  const [layout, home, about, services, detail, sitemap, discovery] = await Promise.all([
    read("app/layout.tsx"),
    read("app/page.tsx"),
    read("app/nosotros/page.tsx"),
    read("app/soluciones/page.tsx"),
    read("app/soluciones/[slug]/page.tsx"),
    read("app/sitemap.ts"),
    read("lib/public-discovery.ts"),
  ]);

  assert.match(layout, /getVisiblePrimaryNavigation\(visibility\)/);
  assert.match(home, /visibility\.servicesEnabled/);
  assert.match(home, /visibility\.aboutEnabled/);
  assert.match(about, /if \(!aboutEnabled\) notFound\(\)/);
  assert.match(services, /if \(!servicesEnabled\) notFound\(\)/);
  assert.match(detail, /if \(!servicesEnabled\) notFound\(\)/);
  assert.match(sitemap, /visibility\.aboutEnabled/);
  assert.match(sitemap, /visibility\.servicesEnabled/);
  assert.match(discovery, /sectionVisibility/);
});

test("client follow-up documents provisional copy without secrets", async () => {
  const document = await read("docs/client-input-pending.md");
  assert.match(document, /Contenido provisional — Nosotros y Servicios\/Soluciones/);
  assert.match(document, /nombre público definitivo/);
  assert.match(document, /alcance, entregables, modalidad/);
  assert.match(document, /sin borrar su contenido/);
});
