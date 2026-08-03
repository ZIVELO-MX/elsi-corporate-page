import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { paymentsEnabled } from "@/lib/stripe";

const MAX_BATCH = 100;

export async function POST(request: Request) {
  const secret = process.env.PAYMENTS_RECONCILE_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!paymentsEnabled()) return NextResponse.json({ reconciled: 0, disabled: true });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Persistencia no configurada" }, { status: 503 });
  const now = new Date().toISOString();
  const { data: expired, error } = await admin.from("orders").select("id").eq("status", "pending").not("expires_at", "is", null).lte("expires_at", now).limit(MAX_BATCH);
  if (error) return NextResponse.json({ error: "No fue posible consultar órdenes pendientes" }, { status: 500 });
  const ids = (expired ?? []).map((order) => order.id);
  if (ids.length) await admin.from("orders").update({ status: "canceled" }).in("id", ids).eq("status", "pending");
  return NextResponse.json({ reconciled: ids.length, checkedAt: now });
}
