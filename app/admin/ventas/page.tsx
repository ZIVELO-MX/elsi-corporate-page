"use client";

import { Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { extractAdminError, useAdminCollection, type PendingPayment, type Sale } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminExportButton } from "@/components/admin/export-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin-format";

type OrderRow = Sale & { status: "paid" | "pending" };

function PendingPaymentTable({ rows, onApprove }: { rows: PendingPayment[]; onApprove: (payment: PendingPayment) => Promise<void> }) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const { toast } = useToast();

  const approve = async () => {
    if (!selectedPayment) return;
    const payment = selectedPayment;
    setApprovingId(payment.id);
    try {
      await onApprove(payment);
      toast({ title: "Inscripción aprobada. El alumno ya puede ver el curso en su perfil.", variant: "success" });
      setSelectedPayment(null);
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "No fue posible aprobar la inscripción.", variant: "error" });
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <>
      <AdminTable
        rows={rows}
        rowKey={(payment) => payment.id}
        minWidth="42rem"
        columns={[
          { key: "user", header: "Usuario", primary: true, cell: (payment) => <span style={{ fontWeight: 500 }}>{payment.userName}</span> },
          { key: "course", header: "Curso", cell: (payment) => <span className="admin-cell-truncate admin-cell-muted" title={payment.courseName}>{payment.courseName}</span> },
          { key: "amount", header: "Monto", align: "right", cell: (payment) => <span style={{ fontWeight: 600 }}>{formatAdminMoney(payment.amount)}</span> },
          { key: "status", header: "Estado", cell: () => <Badge variant="outline">Pendiente</Badge> },
          { key: "date", header: "Fecha", cell: (payment) => <span className="admin-cell-muted" style={{ whiteSpace: "nowrap" }}>{formatAdminDate(payment.soldAt)}</span> },
        ]}
        actions={(payment) => (
          <Button type="button" size="sm" variant="outline" disabled={approvingId !== null} onClick={() => setSelectedPayment(payment)}>
            Aprobar inscripción
          </Button>
        )}
        empty={<EmptyState icon={<Receipt size={20} aria-hidden="true" />} title="Sin pagos pendientes" hint="Los pagos aparecerán aquí mientras Stripe confirma su estado." />}
      />
      <Dialog open={selectedPayment !== null} onOpenChange={(open) => { if (!open && approvingId === null) setSelectedPayment(null); }}>
        <DialogContent aria-describedby="approve-payment-description">
          <DialogHeader>
            <DialogTitle>¿Aprobar inscripción?</DialogTitle>
            <DialogDescription id="approve-payment-description">
              Esta acción habilita el curso para el alumno y marca la orden como aprobada desde el panel administrativo.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <dl className="grid gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper-warm)] p-4 text-sm">
              <div><dt className="font-bold text-[var(--text-muted)]">Alumno</dt><dd className="font-semibold text-[var(--text)]">{selectedPayment.userName}</dd></div>
              <div><dt className="font-bold text-[var(--text-muted)]">Curso</dt><dd className="font-semibold text-[var(--text)]">{selectedPayment.courseName}</dd></div>
              <div><dt className="font-bold text-[var(--text-muted)]">Monto</dt><dd className="font-semibold text-[var(--text)]">{formatAdminMoney(selectedPayment.amount)}</dd></div>
            </dl>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={approvingId !== null} onClick={() => setSelectedPayment(null)}>Cancelar</Button>
            <Button type="button" disabled={approvingId !== null} onClick={() => void approve()}>
              {approvingId === selectedPayment?.id ? "Aprobando…" : "Confirmar aprobación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminSales() {
  const [page, setPage] = useState(1);
  const url = useMemo(() => `/api/admin/orders?page=${page}&pageSize=25&sort=created_at&direction=desc`, [page]);
  const { items, pagination, loading, error, reload } = useAdminCollection<OrderRow>(url, "orders");
  const sales = items.filter((order): order is OrderRow & { status: "paid" } => order.status === "paid");
  const pendingPayments = items.filter((order): order is PendingPayment => order.status === "pending");

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  const approvePendingPayment = async (id: string) => {
    const response = await fetch("/api/admin/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId: id }) });
    if (!response.ok) throw new Error(await extractAdminError(response, "No fue posible aprobar la inscripción."));
    reload();
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 className="admin-page-title">Ventas</h1>
          <p className="admin-page-sub">
            {pagination.total} órdenes &middot; {formatAdminMoney(totalRevenue)} en ventas de esta página
          </p>
        </div>
        <AdminExportButton endpoint="/api/admin/orders" filename="elsi-ventas.csv" params={url.split("?")[1]} />
      </div>

      <p style={{ margin: "0 0 1.25rem", padding: "0.75rem 1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
        Las ventas se generan automáticamente cuando Stripe confirma un pago. No se crean registros manuales desde este panel.
      </p>

      <section aria-labelledby="pending-payments-title" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
          <h2 id="pending-payments-title" className="admin-section-title">Pagos pendientes</h2>
          <Badge variant="outline">{pendingPayments.length}</Badge>
        </div>
        <p className="admin-page-sub" style={{ marginBottom: "1rem" }}>
          Revisa casos en los que Stripe aún no confirmó el pago. Aprobar manualmente crea la inscripción y deja registro de la acción.
        </p>
        {loading ? <TableSkeleton rows={2} widths={["9rem", "12rem", "5rem", "8rem"]} /> : <PendingPaymentTable rows={pendingPayments} onApprove={(payment) => approvePendingPayment(payment.id)} />}
      </section>

      {error ? <p role="alert" className="admin-page-sub">{error}</p> : null}
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
                  {s.amount === 0 ? <span style={{ color: "var(--moss)" }}>Sin costo</span> : formatAdminMoney(s.amount)}
                </span>
              ),
            },
            { key: "date", header: "Fecha", cell: (s) => <span className="admin-cell-muted" style={{ whiteSpace: "nowrap" }}>{formatAdminDate(s.soldAt)}</span> },
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
      <AdminPagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
