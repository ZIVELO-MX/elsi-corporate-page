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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!["in_progress", "completed"].includes(body.status)) return NextResponse.json({ error: "Transición inválida" }, { status: 400 });
  const { id } = await params;
  const { data, error } = await client.from("enrollments").update({ status: body.status, completed_at: body.status === "completed" ? new Date().toISOString() : null }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "No fue posible actualizar la inscripción" }, { status: 400 });
  return NextResponse.json({ enrollment: data });
}
