import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabasePublicConfig()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const { data: current } = await client.from("certificates").select("storage_path").eq("id", id).maybeSingle();
  if (!current?.storage_path) return NextResponse.json({ error: "Primero carga el archivo de la constancia" }, { status: 409 });
  const { data, error } = await client.from("certificates").update({ status: "available", issued_at: new Date().toISOString() }).eq("id", id).select("id,status,issued_at,storage_path").single();
  if (error) return NextResponse.json({ error: "No fue posible publicar la constancia" }, { status: 400 });
  return NextResponse.json({ certificate: data });
}
