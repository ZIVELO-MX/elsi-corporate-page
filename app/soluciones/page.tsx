"use client";

import { ArrowRight, Building2, GraduationCap, Sprout } from "lucide-react";
import Link from "next/link";
import { solutions } from "@/lib/solutions";
import { solutionImages } from "@/lib/image-assets";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const serviceIcons = {
  capacitacion: GraduationCap,
  "soluciones-ambientales": Building2,
  "educacion-universitaria": Sprout,
};

export default function SolucionesPage() {
  return (
    <main>
      <section className="section-shell solutions-section" data-section-label="Soluciones / Servicios">
        <span className="eyebrow">Lo que hacemos</span>
        <h1 className="solutions-title">Soluciones que hacen accesible el conocimiento ambiental.</h1>
        <p className="solutions-lede">
          Conectamos pedagogía, experiencia técnica y cercanía para generar cambios que sí permanecen.
        </p>

        <div className="solutions-grid">
          {solutions.map(({ slug, title, description, items }) => {
            const Icon = serviceIcons[slug];
            const image = solutionImages[slug];

            return (
              <Link key={slug} href={`/soluciones/${slug}`} className="solution-card-link">
                <Card className="solution-card">
                  {image && (
                    <div className="featured-course-media solution-card-media">
                      <SafeImage src={image.src} alt={image.alt} loading="lazy" />
                    </div>
                  )}
                  <CardHeader className="solution-card-header">
                    <div className="solution-card-icon">
                      <Icon aria-hidden="true" />
                    </div>
                    <CardTitle className="solution-card-title">{title}</CardTitle>
                    <CardDescription className="solution-card-description">{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="solution-card-content">
                    <ul className="solution-card-list">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <span className="solution-card-cta">
                      Leer más <ArrowRight aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="solutions-contact">
          <Button asChild size="lg">
            <Link href="/contacto">Solicita información <ArrowRight data-icon="inline-end" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
