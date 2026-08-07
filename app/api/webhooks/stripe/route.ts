import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe, paymentsEnabled } from "@/lib/stripe";

export const runtime = "nodejs";

const FULFILLMENT_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);
const RECOVERY_EVENTS = new Set(["checkout.session.expired", "checkout.session.async_payment_failed", "payment_intent.payment_failed"]);

export async function POST(request: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ received: true, disabled: true });
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });
  const signature = request.headers.get("Stripe-Signature");
  if (!signature) return NextResponse.json({ error: "Firma requerida" }, { status: 400 });
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Persistencia no configurada" }, { status: 503 });
  const payload = { eventId: event.id, type: event.type };
  const { error: insertError } = await admin.from("stripe_events").insert({ event_id: event.id, event_type: event.type, payload });
  if (insertError?.code === "23505") return NextResponse.json({ received: true, duplicate: true });
  if (insertError) return NextResponse.json({ error: "No fue posible registrar el evento" }, { status: 500 });
  if (!FULFILLMENT_EVENTS.has(event.type)) {
    if (RECOVERY_EVENTS.has(event.type)) {
      const object = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
      const metadata = object.metadata ?? {};
      const orderId = metadata.orderId;
      if (orderId) {
        const status = event.type === "checkout.session.expired" ? "canceled" : "failed";
        await admin.from("orders").update({ status }).eq("id", orderId).eq("status", "pending");
      }
    }
    await admin.from("stripe_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("event_id", event.id);
    return NextResponse.json({ received: true, ignored: !RECOVERY_EVENTS.has(event.type), recovered: RECOVERY_EVENTS.has(event.type) });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  if (!orderId || session.payment_status !== "paid") {
    await admin.from("stripe_events").update({ status: "failed", error_message: "Sesión sin pago confirmado" }).eq("event_id", event.id);
    return NextResponse.json({ received: true, pending: true });
  }
  const { data: order } = await admin.from("orders").select("id,amount_cents,currency,livemode,status").eq("id", orderId).maybeSingle();
  if (!order || order.amount_cents !== session.amount_total || order.currency.toLowerCase() !== session.currency?.toLowerCase() || order.livemode !== session.livemode) {
    await admin.from("stripe_events").update({ status: "failed", error_message: "Discrepancia de orden" }).eq("event_id", event.id);
    return NextResponse.json({ received: true, discrepancy: true });
  }
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (paymentIntentId) await admin.from("orders").update({ stripe_payment_intent_id: paymentIntentId }).eq("id", orderId);
  const { error: fulfillError } = await admin.rpc("fulfill_stripe_order", { p_order_id: order.id, p_event_id: event.id, p_payload: payload });
  if (fulfillError) return NextResponse.json({ error: "Fulfillment pendiente" }, { status: 500 });
  return NextResponse.json({ received: true, fulfilled: true });
}
