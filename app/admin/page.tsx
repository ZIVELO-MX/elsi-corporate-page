"use client";

import Link from "next/link";
import { BookOpen, Users, ClipboardList, Receipt } from "lucide-react";
import { useAdminResource } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAdminDate, formatAdminMoney, formatAdminNumber } from "@/lib/admin-format";
import { AdminPageHeader } from "@/components/admin/page-header";

const panelStyle: React.CSSProperties = { padding: "1.25rem", background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" };

export default function AdminDashboard() {
  const { data, loading, error } = useAdminResource<{
    summary: { courses: number; activeCourses: number; draftCourses: number; users: number; admins: number; enrollments: number; usersWithCourses: number; sales: number; revenueCents: number; newLeads: number; pendingCertificates: number; pendingPayments: number; failedPayments: number; canceledPayments: number };
    recentCourses: { id: string; title: string; created_at: string; is_active: boolean }[];
    recentEnrollments: { id: string; userName: string; courseName: string; enrolled_at: string }[];
  }>("/api/admin/summary");
  const summary = data?.summary ?? { courses: 0, activeCourses: 0, draftCourses: 0, users: 0, admins: 0, enrollments: 0, usersWithCourses: 0, sales: 0, revenueCents: 0, newLeads: 0, pendingCertificates: 0, pendingPayments: 0, failedPayments: 0, canceledPayments: 0 };

  // KPI tiles double as shortcuts: each links to its section.
  const cards = [
    { label: "Cursos activos", value: summary.activeCourses, sub: `${formatAdminNumber(summary.courses)} totales`, href: "/admin/cursos", Icon: BookOpen },
    { label: "Usuarios registrados", value: summary.users, sub: `${formatAdminNumber(summary.admins)} administradores`, href: "/admin/usuarios", Icon: Users },
    { label: "Inscripciones", value: summary.enrollments, sub: `${formatAdminNumber(summary.usersWithCourses)} usuarios con cursos`, href: "/admin/inscripciones", Icon: ClipboardList },
    { label: "Ventas registradas", value: summary.sales, sub: `${formatAdminMoney(summary.revenueCents / 100)} total`, href: "/admin/ventas?status=paid", Icon: Receipt },
  ];

  // "Needs attention": real derived counts of work waiting on the admin.
  const attention = [
    { n: summary.pendingPayments, label: "Pagos pendientes", sub: "Requieren revisión", href: "/admin/ventas?status=pending" },
    { n: summary.failedPayments + summary.canceledPayments, label: "Pagos con incidencia", sub: "Fallidos o cancelados", href: "/admin/ventas?status=failed" },
    { n: summary.newLeads, label: "Mensajes nuevos", sub: "Sin responder", href: "/admin/contacto?status=new" },
    { n: summary.pendingCertificates, label: "Constancias pendientes", sub: "Realizados sin publicar", href: "/admin/inscripciones?certificate=pending" },
    { n: summary.draftCourses, label: "Cursos por revisar", sub: "Inactivos o provisionales", href: "/admin/cursos?visibility=inactive" },
  ];

  const recentCourses = data?.recentCourses ?? [];
  const recentEnrollments = data?.recentEnrollments ?? [];

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Cola operativa y accesos directos a cada sección." />

      {error && (
        <div role="alert" style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", color: "var(--danger)", background: "var(--card)" }}>
          {error} Actualiza la página o revisa la sesión de administrador.
        </div>
      )}

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
                <p className="admin-kpi-value">{formatAdminNumber(card.value)}</p>
                <p className="admin-kpi-sub">{card.sub}</p>
              </Link>
            ))}
          </div>

          <h2 className="admin-section-title">Requiere atención</h2>
          <div className="admin-attention-grid">
            {attention.map((a) => (
              <Link key={a.label} href={a.href} className="admin-attention-tile" data-alert={a.n > 0}>
                <span className="admin-attention-num">{formatAdminNumber(a.n)}</span>
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
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><small style={{ color: "var(--text-muted)" }}>{formatAdminDate(c.created_at)}</small><Badge variant={c.is_active ? "default" : "secondary"} style={{ fontSize: "0.75rem" }}>{c.is_active ? "Activo" : "Inactivo"}</Badge></span>
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
                  <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatAdminDate(e.enrolled_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
