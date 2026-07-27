"use client";

import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { useAdminData } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

export default function AdminSales() {
  const { loading, courses, users, sales, addSale } = useAdminData();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState(0);
  const selectableUsers = useMemo(() => users.filter((user) => user.role === "user"), [users]);
  const activeCourses = useMemo(() => courses.filter((course) => course.status === "active"), [courses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedCourse) {
      toast({ title: "Selecciona un alumno y un curso.", variant: "error" });
      return;
    }
    addSale(selectedUser, selectedCourse, amount);
    toast({ title: "Venta registrada.", variant: "success" });
    setSelectedUser("");
    setSelectedCourse("");
    setAmount(0);
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="admin-page-title">Ventas</h1>
        <p className="admin-page-sub">
          {sales.length} ventas registradas &middot; {totalRevenue > 0 ? `$${totalRevenue.toFixed(2)} total` : "Gratis por ahora"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-bar">
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label htmlFor="sale-usuario" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Usuario</label>
          <select id="sale-usuario" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required
            className="admin-select" style={{ width: "100%" }}>
            <option value="">Seleccionar usuario</option>
            {selectableUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label htmlFor="sale-curso" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Curso</label>
          <select id="sale-curso" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required
            className="admin-select" style={{ width: "100%" }}>
            <option value="">Seleccionar curso</option>
            {activeCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: "8rem" }}>
          <label htmlFor="sale-monto" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Monto</label>
          <input id="sale-monto" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }} />
        </div>
        <Button type="submit" variant="primary">Registrar venta</Button>
      </form>

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
