import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("admin provider loads persisted collections instead of shipping fixtures", async () => {
  const provider = await read("lib/admin-data.tsx");
  assert.match(provider, /fetch\("\/api\/admin\/courses"/);
  assert.match(provider, /fetch\("\/api\/admin\/users"/);
  assert.match(provider, /fetch\("\/api\/admin\/enrollments"/);
  assert.match(provider, /fetch\("\/api\/admin\/leads"/);
  assert.match(provider, /fetch\("\/api\/admin\/content"/);
  assert.match(provider, /fetch\("\/api\/admin\/orders"/);
  assert.doesNotMatch(provider, /INITIAL_(COURSES|USERS|ENROLLMENTS|SALES|SECTIONS|LEADS|TESTIMONIALS)/);
});

test("admin sales and pending payments are projections of persisted orders", async () => {
  const [route, screen] = await Promise.all([
    read("app/api/admin/orders/route.ts"),
    read("app/admin/ventas/page.tsx"),
  ]);
  assert.match(route, /role.*admin/);
  assert.match(route, /in\("status", \["paid", "pending"\]\)/);
  assert.match(route, /amount_cents/);
  assert.match(screen, /Stripe confirma un pago/);
  assert.match(screen, /Pagos pendientes/);
  assert.match(screen, /Aprobar inscripción/);
  assert.doesNotMatch(screen, /addSale|Registrar venta/);
});
