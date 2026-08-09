import { createAdminCsvExport } from "@/lib/admin-csv";
import { fetchAllPages } from "@/lib/csv";
import { escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["created_at", "title", "price_cents", "category"] as const;
type CourseExport = { id: string; slug: string; title: string; category: string; modality: string; is_active: boolean; content_status: string; price_cents: number; currency: string; created_at: string };

export const GET = createAdminCsvExport<CourseExport>({
  entity: "courses",
  filename: "elsi-cursos.csv",
  personalData: false,
  columns: [
    { header: "id", value: (row) => row.id },
    { header: "slug", value: (row) => row.slug },
    { header: "titulo", value: (row) => row.title },
    { header: "categoria", value: (row) => row.category },
    { header: "modalidad", value: (row) => row.modality },
    { header: "estado", value: (row) => row.is_active ? "activo" : "inactivo" },
    { header: "contenido", value: (row) => row.content_status },
    { header: "precio_centavos", value: (row) => row.price_cents },
    { header: "moneda", value: (row) => row.currency },
    { header: "creado_en", value: (row) => row.created_at },
  ],
  async load({ client, request }) {
    const query = parseAdminQuery(request, SORTS, "created_at");
    const search = escapePostgrestSearch(query.search);
    return fetchAllPages<CourseExport>((from, to) => {
      // select("*") remains compatible while additive operational columns reach hosted Supabase.
      let selection = client.from("courses").select("*");
      if (search) selection = selection.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
      const visibility = query.filters.get("visibility");
      if (visibility === "active" || visibility === "inactive") selection = selection.eq("is_active", visibility === "active");
      const editorial = query.filters.get("editorial");
      if (editorial === "fixture" || editorial === "verified") selection = selection.eq("content_status", editorial);
      const modality = query.filters.get("modality");
      if (modality === "online" || modality === "in_person") selection = selection.eq("modality", modality);
      const category = query.filters.get("category");
      if (category) selection = selection.eq("category", category.slice(0, 120));
      return selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(from, to);
    });
  },
});
