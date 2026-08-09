import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.role !== "admin" && body.role !== "student") return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  const { id } = await params;
  const { data, error } = await client.rpc("change_admin_user_role", { p_user_id: id, p_role: body.role });
  if (error) {
    if (error.message.includes("self_role_change")) return NextResponse.json({ error: "No puedes quitar tu propio acceso administrativo" }, { status: 409 });
    if (error.message.includes("last_admin")) return NextResponse.json({ error: "Debe permanecer al menos un administrador" }, { status: 409 });
    if (error.message.includes("user_not_found")) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "No fue posible cambiar el rol" }, { status: 400 });
  }
  return NextResponse.json({ user: data });
}
