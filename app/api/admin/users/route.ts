import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminPage, escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["created_at", "full_name", "email", "role"] as const;

export async function GET(request: Request) {
  const client = await requireAdminClient();
  const admin = createSupabaseAdminClient();
  if (!client || !admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const query = parseAdminQuery(request, SORTS, "created_at");
  const search = escapePostgrestSearch(query.search);

  let selection = client.from("profiles").select("*", { count: "exact" });
  if (search) selection = selection.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  const role = query.filters.get("role");
  if (role === "admin" || role === "student") selection = selection.eq("role", role);
  let result = await selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to);

  if (result.error?.code === "42703") {
    // Hosted environments can serve the branch before its additive migration.
    let fallback = client.from("profiles").select("id,full_name,phone,role,avatar_url,created_at,updated_at", { count: "exact" });
    if (search) fallback = fallback.ilike("full_name", `%${search}%`);
    if (role === "admin" || role === "student") fallback = fallback.eq("role", role);
    result = await fallback.order(query.sort === "email" ? "created_at" : query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to) as typeof result;
  }
  if (result.error) return NextResponse.json({ error: "No fue posible consultar usuarios" }, { status: 500 });

  const profiles = result.data ?? [];
  const ids = profiles.map((profile) => profile.id);
  const [{ data: enrollments }, authUsers] = await Promise.all([
    ids.length ? client.from("enrollments").select("user_id").in("user_id", ids) : Promise.resolve({ data: [] as { user_id: string }[] }),
    profiles.some((profile) => !profile.email) ? admin.auth.admin.listUsers({ page: 1, perPage: 1000 }) : Promise.resolve({ data: { users: [] }, error: null }),
  ]);
  const counts = new Map<string, number>();
  for (const enrollment of enrollments ?? []) counts.set(enrollment.user_id, (counts.get(enrollment.user_id) ?? 0) + 1);
  const fallbackEmails = new Map((authUsers.data?.users ?? []).map((user) => [user.id, user.email ?? ""]));
  const users = profiles.map((profile) => ({
    id: profile.id,
    name: profile.full_name ?? profile.email ?? "Sin nombre",
    email: profile.email ?? fallbackEmails.get(profile.id) ?? "",
    phone: profile.phone ?? "",
    avatarUrl: profile.avatar_url ?? undefined,
    role: profile.role === "admin" ? "admin" as const : "user" as const,
    enrolledCourses: counts.get(profile.id) ?? 0,
    createdAt: profile.created_at.slice(0, 10),
  }));
  return NextResponse.json({ users, ...adminPage(users, result.count, query) });
}
