import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { mapCoursePatch, validateCoursePatch } from "@/lib/courses-repository";

async function requireAdmin() {
  if (!hasSupabasePublicConfig()) return null;
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  return profile?.role === "admin" ? client : null;
}

function revalidateCourseSurfaces(slug?: string, previousSlug?: string) {
  revalidatePath("/cursos");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/cursos/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/cursos/${previousSlug}`);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    // Partial update: only the fields the admin actually sends are written, so
    // editing a course never reverts content_status/is_active or wipes the
    // structured syllabus it did not touch.
    const input = validateCoursePatch(await request.json());
    const { id } = await params;
    const { data: previous } = await client.from("courses").select("slug, syllabus").eq("id", id).maybeSingle();
    if (!previous) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    const update = mapCoursePatch(input, previous.syllabus);
    if (Object.keys(update).length === 0) {
      const { data: current } = await client.from("courses").select().eq("id", id).single();
      return NextResponse.json({ course: current });
    }
    const { data, error } = await client.from("courses").update(update).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "El slug ya existe" : "No fue posible actualizar el curso" }, { status: error.code === "23505" ? 409 : 400 });
    revalidateCourseSurfaces(data.slug, previous?.slug);
    return NextResponse.json({ course: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [client, { id }] = await Promise.all([requireAdmin(), params]);
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await client.from("courses").update({ is_active: false }).eq("id", id).select("id,is_active,slug").single();
  if (error) return NextResponse.json({ error: "No fue posible desactivar el curso" }, { status: 400 });
  revalidateCourseSurfaces(data.slug);
  return NextResponse.json({ course: data });
}
