import { NextResponse } from "next/server";
import { requireAdminClient } from "@/lib/admin-auth";
import { adminPage, escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["created_at", "full_name", "status"] as const;

export async function GET(request: Request) {
  const client = await requireAdminClient();
  if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const query = parseAdminQuery(request, SORTS, "created_at");
  const search = escapePostgrestSearch(query.search);
  let selection = client.from("contact_leads").select("*", { count: "exact" });
  if (search) selection = selection.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,message.ilike.%${search}%`);
  const status = query.filters.get("status");
  if (status === "new" || status === "contacted" || status === "closed") selection = selection.eq("status", status);
  const { data, error, count } = await selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(query.from, query.to);
  if (error) return NextResponse.json({ error: "No fue posible consultar mensajes" }, { status: 500 });
  const rows = data ?? [];
  const slugs = [...new Set(rows.map((lead) => lead.source.startsWith("course:") ? lead.source.slice(7) : null).filter((slug): slug is string => Boolean(slug)))];
  const { data: courses } = slugs.length
    ? await client.from("courses").select("slug,title").in("slug", slugs)
    : { data: [] };
  const courseTitles = new Map((courses ?? []).map((course) => [course.slug, course.title]));
  const leads = rows.map((lead) => ({
    ...lead,
    course_title: lead.source.startsWith("course:") ? courseTitles.get(lead.source.slice(7)) ?? null : null,
  }));
  return NextResponse.json({ leads, ...adminPage(leads, count, query) });
}
