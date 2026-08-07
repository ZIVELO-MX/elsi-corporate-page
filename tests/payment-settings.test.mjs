import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("payment setting defaults disabled and is protected by admin writes", async () => {
  const migration = await read("supabase/migrations/20260809000000_site_settings.sql");
  const route = await read("app/api/admin/settings/payments/route.ts");
  assert.match(migration, /card_enabled.*false/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /public\.is_admin/);
  assert.match(route, /profile\?\.role === "admin"/);
  assert.match(route, /export async function PATCH/);
});

test("disabled payments produce a mail request in checkout", async () => {
  const page = await read("app/checkout/page.tsx");
  const ui = await read("components/checkout/checkout-experience.tsx");
  assert.match(page, /getCardPaymentsEnabled/);
  assert.match(ui, /mailto:/);
  assert.match(ui, /Enviar solicitud por correo/);
  assert.match(ui, /cardPaymentsEnabled/);
});
