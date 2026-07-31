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
  const { data, error } = await client.from("enrollments").select("id,user_id,course_id,source,status,enrolled_at,completed_at").order("enrolled_at", { ascending: false });
  if (error) return NextResponse.json({ error: "No fue posible consultar inscripciones" }, { status: 500 });
  return NextResponse.json({ enrollments: data ?? [] });
}

export async function POST(request: Request) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.userId !== "string" || typeof body.courseId !== "string" || !["internal", "external"].includes(body.source ?? "internal")) return NextResponse.json({ error: "Alumno, curso y origen son requeridos" }, { status: 400 });
  const { data, error } = await client.from("enrollments").insert({ user_id: body.userId, course_id: body.courseId, source: body.source ?? "internal" }).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "El alumno ya está inscrito en este curso" : "No fue posible registrar la inscripción" }, { status: error.code === "23505" ? 409 : 400 });
  return NextResponse.json({ enrollment: data }, { status: 201 });
}
