import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, paymentsEnabled } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ error: "Pagos no disponibles" }, { status: 503 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length > 120) return NextResponse.json({ error: "Falta Idempotency-Key" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.courseId !== "string") return NextResponse.json({ error: "Curso inválido" }, { status: 400 });
  const { data: existing } = await client.from("orders").select("id,amount_cents,currency,status,stripe_checkout_session_id,expires_at").eq("user_id", auth.user.id).eq("idempotency_key", idempotencyKey).maybeSingle();
  if (existing?.stripe_checkout_session_id) return NextResponse.json({ orderId: existing.id, clientSecret: null, amount: existing.amount_cents, currency: existing.currency, status: existing.status, expiresAt: existing.expires_at });
  const { data: course, error: courseError } = await client.from("courses").select("id,title,price_cents,currency,is_active,content_status").eq("id", body.courseId).eq("is_active", true).eq("content_status", "verified").maybeSingle();
  if (courseError || !course) return NextResponse.json({ error: "Curso no disponible" }, { status: 404 });
  const { data: order, error: orderError } = await client.from("orders").insert({ user_id: auth.user.id, course_id: course.id, course_title: course.title, amount_cents: course.price_cents, currency: course.currency, idempotency_key: idempotencyKey, livemode: false }).select("id,amount_cents,currency,status").single();
  if (orderError || !order) {
    if (orderError?.code === "23505") return NextResponse.json({ error: "La solicitud ya está en proceso; reintenta con el mismo Idempotency-Key" }, { status: 409 });
    return NextResponse.json({ error: "No fue posible crear la orden" }, { status: 500 });
  }
  try {
    const session = await stripe.checkout.sessions.create({ mode: "payment", ui_mode: "custom", line_items: [{ price_data: { currency: course.currency.toLowerCase(), product_data: { name: course.title }, unit_amount: course.price_cents }, quantity: 1 }], return_url: `${new URL(request.url).origin}/checkout?session_id={CHECKOUT_SESSION_ID}`, metadata: { orderId: order.id, courseId: course.id, userId: auth.user.id }, expires_at: Math.floor(Date.now() / 1000) + 30 * 60 }, { idempotencyKey });
    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null;
    await client.from("orders").update({ stripe_checkout_session_id: session.id, expires_at: expiresAt }).eq("id", order.id);
    return NextResponse.json({ orderId: order.id, clientSecret: session.client_secret, amount: order.amount_cents, currency: order.currency, status: order.status, expiresAt });
  } catch {
    await client.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Stripe no está disponible; inténtalo más tarde" }, { status: 502 });
  }
}
