import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import {
  LEAD_NOTIFICATION_TEMPLATE_VERSION,
  renderLeadNotification,
} from "@/lib/notifications/templates";

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 5;
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;

type OutboxEvent = {
  id: string;
  aggregate_id: string | null;
  event_type: string;
  payload: Json;
  attempts: number;
};

type Lead = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  message: string;
};

function authorized(request: Request) {
  const secret = process.env.NOTIFICATIONS_WORKER_SECRET?.trim();
  if (!secret) return false;
  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

function recipients() {
  return (process.env.LEAD_NOTIFICATION_RECIPIENTS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => /^\S+@\S+\.\S+$/.test(value));
}

function leadId(event: OutboxEvent) {
  if (event.aggregate_id) return event.aggregate_id;
  if (typeof event.payload === "object" && event.payload !== null && !Array.isArray(event.payload)) {
    const value = (event.payload as Record<string, Json>).leadId;
    return typeof value === "string" ? value : null;
  }
  return null;
}

function retryAt(attempts: number) {
  const delay = Math.min(60 * 60 * 1000, 60 * 1000 * 2 ** Math.max(0, attempts - 1));
  return new Date(Date.now() + delay).toISOString();
}

async function sendLeadNotification(lead: Lead, eventId: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = recipients();
  if (!apiKey || !from || to.length === 0) throw new Error("Resend no está configurado");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lead.created/${eventId}`,
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: lead.email,
      subject: `Nuevo contacto de ${lead.full_name}`,
      html: renderLeadNotification(lead),
      headers: { "X-ELSI-Template-Version": LEAD_NOTIFICATION_TEMPLATE_VERSION },
    }),
  });
  if (!response.ok) throw new Error(`Resend respondió ${response.status}`);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Persistencia no configurada" }, { status: 503 });
  if (!process.env.RESEND_API_KEY?.trim() || !process.env.RESEND_FROM_EMAIL?.trim() || recipients().length === 0) {
    return NextResponse.json({ error: "Resend no configurado" }, { status: 503 });
  }

  const now = new Date();
  const stale = new Date(now.getTime() - LOCK_TIMEOUT_MS).toISOString();
  await admin.from("outbox_events").update({ status: "pending", locked_at: null }).eq("status", "processing").lt("locked_at", stale);

  const { data: pending, error: pendingError } = await admin
    .from("outbox_events")
    .select("id,aggregate_id,event_type,payload,attempts")
    .eq("status", "pending")
    .lte("available_at", now.toISOString())
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (pendingError) return NextResponse.json({ error: "No fue posible consultar el outbox" }, { status: 500 });

  let processed = 0;
  let retried = 0;
  let failed = 0;
  for (const candidate of (pending ?? []) as OutboxEvent[]) {
    const { data: event, error: claimError } = await admin
      .from("outbox_events")
      .update({ status: "processing", locked_at: new Date().toISOString(), attempts: candidate.attempts + 1 })
      .eq("id", candidate.id)
      .eq("status", "pending")
      .select("id,aggregate_id,event_type,payload,attempts")
      .maybeSingle();
    if (claimError || !event) continue;

    try {
      if (event.event_type !== "lead.created") {
        await admin.from("outbox_events").update({ status: "processed", processed_at: new Date().toISOString(), locked_at: null }).eq("id", event.id);
        processed += 1;
        continue;
      }
      const id = leadId(event as OutboxEvent);
      if (!id) throw new Error("Evento sin leadId");
      const { data: lead, error: leadError } = await admin.from("contact_leads").select("id,full_name,email,company,message").eq("id", id).maybeSingle();
      if (leadError || !lead) throw new Error("Lead no encontrado");
      await sendLeadNotification(lead, event.id);
      await admin.from("outbox_events").update({ status: "processed", processed_at: new Date().toISOString(), locked_at: null }).eq("id", event.id);
      processed += 1;
    } catch {
      const attempts = event.attempts;
      const terminal = attempts >= MAX_ATTEMPTS;
      await admin.from("outbox_events").update({ status: terminal ? "failed" : "pending", available_at: terminal ? now.toISOString() : retryAt(attempts), locked_at: null }).eq("id", event.id);
      if (terminal) failed += 1;
      else retried += 1;
    }
  }
  return NextResponse.json({ processed, retried, failed, claimed: pending?.length ?? 0 });
}
