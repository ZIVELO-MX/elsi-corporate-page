import { NextResponse } from "next/server";
import { requireAdminContentClient, revalidatePublicContent, validateTestimonial } from "@/lib/content-repository";

export async function POST(request: Request) {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const testimonial = validateTestimonial(await request.json());
    const { data, error } = await client.from("testimonials").insert(testimonial).select().single();
    if (error) return NextResponse.json({ error: "No fue posible guardar el testimonio" }, { status: 400 });
    revalidatePublicContent();
    return NextResponse.json({ testimonial: data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 }); }
}
