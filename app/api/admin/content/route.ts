import { NextResponse } from "next/server";
import { requireAdminContentClient, revalidatePublicContent, validateSection } from "@/lib/content-repository";

export async function GET() {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const [sections, solutions, testimonials] = await Promise.all([client.from("page_sections").select("*").order("sort_order"), client.from("solutions").select("*").order("sort_order"), client.from("testimonials").select("*").order("sort_order")]);
  if (sections.error || solutions.error || testimonials.error) return NextResponse.json({ error: "No fue posible consultar contenido" }, { status: 500 });
  return NextResponse.json({ sections: sections.data ?? [], solutions: solutions.data ?? [], testimonials: testimonials.data ?? [] });
}

export async function POST(request: Request) {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const section = validateSection(await request.json());
    const { data, error } = await client.from("page_sections").insert(section).select().single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "La clave ya existe" : "No fue posible guardar la sección" }, { status: error.code === "23505" ? 409 : 400 });
    revalidatePublicContent();
    return NextResponse.json({ section: data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos" }, { status: 400 }); }
}
