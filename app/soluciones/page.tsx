"use client";

import { ArrowRight, Building2, GraduationCap, Sprout } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    icon: GraduationCap,
    title: "Capacitación",
    description: "Programas prácticos para equipos, comunidades y jóvenes.",
    items: [
      "Talleres presenciales y en línea",
      "Formación de facilitadores ambientales",
      "Programas para jóvenes y comunidades",
      "Certificaciones en educación ambiental",
    ],
  },
  {
    icon: Building2,
    title: "Soluciones ambientales",
    description: "Acompañamiento para convertir retos ambientales en planes claros.",
    items: [
      "Diagnóstico y evaluación ambiental",
      "Planes de manejo de residuos",
      "Cumplimiento normativo y permisos",
      "Estrategias de sostenibilidad empresarial",
    ],
  },
  {
    icon: Sprout,
    title: "Educación universitaria",
    description: "Talleres y experiencias que despiertan una participación activa.",
    items: [
      "Conferencias y talleres en campus",
      "Programas de liderazgo ambiental",
      "Vinculación con organizaciones ambientales",
      "Proyectos de impacto comunitario",
    ],
  },
];

export default function SolucionesPage() {
  return (
    <main>
      <section className="section-shell" style={{ maxWidth: "60rem", margin: "0 auto" }}>
        <span className="eyebrow">Lo que hacemos</span>
        <h1 style={{ fontSize: "clamp(2.8rem,5vw,4.5rem)", lineHeight: 1.05, letterSpacing: "-.04em", fontWeight: 500, margin: "0 0 1rem" }}>
          Soluciones que hacen accesible el conocimiento ambiental.
        </h1>
        <p style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "var(--muted-foreground)", maxWidth: "40rem", marginBottom: "3rem" }}>
          Conectamos pedagogía, experiencia técnica y cercanía para generar cambios que sí permanecen.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {services.map(({ icon: Icon, title, description, items }) => (
            <Card key={title} style={{ display: "flex", flexDirection: "column" }}>
              <CardHeader>
                <Icon className="service-icon" style={{ width: "2rem", height: "2rem", color: "var(--primary)", margin: "1.5rem 0" }} />
                <CardTitle style={{ fontFamily: '"Iowan Old Style", serif', fontSize: "1.7rem" }}>{title}</CardTitle>
                <CardDescription style={{ lineHeight: 1.6 }}>{description}</CardDescription>
              </CardHeader>
              <CardContent style={{ marginTop: "auto" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {items.map((item) => (
                    <li key={item} style={{ padding: "0.5rem 0", borderTop: "1px solid var(--border)", fontSize: "0.88rem", color: "var(--muted-foreground)" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <Button asChild size="lg">
            <Link href="/contacto">Solicita información <ArrowRight data-icon="inline-end" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
