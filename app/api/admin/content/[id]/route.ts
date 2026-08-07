import { NextResponse } from "next/server";
import { requireAdminContentClient, revalidatePublicContent, validateSection } from "@/lib/content-repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const section = validateSection(await request.json());
    const { id } = await params;
    const { data, error } = await client.from("page_sections").update(section).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: "No fue posible actualizar la sección" }, { status: 400 });
    revalidatePublicContent();
    return NextResponse.json({ section: data });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 }); }
}
