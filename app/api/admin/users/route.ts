import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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
  const admin = createSupabaseAdminClient();
  if (!client || !admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [{ data: profiles, error: profileError }, { data: authUsers, error: authError }] = await Promise.all([
    client.from("profiles").select("id,full_name,role,created_at"),
    admin.auth.admin.listUsers({ page: 1, perPage: 100 }),
  ]);
  if (profileError || authError) return NextResponse.json({ error: "No fue posible consultar usuarios" }, { status: 500 });

  const ids = (profiles ?? []).map(profile => profile.id);
  const { data: enrollments } = ids.length
    ? await client.from("enrollments").select("user_id").in("user_id", ids)
    : { data: [] as { user_id: string }[] };
  const counts = new Map<string, number>();
  for (const enrollment of enrollments ?? []) counts.set(enrollment.user_id, (counts.get(enrollment.user_id) ?? 0) + 1);
  const emails = new Map((authUsers?.users ?? []).map(user => [user.id, user.email ?? ""]));

  return NextResponse.json({ users: (profiles ?? []).map(profile => ({
    id: profile.id,
    name: profile.full_name ?? "Usuario ELSI",
    email: emails.get(profile.id) ?? "",
    role: profile.role,
    enrolledCourses: counts.get(profile.id) ?? 0,
    createdAt: profile.created_at.slice(0, 10),
  })) });
}
