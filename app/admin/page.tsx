"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  return (
    <main>
      <section style={{ padding: "4rem 2rem", maxWidth: "40rem", margin: "0 auto", textAlign: "center" }}>
        <Badge style={{ marginBottom: "1rem" }}>Panel local</Badge>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "2rem", fontWeight: 700, margin: "0 0 1rem" }}>
          Administración ELSI
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "2rem" }}>
          El panel de administración estará disponible próximamente. Por ahora el contenido del sitio es estático y se edita directamente en el código.
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </section>
    </main>
  );
}
