import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import {
  getPublicAboutContent,
  isAboutContentVerified,
} from "@/lib/about";
import { siteImages } from "@/lib/image-assets";
import { buildMetadata, indexable } from "@/lib/seo";
import { listPublicContent, sectionText } from "@/lib/content-repository";

export const metadata = buildMetadata({
  title: "Nosotros",
  description:
    "La historia de ELSI: de la iniciativa estudiantil Bee Blue a un instituto de educación y soluciones ambientales.",
  path: "/nosotros",
  allowIndexing: indexable && isAboutContentVerified(),
});

export default async function NosotrosPage() {
  const persistedContent = await listPublicContent();
  const fixture = getPublicAboutContent();
  const content = fixture
    ? {
        ...fixture,
        title: sectionText(persistedContent, "about-title", fixture.title),
        introduction: sectionText(persistedContent, "about-intro", fixture.introduction),
        journeyTitle: sectionText(persistedContent, "about-journey", fixture.journeyTitle),
        principlesTitle: sectionText(persistedContent, "about-principles", fixture.principlesTitle),
      }
    : undefined;

  if (!content) {
    return (
      <main>
        <section
          className="about-pending"
          aria-labelledby="about-pending-title"
          data-section-label="Nosotros / Contenido pendiente"
        >
          <div className="shell">
            <p className="home-kicker">Nosotros</p>
            <h1 id="about-pending-title">
              La información institucional está en preparación.
            </h1>
            <p>
              Publicaremos la historia y los principios de ELSI después de su
              validación.
            </p>
            <Button asChild size="lg">
              <Link href="/contacto">Contactar a ELSI</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section
        className="about-hero"
        aria-labelledby="about-title"
        data-section-label="Nosotros / Historia"
      >
        <div className="shell about-hero-grid">
          <div className="about-hero-copy">
            <p className="home-kicker">Quiénes somos</p>
            <h1 id="about-title">{content.title}</h1>
            <p className="about-hero-lede">{content.introduction}</p>
          </div>

          <figure className="about-hero-media">
            <SafeImage
              src={siteImages.story.src}
              alt={siteImages.story.alt}
              width={siteImages.story.width}
              height={siteImages.story.height}
              preload
              sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1440px) 52vw, 660px"
            />
          </figure>
        </div>
      </section>

      <section
        className="about-journey"
        aria-labelledby="about-journey-title"
        data-section-label="Nosotros / Línea de tiempo"
      >
        <div className="shell">
          <header className="about-section-intro">
            <h2 id="about-journey-title">{content.journeyTitle}</h2>
            <p>{content.journeyIntroduction}</p>
          </header>

          <ol className="about-timeline">
            {content.timeline.map((item) => (
              <li key={item.title}>
                <span className="about-timeline-marker">{item.marker}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="about-principles"
        aria-labelledby="about-principles-title"
        data-section-label="Nosotros / Misión visión valores"
      >
        <div className="shell about-principles-grid">
          <header>
            <h2 id="about-principles-title">
              {content.principlesTitle}
            </h2>
          </header>

          <dl className="about-principles-list">
            {content.principles.map((item) => (
              <div key={item.title}>
                <dt>{item.title}</dt>
                <dd>{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="about-next-step"
        aria-labelledby="about-next-step-title"
        data-section-label="Nosotros / Siguiente paso"
      >
        <div className="shell about-next-step-grid">
          <div>
            <h2 id="about-next-step-title">
              Convierte el interés en un siguiente paso.
            </h2>
            <p>
              Revisa la oferta formativa o cuéntanos qué necesita tu comunidad
              u organización.
            </p>
          </div>
          <div className="about-next-step-actions">
            <Button asChild size="lg" variant="primary">
              <Link href="/cursos">
                Explorar cursos
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contacto">Solicitar información</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
