"use client";

import Link from "next/link";
import { BookOpen, Users, ClipboardList, Receipt } from "lucide-react";
import { useAdminData } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const panelStyle: React.CSSProperties = { padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" };

export default function AdminDashboard() {
  const { loading, courses, users, enrollments, sales, leads } = useAdminData();

  const activeCourses = courses.filter((c) => c.status === "active");
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  // KPI tiles double as shortcuts: each links to its section.
  const cards = [
    { label: "Cursos activos", value: activeCourses.length, sub: `${courses.length} totales`, href: "/admin/cursos", Icon: BookOpen },
    { label: "Usuarios registrados", value: users.length, sub: `${users.filter((u) => u.role === "admin").length} administradores`, href: "/admin/usuarios", Icon: Users },
    { label: "Inscripciones", value: enrollments.length, sub: `${users.filter((u) => u.enrolledCourses > 0).length} usuarios con cursos`, href: "/admin/inscripciones", Icon: ClipboardList },
    { label: "Ventas registradas", value: sales.length, sub: totalRevenue > 0 ? `$${totalRevenue.toFixed(2)} total` : "Gratis por ahora", href: "/admin/ventas", Icon: Receipt },
  ];

  // "Needs attention": real derived counts of work waiting on the admin.
  const newLeads = leads.filter((l) => l.status === "nuevo").length;
  const pendingCerts = enrollments.filter((e) => e.status === "realizado" && e.certificateStatus === "pendiente").length;
  const draftCourses = courses.filter((c) => c.status === "inactive").length;
  const attention = [
    { n: newLeads, label: "Mensajes nuevos", sub: "Sin responder", href: "/admin/contacto" },
    { n: pendingCerts, label: "Constancias pendientes", sub: "Realizados sin publicar", href: "/admin/inscripciones" },
    { n: draftCourses, label: "Cursos en borrador", sub: "Inactivos o incompletos", href: "/admin/cursos" },
  ];

  const recentCourses = courses.slice(0, 4);
  const recentEnrollments = enrollments.slice(-4).reverse();

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Resumen general de la plataforma. Toca una tarjeta para ir a su sección.</p>
      </div>

      {loading && (
        <div role="status" aria-label="Cargando resumen">
          <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={panelStyle}>
                <Skeleton width="6rem" height="0.7rem" />
                <Skeleton width="3rem" height="1.8rem" style={{ display: "block", margin: "0.75rem 0 0.5rem" }} />
                <Skeleton width="5rem" height="0.7rem" />
              </div>
            ))}
          </div>
          <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[0, 1].map((col) => (
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

      {!loading && (
        <>
          <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {cards.map((card) => (
              <Link key={card.label} href={card.href} className="admin-kpi-tile">
                <div className="admin-kpi-head">
                  <p className="admin-kpi-label">{card.label}</p>
                  <span aria-hidden="true" className="admin-kpi-icon"><card.Icon size={16} strokeWidth={2} /></span>
                </div>
                <p className="admin-kpi-value">{card.value}</p>
                <p className="admin-kpi-sub">{card.sub}</p>
              </Link>
            ))}
          </div>

          <h2 className="admin-section-title">Requiere atención</h2>
          <div className="admin-attention-grid">
            {attention.map((a) => (
              <Link key={a.label} href={a.href} className="admin-attention-tile" data-alert={a.n > 0}>
                <span className="admin-attention-num">{a.n}</span>
                <span className="admin-attention-text">
                  {a.label}
                  <small>{a.n > 0 ? a.sub : "Todo al día"}</small>
                </span>
              </Link>
            ))}
          </div>

          <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="admin-panel">
              <h2 className="admin-panel-title">Cursos recientes</h2>
              {recentCourses.length === 0 ? (
                <p className="admin-panel-empty">Todavía no hay cursos creados.</p>
              ) : recentCourses.map((c) => (
                <div key={c.id} className="admin-panel-row">
                  <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{c.title}</span>
                  <Badge variant={c.status === "active" ? "default" : "secondary"} style={{ fontSize: "0.75rem" }}>
                    {c.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="admin-panel">
              <h2 className="admin-panel-title">Inscripciones recientes</h2>
              {recentEnrollments.length === 0 ? (
                <p className="admin-panel-empty">Todavía no hay inscripciones registradas.</p>
              ) : recentEnrollments.map((e) => (
                <div key={e.id} className="admin-panel-row" style={{ display: "block" }}>
                  <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500 }}>{e.userName}</p>
                  <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.courseName}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
