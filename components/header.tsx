import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/safe-image";

export default function Header() {
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
          <Link href="/contacto" className="header-contact-link">Contacto</Link>
          <Button asChild variant="primary" className="header-primary">
            <Link href="/cursos">Explorar cursos</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
