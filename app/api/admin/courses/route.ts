import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin-auth";
import { adminPage, escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";
import { mapCourseInput, validateCourseInput } from "@/lib/courses-repository";

const SORTS = ["created_at", "title", "price_cents", "category"] as const;

function revalidateCourseSurfaces(slug?: string) {
  revalidatePath("/cursos");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/cursos/${slug}`);
}

export async function GET(request: Request) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const query = parseAdminQuery(request, SORTS, "created_at");
  const search = escapePostgrestSearch(query.search);

  let selection = client.from("courses").select("*", { count: "exact" });
  if (search) selection = selection.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  const visibility = query.filters.get("visibility");
  if (visibility === "active" || visibility === "inactive") selection = selection.eq("is_active", visibility === "active");
  const editorial = query.filters.get("editorial");
  if (editorial === "fixture" || editorial === "verified") selection = selection.eq("content_status", editorial);
  const modality = query.filters.get("modality");
  if (modality === "online" || modality === "in_person") selection = selection.eq("modality", modality);
  const category = query.filters.get("category");
  if (category) selection = selection.eq("category", category.slice(0, 120));
  const id = query.filters.get("id");
  if (id) selection = selection.eq("id", id);

  const { data, error, count } = await selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to);
  if (error) return NextResponse.json({ error: "No fue posible consultar cursos" }, { status: 500 });

  const ids = (data ?? []).map((course) => course.id);
  let studentCounts = new Map<string, number>();
  if (ids.length > 0) {
    const counts = await client.rpc("get_admin_course_enrollment_counts", { p_course_ids: ids });
    if (!counts.error) {
      studentCounts = new Map((counts.data ?? []).map((row) => [row.course_id, Number(row.enrollment_count)]));
    } else {
      // Compatibility while the additive ELS-0073 migration reaches Supabase.
      const fallback = await client.from("enrollments").select("course_id").in("course_id", ids);
      for (const enrollment of fallback.data ?? []) {
        studentCounts.set(enrollment.course_id, (studentCounts.get(enrollment.course_id) ?? 0) + 1);
      }
    }
  }

  const courses = (data ?? []).map((course) => ({ ...course, category: course.category ?? "General", students: studentCounts.get(course.id) ?? 0 }));
  return NextResponse.json({ courses, ...adminPage(courses, count, query) });
}

export async function POST(request: Request) {
  const client = await requireAdminClient();
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
