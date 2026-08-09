import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminClient } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import { createCsv, type CsvColumn } from "@/lib/csv";

export const EXPORT_CONFIRMATION_HEADER = "x-elsi-export-confirmed";
type ExportContext = { client: SupabaseClient<Database>; request: Request };

type ExportDefinition<Row> = {
  entity: "users" | "courses" | "enrollments" | "orders" | "leads";
  filename: string;
  personalData: boolean;
  columns: CsvColumn<Row>[];
  load: (context: ExportContext) => Promise<Row[]>;
};

export function exportFilters(request: Request) {
  const filters: Record<string, string> = {};
  for (const [key, value] of new URL(request.url).searchParams) {
    if (key !== "page" && key !== "pageSize" && value) filters[key] = value.slice(0, 160);
  }
  return filters;
}

export function chunks<T>(values: T[], size = 200) {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

async function recordExportAudit(client: SupabaseClient<Database>, request: Request, entity: string, count: number) {
  const admin = createSupabaseAdminClient();
  const { data: auth } = await client.auth.getUser();
  if (!admin || !auth.user) return null;
  const metadata = { entity, filters: exportFilters(request), count } satisfies Json;
  const audit = await admin.from("audit_events").insert({
    actor_id: auth.user.id,
    action: "insert",
    resource_type: `${entity}_export`,
    metadata,
  }).select("id").single();
  if (!audit.error && audit.data) return { id: audit.data.id, store: "audit_events" };

  // Compatibility until the additive audit metadata migration reaches Supabase.
  const fallback = await admin.from("outbox_events").insert({
    aggregate_type: "admin_export",
    aggregate_id: null,
    event_type: "admin.export.audit",
    payload: metadata,
    status: "processed",
    processed_at: new Date().toISOString(),
  }).select("id").single();
  return fallback.error || !fallback.data ? null : { id: fallback.data.id, store: "outbox_events" };
}

export function createAdminCsvExport<Row>(definition: ExportDefinition<Row>) {
  return async function GET(request: Request) {
    const client = await requireAdminClient();
    if (!client) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (definition.personalData && request.headers.get(EXPORT_CONFIRMATION_HEADER) !== "true") {
      return NextResponse.json({ error: "Confirma la exportación de datos personales" }, { status: 428 });
    }
    try {
      const rows = await definition.load({ client, request });
      const audit = await recordExportAudit(client, request, definition.entity, rows.length);
      if (!audit) return NextResponse.json({ error: "No fue posible auditar la exportación" }, { status: 503 });
      return new NextResponse(createCsv(definition.columns, rows), {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${definition.filename}"`,
          "cache-control": "private, no-store",
          "x-export-audit-id": audit.id,
          "x-export-audit-store": audit.store,
        },
      });
    } catch {
      return NextResponse.json({ error: "No fue posible generar la exportación" }, { status: 500 });
    }
  };
}
