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

  const [{ data: orders, error: ordersError }, { data: profiles, error: profilesError }] = await Promise.all([
    client.from("orders").select("id,user_id,course_id,course_title,amount_cents,currency,status,created_at").eq("status", "paid").order("created_at", { ascending: false }),
    client.from("profiles").select("id,full_name"),
  ]);

  if (ordersError || profilesError) {
    return NextResponse.json({ error: "No fue posible consultar ventas" }, { status: 500 });
  }

  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name ?? "Usuario ELSI"]));
  return NextResponse.json({
    sales: (orders ?? []).map((order) => ({
      id: order.id,
      userId: order.user_id,
      userName: names.get(order.user_id) ?? `Alumno ${order.user_id.slice(0, 8)}`,
      courseId: order.course_id,
      courseName: order.course_title,
      amount: order.amount_cents / 100,
      currency: order.currency,
      soldAt: order.created_at.slice(0, 10),
    })),
  });
}
