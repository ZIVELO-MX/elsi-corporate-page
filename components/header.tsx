"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo-block" aria-label="ELSI, inicio">
          <span className="logo-text">ELSI</span>
          <span className="logo-sub">Academy</span>
        </Link>
        <nav className="header-nav" aria-label="Navegación principal">
          <Link href="/">Inicio</Link>
          <Link href="/nosotros">Quiénes somos</Link>
          <Link href="/cursos">Cursos</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <div className="header-actions">
          <button type="button" className="cart-icon" aria-label="Carrito de compras">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </button>
          <button type="button" className="user-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Ingresar</span>
          </button>
          <Button type="button" style={{ background: "var(--primary)", borderRadius: 8, fontSize: 13.5 }}>Regístrate</Button>
        </div>
      </div>
    </header>
  );
}
