import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("admin approval exposes a protected, transactional pending-order action", async () => {
  const [route, migration, provider] = await Promise.all([
    read("app/api/admin/orders/route.ts"),
    read("supabase/migrations/20260810000000_admin_order_approval.sql"),
    read("lib/admin-data.tsx"),
  ]);

  assert.match(route, /export async function POST/);
  assert.match(route, /requireAdmin/);
  assert.match(route, /approve_pending_order/);
  assert.match(migration, /status <> 'pending'/);
  assert.match(migration, /insert into public\.enrollments \(user_id, course_id, source, status\)[\s\S]*values \(current_order\.user_id, current_order\.course_id, 'internal'/);
  assert.match(migration, /approvedBy/);
  assert.match(provider, /approvePendingPayment/);
  assert.match(await read("app/admin/ventas/page.tsx"), /<Dialog open=/);
  assert.match(await read("app/admin/ventas/page.tsx"), /Confirmar aprobación/);
  assert.doesNotMatch(await read("app/admin/ventas/page.tsx"), /window\.confirm/);
});
