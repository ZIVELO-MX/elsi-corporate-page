import { createSupabasePublicClient } from "@/lib/supabase/server";
import { CATALOG_CATEGORIES } from "@/lib/agentic-navigation";
import type { Course, CourseModality, PublishState } from "@/lib/courses";
import type { Database } from "@/lib/supabase/types";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
export type CourseInput = {
  slug: string;
  title: string;
  shortDescription: string;
  description?: string | null;
  durationHours?: number | null;
  audience?: string | null;
  syllabus?: unknown;
  modality?: CourseModality;
  location?: string | null;
  startsAt?: string | null;
  enrollmentLink?: string | null;
  priceCents?: number;
  currency?: string;
  contentStatus?: "fixture" | "verified";
  isActive?: boolean;
};

export function validateCourseInput(input: CourseInput) {
  const slug = input.slug?.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug inválido");
  if (!input.title?.trim() || !input.shortDescription?.trim()) throw new Error("Título y descripción son requeridos");
  if (input.priceCents !== undefined && (!Number.isInteger(input.priceCents) || input.priceCents < 0)) throw new Error("Precio inválido");
  if (input.modality && !["online", "presencial"].includes(input.modality)) throw new Error("Modalidad inválida");
  return { ...input, slug, title: input.title.trim(), shortDescription: input.shortDescription.trim(), priceCents: input.priceCents ?? 0 };
}

function resolveCategory(label: unknown): { category: string; cat: string; catLabel: string } {
  const text = typeof label === "string" && label.trim() ? label.trim() : "";
  const entry = CATALOG_CATEGORIES.find(
    (item) => item.key !== "todos" && (item.label === text || text.startsWith(item.label)),
  );
  return { category: text, cat: entry?.key ?? "", catLabel: entry?.label ?? text };
}

function mapCourse(row: CourseRow): Course {
  const syllabus = row.syllabus && typeof row.syllabus === "object" && !Array.isArray(row.syllabus) ? row.syllabus as Record<string, unknown> : {};
  const moduleList = Array.isArray(syllabus.moduleList) ? syllabus.moduleList.filter((item): item is string => typeof item === "string") : [];
  const publishState = (syllabus.publishState as PublishState | undefined) ?? (row.is_active ? "published" : "draft");
  const category = resolveCategory(syllabus.category);
  const certificateType = typeof syllabus.certificateType === "string" && syllabus.certificateType.trim() ? syllabus.certificateType.trim() : undefined;
  return {
    id: row.id, slug: row.slug, title: row.title, category: category.category, cat: category.cat, catLabel: category.catLabel,
    duration: row.duration_hours ? `${row.duration_hours} horas` : "",
    modules: moduleList.length, status: publishState, students: 0,
    price: row.price_cents / 100, description: row.description ?? row.short_description,
    moduleList, publishState, modality: row.modality === "in_person" ? "presencial" : "online",
    place: row.location ?? undefined, priceLabel: undefined, featured: false,
    targetAudience: row.audience ? [row.audience] : undefined,
    certificateType,
    contentStatus: row.content_status, updatedAt: row.updated_at,
  };
}

export async function listPublicCourses() {
  const client = createSupabasePublicClient();
  if (!client) return null;
  const { data, error } = await client.from("courses").select("*").eq("is_active", true).eq("content_status", "verified").order("created_at", { ascending: false });
  if (error) throw new Error("No fue posible consultar el catálogo");
  return (data ?? []).map(mapCourse);
}

export async function getPublicCourse(slug: string) {
  const client = createSupabasePublicClient();
  if (!client) return null;
  const { data, error } = await client.from("courses").select("*").eq("slug", slug).eq("is_active", true).eq("content_status", "verified").maybeSingle();
  if (error) throw new Error("No fue posible consultar el curso");
  return data ? mapCourse(data) : undefined;
}

