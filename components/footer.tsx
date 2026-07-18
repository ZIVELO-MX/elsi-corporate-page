"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SafeImage } from "@/components/safe-image";

export default function Footer() {
  const pathname = usePathname();

  // The admin panel is a self-contained app shell without the marketing footer.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <SafeImage
              src="/logos/elsi-horizontal-logo.png"
              alt="ELSI — Environmental Learning & Solutions Institute"
              width={180}
              height={101}
              className="footer-logo block h-auto w-[190px] object-contain"
            />
          </div>
          <div className="footer-col">
            <strong>Instituto</strong>
            <Link href="/nosotros">Quiénes somos</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
          <div className="footer-col">
            <strong>Academia</strong>
            <Link href="/cursos">Cursos</Link>
            <Link href="/login">Ingresar</Link>
          </div>
          <div className="footer-col footer-col-contact">
            <strong>Contacto</strong>
            <a href="tel:+523921104719">392-110-4719</a>
            <a href="mailto:instituteelsi@gmail.com">instituteelsi@gmail.com</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ELSI Academy</span>
          <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
          <a href="https://zivelo.mx" rel="noreferrer">Diseño y desarrollo por Zivelo</a>
        </div>
      </div>
    </footer>
  );
}
