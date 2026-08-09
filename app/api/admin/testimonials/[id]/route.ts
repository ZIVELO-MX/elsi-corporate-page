import { NextResponse } from "next/server";
import { requireAdminContentClient, revalidatePublicContent, validateTestimonial } from "@/lib/content-repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const testimonial = validateTestimonial(await request.json());
    const { id } = await params;
    const { data, error } = await client.from("testimonials").update(testimonial).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: "No fue posible actualizar el testimonio" }, { status: 400 });
    revalidatePublicContent();
    return NextResponse.json({ testimonial: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { error } = await client.from("testimonials").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "No fue posible eliminar el testimonio" }, { status: 400 });
  revalidatePublicContent();
  return NextResponse.json({ deleted: true });
}
