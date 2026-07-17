"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { AdminDataProvider } from "@/lib/admin-data";
import { ToastProvider } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, BookOpen, Users, ClipboardList, Receipt, FileText } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", Icon: BookOpen },
  { href: "/admin/usuarios", label: "Usuarios", Icon: Users },
  { href: "/admin/inscripciones", label: "Inscripciones", Icon: ClipboardList },
  { href: "/admin/ventas", label: "Ventas", Icon: Receipt },
  { href: "/admin/contenido", label: "Contenido", Icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer on Escape. Route-change closing is handled where the
  // navigation happens (each drawer link and the backdrop call setSidebarOpen(false)),
  // so no pathname effect is needed — that would be a cascading render on every route.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  if (!user) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "30rem", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1rem" }}>Acceso restringido</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Inicia sesión con una cuenta de administrador para acceder al panel.
        </p>
        <Button asChild variant="primary">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "30rem", margin: "0 auto" }}>
        <Badge variant="destructive" style={{ marginBottom: "1rem" }}>Sin permiso</Badge>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1rem" }}>Acceso denegado</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
          No tienes permisos de administrador para acceder a esta sección.
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </main>
    );
  }

  return (
    <AdminDataProvider>
      <ToastProvider>
      <div className="admin-mobile-bar">
        <button
          type="button"
          aria-expanded={sidebarOpen}
          aria-controls="admin-sidebar"
          aria-label={sidebarOpen ? "Cerrar menú de administración" : "Abrir menú de administración"}
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "2.25rem", height: "2.25rem", padding: 0,
            background: "transparent", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "1rem",
          }}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.9375rem", fontWeight: 700, margin: 0 }}>Administración</h2>
      </div>

      <div
        className="admin-sidebar-backdrop"
        data-open={sidebarOpen}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />

      <div className="admin-shell">
        <aside
          id="admin-sidebar"
          className="admin-sidebar"
          data-open={sidebarOpen}
          aria-label="Navegación de administración"
        >
          <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem" }}>Administración</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>ELSI</h2>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.125rem", padding: "0 0.75rem", flex: 1 }}>
            {NAV_ITEMS.map(item => {
              const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--primary)" : "var(--text)",
                    background: isActive ? "var(--primary-light)" : "transparent",
                    textDecoration: "none",
                    transition: "background var(--motion-fast), color var(--motion-fast)",
                  }}>
                  <item.Icon size={18} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ padding: "1rem 1.25rem 0", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{
                width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--primary-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "var(--primary)",
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.3 }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</p>
              </div>
            </div>
            <button onClick={logout} style={{
              width: "100%", padding: "0.5rem", fontSize: "0.8125rem",
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", cursor: "pointer",
              color: "var(--text-muted)", transition: "color var(--motion-fast)",
            }} onMouseOver={e => e.currentTarget.style.color = "var(--destructive)"}
               onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}>
              Cerrar sesión
            </button>
          </div>
        </aside>
        <main className="admin-main">
          {children}
        </main>
      </div>
      </ToastProvider>
    </AdminDataProvider>
  );
}
