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
      <section style={{ padding: "72px 0 96px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start", padding: "0 48px" }}>
          <div>
            <span className="section-kicker">Contacto</span>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 32, fontWeight: 700, margin: "0 0 16px" }}>
              Escríbenos y compártenos qué necesitas aprender o resolver
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 460 }}>
              Este formulario simula el flujo de contacto de la fase corporativa. Sirve para validar el mensaje, la intención del usuario y los campos mínimos antes de conectar un backend.
            </p>
            <div className="contact-info">
              <div><strong>Teléfono:</strong> 392-110-4719</div>
              <div><strong>Correo:</strong> instituteelsi@gmail.com</div>
              <div><strong>Correo:</strong> emapime123@gmail.com</div>
              <div><strong>Ubicación:</strong> Guanajuato, México</div>
            </div>
          </div>
          <form
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          >
            <Field>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" type="text" placeholder="Tu nombre" required />
            </Field>
            <Field>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" placeholder="tu@correo.com" required />
            </Field>
            <Field>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea id="mensaje" placeholder="¿En qué podemos ayudarte?" rows={4} defaultValue={courseMessage} required />
            </Field>
            {sent && <div className="contact-sent" role="status">Solicitud registrada en modo demo. Te responderemos pronto cuando el flujo esté conectado.</div>}
            <Button type="submit" disabled={sent} style={{ background: "var(--primary)", width: "100%" }}>{sent ? "Solicitud registrada" : "Enviar mensaje"}</Button>
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
