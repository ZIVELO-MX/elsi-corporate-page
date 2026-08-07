"use client";

import { Receipt } from "lucide-react";
import { useAdminData } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminSales() {
  const { loading, sales } = useAdminData();

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="admin-page-title">Ventas</h1>
        <p className="admin-page-sub">
          {sales.length} ventas registradas &middot; {totalRevenue > 0 ? `$${totalRevenue.toFixed(2)} total` : "Gratis por ahora"}
        </p>
      </div>

      <p style={{ margin: "0 0 1.25rem", padding: "0.75rem 1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
        Las ventas se generan automáticamente cuando Stripe confirma un pago. No se crean registros manuales desde este panel.
      </p>

      {loading ? (
        <TableSkeleton rows={4} widths={["9rem", "12rem", "5rem", "6rem"]} />
      ) : (
        <AdminTable
          rows={sales}
          rowKey={(s) => s.id}
          minWidth="32rem"
          columns={[
            { key: "user", header: "Usuario", primary: true, cell: (s) => <span style={{ fontWeight: 500 }}>{s.userName}</span> },
            { key: "course", header: "Curso", cell: (s) => <span className="admin-cell-truncate admin-cell-muted" title={s.courseName}>{s.courseName}</span> },
            {
              key: "amount", header: "Monto", align: "right",
              cell: (s) => (
                <span style={{ fontWeight: 600 }}>
                  {s.amount === 0 ? <span style={{ color: "var(--moss)" }}>Gratis</span> : `$${s.amount.toFixed(2)}`}
                </span>
              ),
            },
            { key: "date", header: "Fecha", cell: (s) => <span className="admin-cell-muted" style={{ whiteSpace: "nowrap" }}>{s.soldAt}</span> },
          ]}
          empty={
            <EmptyState
              icon={<Receipt size={20} aria-hidden="true" />}
              title="Sin ventas todavía"
              hint="Registra la primera venta con el formulario de arriba."
            />
          }
        />
      )}
    </div>
  );
}
