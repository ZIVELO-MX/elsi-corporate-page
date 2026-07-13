"use client";

import { useState } from "react";
import { useAdminData } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";

export default function AdminSales() {
  const { courses, users, sales, addSale } = useAdminData();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedCourse) return;
    addSale(selectedUser, selectedCourse, amount);
    setSelectedUser("");
    setSelectedCourse("");
    setAmount(0);
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Ventas</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
          {sales.length} ventas registradas &middot; {totalRevenue > 0 ? `$${totalRevenue.toFixed(2)} total` : "Gratis por ahora"}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: "flex", gap: "0.75rem", alignItems: "flex-end",
        padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)",
        border: "1px solid var(--border)", marginBottom: "1.5rem", flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Usuario</label>
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }}>
            <option value="">Seleccionar usuario</option>
            {users.filter(u => u.role === "user").map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "10rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Curso</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }}>
            <option value="">Seleccionar curso</option>
            {courses.filter(c => c.status === "active").map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: "8rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Monto</label>
          <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: "var(--paper)" }} />
        </div>
        <Button type="submit" variant="primary">Registrar venta</Button>
      </form>

      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["Usuario", "Curso", "Monto", "Fecha"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{s.userName}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{s.courseName}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 600 }}>
                  {s.amount === 0 ? <span style={{ color: "var(--leaf)" }}>Gratis</span> : `$${s.amount.toFixed(2)}`}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{s.soldAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
