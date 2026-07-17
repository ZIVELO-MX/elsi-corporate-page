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
              className="block h-auto w-[190px] object-contain"
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
          <div className="footer-col">
            <strong>Síguenos</strong>
            <a href="https://www.instagram.com/elsiacademy/" rel="noopener noreferrer" target="_blank">Instagram</a>
            <a href="https://www.facebook.com/" rel="noopener noreferrer" target="_blank">Facebook</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ELSI Academy</span>
          <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
          <span className="footer-prototype">Prototipo de validación · Diseñado y desarrollado por Zivelo</span>
        </div>
      </div>
    </footer>
  );
}
