import { chunks, createAdminCsvExport } from "@/lib/admin-csv";
import { fetchAllPages } from "@/lib/csv";
import { escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";

const SORTS = ["created_at", "amount_cents", "status", "course_title"] as const;
type OrderRow = { id: string; user_id: string; course_id: string; course_title: string; amount_cents: number; currency: string; status: string; payment_method: string | null; payment_reference?: string | null; reviewed_at: string | null; created_at: string };
type OrderExport = OrderRow & { user_name: string; user_email: string };

export const GET = createAdminCsvExport<OrderExport>({
  entity: "orders",
  filename: "elsi-ventas.csv",
  personalData: true,
  columns: [
    { header: "id", value: (row) => row.id },
    { header: "usuario_id", value: (row) => row.user_id },
    { header: "nombre", value: (row) => row.user_name },
    { header: "correo", value: (row) => row.user_email },
    { header: "curso_id", value: (row) => row.course_id },
    { header: "curso", value: (row) => row.course_title },
    { header: "monto_centavos", value: (row) => row.amount_cents },
    { header: "moneda", value: (row) => row.currency },
    { header: "estado", value: (row) => row.status },
    { header: "metodo_pago", value: (row) => row.payment_method },
    { header: "referencia_pago", value: (row) => row.payment_reference },
    { header: "revisado_en", value: (row) => row.reviewed_at },
    { header: "creado_en", value: (row) => row.created_at },
  ],
  async load({ client, request }) {
    const query = parseAdminQuery(request, SORTS, "created_at");
    const requestedStatus = query.filters.get("status");
    const rows = await fetchAllPages<OrderRow>((from, to) => {
      let selection = client.from("orders").select("*").in("status", ["paid", "pending"]);
      if (requestedStatus === "paid" || requestedStatus === "pending") selection = selection.eq("status", requestedStatus);
      return selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(from, to);
    });
    const profilePages = await Promise.all(chunks([...new Set(rows.map((row) => row.user_id))]).map(async (ids) => {
      let result = await client.from("profiles").select("id,full_name,email").in("id", ids);
      if (result.error?.code === "42703") result = await client.from("profiles").select("id,full_name").in("id", ids) as typeof result;
      if (result.error) throw result.error;
      return result.data ?? [];
    }));
    const profiles = profilePages.flat();
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
    const search = escapePostgrestSearch(query.search).toLocaleLowerCase("es-MX");
    const exported: OrderExport[] = [];
    for (const row of rows) {
      const result = {
        ...row,
        user_name: profileById.get(row.user_id)?.full_name ?? "",
        user_email: profileById.get(row.user_id)?.email ?? "",
      };
      if (!search || `${result.user_name} ${result.user_email} ${result.course_title} ${result.payment_reference ?? ""}`.toLocaleLowerCase("es-MX").includes(search)) exported.push(result);
    }
    return exported;
  },
});
