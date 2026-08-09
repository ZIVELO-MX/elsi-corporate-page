import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"];
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`${name} es requerido`);
}
if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")) throw new Error("STRIPE_SECRET_KEY debe ser una clave test");
if (process.env.SMOKE_KEEP_DATA !== "1") console.log("Smoke Stripe: los datos temporales se eliminarán al terminar.");

const baseUrl = (process.env.APP_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseSecretKey?.trim()) throw new Error("Define SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY");
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseSecretKey, { auth: { autoRefreshToken: false, persistSession: false } });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = `smoke-stripe-${suffix}@example.invalid`;
const password = `Smoke-${crypto.randomUUID()}-Aa1!`;
const slug = `smoke-stripe-${suffix}`;
const ids = { user: null, course: null, order: null };

async function expectOk(label, result) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function cleanup() {
  if (process.env.SMOKE_KEEP_DATA === "1") return;
  if (ids.order) await admin.from("outbox_events").delete().eq("aggregate_id", ids.order);
  if (ids.order) await admin.from("orders").delete().eq("id", ids.order);
  if (ids.course) await admin.from("enrollments").delete().eq("course_id", ids.course);
  if (ids.course) await admin.from("courses").delete().eq("id", ids.course);
  if (ids.user) await admin.auth.admin.deleteUser(ids.user);
}

try {
  const user = await expectOk("crear usuario", await admin.auth.admin.createUser({ email, password, email_confirm: true }));
  ids.user = user.user.id;
  const course = await expectOk("crear curso", await admin.from("courses").insert({
    slug,
    title: "Smoke Stripe Test",
    short_description: "Curso temporal para validar fulfillment Stripe.",
    description: "No conservar.",
    duration_hours: 1,
    syllabus: { publishState: "published", moduleList: ["Smoke"] },
    modality: "online",
    price_cents: 100,
    currency: "MXN",
    content_status: "verified",
    is_active: true,
  }).select("id").single());
  ids.course = course.id;
  const order = await expectOk("crear orden", await admin.from("orders").insert({
    user_id: ids.user,
    course_id: ids.course,
    course_title: course.title ?? "Smoke Stripe Test",
    amount_cents: 100,
    currency: "MXN",
    idempotency_key: `smoke-${suffix}`,
    livemode: false,
  }).select("id").single());
  ids.order = order.id;

  const eventId = `evt_smoke_${suffix.replace(/[^a-z0-9]/gi, "")}`;
  const payload = JSON.stringify({
    id: eventId,
    object: "event",
    api_version: "2026-01-28.clover",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    type: "checkout.session.completed",
    data: { object: {
      id: `cs_test_smoke_${suffix}`,
      object: "checkout.session",
      livemode: false,
      payment_status: "paid",
      amount_total: 100,
      currency: "mxn",
      payment_intent: `pi_smoke_${suffix}`,
      metadata: { orderId: ids.order, courseId: ids.course, userId: ids.user },
    } },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const send = () => fetch(`${baseUrl}/api/webhooks/stripe`, { method: "POST", headers: { "content-type": "application/json", "stripe-signature": signature }, body: payload });
  const first = await send();
  if (!first.ok) throw new Error(`webhook inicial devolvió HTTP ${first.status}: ${await first.text()}`);
  const duplicate = await send();
  if (!duplicate.ok) throw new Error(`webhook duplicado devolvió HTTP ${duplicate.status}: ${await duplicate.text()}`);

  const persisted = await expectOk("leer orden", await admin.from("orders").select("status,stripe_payment_intent_id").eq("id", ids.order).single());
  if (persisted.status !== "paid" || persisted.stripe_payment_intent_id !== `pi_smoke_${suffix}`) throw new Error("la orden no quedó paid con payment intent");
  const enrollments = await expectOk("leer inscripción", await admin.from("enrollments").select("id,source,status").eq("user_id", ids.user).eq("course_id", ids.course));
  if (enrollments.length !== 1 || enrollments[0].source !== "stripe") throw new Error("la inscripción Stripe no fue creada exactamente una vez");
  const events = await expectOk("leer outbox", await admin.from("outbox_events").select("event_type").eq("aggregate_id", enrollments[0].id));
  if (!events.some((event) => event.event_type === "enrollment.created")) throw new Error("falta enrollment.created en outbox");

  console.log(`Stripe test smoke OK: order=${ids.order} enrollment=${enrollments[0].id}`);
} finally {
  await cleanup();
}