export function mapCourseInput(input: ReturnType<typeof validateCourseInput>): Database["public"]["Tables"]["courses"]["Insert"] {
  return {
    slug: input.slug, title: input.title, short_description: input.shortDescription,
    description: input.description ?? null, duration_hours: input.durationHours ?? null,
    audience: input.audience ?? null, syllabus: input.syllabus as Database["public"]["Tables"]["courses"]["Insert"]["syllabus"],
    modality: input.modality === "presencial" ? "in_person" : "online",
    location: input.location ?? null, starts_at: input.startsAt ?? null,
    enrollment_link: input.enrollmentLink ?? null, price_cents: input.priceCents,
    currency: input.currency ?? "MXN", content_status: input.contentStatus ?? "fixture", is_active: input.isActive ?? false,
  };
}

type SyllabusJson = Database["public"]["Tables"]["courses"]["Insert"]["syllabus"];
const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

// Partial edit contract. Only the keys the admin actually sends are validated
// and mapped, so an update never clobbers unsent columns (content_status,
// is_active, description, the structured syllabus, etc.).
export function validateCoursePatch(raw: unknown): Partial<CourseInput> {
  const input = (isObject(raw) ? raw : {}) as Partial<CourseInput>;
  const out: Partial<CourseInput> = {};
  if (input.slug !== undefined) {
    const slug = String(input.slug).trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug inválido");
    out.slug = slug;
  }
  if (input.title !== undefined) {
    if (!String(input.title).trim()) throw new Error("Título requerido");
    out.title = String(input.title).trim();
  }
  if (input.shortDescription !== undefined) {
    if (!String(input.shortDescription).trim()) throw new Error("Descripción requerida");
    out.shortDescription = String(input.shortDescription).trim();
  }
  if (input.priceCents !== undefined) {
    if (!Number.isInteger(input.priceCents) || input.priceCents < 0) throw new Error("Precio inválido");
    out.priceCents = input.priceCents;
  }
  if (input.modality !== undefined) {
    if (!["online", "presencial"].includes(input.modality)) throw new Error("Modalidad inválida");
    out.modality = input.modality;
  }
  if (input.contentStatus !== undefined && !["fixture", "verified"].includes(input.contentStatus)) throw new Error("Estado editorial inválido");
  if (input.isActive !== undefined && typeof input.isActive !== "boolean") throw new Error("Visibilidad inválida");
  for (const key of ["description", "durationHours", "audience", "syllabus", "location", "startsAt", "enrollmentLink", "currency", "contentStatus", "isActive"] as const) {
    if (input[key] !== undefined) Object.assign(out, { [key]: input[key] });
  }
  return out;
}

export function mapCoursePatch(input: Partial<CourseInput>, existingSyllabus: unknown): Database["public"]["Tables"]["courses"]["Update"] {
  const update: Database["public"]["Tables"]["courses"]["Update"] = {};
  if (input.slug !== undefined) update.slug = input.slug;
  if (input.title !== undefined) update.title = input.title;
  if (input.shortDescription !== undefined) update.short_description = input.shortDescription;
  if (input.description !== undefined) update.description = input.description ?? null;
  if (input.durationHours !== undefined) update.duration_hours = input.durationHours ?? null;
  if (input.audience !== undefined) update.audience = input.audience ?? null;
  if (input.modality !== undefined) update.modality = input.modality === "presencial" ? "in_person" : "online";
  if (input.location !== undefined) update.location = input.location ?? null;
  if (input.startsAt !== undefined) update.starts_at = input.startsAt ?? null;
  if (input.enrollmentLink !== undefined) update.enrollment_link = input.enrollmentLink ?? null;
  if (input.priceCents !== undefined) update.price_cents = input.priceCents;
  if (input.currency !== undefined) update.currency = input.currency ?? "MXN";
  if (input.contentStatus !== undefined) update.content_status = input.contentStatus;
  if (input.isActive !== undefined) update.is_active = input.isActive;
  if (input.syllabus !== undefined) {
    update.syllabus = isObject(input.syllabus)
      ? ({ ...(isObject(existingSyllabus) ? existingSyllabus : {}), ...input.syllabus } as SyllabusJson)
      : (input.syllabus as SyllabusJson);
  }
  return update;
}
