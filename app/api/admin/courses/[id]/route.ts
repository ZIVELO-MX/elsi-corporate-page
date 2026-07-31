import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { mapCourseInput, validateCourseInput } from "@/lib/courses-repository";

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
  try {
    const input = validateCourseInput(await request.json());
    const { id } = await params;
    const { data, error } = await client.from("courses").update(mapCourseInput(input)).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "El slug ya existe" : "No fue posible actualizar el curso" }, { status: error.code === "23505" ? 409 : 400 });
    return NextResponse.json({ course: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await client.from("courses").update({ is_active: false }).eq("id", id).select("id,is_active").single();
  if (error) return NextResponse.json({ error: "No fue posible desactivar el curso" }, { status: 400 });
  return NextResponse.json({ course: data });
}
