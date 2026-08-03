import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

function revalidateCourseSurfaces(slug?: string) {
  revalidatePath("/cursos");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/cursos/${slug}`);
}

export async function GET() {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await client.from("courses").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "No fue posible consultar cursos" }, { status: 500 });
  return NextResponse.json({ courses: data ?? [] });
}

export async function POST(request: Request) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const input = validateCourseInput(await request.json());
    const { data, error } = await client.from("courses").insert(mapCourseInput(input)).select().single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "El slug ya existe" : "No fue posible crear el curso" }, { status: error.code === "23505" ? 409 : 400 });
    revalidateCourseSurfaces(data.slug);
    return NextResponse.json({ course: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 });
  }
}
