import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Aviso de privacidad",
  description: "Aviso de privacidad de ELSI: cómo tratamos y protegemos tus datos personales.",
  path: "/aviso-de-privacidad",
});

export default function AvisoPrivacidadPage() {
  return (
    <main>
      <section className="shell privacy-shell" data-section-label="Legal / Aviso de privacidad">
        <article className="privacy-content">
          <header className="privacy-header">
            <Link href="/" className="privacy-back">← Volver al inicio</Link>
            <span className="eyebrow">Legal</span>
            <h1 className="privacy-title">Aviso de privacidad</h1>
          </header>

          <p><strong>Environment Learning & Solutions Institute (ELSI)</strong>, con domicilio en Guanajuato, México, es el responsable del uso y protección de sus datos personales.</p>

          <section><h2>Datos que recopilamos</h2><p>Nombre, correo electrónico y número telefónico proporcionados voluntariamente a través de nuestro formulario de contacto o vía correo electrónico.</p></section>

          <section><h2>Finalidad del tratamiento</h2><p>Atender solicitudes de información, cotizaciones, dudas o comentarios; dar seguimiento a la relación con nuestros usuarios; y enviar comunicaciones relacionadas con nuestros servicios educativos y ambientales.</p></section>

          <section><h2>Transferencia de datos</h2><p>No transferimos datos personales a terceros, salvo obligación legal o autorización expresa del titular.</p></section>

          <section><h2>Derechos ARCO</h2><p>Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición enviando un correo a <a href="mailto:instituteelsi@gmail.com">instituteelsi@gmail.com</a>.</p></section>

          <section><h2>Cambios al aviso</h2><p>Nos reservamos el derecho de modificar este aviso de privacidad en cualquier momento. Los cambios entrarán en vigor al ser publicados en esta página.</p></section>

          <p className="privacy-updated">Última actualización: julio 2026.</p>
        </article>
      </section>
    </main>
  );
}
