"use client";

import { useAdminData } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { courses, users, enrollments, sales } = useAdminData();

  const activeCourses = courses.filter(c => c.status === "active");
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  const cards = [
    { label: "Cursos activos", value: activeCourses.length, sub: `${courses.length} totales` },
    { label: "Usuarios registrados", value: users.length, sub: `${users.filter(u => u.role === "admin").length} administradores` },
    { label: "Inscripciones", value: enrollments.length, sub: `${users.filter(u => u.enrolledCourses > 0).length} usuarios con cursos` },
    { label: "Ventas registradas", value: sales.length, sub: totalRevenue > 0 ? `$${totalRevenue.toFixed(2)} total` : "Gratis por ahora" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Resumen general de la plataforma.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {cards.map(card => (
          <div key={card.label} style={{ padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem" }}>{card.label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "2rem", fontWeight: 800, margin: "0 0 0.25rem", color: "var(--primary)" }}>{card.value}</p>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>{card.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.875rem", fontWeight: 700, margin: "0 0 1rem" }}>Cursos recientes</h2>
          {courses.slice(0, 4).map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{c.title}</span>
              <Badge variant={c.status === "active" ? "default" : "secondary"} style={{ fontSize: "0.6875rem" }}>
                {c.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          ))}
        </div>
        <div style={{ padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.875rem", fontWeight: 700, margin: "0 0 1rem" }}>Inscripciones recientes</h2>
          {enrollments.slice(-4).reverse().map(e => (
            <div key={e.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500 }}>{e.userName}</p>
              <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.courseName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
