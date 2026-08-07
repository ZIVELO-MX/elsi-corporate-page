"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { AdminDataProvider } from "@/lib/admin-data";
import { ToastProvider } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, BookOpen, Users, ClipboardList, Receipt, FileText, Inbox, Quote, Settings, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", Icon: BookOpen },
  { href: "/admin/usuarios", label: "Usuarios", Icon: Users },
  { href: "/admin/inscripciones", label: "Inscripciones", Icon: ClipboardList },
  { href: "/admin/ventas", label: "Ventas", Icon: Receipt },
  { href: "/admin/contenido", label: "Contenido", Icon: FileText },
  { href: "/admin/contacto", label: "Contacto", Icon: Inbox },
  { href: "/admin/testimonios", label: "Testimonios", Icon: Quote },
  { href: "/admin/configuracion", label: "Configuración", Icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
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
      <main className="admin-access-state">
        <h1>Acceso restringido</h1>
        <p>
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
      <main className="admin-access-state">
        <Badge variant="destructive" className="admin-access-badge">Sin permiso</Badge>
        <h1>Acceso denegado</h1>
        <p>
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
          className="admin-mobile-toggle"
        >
          {sidebarOpen ? <X size={18} strokeWidth={2} aria-hidden="true" /> : <Menu size={18} strokeWidth={2} aria-hidden="true" />}
        </button>
        <h2 className="admin-mobile-title">Administración</h2>
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
          <div className="admin-sidebar-heading">
            <p>Administración</p>
            <h2>ELSI</h2>
          </div>
          <nav className="admin-sidebar-nav">
            {NAV_ITEMS.map(item => {
              const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-nav-link"
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? "page" : undefined}>
                  <item.Icon size={18} strokeWidth={2} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="admin-sidebar-account">
            <div className="admin-sidebar-user">
              <div className="admin-avatar-chip">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="admin-sidebar-user-name">{user.name}</p>
                <p className="admin-sidebar-user-email">{user.email}</p>
              </div>
            </div>
            <button type="button" onClick={logout} className="admin-logout-btn">
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
