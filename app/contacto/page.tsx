"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";

function ContactoContent() {
  const [sent, setSent] = useState(false);
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get("curso");
  const courseMessage = courseSlug ? `Me interesa recibir información sobre el curso ${courseSlug.replaceAll("-", " ")}.` : "";

  return (
    <main>
      <section className="contact-section" data-section-label="Contacto / Formulario">
        <div className="contact-grid">
          <div>
            <span className="section-kicker">Contacto</span>
            <h1 className="contact-title">
              Escríbenos y compártenos qué necesitas aprender o resolver
            </h1>
            <p className="contact-lede">
              Cuéntanos qué necesitas aprender o resolver. Te responderemos por los canales de contacto del instituto.
            </p>
            <div className="contact-info">
              <div><strong>Teléfono:</strong> <a href="tel:+523921104719">392-110-4719</a></div>
              <div><strong>Correo:</strong> <a href="mailto:instituteelsi@gmail.com">instituteelsi@gmail.com</a></div>
              <div><strong>Ubicación:</strong> Guanajuato, México</div>
            </div>
          </div>
          <form
            className="contact-form"
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          >
            <Field>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="name" autoComplete="name" type="text" placeholder="Tu nombre" required />
            </Field>
            <Field>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" autoComplete="email" type="email" placeholder="tu@correo.com" required />
            </Field>
            <Field>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea id="mensaje" name="message" placeholder="¿En qué podemos ayudarte?" rows={4} defaultValue={courseMessage} required />
            </Field>
            {sent && <div className="contact-sent" role="status">Vista previa completada. El envío se habilitará al conectar el canal de contacto.</div>}
            <Button type="submit" disabled={sent} variant="primary" className="contact-submit">{sent ? "Solicitud registrada" : "Enviar mensaje"}</Button>
          </form>
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
