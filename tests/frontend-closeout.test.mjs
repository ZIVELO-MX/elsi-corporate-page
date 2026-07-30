import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public surfaces use shared color and layout classes while keeping prototype safeguards", async () => {
  const [catalog, login, register, checkout, profile, solutions, media, config] = await Promise.all([
    read("app/cursos/page.tsx"),
    read("app/login/page.tsx"),
    read("app/register/page.tsx"),
    read("components/checkout/checkout-experience.tsx"),
    read("app/profile/page.tsx"),
    read("app/soluciones/page.tsx"),
    read("components/course-media.tsx"),
    read("lib/site-config.ts"),
  ]);

  for (const source of [catalog, login, register, checkout, profile, solutions, media]) {
    assert.doesNotMatch(source, /style=\{\{\s*color:/);
  }
  assert.match(catalog, /course-catalog-section/);
  assert.match(media, /className="course-media-image"/);
  assert.match(config, /NEXT_PUBLIC_CONTENT_STATUS/);
  assert.match(config, /prototypeMode/);
});

test("admin shell and table skeleton use reusable classes without changing their behavior", async () => {
  const [shell, skeleton] = await Promise.all([
    read("components/admin-shell.tsx"),
    read("components/ui/skeleton.tsx"),
  ]);

  assert.doesNotMatch(shell, /style=\{/);
  assert.match(shell, /aria-expanded=\{sidebarOpen\}/);
  assert.match(shell, /aria-controls="admin-sidebar"/);
  assert.match(shell, /window\.addEventListener\("keydown"/);
  assert.match(shell, /className="admin-access-state"/);
  assert.match(shell, /className="admin-sidebar-account"/);
  assert.match(skeleton, /className="admin-table-skeleton"/);
  assert.match(skeleton, /role="status"/);
});
