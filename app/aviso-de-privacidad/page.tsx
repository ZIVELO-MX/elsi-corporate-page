import Link from "next/link";

export default function AvisoPrivacidadPage() {
  return (
    <main>
      <section className="shell privacy-shell" data-section-label="Legal / Aviso de privacidad">
        <Link href="/" className="text-link" style={{ marginBottom: "2rem", display: "inline-block" }}>← Volver al inicio</Link>
        <div className="privacy-content">
          <span className="eyebrow">Legal</span>
          <h1 className="privacy-title">
            Aviso de privacidad
          </h1>

          <p><strong>Environment Learning & Solutions Institute (ELSI)</strong>, con domicilio en Guanajuato, México, es el responsable del uso y protección de sus datos personales.</p>

          <h2>Datos que recopilamos</h2>
          <p>Nombre, correo electrónico y número telefónico proporcionados voluntariamente a través de nuestro formulario de contacto o vía correo electrónico.</p>

          <h2>Finalidad del tratamiento</h2>
          <p>Atender solicitudes de información, cotizaciones, dudas o comentarios; dar seguimiento a la relación con nuestros usuarios; y enviar comunicaciones relacionadas con nuestros servicios educativos y ambientales.</p>

          <h2>Transferencia de datos</h2>
          <p>No transferimos datos personales a terceros, salvo obligación legal o autorización expresa del titular.</p>

          <h2>Derechos ARCO</h2>
          <p>Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición enviando un correo a <strong>instituteelsi@gmail.com</strong>.</p>

          <h2>Cambios al aviso</h2>
          <p>Nos reservamos el derecho de modificar este aviso de privacidad en cualquier momento. Los cambios entrarán en vigor al ser publicados en esta página.</p>

          <p style={{ fontSize: "0.82rem", marginTop: "2rem", fontStyle: "italic" }}>Última actualización: julio 2026.</p>
        </div>
      </section>
    </main>
  );
}
