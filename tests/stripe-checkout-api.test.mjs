import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("Stripe checkout is feature-flagged, authenticated and price-canonical", async () => {
  const [route, stripe, migration] = await Promise.all([read("app/api/payments/checkout/route.ts"), read("lib/stripe.ts"), read("supabase/migrations/20260731000000_initial_schema.sql")]);
  assert.match(route, /paymentsEnabled/);
  assert.match(route, /auth\.getUser/);
  assert.match(route, /Idempotency-Key/);
  assert.match(route, /price_cents/);
  assert.match(route, /checkout\.sessions\.create/);
  assert.match(route, /stripe_checkout_session_id/);
  assert.match(stripe, /STRIPE_SECRET_KEY/);
  assert.match(migration, /create table if not exists public\.orders/);
  assert.match(migration, /unique \(user_id, idempotency_key\)/);
});

test("order lookup is owner-scoped and checkout UI identifies Stripe", async () => {
  const [orders, ui] = await Promise.all([read("app/api/orders/[id]/route.ts"), read("components/checkout/checkout-experience.tsx")]);
  assert.match(orders, /auth\.getUser/);
  assert.match(orders, /eq\("user_id", auth\.user\.id\)/);
  assert.match(ui, /Stripe Payment Element/);
  assert.doesNotMatch(ui, /Conekta/);
});

test("checkout keeps Stripe.js behind the public payment flag and preserves demo fallback", async () => {
  const ui = await read("components/checkout/checkout-experience.tsx");
  assert.match(ui, /NEXT_PUBLIC_PAYMENTS_ENABLED/);
  assert.match(ui, /https:\/\/js\.stripe\.com\/clover\/stripe\.js/);
  assert.match(ui, /\/api\/payments\/checkout/);
  assert.match(ui, /Idempotency-Key/);
  assert.match(ui, /createPaymentElement/);
  assert.match(ui, /createMockPaymentGateway/);
});

test("checkout resolves persisted public courses before the fixture fallback", async () => {
  const [page, payments] = await Promise.all([
    read("app/checkout/page.tsx"),
    read("lib/payments.ts"),
  ]);
  assert.match(page, /getPublicCourse/);
  assert.match(page, /mapPublicCourseToCheckoutCourse/);
  assert.match(payments, /mapPublicCourseToCheckoutCourse/);
  assert.match(payments, /Math\.round\(course\.price \* 100\)/);
});
