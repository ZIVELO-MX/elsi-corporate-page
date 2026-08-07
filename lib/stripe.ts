import Stripe from "stripe";

export function paymentsEnabled() {
  return process.env.PAYMENTS_ENABLED === "1";
}

export function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  return secret ? new Stripe(secret, { apiVersion: "2026-07-29.dahlia" }) : null;
}
