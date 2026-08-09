import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  isSolutionVerified,
} from "@/lib/solutions";
import { solutionImages } from "@/lib/image-assets";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StructuredData } from "@/components/structured-data";
import {
  buildMetadata,
  buildPrivateMetadata,
  buildServiceJsonLd,
  indexable,
} from "@/lib/seo";
import { buildContactPath } from "@/lib/agentic-navigation";
import { getPublicSolution, listPublicSolutions } from "@/lib/content-repository";

type SolutionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const publicSolutions = await listPublicSolutions();
  return publicSolutions.map((solution) => ({
    slug: solution.slug,
  }));
}

export async function generateMetadata({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const solution = await getPublicSolution(slug);

  if (!solution) {
    return buildPrivateMetadata({
      title: "Solución no encontrada",
      path: `/soluciones/${slug}`,
    });
  }

  return buildMetadata({
    title: solution.title,
    description: solution.description,
    path: `/soluciones/${solution.slug}`,
    allowIndexing: indexable && isSolutionVerified(solution),
  });
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const solution = await getPublicSolution(slug);

  if (!solution) {
    notFound();
  }

  const image = solutionImages[slug];

  return (
    <main>
      {indexable && isSolutionVerified(solution) ? (
        <StructuredData value={buildServiceJsonLd(solution)} />
      ) : null}
      <section
        className="solution-detail-hero"
        data-layout={solution.layout}
        aria-labelledby="solution-detail-title"
        data-section-label={`Soluciones / ${solution.title}`}
      >
        <div className="shell">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Soluciones", href: "/soluciones" }, { label: solution.title, href: `/soluciones/${solution.slug}` }]} />

          <div className="solution-detail-hero-grid">
            <header className="solution-detail-copy">
              <p className="home-kicker">{solution.eyebrow}</p>
              <h1 id="solution-detail-title">{solution.title}</h1>
              <p className="solution-detail-intro">{solution.intro}</p>
            </header>

            {image ? (
              <figure className="solution-detail-media">
                <SafeImage
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  preload
                  sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1440px) 58vw, 760px"
                />
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className="solution-detail-body"
        data-layout={solution.layout}
        aria-labelledby="solution-detail-approach-title"
        data-section-label={`Soluciones / ${solution.title} / Alcance`}
      >
        <div className="shell solution-detail-body-grid">
          <article className="solution-detail-approach">
            <h2 id="solution-detail-approach-title">
              Cómo se construye la ruta
            </h2>
            <p>{solution.approach}</p>

            <dl className="solution-detail-facts">
              <div>
                <dt>Para quién</dt>
                <dd>{solution.audience}</dd>
              </div>
              <div>
                <dt>Cómo se entrega</dt>
                <dd>{solution.delivery}</dd>
              </div>
            </dl>
          </article>

          <section
            className="solution-detail-scope"
            aria-labelledby="solution-detail-scope-title"
          >
            <h2 id="solution-detail-scope-title">Líneas de trabajo</h2>
            <ol>
              {solution.items.map((item, index) => (
                <li key={item}>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{item}</strong>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>

      <section
        className="solution-detail-contact"
        aria-labelledby="solution-detail-contact-title"
        data-section-label={`Soluciones / ${solution.title} / Contacto`}
      >
        <div className="shell solution-detail-contact-grid">
          <div>
            <h2 id="solution-detail-contact-title">
              Define el punto de partida con ELSI.
            </h2>
            <p>
              Comparte el contexto para orientar alcance, modalidad y próximos
              pasos.
            </p>
          </div>
          <Button asChild size="lg" variant="primary">
            <Link href={buildContactPath({ solution: solution.slug })}>
              Solicitar información
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
