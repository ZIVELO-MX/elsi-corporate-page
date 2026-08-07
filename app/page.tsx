import Link from "next/link";
import { ArrowRight, BookOpen, Leaf } from "lucide-react";
import { getPublicCourses, money } from "@/lib/courses";
import { getPublicSolutions } from "@/lib/solutions";
import { SafeImage } from "@/components/safe-image";
import { siteImages } from "@/lib/image-assets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicContactForm } from "@/components/public-contact-form";
import { CourseMedia } from "@/components/course-media";
import { StructuredData } from "@/components/structured-data";
import {
  buildMetadata,
  indexable,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { intentRoutes } from "@/lib/agentic-navigation";
import { listPublicContent, mapPublicSolutions, sectionText } from "@/lib/content-repository";
import { listPublicCourses } from "@/lib/courses-repository";

export const metadata = buildMetadata({
  description: "ELSI, Environmental Learning & Solutions Institute. Cursos, capacitación y consultoría ambiental para personas, empresas y universidades en Guanajuato.",
  path: "/",
});

const homeFaqs = [
  {
    question: "¿Qué tipo de acompañamiento ofrece ELSI?",
    answer: "ELSI trabaja con capacitación, soluciones ambientales y experiencias universitarias. Cada ruta parte del contexto y del objetivo de la organización o comunidad.",
  },
  {
    question: "¿Cómo se define un programa?",
    answer: "Antes de iniciar se acuerdan alcance, modalidad, calendario y entregables. La propuesta distingue con claridad qué está incluido y qué requiere una definición adicional.",
  },
  {
    question: "¿Dónde puedo revisar la oferta formativa?",
    answer: "El catálogo reúne los cursos disponibles y permite consultar su descripción y temario antes de solicitar información.",
  },
] as const;

export default async function Home() {
  const persistedContent = await listPublicContent();
  const persistedCourses = await listPublicCourses();
  const featuredCourses = (persistedCourses ?? getPublicCourses()).slice(0, 3);
  const [primaryCourse, ...secondaryCourses] = featuredCourses;
  const publicSolutions = mapPublicSolutions(persistedContent, getPublicSolutions());
  const availableIntentRoutes = intentRoutes.filter((intent) => {
    if (intent.href === "/cursos") return featuredCourses.length > 0;
    return publicSolutions.some((solution) => intent.href === `/soluciones/${solution.slug}`);
  });
  const heroText = sectionText(persistedContent, "hero", "ELSI crea rutas de formación y acompañamiento para organizaciones, comunidades e instituciones educativas.");
  const storyText = sectionText(persistedContent, "value-prop", "Bee Blue reunió educación ambiental, participación universitaria y trabajo de campo. ELSI continúa esa trayectoria mediante experiencias que conectan conocimiento y contexto.");
  const faqText = sectionText(persistedContent, "faq", "Estas respuestas describen el proceso general. El alcance específico se confirma en cada propuesta.");
  const ctaText = sectionText(persistedContent, "cta", "Comparte tus datos y el contexto general. ELSI podrá orientar la solución, curso o programa adecuado.");
  return (
    <main>
      {indexable ? (
        <>
          <StructuredData value={organizationJsonLd} />
          <StructuredData value={websiteJsonLd} />
        </>
      ) : null}
      <section className="home-hero" data-section-label="Home / Hero editorial">
        <SafeImage
          src={siteImages.hero.src}
          alt={siteImages.hero.alt}
          className="home-hero-bg"
          width={siteImages.hero.width}
          height={siteImages.hero.height}
          preload
          sizes="100vw"
        />
        <div className="home-hero-overlay" />

        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-kicker">Instituto de educación y soluciones ambientales</p>
            <h1>Conocimiento ambiental para aprender, decidir y actuar.</h1>
            <p className="home-hero-lede">
              {heroText}
            </p>
            <div className="home-hero-actions">
              <Button asChild variant="inverse" size="lg">
                <Link
                  href={
                    publicSolutions.length > 0 ? "/soluciones" : "/contacto"
                  }
                >
                  {publicSolutions.length > 0
                    ? "Explorar soluciones"
                    : "Solicitar información"}{" "}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              {featuredCourses.length > 0 ? (
                <Link href="/cursos" className="home-text-link">
                  Ver cursos
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {availableIntentRoutes.length > 0 ? (
        <section
          className="home-intent"
          aria-labelledby="home-intent-title"
          data-section-label="Home / Rutas por intención"
        >
          <div className="shell home-intent-layout">
            <header>
              <p className="home-kicker">Empieza por tu objetivo</p>
              <h2 id="home-intent-title">¿Qué necesitas resolver?</h2>
            </header>
            <nav aria-label="Rutas según tu objetivo">
              <ol className="home-intent-list">
                {availableIntentRoutes.map((intent) => (
                  <li key={intent.href}>
                    <Link href={intent.href}>
                      <span>
                        <strong>{intent.label}</strong>
                        <small>{intent.description}</small>
                      </span>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>
      ) : null}

      {publicSolutions.length > 0 ? (
        <section
          className="home-solutions"
          data-section-label="Home / Índice de soluciones"
        >
          <div className="shell home-solutions-layout">
            <header className="home-section-intro">
              <p className="home-kicker">Tres rutas, un propósito</p>
              <h2>La forma de avanzar depende del reto.</h2>
              <p>
                Compara el enfoque de cada solución y entra sólo al capítulo que
                corresponde a tu contexto.
              </p>
            </header>

            <ol className="home-solutions-index">
              {publicSolutions.map((solution, index) => (
                <li
                  key={solution.slug}
                  className="home-solution-index-item"
                  data-layout={solution.layout}
                >
                  <Link href={`/soluciones/${solution.slug}`}>
                    <span className="home-solution-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="home-solution-index-copy">
                      <span>{solution.eyebrow}</span>
                      <strong>{solution.title}</strong>
                      <small>{solution.audience}</small>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="home-story" data-section-label="Home / Historia documental">
        <div className="shell home-story-grid">
          <figure className="home-story-media">
            <SafeImage
              src={siteImages.story.src}
              alt={siteImages.story.alt}
              width={siteImages.story.width}
              height={siteImages.story.height}
              sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1440px) 48vw, 607px"
            />
            <figcaption>Archivo ELSI · Bee Blue, origen estudiantil del instituto.</figcaption>
          </figure>

          <div className="home-story-copy">
            <div className="home-story-mark" aria-hidden="true"><Leaf /></div>
            <p className="home-kicker">Una historia que nace en comunidad</p>
            <h2>De una iniciativa estudiantil a una práctica ambiental compartida.</h2>
            <p>
              {storyText}
            </p>
            <Button asChild variant="link" className="home-inline-action">
              <Link href="/nosotros">Conocer la historia <ArrowRight data-icon="inline-end" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {primaryCourse ? (
        <section
          className="home-courses"
          data-section-label="Home / Cursos destacados"
        >
          <div className="shell">
            <header className="home-courses-header">
              <div>
                <p className="home-kicker">Aprendizaje disponible</p>
                <h2>Cursos para pasar del interés a la práctica.</h2>
              </div>
              <Link href="/cursos" className="home-text-link">
                Ver catálogo completo
              </Link>
            </header>

            <div className="home-courses-layout">
              <Link href={`/cursos/${primaryCourse.slug}`} className="home-course-feature">
                <div className="home-course-feature-media">
                  <CourseMedia
                    course={primaryCourse}
                    variant="feature"
                    sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1024px) 60vw, 520px"
                  />
                </div>
                <div className="home-course-feature-body">
                  <Badge variant="outline">{primaryCourse.catLabel}</Badge>
                  <h3>{primaryCourse.title}</h3>
                  <p>{primaryCourse.description}</p>
                  <div>
                    <span>{primaryCourse.duration} · {primaryCourse.modules} módulos</span>
                    <strong>{money(primaryCourse.price)}</strong>
                  </div>
                  <span className="home-course-action">Ver curso <ArrowRight aria-hidden="true" /></span>
                </div>
              </Link>

              <nav className="home-course-list" aria-label="Más cursos destacados">
                {secondaryCourses.map((course) => (
                  <Link key={course.id} href={`/cursos/${course.slug}`} className="home-course-row">
                    <span className="home-course-row-icon" aria-hidden="true"><BookOpen /></span>
                    <span className="home-course-row-copy">
                      <small>{course.catLabel}</small>
                      <strong>{course.title}</strong>
                      <span>{course.duration} · {course.modules} módulos</span>
                    </span>
                    <span className="home-course-row-price">{money(course.price)}</span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </section>
      ) : null}

      <section className="home-faq" data-section-label="Home / Preguntas frecuentes">
        <div className="shell home-faq-grid">
          <header className="home-section-intro">
            <p className="home-kicker">Antes de comenzar</p>
            <h2>Una ruta clara desde la primera conversación.</h2>
            <p>{faqText}</p>
          </header>
          <div className="home-faq-list">
            {homeFaqs.map((item) => (
              <details key={item.question} className="home-faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section home-contact" data-section-label="Home / Contacto integrado">
        <div className="shell cta-grid">
          <div className="cta-copy">
            <p className="home-kicker home-kicker-inverse">El siguiente paso</p>
            <h2>Conversemos sobre el reto que quieres atender.</h2>
            <p>{ctaText}</p>
          </div>
          <PublicContactForm
            className="cta-form"
            buttonClassName="cta-submit"
            buttonLabel="Enviar solicitud"
            idPrefix="home-contact"
            statusClassName="cta-sent"
          />
        </div>
      </section>
    </main>
  );
}
