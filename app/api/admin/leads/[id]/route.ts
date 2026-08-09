import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!["new", "contacted", "closed"].includes(body.status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  if (body.assignedTo !== undefined && body.assignedTo !== null && typeof body.assignedTo !== "string") return NextResponse.json({ error: "Responsable inválido" }, { status: 400 });
  if (body.adminNotes !== undefined && typeof body.adminNotes !== "string") return NextResponse.json({ error: "Notas inválidas" }, { status: 400 });
  const { id } = await params;
  const update = {
    status: body.status as "new" | "contacted" | "closed",
    assigned_to: body.assignedTo ?? null,
    admin_notes: typeof body.adminNotes === "string" ? body.adminNotes.trim().slice(0, 5000) || null : null,
    resolved_at: body.status === "closed" ? new Date().toISOString() : null,
  };
  let result = await client.from("contact_leads").update(update).eq("id", id).select("id,status,assigned_to,resolved_at,admin_notes").single();
  if (result.error?.code === "42703") result = await client.from("contact_leads").update({ status: update.status }).eq("id", id).select("id,status").single() as typeof result;
  const { data, error } = result;
  if (error) return NextResponse.json({ error: "No fue posible actualizar el mensaje" }, { status: 400 });
  return NextResponse.json({ lead: data });
}
