import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getPublicSolutionBySlug,
  getPublicSolutions,
  isSolutionVerified,
} from "@/lib/solutions";
import { solutionImages } from "@/lib/image-assets";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  buildMetadata,
  buildPrivateMetadata,
  indexable,
} from "@/lib/seo";
import { buildContactPath } from "@/lib/agentic-navigation";

type SolutionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPublicSolutions().map((solution) => ({
    slug: solution.slug,
  }));
}

export async function generateMetadata({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const solution = getPublicSolutionBySlug(slug);

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
  const solution = getPublicSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const image = solutionImages[slug];

  return (
    <main>
      <section className="solution-article" data-section-label={`Soluciones / ${solution.title}`}>
        <div className="shell solution-article-shell">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Soluciones", href: "/soluciones" }, { label: solution.title, href: `/soluciones/${solution.slug}` }]} />
          <Link href="/soluciones" className="solution-back-link">
            <ArrowLeft aria-hidden="true" />
            Volver a soluciones
          </Link>

          <div className="solution-article-header">
            <Badge variant="outline" className="solution-article-badge">Solución ELSI</Badge>
            <h1>{solution.title}</h1>
            <p>{solution.intro}</p>
          </div>

          {image && (
            <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-card)", aspectRatio: "21 / 9", marginBottom: 40 }}>
              <SafeImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="eager"
                sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1136px) calc(100vw - 96px), 1040px"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div className="solution-article-grid">
            <article className="solution-article-content">
              <h2>Una ruta clara para avanzar</h2>
              <p>{solution.approach}</p>

              <h2>Alcance transparente</h2>
              <p>{solution.delivery}</p>
            </article>

            <aside className="solution-article-aside">
              <h2>Qué incluye</h2>
              <ul>
                {solution.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button asChild variant="primary" className="solution-article-button">
                <Link href={buildContactPath({ solution: solution.slug })}>Solicitar información <ArrowRight data-icon="inline-end" /></Link>
              </Button>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
