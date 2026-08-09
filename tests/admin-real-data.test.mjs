import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("admin screens request their own bounded resources without a global collection provider", async () => {
  const [shell, data, dashboard, courses, users] = await Promise.all([
    read("components/admin-shell.tsx"),
    read("lib/admin-data.tsx"),
    read("app/admin/page.tsx"),
    read("app/admin/cursos/page.tsx"),
    read("app/admin/usuarios/page.tsx"),
  ]);
  assert.doesNotMatch(shell, /AdminDataProvider/);
  assert.doesNotMatch(data, /createContext|useContext/);
  assert.match(data, /useAdminCollection/);
  assert.match(dashboard, /\/api\/admin\/summary/);
  assert.match(courses, /\/api\/admin\/courses\?/);
  assert.match(users, /\/api\/admin\/users\?/);
  assert.doesNotMatch(data, /INITIAL_(COURSES|USERS|ENROLLMENTS|SALES|SECTIONS|LEADS|TESTIMONIALS)/);
});

test("course, enrollment, and lead screens never report memory-only saves", async () => {
  const [courses, enrollments, leads] = await Promise.all([
    read("app/admin/cursos/page.tsx"),
    read("app/admin/inscripciones/page.tsx"),
    read("app/admin/contacto/page.tsx"),
  ]);
  assert.match(courses, /persistCourse\(editing \? `\/api\/admin\/courses\/\$\{editing\}` : "\/api\/admin\/courses"/);
  assert.doesNotMatch(courses, /if \(!persistedCourses\)/);
  assert.match(enrollments, /\/api\/admin\/enrollments\?/);
  assert.doesNotMatch(enrollments, /else (?:add|complete|mark)/);
  assert.match(leads, /method: "PATCH"/);
  assert.doesNotMatch(leads, /markLeadAttended/);
});

test("admin money, dates, and recent records use explicit locale-aware formatting", async () => {
  const { formatAdminDate, formatAdminMoney, newestFirst } = await import("../lib/admin-format.ts");
  assert.match(formatAdminMoney(1234.5), /MXN/);
  assert.notEqual(formatAdminDate("2026-08-08"), "—");
  assert.equal(formatAdminDate("invalid"), "—");
  assert.deepEqual(newestFirst([{ date: "2026-01-01" }, { date: "2026-08-08" }], (item) => item.date), [
    { date: "2026-08-08" },
    { date: "2026-01-01" },
  ]);
});

test("admin sales and pending payments are projections of persisted orders", async () => {
  const [route, screen] = await Promise.all([
    read("app/api/admin/orders/route.ts"),
    read("app/admin/ventas/page.tsx"),
  ]);
  assert.match(route, /requireAdminClient/);
  assert.match(route, /in\("status", \["paid", "pending"\]\)/);
  assert.match(route, /amount_cents/);
  assert.match(screen, /Stripe confirma un pago/);
  assert.match(screen, /Pagos pendientes/);
  assert.match(screen, /Aprobar inscripción/);
  assert.doesNotMatch(screen, /addSale|Registrar venta/);
});
