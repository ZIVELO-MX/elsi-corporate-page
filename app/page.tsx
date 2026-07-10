"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllCourses, money } from "@/lib/courses";
import { SafeImage } from "@/components/safe-image";
import { courseImages, siteImages } from "@/lib/image-assets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

const TESTIMONIALS = [
  { quote: '"Certificamos a nuestro equipo de 40 personas en 3 semanas y redujimos 30% las no conformidades ambientales en la primera auditoría siguiente."', name: 'Nombre Apellido', role: 'Gerente de Operaciones · Empresa manufacturera' },
  { quote: '"Más de 300 estudiantes se inscribieron al taller en 48 horas. ELSI entendió exactamente cómo hablarle a nuestra comunidad universitaria."', name: 'Nombre Apellido', role: 'Directora Académica · Universidad' },
  { quote: '"En 6 semanas pasamos de no tener plan de cumplimiento a documentar el 100% de nuestros procesos ambientales críticos."', name: 'Nombre Apellido', role: 'Coordinador Ambiental · Institución pública' },
];

const HERO_AVATARS = [
  {
    src: "https://live.staticflickr.com/3833/9658307900_fc780e6826_b.jpg",
    alt: "Estudiante participante en una sesion formativa",
    fallback: "EC",
    attribution: "Student Portrait, Englewood Codes 2013 by danxoneil, CC BY 2.0, via Openverse/Flickr: https://www.flickr.com/photos/36521980095@N01/9658307900",
  },
  {
    src: "https://live.staticflickr.com/7443/9658311952_ff4c562d68_b.jpg",
    alt: "Participante de programa educativo ambiental",
    fallback: "UG",
    attribution: "Student Portrait, Englewood Codes 2013 by danxoneil, CC BY 2.0, via Openverse/Flickr: https://www.flickr.com/photos/36521980095@N01/9658311952",
  },
  {
    src: "https://live.staticflickr.com/7452/9658302076_5d93bc242a_b.jpg",
    alt: "Estudiante en actividad de capacitacion",
    fallback: "EL",
    attribution: "Student Portrait, Englewood Codes 2013 by danxoneil, CC BY 2.0, via Openverse/Flickr: https://www.flickr.com/photos/36521980095@N01/9658302076",
  },
];

const HOME_STATS = [
  { num: "+2,200", label: "estudiantes universitarios alcanzados", note: "dato real del sitio actual" },
  { num: "+100", label: "espacios formativos realizados", note: "dato real del sitio actual" },
  { num: "3", label: "líneas de servicio", note: "capacitación, soluciones y universidades" },
  { num: "2026", label: "nuevo sitio corporativo", note: "migración en proceso" },
];

const STORY_PREVIEW = [
  { num: "2019", label: "Bee Blue", desc: "Iniciativa estudiantil enfocada en educación ambiental." },
  { num: "UG", label: "Comunidad universitaria", desc: "Conferencias, talleres y eventos en Guanajuato." },
  { num: "+2.2k", label: "Alcance formativo", desc: "Miles de estudiantes impactados con experiencias ambientales." },
  { num: "ELSI", label: "Instituto", desc: "La iniciativa evoluciona hacia capacitación y soluciones ambientales." },
];

