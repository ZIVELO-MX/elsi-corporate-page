"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, BookOpen, Users, ClipboardList, Receipt, FileText, Inbox, Quote, Settings, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [isMobile, setIsMobile] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");
    const sync = () => { setIsMobile(media.matches); if (!media.matches) setSidebarOpen(false); };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Close the mobile drawer on Escape. Route-change closing is handled where the
  // navigation happens (each drawer link and the backdrop call setSidebarOpen(false)),
  // so no pathname effect is needed — that would be a cascading render on every route.
  useEffect(() => {
    if (!sidebarOpen) return;
    const sidebar = sidebarRef.current;
    const toggle = toggleRef.current;
    const focusable = sidebar ? [...sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')] : [];
    focusable[0]?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setSidebarOpen(false); return; }
      if (e.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      toggle?.focus();
    };
  }, [isMobile, sidebarOpen]);

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
    <ToastProvider>
      <div className="admin-mobile-bar">
        <button
          ref={toggleRef}
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
          ref={sidebarRef}
          id="admin-sidebar"
          className="admin-sidebar"
          data-open={sidebarOpen}
          aria-label="Navegación de administración"
          inert={isMobile && !sidebarOpen ? true : undefined}
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
              <Avatar size="sm"><AvatarImage src={user.avatarUrl} alt="" /><AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
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
        <main className="admin-main" inert={isMobile && sidebarOpen ? true : undefined}>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
