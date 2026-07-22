import Link from "next/link";
import { ArrowRight, BookOpen, Leaf } from "lucide-react";
import { getAllCourses, money } from "@/lib/courses";
import { solutions } from "@/lib/solutions";
import { SafeImage } from "@/components/safe-image";
import { courseImages, siteImages } from "@/lib/image-assets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicContactForm } from "@/components/public-contact-form";

const featuredCourses = getAllCourses().slice(0, 3);
const [primaryCourse, ...secondaryCourses] = featuredCourses;

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

export default function Home() {
  return (
    <main>
      <section className="home-hero" data-section-label="Home / Hero editorial">
        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-kicker">Instituto de educación y soluciones ambientales</p>
            <h1>Conocimiento ambiental para aprender, decidir y actuar.</h1>
            <p className="home-hero-lede">
              ELSI crea rutas de formación y acompañamiento para organizaciones, comunidades e instituciones educativas.
            </p>
            <div className="home-hero-actions">
              <Button asChild size="lg">
                <Link href="/soluciones">Explorar soluciones <ArrowRight data-icon="inline-end" /></Link>
              </Button>
              <Link href="/cursos" className="home-text-link">Ver cursos</Link>
            </div>
          </div>

          <figure className="home-hero-media">
            <SafeImage
              src="/hero-bg.jpg"
              alt="Paisaje boscoso junto a un lago, territorio natural que enmarca el trabajo ambiental de ELSI"
              width={1600}
              height={900}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 800px) 100vw, 54vw"
            />
            <figcaption>El territorio como punto de partida para aprender y actuar.</figcaption>
          </figure>
        </div>
      </section>

      <section className="home-solutions" data-section-label="Home / Índice de soluciones">
        <div className="shell home-solutions-layout">
          <header className="home-section-intro">
            <p className="home-kicker">Tres rutas, un propósito</p>
            <h2>La forma de avanzar depende del reto.</h2>
            <p>Compara el enfoque de cada solución y entra sólo al capítulo que corresponde a tu contexto.</p>
          </header>

          <ol className="home-solutions-index">
            {solutions.map((solution, index) => (
              <li key={solution.slug} className="home-solution-index-item" data-layout={solution.layout}>
                <Link href={`/soluciones/${solution.slug}`}>
                  <span className="home-solution-number">{String(index + 1).padStart(2, "0")}</span>
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

      <section className="home-story" data-section-label="Home / Historia documental">
        <div className="shell home-story-grid">
          <figure className="home-story-media">
            <SafeImage
              src={siteImages.story.src}
              alt={siteImages.story.alt}
              width={800}
              height={600}
              sizes="(max-width: 800px) 100vw, 48vw"
            />
            <figcaption>Archivo ELSI · Bee Blue, origen estudiantil del instituto.</figcaption>
          </figure>

          <div className="home-story-copy">
            <div className="home-story-mark" aria-hidden="true"><Leaf /></div>
            <p className="home-kicker">Una historia que nace en comunidad</p>
            <h2>De una iniciativa estudiantil a una práctica ambiental compartida.</h2>
            <p>
              Bee Blue reunió educación ambiental, participación universitaria y trabajo de campo. ELSI continúa esa trayectoria mediante experiencias que conectan conocimiento y contexto.
            </p>
            <Button asChild variant="link" className="home-inline-action">
              <Link href="/nosotros">Conocer la historia <ArrowRight data-icon="inline-end" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="home-courses" data-section-label="Home / Cursos destacados">
        <div className="shell">
          <header className="home-courses-header">
            <div>
              <p className="home-kicker">Aprendizaje disponible</p>
              <h2>Cursos para pasar del interés a la práctica.</h2>
            </div>
            <Link href="/cursos" className="home-text-link">Ver catálogo completo</Link>
          </header>

          {primaryCourse ? (
            <div className="home-courses-layout">
              <Link href={`/cursos/${primaryCourse.slug}`} className="home-course-feature">
                <div className="home-course-feature-media">
                  <SafeImage
                    src={courseImages[primaryCourse.slug].src}
                    alt={courseImages[primaryCourse.slug].alt}
                    width={900}
                    height={600}
                    sizes="(max-width: 800px) 100vw, 58vw"
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
          ) : null}
        </div>
      </section>

      <section className="home-faq" data-section-label="Home / Preguntas frecuentes">
        <div className="shell home-faq-grid">
          <header className="home-section-intro">
            <p className="home-kicker">Antes de comenzar</p>
            <h2>Una ruta clara desde la primera conversación.</h2>
            <p>Estas respuestas describen el proceso general. El alcance específico se confirma en cada propuesta.</p>
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
            <p>Comparte tus datos y el contexto general. ELSI podrá orientar la solución, curso o programa adecuado.</p>
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
