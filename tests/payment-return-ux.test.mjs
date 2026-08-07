import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("Stripe returns to the authenticated profile with an owner-scoped order reference", async () => {
  const [checkout, orderLookup] = await Promise.all([
    read("app/api/payments/checkout/route.ts"),
    read("app/api/orders/[id]/route.ts"),
  ]);

  assert.match(checkout, /new URL\("\/profile"/);
  assert.match(checkout, /searchParams\.set\("checkout", "success"\)/);
  assert.match(checkout, /searchParams\.set\("order_id", order\.id\)/);
  assert.doesNotMatch(checkout, /CHECKOUT_SESSION_ID/);
  assert.match(orderLookup, /auth\.getUser/);
  assert.match(orderLookup, /eq\("user_id", auth\.user\.id\)/);
});

test("profile polls a bounded owner-safe order lookup and refreshes enrollment data after payment", async () => {
  const profile = await read("app/profile/page.tsx");

  assert.match(profile, /PAYMENT_POLL_ATTEMPTS = 15/);
  assert.match(profile, /fetch\(`\/api\/orders\/\$\{encodeURIComponent\(orderId\)\}`/);
  assert.match(profile, /method: "GET"/);
  assert.match(profile, /order\.status === "paid"/);
  assert.match(profile, /await load\(\)/);
  assert.match(profile, /fetch\("\/api\/profile", \{ cache: "no-store" \}\)/);
  assert.match(profile, /toast\.success\("Pago confirmado"/);
  assert.match(profile, /Pago pendiente/);
  assert.match(profile, /Actualizar estado/);
  assert.match(profile, /window\.history\.replaceState/);
  assert.doesNotMatch(profile, /from\("enrollments"\)/);
  assert.doesNotMatch(profile, /fulfill_stripe_order/);
});
