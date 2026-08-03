import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe, paymentsEnabled } from "@/lib/stripe";

const MAX_BATCH = 100;

export async function POST(request: Request) {
  const secret = process.env.PAYMENTS_RECONCILE_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!paymentsEnabled()) return NextResponse.json({ reconciled: 0, disabled: true });
  const admin = createSupabaseAdminClient();
  const stripe = getStripe();
  if (!admin || !stripe) return NextResponse.json({ error: "Persistencia o Stripe no configurado" }, { status: 503 });
  const now = new Date().toISOString();
  const { data: expired, error } = await admin.from("orders").select("id,amount_cents,currency,livemode,stripe_checkout_session_id,expires_at").eq("status", "pending").not("expires_at", "is", null).lte("expires_at", now).limit(MAX_BATCH);
  if (error) return NextResponse.json({ error: "No fue posible consultar órdenes pendientes" }, { status: 500 });
  let canceled = 0;
  let fulfilled = 0;
  let stillPending = 0;
  let errors = 0;
  for (const order of expired ?? []) {
    try {
      let session: Stripe.Checkout.Session | null = null;
      if (order.stripe_checkout_session_id) session = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
      if (session?.payment_status === "paid") {
        const amountMatches = session.amount_total === order.amount_cents;
        const currencyMatches = session.currency?.toUpperCase() === order.currency.toUpperCase();
        const modeMatches = session.livemode === order.livemode;
        if (!amountMatches || !currencyMatches || !modeMatches) {
          await admin.from("orders").update({ status: "failed" }).eq("id", order.id).eq("status", "pending");
          errors += 1;
          continue;
        }
        const eventId = `reconcile:${order.id}:${session.id}`;
        const { error: eventError } = await admin.from("stripe_events").insert({ event_id: eventId, event_type: "reconciliation.checkout.session.completed", payload: { eventId, type: "reconciliation.checkout.session.completed", sessionId: session.id } });
        if (eventError && eventError.code !== "23505") throw eventError;
        const { error: fulfillError } = await admin.rpc("fulfill_stripe_order", { p_order_id: order.id, p_event_id: eventId, p_payload: { eventId, type: "reconciliation.checkout.session.completed", sessionId: session.id } });
        if (fulfillError) throw fulfillError;
        fulfilled += 1;
        continue;
      }
      if (session?.status === "open" || session?.status === "complete") {
        stillPending += 1;
        continue;
      }
      const { error: cancelError } = await admin.from("orders").update({ status: "canceled" }).eq("id", order.id).eq("status", "pending");
      if (cancelError) throw cancelError;
      canceled += 1;
    } catch {
      errors += 1;
    }
  }
  return NextResponse.json({ reconciled: canceled + fulfilled, checked: expired?.length ?? 0, canceled, fulfilled, pending: stillPending, errors, checkedAt: now });
}
