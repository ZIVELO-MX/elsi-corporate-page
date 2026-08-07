import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserEnrollmentCourseIds(): Promise<Set<string>> {
  const client = await createSupabaseServerClient();
  if (!client) return new Set();

  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return new Set();

  const { data, error } = await client
    .from("enrollments")
    .select("course_id")
    .eq("user_id", auth.user.id);
  if (error) return new Set();

  return new Set((data ?? []).map((enrollment) => enrollment.course_id));
}

export async function currentUserHasEnrollment(courseId: string): Promise<boolean> {
  const courseIds = await getCurrentUserEnrollmentCourseIds();
  return courseIds.has(courseId);
}

export async function currentUserHasPendingOrder(courseId: string): Promise<boolean> {
  const client = await createSupabaseServerClient();
  if (!client) return false;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return false;
  const { data, error } = await client.from("orders").select("id").eq("user_id", auth.user.id).eq("course_id", courseId).eq("status", "pending").limit(1).maybeSingle();
  return !error && Boolean(data);
}
