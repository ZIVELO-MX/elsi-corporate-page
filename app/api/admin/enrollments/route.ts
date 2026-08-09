import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminPage, escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["enrolled_at", "status", "source"] as const;

export async function GET(request: Request) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const query = parseAdminQuery(request, SORTS, "enrolled_at");
  const search = escapePostgrestSearch(query.search);
  let enrollmentSearchClauses: string | null = null;
  const certificate = query.filters.get("certificate");
  const certificateJoin = certificate === "pending" || certificate === "available" ? "certificates!inner" : "certificates";

  let selection = client.from("enrollments")
    .select(`id,user_id,course_id,source,status,enrolled_at,completed_at,${certificateJoin}(id,status,storage_path,original_filename,mime_type,size_bytes)`, { count: "exact" });
  if (search) {
    let profileMatches = await client.from("profiles").select("id").or(`full_name.ilike.%${search}%,email.ilike.%${search}%`).limit(500);
    if (profileMatches.error?.code === "42703") profileMatches = await client.from("profiles").select("id").ilike("full_name", `%${search}%`).limit(500);
    const courseMatches = await client.from("courses").select("id").ilike("title", `%${search}%`).limit(500);
    const userIds = (profileMatches.data ?? []).map((profile) => profile.id);
    const courseIds = (courseMatches.data ?? []).map((course) => course.id);
    if (userIds.length === 0 && courseIds.length === 0) return NextResponse.json({ enrollments: [], ...adminPage([], 0, query) });
    const clauses = [
      userIds.length ? `user_id.in.(${userIds.join(",")})` : null,
      courseIds.length ? `course_id.in.(${courseIds.join(",")})` : null,
    ].filter((clause): clause is string => Boolean(clause));
    enrollmentSearchClauses = clauses.join(",");
    selection = selection.or(enrollmentSearchClauses);
  }
  const status = query.filters.get("status");
  if (status === "in_progress" || status === "completed") selection = selection.eq("status", status);
  const source = query.filters.get("source");
  if (source === "internal" || source === "external" || source === "stripe") selection = selection.eq("source", source);
  const userId = query.filters.get("userId");
  if (userId) selection = selection.eq("user_id", userId);
  const courseId = query.filters.get("courseId");
  if (courseId) selection = selection.eq("course_id", courseId);
  if (certificate === "pending" || certificate === "available") selection = selection.eq("certificates.status", certificate);
  if (certificate === "none") selection = selection.is("certificates", null);
  let result = await selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to);
  if (result.error?.code === "42703") {
    let fallback = client.from("enrollments").select(`id,user_id,course_id,source,status,enrolled_at,completed_at,${certificateJoin}(id,status,storage_path)`, { count: "exact" });
    if (status === "in_progress" || status === "completed") fallback = fallback.eq("status", status);
    if (source === "internal" || source === "external" || source === "stripe") fallback = fallback.eq("source", source);
    if (userId) fallback = fallback.eq("user_id", userId);
    if (courseId) fallback = fallback.eq("course_id", courseId);
    if (certificate === "pending" || certificate === "available") fallback = fallback.eq("certificates.status", certificate);
    if (certificate === "none") fallback = fallback.is("certificates", null);
    if (enrollmentSearchClauses) fallback = fallback.or(enrollmentSearchClauses);
    result = await fallback.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to) as typeof result;
  }
  if (result.error) return NextResponse.json({ error: "No fue posible consultar inscripciones" }, { status: 500 });

  const rows = result.data ?? [];
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const courseIds = [...new Set(rows.map((row) => row.course_id))];
  const [profileResult, { data: courses }] = await Promise.all([
    userIds.length ? client.from("profiles").select("id,full_name,email,avatar_url").in("id", userIds) : Promise.resolve({ data: [], error: null }),
    courseIds.length ? client.from("courses").select("id,title,modality").in("id", courseIds) : Promise.resolve({ data: [] }),
  ]);
  const profiles = profileResult.error?.code === "42703"
    ? (await client.from("profiles").select("id,full_name,avatar_url").in("id", userIds)).data
    : profileResult.data;
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const courseById = new Map((courses ?? []).map((course) => [course.id, course]));
  const enrollments = rows.map((row) => ({ ...row, user: profileById.get(row.user_id) ?? null, course: courseById.get(row.course_id) ?? null }));
  return NextResponse.json({ enrollments, ...adminPage(enrollments, result.count, query) });
}

export async function POST(request: Request) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.userId !== "string" || typeof body.courseId !== "string" || !["internal", "external"].includes(body.source ?? "internal")) return NextResponse.json({ error: "Alumno, curso y origen son requeridos" }, { status: 400 });
  const { data, error } = await client.from("enrollments").insert({ user_id: body.userId, course_id: body.courseId, source: body.source ?? "internal" }).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "El alumno ya está inscrito en este curso" : "No fue posible registrar la inscripción" }, { status: error.code === "23505" ? 409 : 400 });
  const adminClient = createSupabaseAdminClient();
  if (adminClient) await adminClient.from("outbox_events").insert({ aggregate_type: "enrollment", aggregate_id: data.id, event_type: "enrollment.created", payload: { enrollmentId: data.id } });
  return NextResponse.json({ enrollment: data }, { status: 201 });
}
