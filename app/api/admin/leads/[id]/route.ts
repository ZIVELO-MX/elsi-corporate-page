import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabasePublicConfig()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (!["new", "contacted", "closed"].includes(body.status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  const { id } = await params;
  const { data, error } = await client.from("contact_leads").update({ status: body.status }).eq("id", id).select("id,status").single();
  if (error) return NextResponse.json({ error: "No fue posible actualizar el mensaje" }, { status: 400 });
  return NextResponse.json({ lead: data });
}
