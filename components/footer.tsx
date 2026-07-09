import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo-text">ELSI</span>
            <p>Environment Learning & Solutions Institute. Educación, capacitación y consultoría ambiental.</p>
          </div>
          <div className="footer-col">
            <strong>Instituto</strong>
            <Link href="/nosotros">Quiénes somos</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
          <div className="footer-col">
            <strong>Academia</strong>
            <Link href="/cursos">Cursos</Link>
            <span>Ingresar</span>
          </div>
          <div className="footer-col">
            <strong>Síguenos</strong>
            <span>Instagram</span>
            <span>Facebook</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ELSI Academy</span>
          <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
        </div>
      </div>
    </footer>
  );
}