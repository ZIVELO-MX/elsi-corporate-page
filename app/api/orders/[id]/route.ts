import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await client.from("orders").select("id,course_id,course_title,amount_cents,currency,status,expires_at,created_at").eq("id", id).eq("user_id", auth.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "No fue posible consultar la orden" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  return NextResponse.json({ order: data });
}
