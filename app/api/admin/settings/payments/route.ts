import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

async function requireAdmin() {
  if (!hasSupabasePublicConfig()) return null;
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  return profile?.role === "admin" ? client : null;
}

export async function GET() {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await client.from("site_settings").select("value").eq("key", "payments").maybeSingle();
  if (error) return NextResponse.json({ error: "No fue posible consultar la configuración" }, { status: 500 });
  return NextResponse.json({ cardEnabled: data?.value && typeof data.value === "object" && !Array.isArray(data.value) && data.value.card_enabled === true });
}

export async function PATCH(request: Request) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.enabled !== "boolean") return NextResponse.json({ error: "enabled debe ser booleano" }, { status: 400 });
  const { error } = await client.from("site_settings").upsert({ key: "payments", value: { card_enabled: body.enabled } });
  if (error) return NextResponse.json({ error: "No fue posible guardar la configuración" }, { status: 500 });
  return NextResponse.json({ cardEnabled: body.enabled });
}