const servicios = [
  { icon: "C", title: "Capacitación Ambiental", text: "Programas de formación práctica y medible para equipos." },
  { icon: "C", title: "Consultoría Ambiental", text: "Diagnóstico, cumplimiento normativo y sostenibilidad." },
  { icon: "P", title: "Programas Universitarios", text: "Experiencias formativas para estudiantes." },
  { icon: "C", title: "Conferencias", text: "Charlas que despiertan conciencia ambiental." },
  { icon: "T", title: "Talleres", text: "Sesiones prácticas para escuelas y empresas." },
  { icon: "S", title: "Proyectos de Sostenibilidad", text: "Acompañamiento de largo plazo." },
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
            <div className="hero-stat">
              <AvatarGroup className="hero-avatar-group" aria-label="Participantes formados por ELSI">
                {HERO_AVATARS.map((avatar) => (
                  <Avatar key={avatar.src} size="lg" className="hero-avatar-item">
                    <AvatarImage src={avatar.src} alt={avatar.alt} title={avatar.attribution} />
                    <AvatarFallback>{avatar.fallback}</AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount className="hero-avatar-count">+2k</AvatarGroupCount>
              </AvatarGroup>
              <span className="hero-stat-text"><strong>+2,200 estudiantes</strong> ya se han formado con nosotros desde 2019.</span>
            </div>
          </div>
          <div style={{ display: "none" }} />
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      <section className="partners reveal" data-delay="1" data-section-label="Home / Confianza">
        <div className="shell">
          <p className="partners-label">Organizaciones que han confiado en ELSI</p>
          <div className="partners-grid">
            {["UG", "INDUSTRIA", "GOBIERNO", "EDUCACIÓN", "ORG. CIVIL"].map((name) => (
              <div key={name} className="partner-badge">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE STRIP ===== */}
      <section className="feature-strip reveal" data-delay="2" data-section-label="Home / Beneficios rápidos">
        <div className="shell">
          <div className="feature-grid">
            {[
              { svg: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01 9 11.01", text: "Constancias con validez curricular" },
              { svg: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", text: "Origen en la Universidad de Guanajuato" },
              { svg: "M20 6 9 17l-5-5", text: "Contenido alineado a normatividad mexicana" },
              { svg: "M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", text: "Instructores con experiencia comprobada" },
            ].map((item, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.svg} /></svg>
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-band reveal" data-section-label="Home / Estadísticas">
        <div className="shell">
          <div className="stats-grid">
            {HOME_STATS.map((stat) => (
              <Card key={stat.num} className="stat-card">
                <CardHeader className="stat-card-header">
                  <span className="stat-number">{stat.num}</span>
                  <CardDescription className="stat-label">{stat.label}</CardDescription>
                  <span className="stat-note">{stat.note}</span>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HISTORIA RESUMIDA ===== */}
      <section className="historia-resumida" data-section-label="Home / Historia resumida">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">Nuestra historia</span>
              <h2 className="section-title">De Bee Blue a una plataforma de aprendizaje ambiental</h2>
            </div>
            <p className="section-lede">Home solo muestra los hitos esenciales. La línea completa vive en Nosotros para que la narrativa pueda crecer sin saturar la conversión principal.</p>
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
                      <div className="service-mark">{svc.icon}</div>
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
              <p className="section-lede">Catálogo propuesto para presentar la oferta y capturar interés antes de activar compra o inscripción automática.</p>
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

      {/* ===== POR QUÉ ELEGIR ELSI ===== */}
      <section data-section-label="Home / Por qué elegir ELSI" style={{ padding: "64px 0" }}>
        <div className="shell">
          <span className="section-kicker">¿Por qué elegir ELSI?</span>
          <h2 className="section-title">Un aliado estratégico, no solo un proveedor</h2>
          <div className="beneficios-grid">
            {[
              { strong: "Equipo especializado", p: "Profesionales en ciencias ambientales y educación." },
              { strong: "Metodologías prácticas", p: "Aprender haciendo, no solo escuchando." },
              { strong: "Experiencia comprobada", p: "Miles de personas capacitadas desde 2019." },
              { strong: "Programas personalizados", p: "Cada organización recibe una solución a su medida." },
              { strong: "Impacto medible", p: "Indicadores claros antes, durante y después." },
              { strong: "Innovación constante", p: "Contenidos actualizados a normativa y tendencias." },
            ].map((ben, i) => (
              <div key={ben.strong} className="beneficio-card">
                <span className="beneficio-index">0{i + 1}</span>
                <strong>{ben.strong}</strong>
                <p>{ben.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALES ===== */}
      <section className="testimonios" data-section-label="Home / Testimonios">
        <div className="shell">
          <Carousel opts={{ align: "center", loop: true }} className="testimonial-carousel">
            <CarouselContent>
              {TESTIMONIALS.map((testimonial) => (
                <CarouselItem key={testimonial.role}>
                  <div className="testimonial-card">
                    <div className="portrait-thumb testimonial-portrait">
                      <SafeImage src={siteImages.testimonial.src} alt={siteImages.testimonial.alt} width={160} height={160} />
                    </div>
                    <div className="testimonial-stars" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ))}
                    </div>
                    <p>{testimonial.quote}</p>
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="testimonial-carousel-button" />
            <CarouselNext className="testimonial-carousel-button" />
          </Carousel>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section data-section-label="Home / FAQ" style={{ padding: "64px 0" }}>
        <div className="shell" style={{ maxWidth: 820, margin: "0 auto" }}>
          <span className="section-kicker" style={{ textAlign: "center" }}>Preguntas frecuentes</span>
          <h2 style={{ textAlign: "center", fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 700, margin: "0 0 28px" }}>Resolvemos tus dudas</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="0">
              <AccordionTrigger style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15 }}>¿Qué tipo de organizaciones pueden trabajar con ELSI?</AccordionTrigger>
              <AccordionContent style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Trabajamos con empresas, instituciones educativas y organizaciones públicas de cualquier tamaño.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="1">
              <AccordionTrigger style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15 }}>¿Los cursos se toman en línea o de forma presencial?</AccordionTrigger>
              <AccordionContent style={{ fontSize: 13.5, color: "var(--text-muted)" }}>La mayoría de nuestros cursos son 100% en línea, a tu ritmo, con acceso desde tu cuenta.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15 }}>¿Ofrecen certificados al terminar?</AccordionTrigger>
              <AccordionContent style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Sí, la mayoría de nuestros programas incluyen constancia o certificado descargable.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15 }}>¿Cómo se cotiza una consultoría o programa in-company?</AccordionTrigger>
              <AccordionContent style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Escríbenos desde Contacto y te enviamos una propuesta a la medida de tu organización.</AccordionContent>
            </AccordionItem>
          </Accordion>
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
            {ctaSent && <div className="cta-sent" role="status">Solicitud recibida. Te contactaremos pronto.</div>}
            <Button type="submit" size="lg" variant="primary" className="cta-submit">
              Enviar solicitud
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
