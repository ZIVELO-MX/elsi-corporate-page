import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("Stripe smoke script verifies signed fulfillment and idempotency", async () => {
  const script = await read("scripts/smoke-stripe-test.mjs");
  assert.match(script, /STRIPE_SECRET_KEY\.startsWith\("sk_test_"\)/);
  assert.match(script, /generateTestHeaderString/);
  assert.match(script, /stripe-signature/);
  assert.match(script, /send\(\)/);
  assert.match(script, /status !== "paid"/);
  assert.match(script, /enrollments\.length !== 1/);
  assert.match(script, /enrollment\.created/);
  assert.match(script, /SMOKE_KEEP_DATA/);
});
