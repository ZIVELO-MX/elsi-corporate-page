"use client";

import { useState } from "react";
import { useAdminData } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";

export default function AdminEnrollments() {
  const { courses, users, enrollments, addEnrollment } = useAdminData();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedCourse) return;
    addEnrollment(selectedUser, selectedCourse);
    setSelectedUser("");
    setSelectedCourse("");
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Inscripciones</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>{enrollments.length} inscripciones registradas</p>
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
        <Button type="submit" variant="primary">Inscribir</Button>
      </form>

      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["Usuario", "Curso", "Fecha de inscripción"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enrollments.map(e => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{e.userName}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{e.courseName}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{e.enrolledAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
