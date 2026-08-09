import { NextResponse } from "next/server";
import { requireAdminContentClient, revalidatePublicContent, validateSolution } from "@/lib/content-repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const solution = validateSolution(await request.json());
    const { id } = await params;
    const { data, error } = await client.from("solutions").update(solution).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "El slug ya existe" : "No fue posible actualizar la solución" }, { status: error.code === "23505" ? 409 : 400 });
    revalidatePublicContent(data.slug);
    return NextResponse.json({ solution: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 });
  }
}
