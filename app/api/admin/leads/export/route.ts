import { createAdminCsvExport } from "@/lib/admin-csv";
import { fetchAllPages } from "@/lib/csv";
import { escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["created_at", "full_name", "status"] as const;
type LeadExport = { id: string; full_name: string; email: string; phone: string | null; company: string | null; message: string; source: string; status: string; assigned_to: string | null; admin_notes: string | null; resolved_at: string | null; created_at: string };

export const GET = createAdminCsvExport<LeadExport>({
  entity: "leads",
  filename: "elsi-contacto.csv",
  personalData: true,
  columns: [
    { header: "id", value: (row) => row.id },
    { header: "nombre", value: (row) => row.full_name },
    { header: "correo", value: (row) => row.email },
    { header: "telefono", value: (row) => row.phone },
    { header: "empresa", value: (row) => row.company },
    { header: "mensaje", value: (row) => row.message },
    { header: "origen", value: (row) => row.source },
    { header: "estado", value: (row) => row.status },
    { header: "responsable", value: (row) => row.assigned_to },
    { header: "notas", value: (row) => row.admin_notes },
    { header: "resuelto_en", value: (row) => row.resolved_at },
    { header: "creado_en", value: (row) => row.created_at },
  ],
  async load({ client, request }) {
    const query = parseAdminQuery(request, SORTS, "created_at");
    const search = escapePostgrestSearch(query.search);
    return fetchAllPages<LeadExport>((from, to) => {
      // select("*") remains compatible while additive assignment columns reach hosted Supabase.
      let selection = client.from("contact_leads").select("*");
      if (search) selection = selection.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,message.ilike.%${search}%`);
      const status = query.filters.get("status");
      if (status === "new" || status === "contacted" || status === "closed") selection = selection.eq("status", status);
      return selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(from, to);
    });
  },
});
