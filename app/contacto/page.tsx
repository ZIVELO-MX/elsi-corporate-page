"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PublicContactForm } from "@/components/public-contact-form";

function ContactoContent() {
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get("curso");
  const courseMessage = courseSlug ? `Me interesa recibir información sobre el curso ${courseSlug.replaceAll("-", " ")}.` : "";

  return (
    <main>
      <section className="contact-section" data-section-label="Contacto / Formulario">
        <div className="contact-grid">
          <header className="contact-intro">
            <span className="section-kicker">Contacto</span>
            <h1 className="contact-title">
              Escríbenos y compártenos qué necesitas aprender o resolver
            </h1>
            <p className="contact-lede">
              Cuéntanos qué necesitas aprender o resolver. Te responderemos por los canales de contacto del instituto.
            </p>
          </header>
          <PublicContactForm
            key={courseMessage}
            className="contact-form"
            buttonClassName="contact-submit"
            buttonLabel="Enviar mensaje"
            defaultMessage={courseMessage}
            idPrefix="contact"
            statusClassName="contact-sent"
          />
          <div className="contact-info" aria-label="Canales de contacto">
            <div><strong>Teléfono:</strong> <a href="tel:+523921104719">392-110-4719</a></div>
            <div><strong>Correo:</strong> <a href="mailto:instituteelsi@gmail.com">instituteelsi@gmail.com</a></div>
            <div><strong>Ubicación:</strong> Guanajuato, México</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ContactoPage() {
  return (
    <Suspense fallback={null}>
      <ContactoContent />
    </Suspense>
  );
}
