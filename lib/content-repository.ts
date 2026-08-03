import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";
import type { Solution } from "@/lib/solutions";

export type PublicContent = NonNullable<Awaited<ReturnType<typeof listPublicContent>>>;

export function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") throw new Error("Texto inválido");
  const clean = value.replace(/<[^>]*>/g, "").trim();
  if (!clean || clean.length > max) throw new Error("Texto fuera de rango");
  return clean;
}

export function validateSection(input: { sectionKey: unknown; title: unknown; body: unknown; isActive?: unknown; sortOrder?: unknown }) {
  const sectionKey = cleanText(input.sectionKey, 80).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(sectionKey)) throw new Error("Clave de sección inválida");
  const body: Json = input.body === undefined ? null : input.body as Json;
  return { section_key: sectionKey, title: cleanText(input.title, 160), body, is_active: input.isActive !== false, sort_order: Number.isInteger(input.sortOrder) ? input.sortOrder as number : 0 } satisfies Database["public"]["Tables"]["page_sections"]["Insert"];
}

export function validateTestimonial(input: { quote: unknown; authorName: unknown; authorRole?: unknown; imagePath?: unknown; consentReference?: unknown; isActive?: unknown; sortOrder?: unknown }) {
  return { quote: cleanText(input.quote, 1200), author_name: cleanText(input.authorName, 160), author_role: input.authorRole ? cleanText(input.authorRole, 160) : null, image_path: input.imagePath ? cleanText(input.imagePath, 500) : null, consent_reference: input.consentReference ? cleanText(input.consentReference, 200) : null, is_active: input.isActive === true, sort_order: Number.isInteger(input.sortOrder) ? input.sortOrder as number : 0 } satisfies Database["public"]["Tables"]["testimonials"]["Insert"];
}

export async function requireAdminContentClient() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await client.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  return profile?.role === "admin" ? client : null;
}

export async function listPublicContent() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const [sections, solutions, testimonials] = await Promise.all([
    client.from("page_sections").select("*").eq("is_active", true).order("sort_order"),
    client.from("solutions").select("*").eq("is_active", true).eq("content_status", "verified").order("sort_order"),
    client.from("testimonials").select("*").eq("is_active", true).order("sort_order"),
  ]);
  if (sections.error || solutions.error || testimonials.error) throw new Error("No fue posible consultar contenido");
  return { sections: sections.data ?? [], solutions: solutions.data ?? [], testimonials: testimonials.data ?? [] };
}

function bodyRecord(body: Json) {
  return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, Json> : {};
}

export function sectionText(content: PublicContent | null, sectionKey: string, fallback: string) {
  if (!content) return fallback;
  const section = content.sections.find((item) => item.section_key === sectionKey);
  if (!section) return fallback;
  const text = bodyRecord(section.body).text;
  return typeof text === "string" && text.trim() ? text.trim() : section.title || fallback;
}

export function mapPublicSolutions(content: PublicContent | null, fallback: readonly Solution[]) {
  if (!content) return fallback;
  return content.solutions.flatMap((row) => {
    const original = fallback.find((solution) => solution.slug === row.slug);
    if (!original) return [];
    const body = bodyRecord(row.body);
    const text = (key: string, value: string) => typeof body[key] === "string" && body[key] ? body[key] as string : value;
    const items = Array.isArray(body.items) ? body.items.filter((item): item is string => typeof item === "string") : original.items;
    return [{
      ...original,
      title: row.title,
      description: text("description", row.summary),
      eyebrow: text("eyebrow", original.eyebrow),
      audience: text("audience", original.audience),
      imageCaption: text("imageCaption", original.imageCaption),
      intro: text("intro", original.intro),
      approach: text("approach", original.approach),
      delivery: text("delivery", original.delivery),
      items,
      contentStatus: "verified" as const,
      updatedAt: row.updated_at,
    } satisfies Solution];
  });
}

export function revalidatePublicContent(slug?: string) {
  revalidatePath("/");
  revalidatePath("/nosotros");
  revalidatePath("/soluciones");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/soluciones/${slug}`);
}
