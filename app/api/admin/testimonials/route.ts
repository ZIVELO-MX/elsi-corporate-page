import { NextResponse } from "next/server";
import { requireAdminContentClient, revalidatePublicContent, validateTestimonial } from "@/lib/content-repository";
import { adminPage, escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["sort_order", "created_at", "author_name"] as const;

export async function GET(request: Request) {
  const client = await requireAdminContentClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const query = parseAdminQuery(request, SORTS, "sort_order");
  const search = escapePostgrestSearch(query.search);
  let selection = client.from("testimonials").select("*", { count: "exact" });
  if (search) selection = selection.or(`author_name.ilike.%${search}%,author_role.ilike.%${search}%,quote.ilike.%${search}%`);
  const status = query.filters.get("status");
  if (status === "active" || status === "inactive") selection = selection.eq("is_active", status === "active");
  const { data, error, count } = await selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to);
  if (error) return NextResponse.json({ error: "No fue posible consultar testimonios" }, { status: 500 });
  const testimonials = data ?? [];
  return NextResponse.json({ testimonials, ...adminPage(testimonials, count, query) });
}

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
