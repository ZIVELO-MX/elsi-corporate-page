"use client";

import Link from "next/link";
import { BookOpen, Users, ClipboardList, Receipt } from "lucide-react";
import { useAdminData } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function EmptyRow({ label }: { label: string }) {
  return (
    <p style={{ padding: "0.75rem 0", fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>{label}</p>
  );
}

const panelStyle: React.CSSProperties = { padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" };

export default function AdminDashboard() {
  const { loading, courses, users, enrollments, sales } = useAdminData();

  const activeCourses = courses.filter(c => c.status === "active");
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  // Each tile links to its section so the KPI row acts as a shortcut,
  // not just a decorative count.
  const cards = [
    { label: "Cursos activos", value: activeCourses.length, sub: `${courses.length} totales`, href: "/admin/cursos", Icon: BookOpen },
    { label: "Usuarios registrados", value: users.length, sub: `${users.filter(u => u.role === "admin").length} administradores`, href: "/admin/usuarios", Icon: Users },
    { label: "Inscripciones", value: enrollments.length, sub: `${users.filter(u => u.enrolledCourses > 0).length} usuarios con cursos`, href: "/admin/inscripciones", Icon: ClipboardList },
    { label: "Ventas registradas", value: sales.length, sub: totalRevenue > 0 ? `$${totalRevenue.toFixed(2)} total` : "Gratis por ahora", href: "/admin/ventas", Icon: Receipt },
  ];

  const recentCourses = courses.slice(0, 4);
  const recentEnrollments = enrollments.slice(-4).reverse();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Resumen general de la plataforma.</p>
      </div>

      {loading && (
        <div role="status" aria-label="Cargando resumen">
          <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={panelStyle}>
                <Skeleton width="6rem" height="0.7rem" />
                <Skeleton width="3rem" height="1.8rem" style={{ display: "block", margin: "0.75rem 0 0.5rem" }} />
                <Skeleton width="5rem" height="0.7rem" />
              </div>
            ))}
          </div>
          <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[0, 1].map(col => (
              <div key={col} style={panelStyle}>
                <Skeleton width="8rem" height="0.85rem" style={{ display: "block", marginBottom: "1rem" }} />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} width="100%" height="0.8rem" style={{ display: "block", marginBottom: "0.75rem", opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (<>
      <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {cards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="admin-kpi-tile"
            style={{
              display: "block", padding: "1.25rem", background: "var(--card)",
              borderRadius: "var(--radius)", border: "1px solid var(--border)",
              textDecoration: "none", color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{card.label}</p>
              <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "var(--radius-sm)", background: "var(--primary-light)", color: "var(--secondary-foreground)", flexShrink: 0 }}>
                <card.Icon size={16} strokeWidth={2} />
              </span>
            </div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "2rem", fontWeight: 800, margin: "0 0 0.25rem", color: "var(--primary)" }}>{card.value}</p>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.875rem", fontWeight: 700, margin: "0 0 1rem" }}>Cursos recientes</h2>
          {recentCourses.length === 0 ? (
            <EmptyRow label="Todavía no hay cursos creados." />
          ) : recentCourses.map(c => (
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
          {recentEnrollments.length === 0 ? (
            <EmptyRow label="Todavía no hay inscripciones registradas." />
          ) : recentEnrollments.map(e => (
            <div key={e.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500 }}>{e.userName}</p>
              <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.courseName}</p>
            </div>
          ))}
        </div>
      </div>
      </>)}
    </div>
  );
}
