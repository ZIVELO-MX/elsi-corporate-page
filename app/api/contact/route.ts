import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

const rate = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function clientKey(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function verifyTurnstile(token: unknown, remoteip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  if (typeof token !== "string" || !token) return false;
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ secret, response: token, remoteip }) });
  const result = await response.json().catch(() => ({ success: false }));
  return result.success === true;
}

export async function POST(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const current = rate.get(key);
  if (current && current.resetAt > now && current.count >= MAX_REQUESTS) return NextResponse.json({ error: "Demasiadas solicitudes. Intenta más tarde." }, { status: 429 });
  rate.set(key, current && current.resetAt > now ? { count: current.count + 1, resetAt: current.resetAt } : { count: 1, resetAt: now + WINDOW_MS });
  const body = await request.json().catch(() => ({}));
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (name.length < 2 || name.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || message.length < 10 || message.length > 4000) return NextResponse.json({ error: "Revisa los campos del formulario." }, { status: 400 });
  if (!(await verifyTurnstile(body.turnstileToken, key))) return NextResponse.json({ error: "No se pudo validar la solicitud." }, { status: 400 });
  if (!hasSupabasePublicConfig()) return NextResponse.json({ ok: true, prototype: true });
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  const source = typeof body.source === "string" ? body.source.slice(0, 120) : "contact";
  const { data: lead, error } = await client.from("contact_leads").insert({ full_name: name, email, phone: typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : null, company: typeof body.company === "string" ? body.company.trim().slice(0, 120) : null, message, source, turnstile_verified: Boolean(process.env.TURNSTILE_SECRET_KEY) }).select("id").single();
  if (error || !lead) return NextResponse.json({ error: "No fue posible registrar el mensaje." }, { status: 500 });
  const { error: outboxError } = await client.from("outbox_events").insert({ aggregate_type: "contact_lead", aggregate_id: lead.id, event_type: "lead.created", payload: { leadId: lead.id } });
  if (outboxError) return NextResponse.json({ error: "Mensaje registrado; la notificación queda pendiente." }, { status: 202 });
  return NextResponse.json({ ok: true });
}
