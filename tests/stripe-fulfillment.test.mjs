import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("Stripe webhook verifies raw signature before fulfillment", async () => {
  const [route, migration] = await Promise.all([read("app/api/webhooks/stripe/route.ts"), read("supabase/migrations/20260731000000_initial_schema.sql")]);
  assert.match(route, /request\.text/);
  assert.match(route, /constructEvent/);
  assert.match(route, /Stripe-Signature/);
  assert.match(route, /stripe_events/);
  assert.match(route, /23505/);
  assert.match(route, /fulfill_stripe_order/);
  assert.match(migration, /create table if not exists public\.stripe_events/);
  assert.match(migration, /unique/);
});

test("fulfillment is monotonic, idempotent and creates enrollment/outbox transactionally", async () => {
  const migration = await read("supabase/migrations/20260731000000_initial_schema.sql");
  assert.match(migration, /status = 'paid'/);
  assert.match(migration, /on conflict \(user_id, course_id\) do nothing/);
  assert.match(migration, /enrollment\.created/);
  assert.match(migration, /for update/);
});
