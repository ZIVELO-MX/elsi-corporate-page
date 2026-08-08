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
    const input = validateCourseInput(await request.json());
    const { id } = await params;
    const { data: previous } = await client.from("courses").select("slug, syllabus, content_status, is_active").eq("id", id).maybeSingle();
    if (!previous) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    // Preserve metadata the admin form does not send, so editing a course never
    // silently reverts its publish/verification state or wipes the structured
    // syllabus (category, publishState, certificateType, moduleList).
    const mapped = mapCourseInput(input);
    if (input.contentStatus === undefined) mapped.content_status = previous.content_status;
    if (input.isActive === undefined) mapped.is_active = previous.is_active;
    const previousSyllabus = previous.syllabus && typeof previous.syllabus === "object" && !Array.isArray(previous.syllabus)
      ? previous.syllabus as Record<string, unknown>
      : {};
    if (input.syllabus === undefined) {
      mapped.syllabus = previous.syllabus;
    } else if (input.syllabus && typeof input.syllabus === "object" && !Array.isArray(input.syllabus)) {
      mapped.syllabus = { ...previousSyllabus, ...(input.syllabus as Record<string, unknown>) };
    }
    const { data, error } = await client.from("courses").update(mapped).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "El slug ya existe" : "No fue posible actualizar el curso" }, { status: error.code === "23505" ? 409 : 400 });
    revalidateCourseSurfaces(data.slug, previous?.slug);
    return NextResponse.json({ course: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { data: previous } = await client.from("courses").select("slug").eq("id", id).maybeSingle();
  const { data, error } = await client.from("courses").update({ is_active: false }).eq("id", id).select("id,is_active,slug").single();
  if (error) return NextResponse.json({ error: "No fue posible desactivar el curso" }, { status: 400 });
  revalidateCourseSurfaces(previous?.slug);
  return NextResponse.json({ course: data });
}
