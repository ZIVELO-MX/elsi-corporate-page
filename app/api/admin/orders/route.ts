import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminPage, escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["created_at", "amount_cents", "status", "course_title"] as const;

export async function GET(request: Request) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const query = parseAdminQuery(request, SORTS, "created_at");
  const search = escapePostgrestSearch(query.search);
  let matchingUserIds: string[] = [];
  if (search) {
    let matches = await client.from("profiles").select("id").or(`full_name.ilike.%${search}%,email.ilike.%${search}%`).limit(500);
    if (matches.error?.code === "42703") matches = await client.from("profiles").select("id").ilike("full_name", `%${search}%`).limit(500);
    matchingUserIds = (matches.data ?? []).map((profile) => profile.id);
  }
  let selection = client.from("orders").select("*", { count: "exact" }).in("status", ["paid", "pending"]);
  if (search) {
    const userClause = matchingUserIds.length ? `,user_id.in.(${matchingUserIds.join(",")})` : "";
    selection = selection.or(`course_title.ilike.%${search}%,payment_reference.ilike.%${search}%${userClause}`);
  }
  const requestedStatus = query.filters.get("status");
  if (requestedStatus === "paid" || requestedStatus === "pending") selection = selection.eq("status", requestedStatus);
  let result = await selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to);
  if (result.error?.code === "42703") {
    let fallback = client.from("orders").select("*", { count: "exact" }).in("status", ["paid", "pending"]);
    if (search) {
      const userClause = matchingUserIds.length ? `,user_id.in.(${matchingUserIds.join(",")})` : "";
      fallback = fallback.or(`course_title.ilike.%${search}%${userClause}`);
    }
    if (requestedStatus === "paid" || requestedStatus === "pending") fallback = fallback.eq("status", requestedStatus);
    result = await fallback.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to);
  }
  if (result.error) return NextResponse.json({ error: "No fue posible consultar ventas" }, { status: 500 });

  const orders = result.data ?? [];
  const userIds = [...new Set(orders.map((order) => order.user_id))];
  let profileResult = userIds.length
    ? await client.from("profiles").select("id,full_name,email").in("id", userIds)
    : { data: [], error: null };
  if (profileResult.error?.code === "42703") profileResult = await client.from("profiles").select("id,full_name").in("id", userIds) as typeof profileResult;
  const profiles = profileResult.data;
  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name ?? profile.email ?? "Sin nombre"]));
  const mapped = orders.map((order) => ({
    id: order.id,
    userId: order.user_id,
    userName: names.get(order.user_id) ?? "Sin nombre",
    courseId: order.course_id,
    courseName: order.course_title,
    amount: order.amount_cents / 100,
    currency: order.currency,
    soldAt: order.created_at.slice(0, 10),
    status: order.status,
    paymentMethod: order.payment_method ?? undefined,
    paymentReference: order.payment_reference ?? undefined,
    reviewedAt: order.reviewed_at ?? undefined,
  }));
  return NextResponse.json({
    orders: mapped,
    sales: mapped.filter((order) => order.status === "paid"),
    pendingPayments: mapped.filter((order) => order.status === "pending"),
    ...adminPage(mapped, result.count, query),
  });
}

export async function POST(request: Request) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.orderId !== "string") return NextResponse.json({ error: "La orden es requerida" }, { status: 400 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return NextResponse.json({ error: "La operación administrativa no está configurada" }, { status: 503 });
  const { data, error } = await adminClient.rpc("approve_pending_order", { p_order_id: body.orderId, p_admin_id: auth.user.id });
  if (error) {
    if (error.message.includes("order_not_found")) return NextResponse.json({ error: "Pago pendiente no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "No fue posible aprobar la inscripción" }, { status: 500 });
  }
  return NextResponse.json({ result: data });
}
