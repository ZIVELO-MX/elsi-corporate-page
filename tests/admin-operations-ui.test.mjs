import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("dashboard exposes every actionable operations queue", async () => {
  const [dashboard, summary] = await Promise.all([read("app/admin/page.tsx"), read("app/api/admin/summary/route.ts")]);
  for (const queue of ["pendingPayments", "failedPayments", "canceledPayments", "newLeads", "pendingCertificates", "draftCourses"]) {
    assert.match(dashboard, new RegExp(queue));
    assert.match(summary, new RegExp(queue));
  }
  assert.match(dashboard, /Pagos con incidencia/);
  assert.match(dashboard, /Constancias pendientes/);
});

test("orders include paid, pending, failed, and canceled states", async () => {
  const [route, screen] = await Promise.all([read("app/api/admin/orders/route.ts"), read("app/admin/ventas/page.tsx")]);
  for (const status of ["paid", "pending", "failed", "canceled"]) {
    assert.match(route, new RegExp(`"${status}"`));
    assert.match(screen, new RegExp(`"${status}"`));
  }
  assert.match(screen, /OrderStatusBadge/);
});

test("contact operations persist complete status, owner, notes, and resolution", async () => {
  const [route, screen] = await Promise.all([read("app/api/admin/leads/[id]/route.ts"), read("app/admin/contacto/page.tsx")]);
  assert.match(route, /assigned_to/);
  assert.match(route, /admin_notes/);
  assert.match(route, /resolved_at/);
  assert.match(screen, /En seguimiento/);
  assert.match(screen, /Notas internas/);
  assert.match(screen, /Responsable/);
});

test("role changes protect self-demotion and the last administrator", async () => {
  const [migration, route, screen] = await Promise.all([
    read("supabase/migrations/20260816000000_admin_operations.sql"),
    read("app/api/admin/users/[id]/role/route.ts"),
    read("app/admin/usuarios/page.tsx"),
  ]);
  assert.match(migration, /self_role_change/);
  assert.match(migration, /last_admin/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /for update/);
  assert.match(route, /change_admin_user_role/);
  assert.match(screen, /ConfirmDialog/);
});

test("admin list state and mobile drawer meet URL and keyboard contracts", async () => {
  const screens = await Promise.all(["usuarios", "cursos", "inscripciones", "ventas", "contacto", "testimonios"].map((name) => read(`app/admin/${name}/page.tsx`)));
  for (const screen of screens) {
    assert.match(screen, /direction/);
    assert.match(screen, /sort/);
    assert.match(screen, /page/);
  }
  const shell = await read("components/admin-shell.tsx");
  assert.match(shell, /e\.key === "Escape"/);
  assert.match(shell, /e\.key !== "Tab"/);
  assert.match(shell, /toggle\?\.focus/);
  assert.match(shell, /inert=\{isMobile && sidebarOpen/);
});
