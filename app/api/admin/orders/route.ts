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
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [{ data: orders, error: ordersError }, { data: profiles, error: profilesError }] = await Promise.all([
    client.from("orders").select("id,user_id,course_id,course_title,amount_cents,currency,status,created_at").in("status", ["paid", "pending"]).order("created_at", { ascending: false }),
    client.from("profiles").select("id,full_name"),
  ]);

  if (ordersError || profilesError) {
    return NextResponse.json({ error: "No fue posible consultar ventas" }, { status: 500 });
  }

  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name ?? "Usuario ELSI"]));
  const mapOrder = (order: NonNullable<typeof orders>[number]) => ({
      id: order.id,
      userId: order.user_id,
      userName: names.get(order.user_id) ?? `Alumno ${order.user_id.slice(0, 8)}`,
      courseId: order.course_id,
      courseName: order.course_title,
      amount: order.amount_cents / 100,
      currency: order.currency,
      soldAt: order.created_at.slice(0, 10),
      status: order.status,
    });

  const mapped = (orders ?? []).map(mapOrder);
  return NextResponse.json({
    sales: mapped.filter((order) => order.status === "paid"),
    pendingPayments: mapped.filter((order) => order.status === "pending"),
  });
}

export async function POST(request: Request) {
  const client = await requireAdmin();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (typeof body.orderId !== "string") {
    return NextResponse.json({ error: "La orden es requerida" }, { status: 400 });
  }

  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return NextResponse.json({ error: "La operación administrativa no está configurada" }, { status: 503 });

  const { data, error } = await adminClient.rpc("approve_pending_order", {
    p_order_id: body.orderId,
    p_admin_id: auth.user.id,
  });
  if (error) {
    if (error.message.includes("order_not_found")) return NextResponse.json({ error: "Pago pendiente no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "No fue posible aprobar la inscripción" }, { status: 500 });
  }

  return NextResponse.json({ result: data });
}
