"use client";

import { useAdminData } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const { users } = useAdminData();

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Usuarios</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>{users.length} usuarios registrados</p>
      </div>

      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["Nombre", "Email", "Rol", "Cursos inscritos", "Registro"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{u.email}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} style={{ fontSize: "0.6875rem" }}>
                    {u.role === "admin" ? "Admin" : "Usuario"}
                  </Badge>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem" }}>{u.enrolledCourses}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{u.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
