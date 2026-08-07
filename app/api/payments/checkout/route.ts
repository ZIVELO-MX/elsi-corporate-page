import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, paymentsEnabled } from "@/lib/stripe";
import { getCardPaymentsEnabled } from "@/lib/payment-settings";

export async function POST(request: Request) {
  if (!paymentsEnabled() || !(await getCardPaymentsEnabled())) return NextResponse.json({ error: "Pagos con tarjeta desactivados" }, { status: 503 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
  const livemode = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_") === true;
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
  const { data: course, error: courseError } = await client.from("courses").select("id,slug,title,price_cents,currency,is_active,content_status").eq("id", body.courseId).eq("is_active", true).eq("content_status", "verified").maybeSingle();
  if (courseError || !course) return NextResponse.json({ error: "Curso no disponible" }, { status: 404 });
  const { data: enrollment, error: enrollmentError } = await client.from("enrollments").select("id,status").eq("user_id", auth.user.id).eq("course_id", course.id).maybeSingle();
  if (enrollmentError) return NextResponse.json({ error: "No fue posible validar tu inscripción" }, { status: 500 });
  if (enrollment) return NextResponse.json({ error: "Ya estás inscrito en este curso", enrollmentStatus: enrollment.status }, { status: 409 });
  const { data: pendingOrder } = await client.from("orders").select("id,status").eq("user_id", auth.user.id).eq("course_id", course.id).eq("status", "pending").limit(1).maybeSingle();
  if (pendingOrder) return NextResponse.json({ error: "Ya tienes un pago pendiente para este curso", orderId: pendingOrder.id, orderStatus: pendingOrder.status }, { status: 409 });
  const { data: order, error: orderError } = await client.from("orders").insert({ user_id: auth.user.id, course_id: course.id, course_title: course.title, amount_cents: course.price_cents, currency: course.currency, idempotency_key: idempotencyKey, livemode }).select("id,amount_cents,currency,status").single();
  if (orderError || !order) {
    if (orderError?.code === "23505") return NextResponse.json({ error: "La solicitud ya está en proceso; reintenta con el mismo Idempotency-Key" }, { status: 409 });
    return NextResponse.json({ error: "No fue posible crear la orden" }, { status: 500 });
  }
  try {
    const returnUrl = new URL("/profile", new URL(request.url).origin);
    returnUrl.searchParams.set("checkout", "success");
    returnUrl.searchParams.set("order_id", order.id);
    const session = await stripe.checkout.sessions.create({ mode: "payment", ui_mode: "elements", line_items: [{ price_data: { currency: course.currency.toLowerCase(), product_data: { name: course.title }, unit_amount: course.price_cents }, quantity: 1 }], return_url: returnUrl.toString(), metadata: { orderId: order.id, courseId: course.id, userId: auth.user.id }, expires_at: Math.floor(Date.now() / 1000) + 30 * 60 }, { idempotencyKey });
    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null;
    await client.from("orders").update({ stripe_checkout_session_id: session.id, expires_at: expiresAt }).eq("id", order.id);
    return NextResponse.json({ orderId: order.id, clientSecret: session.client_secret, amount: order.amount_cents, currency: order.currency, status: order.status, expiresAt });
  } catch (error) {
    const stripeError = error as { type?: string; code?: string; message?: string; statusCode?: number; requestId?: string };
    console.error("[payments/checkout] Stripe session creation failed", {
      type: stripeError.type,
      code: stripeError.code,
      statusCode: stripeError.statusCode,
      requestId: stripeError.requestId,
      message: stripeError.message,
    });
    await client.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Stripe no está disponible; inténtalo más tarde" }, { status: 502 });
  }
}
