import { createAdminCsvExport } from "@/lib/admin-csv";
import { fetchAllPages } from "@/lib/csv";
import { escapePostgrestSearch, parseAdminQuery } from "@/lib/admin-query";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const SORTS = ["created_at", "full_name", "email", "role"] as const;

type UserExport = { id: string; full_name: string | null; email: string | null; phone: string | null; role: string; created_at: string };

export const GET = createAdminCsvExport<UserExport>({
  entity: "users",
  filename: "elsi-usuarios.csv",
  personalData: true,
  columns: [
    { header: "id", value: (row) => row.id },
    { header: "nombre", value: (row) => row.full_name },
    { header: "correo", value: (row) => row.email },
    { header: "telefono", value: (row) => row.phone },
    { header: "rol", value: (row) => row.role },
    { header: "creado_en", value: (row) => row.created_at },
  ],
  async load({ client, request }) {
    const query = parseAdminQuery(request, SORTS, "created_at");
    const search = escapePostgrestSearch(query.search);
    const role = query.filters.get("role");
    try {
      return await fetchAllPages<UserExport>((from, to) => {
        let selection = client.from("profiles").select("id,full_name,email,phone,role,created_at");
        if (search) selection = selection.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        if (role === "admin" || role === "student") selection = selection.eq("role", role);
        return selection.order(query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(from, to);
      });
    } catch {
      const profiles = await fetchAllPages<Omit<UserExport, "email">>((from, to) => {
        let selection = client.from("profiles").select("id,full_name,phone,role,created_at");
        if (role === "admin" || role === "student") selection = selection.eq("role", role);
        return selection.order(query.sort === "email" ? "created_at" : query.sort, { ascending: query.ascending }).order("id", { ascending: query.ascending }).range(from, to);
      });
      const admin = createSupabaseAdminClient();
      const emails = new Map<string, string>();
      if (admin) {
        const first = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (first.error) throw first.error;
        const totalPages = Math.ceil((first.data.total ?? first.data.users.length) / 1000);
        const remaining = await Promise.all(Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => admin.auth.admin.listUsers({ page: index + 2, perPage: 1000 })));
        for (const result of [first, ...remaining]) {
          if (result.error) throw result.error;
          for (const user of result.data.users) emails.set(user.id, user.email ?? "");
        }
      }
      const normalizedSearch = search.toLocaleLowerCase("es-MX");
      const exported: UserExport[] = [];
      for (const profile of profiles) {
        const result = { ...profile, email: emails.get(profile.id) ?? "" };
        if (!normalizedSearch || `${result.full_name ?? ""} ${result.email}`.toLocaleLowerCase("es-MX").includes(normalizedSearch)) exported.push(result);
      }
      return exported;
    }
  },
});
