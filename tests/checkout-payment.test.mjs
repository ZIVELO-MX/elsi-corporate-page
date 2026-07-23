import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

const {
  CHECKOUT_COURSE,
  PAYMENT_SCENARIOS,
  PAYMENT_STATES,
  createMockPaymentGateway,
  formatPaymentAmount,
  validateBuyer,
} = await import("../lib/payments.ts");

test("payment contract exposes every checkout state and canonical amount", () => {
  assert.deepEqual(PAYMENT_STATES, [
    "collecting",
    "creating-session",
    "loading-provider",
    "ready",
    "processing",
    "pending",
    "succeeded",
    "declined",
    "unavailable",
  ]);
  assert.equal(CHECKOUT_COURSE.amount, 55_000);
  assert.equal(CHECKOUT_COURSE.currency, "MXN");
  assert.match(formatPaymentAmount(CHECKOUT_COURSE.amount, "MXN"), /550/);
});

test("buyer validation normalizes valid data and rejects invalid fields", () => {
  assert.deepEqual(
    validateBuyer({
      name: "Gabriela Núñez",
      email: "gabriela@example.com",
      phone: "+524771234567",
    }),
    {},
  );

  const errors = validateBuyer({ name: "", email: "correo", phone: "123" });
  assert.deepEqual(Object.keys(errors).sort(), ["email", "name", "phone"]);
});

test("mock gateway keeps amount server-shaped and supports every result", async () => {
  const gateway = createMockPaymentGateway({ delay: async () => {} });
  const session = await gateway.createSession({
    courseId: CHECKOUT_COURSE.id,
    buyer: {
      name: "Gabriela Núñez",
      email: "gabriela@example.com",
      phone: "+524771234567",
    },
  });

  assert.equal(session.course.amount, CHECKOUT_COURSE.amount);
  assert.equal(session.status, "pending");
  await gateway.loadProvider(session);

  for (const scenario of PAYMENT_SCENARIOS) {
    const result = await gateway.confirmPayment(session, scenario);
    assert.equal(result.state, scenario);
    assert.equal(result.orderId, session.orderId);
  }
});

test("checkout UI keeps sensitive fields outside ELSI and announces states", () => {
  const checkout = read("components/checkout/checkout-experience.tsx");
  const styles = read("components/checkout/checkout.module.css");
  const handoff = read("docs/ELS-0043-conekta-checkout.md");

  assert.match(checkout, /aria-live="polite"/);
  assert.match(checkout, /aria-invalid=/);
  assert.match(checkout, /Prototipo visual · no realiza cargos/);
  assert.match(checkout, /No ingreses datos reales/);
  assert.doesNotMatch(checkout, /name="(?:card|pan|cvc|expiry)"/i);
  assert.doesNotMatch(checkout, /ApplePay|apple-pay-button|/);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(styles, /transition:\s*all|ease-in|scale\(0\)|bounce|confetti/i);
  assert.match(handoff, /useExternalSubmit/);
  assert.match(handoff, /webhook firmado e idempotente/);
  assert.doesNotMatch(
    `${checkout}\n${handoff}`,
    /(?:private|secret)[_-]?key\s*[:=]\s*["'][^"']+/i,
  );
});
