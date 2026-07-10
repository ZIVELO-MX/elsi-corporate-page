"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/safe-image";
import { useAuth } from "@/components/auth-context";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo-block" aria-label="ELSI, inicio">
          <SafeImage src="/logos/elsi-wordmark.png" alt="ELSI" className="header-logo-img" width={123} height={70} />
        </Link>
        <nav className="header-nav" aria-label="Navegación principal">
          <Link href="/">Inicio</Link>
          <Link href="/nosotros">Quiénes somos</Link>
          <Link href="/soluciones">Soluciones</Link>
          <Link href="/cursos">Cursos</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link href="/profile" className="header-contact-link">{user.name}</Link>
              <button type="button" onClick={logout} className="header-contact-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: 800, color: "var(--accent)" }}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="header-contact-link">Iniciar sesión</Link>
          )}
          <Button asChild variant="primary" className="header-primary">
            <Link href="/cursos">Explorar cursos</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
