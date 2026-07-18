"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Building2, Users2, Mic, Wrench, Leaf } from "lucide-react";
import { getAllCourses, money } from "@/lib/courses";
import { SafeImage } from "@/components/safe-image";
import { courseImages } from "@/lib/image-assets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const allCourses = getAllCourses();
const featuredCourses = allCourses.slice(0, 3);

const STORY_PREVIEW = [
  { num: "2019", label: "Bee Blue", desc: "Iniciativa estudiantil enfocada en educación ambiental." },
  { num: "UG", label: "Comunidad universitaria", desc: "Conferencias, talleres y eventos en Guanajuato." },
  { num: "Aula", label: "Experiencias formativas", desc: "Actividades para acercar el aprendizaje ambiental a la práctica." },
  { num: "ELSI", label: "Instituto", desc: "La iniciativa evoluciona hacia capacitación y soluciones ambientales." },
];

const servicios = [
  { Icon: GraduationCap, title: "Capacitación Ambiental", text: "Programas de formación práctica y medible para equipos." },
  { Icon: Building2, title: "Consultoría Ambiental", text: "Diagnóstico, cumplimiento normativo y sostenibilidad." },
  { Icon: Users2, title: "Programas Universitarios", text: "Experiencias formativas para estudiantes." },
  { Icon: Mic, title: "Conferencias", text: "Charlas que despiertan conciencia ambiental." },
  { Icon: Wrench, title: "Talleres", text: "Sesiones prácticas para escuelas y empresas." },
  { Icon: Leaf, title: "Proyectos de Sostenibilidad", text: "Acompañamiento de largo plazo." },
];

export default function Home() {
  const [ctaSent, setCtaSent] = useState(false);

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero" data-section-label="Home / Hero">
        <SafeImage
          src="/hero-bg.jpg"
          alt="Participantes en una actividad de educacion ambiental"
          className="hero-bg"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
        />
        <div className="hero-overlay" />
        <div className="shell hero-grid">
          <div className="reveal">
            <p className="hero-eyebrow">Instituto de educación y soluciones ambientales</p>
            <h1>Impulsamos una cultura ambiental que transforma personas, instituciones e industrias.</h1>
            <p>En ELSI desarrollamos programas de capacitación, consultoría y educación ambiental para organizaciones, instituciones educativas y jóvenes que buscan generar un impacto positivo.</p>
            <div className="hero-actions">
              <Button asChild variant="inverse" size="lg" className="hero-action-primary">
                <Link href="/cursos">Conoce nuestros cursos</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="hero-action-secondary">
                <Link href="/contacto">Solicita información</Link>
              </Button>
            </div>
          </div>
          <div style={{ display: "none" }} />
        </div>
      </section>

      {/* ===== HISTORIA RESUMIDA ===== */}
      <section className="historia-resumida" data-section-label="Home / Historia resumida">
        <div className="shell">
          <div style={{ marginBottom: 30 }}>
            <span className="section-kicker">Nuestra historia</span>
            <h2 className="section-title">De Bee Blue a una plataforma de aprendizaje ambiental</h2>
            <p className="section-lede" style={{ marginTop: 12 }}>Home solo muestra los hitos esenciales. La línea completa vive en Nosotros para que la narrativa pueda crecer sin saturar la conversión principal.</p>
          </div>
          <div className="timeline-grid">
            {STORY_PREVIEW.map((step) => (
              <div key={step.num} className="timeline-step">
                <div className="timeline-num">{step.num}</div>
                <strong>{step.label}</strong>
                <span>{step.desc}</span>
              </div>
            ))}
          </div>
          <Button asChild variant="link" className="story-link">
            <Link href="/nosotros">Seguir viendo en Nosotros →</Link>
          </Button>
        </div>
      </section>

      {/* ===== SERVICIOS GALERIA ===== */}
      <section className="servicios-galeria" data-section-label="Home / Servicios carrusel">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">¿Qué hacemos?</span>
              <h2 className="section-title">Soluciones para cada tipo de organización</h2>
            </div>
          </div>
          <Carousel
            opts={{ align: "start", loop: true }}
            className="service-carousel"
          >
            <CarouselContent className="-ml-4">
              {servicios.map((svc) => (
                <CarouselItem key={svc.title} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="servicio-card">
                    <CardHeader>
                      <div className="service-mark"><svc.Icon size={20} strokeWidth={2} aria-hidden="true" /></div>
                      <CardTitle className="service-title">{svc.title}</CardTitle>
                      <CardDescription className="service-copy">{svc.text}</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="service-carousel-button" />
            <CarouselNext className="service-carousel-button" />
          </Carousel>
        </div>
      </section>

      {/* ===== CURSOS DESTACADOS ===== */}
      <section className="cursos-seccion" data-section-label="Home / Cursos destacados">
        <div className="shell">
          <div className="cursos-header">
            <div>
              <span className="section-kicker">Aprende a tu ritmo</span>
              <h2 className="section-title" style={{ margin: 0 }}>Cursos destacados</h2>
              <p className="section-lede">Explora programas ambientales y revisa su temario antes de solicitar información.</p>
            </div>
            <Button asChild variant="link">
              <Link href="/cursos">Ver catálogo completo →</Link>
            </Button>
          </div>
          <div className="cursos-grid">
            {featuredCourses.map((course, index) => (
              <Link key={course.id} href={`/cursos/${course.slug}`} className="featured-course-link">
                <article className="featured-course-card">
                  <div className="featured-course-media">
                    <SafeImage
                      src={courseImages[course.slug].src}
                      alt={courseImages[course.slug].alt}
                      width={900}
                      height={600}
                    />
                    <span className="featured-course-number">0{index + 1}</span>
                  </div>
                  <div className="featured-course-body">
                    <div className="featured-course-meta">
                      <Badge variant="outline" className="featured-course-badge">{course.catLabel}</Badge>
                      <span>{course.modules} módulos</span>
                    </div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="featured-course-footer">
                      <strong>{money(course.price)}</strong>
                      <span>Ver curso</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section" data-section-label="Home / CTA formulario">
        <div className="shell cta-grid">
          <div className="cta-copy">
            <h2>Encuentra el curso o programa ambiental adecuado.</h2>
            <p>Comparte tus datos y te contactaremos para orientar la ruta de aprendizaje, capacitación o consultoría más útil para tu organización.</p>
          </div>
          <form
            className="cta-form"
            onSubmit={(e) => {
              e.preventDefault();
              setCtaSent(true);
            }}
          >
            <Field>
              <Label htmlFor="cta-nombre">Nombre</Label>
              <Input id="cta-nombre" name="nombre" type="text" placeholder="Tu nombre" autoComplete="given-name" required />
            </Field>
            <Field>
              <Label htmlFor="cta-email">Correo</Label>
              <Input id="cta-email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" required />
            </Field>
            <Field>
              <Label htmlFor="cta-mensaje">Mensaje</Label>
              <Textarea id="cta-mensaje" name="mensaje" placeholder="¿En qué podemos ayudarte?" rows={4} required />
            </Field>
            {ctaSent && <div className="cta-sent" role="status">Vista previa completada. El envío se habilitará al conectar el canal de contacto.</div>}
            <Button type="submit" size="lg" variant="primary" className="cta-submit">
              Enviar solicitud
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
